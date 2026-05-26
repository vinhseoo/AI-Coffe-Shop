package com.coffeeshop.service.ai;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.response.dashboard.*;
import com.coffeeshop.service.DashboardService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardAIService {

    @Qualifier("geminiRestTemplate")
    private final RestTemplate restTemplate;

    private final DashboardService dashboardService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.model:gemini-1.5-pro}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    /**
     * Tạo tóm tắt phân tích và khuyến nghị kinh doanh hôm nay từ AI
     */
    public AIDashboardSummary generateDailySummary() {
        // 1. Thu thập dữ liệu kinh doanh hôm nay
        DashboardOverviewResponse overview = dashboardService.getOverview();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        List<TopSellingItem> topSelling = dashboardService.getTopSelling(todayStart, todayEnd, 5);

        List<LowStockAlert> lowStock = dashboardService.getLowStockAlerts();

        // 2. Chuyển đổi dữ liệu sang định dạng văn bản
        StringBuilder topSellingBuilder = new StringBuilder();
        for (TopSellingItem item : topSelling) {
            topSellingBuilder.append(String.format("- Món: %s (ID: %d), Số lượng bán: %d, Doanh thu: %sđ\n",
                    item.getName(), item.getMenuItemId(), item.getTotalSold(), item.getRevenue().toString()));
        }
        String topSellingData = topSellingBuilder.length() > 0 ? topSellingBuilder.toString() : "- Không có dữ liệu bán chạy hôm nay\n";

        StringBuilder lowStockBuilder = new StringBuilder();
        for (LowStockAlert alert : lowStock) {
            lowStockBuilder.append(String.format("- Nguyên liệu: %s, Tồn hiện tại: %s %s (Mức an toàn tối thiểu: %s %s)\n",
                    alert.getName(), alert.getCurrentStock().toString(), alert.getUnit(),
                    alert.getMinStock().toString(), alert.getUnit()));
        }
        String lowStockData = lowStockBuilder.length() > 0 ? lowStockBuilder.toString() : "- Không có nguyên liệu nào ở dưới mức an toàn\n";

        // 3. Tải prompt template và thay thế tham số
        String promptTemplate = loadPrompt("dashboard-summary.txt");
        String finalPrompt = promptTemplate
                .replace("{today_revenue}", overview.getTodayRevenue().toString() + "đ")
                .replace("{yesterday_revenue}", overview.getYesterdayRevenue().toString() + "đ")
                .replace("{revenue_change_percent}", overview.getRevenueChangePercent().toString())
                .replace("{today_order_count}", overview.getTodayOrderCount().toString())
                .replace("{yesterday_order_count}", overview.getYesterdayOrderCount().toString())
                .replace("{order_count_change_percent}", overview.getOrderCountChangePercent().toString())
                .replace("{avg_order_value}", overview.getAvgOrderValue().toString() + "đ")
                .replace("{top_selling_data}", topSellingData)
                .replace("{low_stock_data}", lowStockData);

        // 4. Gửi yêu cầu đến Gemini AI và phân tích kết quả trả về
        String aiResponseJson = callGemini(finalPrompt);

        try {
            return objectMapper.readValue(aiResponseJson, AIDashboardSummary.class);
        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON trả về từ AI cho Dashboard Summary", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    private String loadPrompt(String fileName) {
        try {
            InputStream inputStream = new ClassPathResource("prompts/" + fileName).getInputStream();
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Lỗi khi đọc file prompt template: {}", fileName, e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không thể tải cấu hình AI prompt");
        }
    }

    private String callGemini(String prompt) {
        String url = baseUrl + "/models/" + model + ":generateContent";

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> contentObj = new HashMap<>();
        contentObj.put("role", "user");
        contentObj.put("parts", List.of(part));
        requestBody.put("contents", List.of(contentObj));

        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("text", "Bạn là một trợ lý AI chuyên gia phân tích kinh doanh cho quán cà phê. Luôn trả lời ở định dạng JSON thô.");
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(systemPart));
        requestBody.put("systemInstruction", systemInstruction);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody);

        try {
            log.info("Đang gửi yêu cầu Dashboard AI đến Gemini API (Model: {})", model);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                String content = rootNode.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();
                return content.trim();
            } else {
                throw new AppException(ErrorCode.AI_SERVICE_ERROR, "Gemini API trả về mã lỗi: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Gặp lỗi khi kết nối với Gemini API cho Dashboard AI", e);
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            throw new AppException(ErrorCode.AI_SERVICE_ERROR, "Không thể kết nối dịch vụ AI Gemini");
        }
    }
}
