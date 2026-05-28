package com.coffeeshop.service.ai;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.response.report.*;
import com.coffeeshop.model.dto.response.dashboard.LowStockAlert;
import com.coffeeshop.model.entity.AIReport;
import com.coffeeshop.model.entity.User;
import com.coffeeshop.model.enums.AIReportType;
import com.coffeeshop.repository.AIReportRepository;
import com.coffeeshop.repository.UserRepository;
import com.coffeeshop.service.DashboardService;
import com.coffeeshop.service.ReportService;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportAIService {

    @Qualifier("geminiRestTemplate")
    private final RestTemplate restTemplate;

    private final ReportService reportService;
    private final DashboardService dashboardService;
    private final UserRepository userRepository;
    private final AIReportRepository aiReportRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.model:gemini-1.5-pro}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    /**
     * Tạo báo cáo phân tích hiệu suất tuần này
     */
    @Transactional
    public AIWeeklyAnalysis generateWeeklyAnalysis(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. Phân chia mốc thời gian: 7 ngày qua vs 7 ngày trước đó
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime sevenDaysAgoStart = LocalDate.now().minusDays(6).atStartOfDay();

        LocalDateTime prevEnd = LocalDate.now().minusDays(7).atTime(LocalTime.MAX);
        LocalDateTime fourteenDaysAgoStart = LocalDate.now().minusDays(13).atStartOfDay();

        // 2. Thu thập dữ liệu tuần này
        RevenueReportResponse thisWeekRev = reportService.getRevenueSummary(sevenDaysAgoStart, todayEnd, "day");
        List<CategoryRevenueResponse> categoryRev = reportService.getRevenueByCategory(sevenDaysAgoStart, todayEnd);
        List<TopItemResponse> topItems = reportService.getTopItems(sevenDaysAgoStart, todayEnd, 5);
        CustomerStatsResponse customerStats = reportService.getCustomerStats(sevenDaysAgoStart, todayEnd);
        Map<String, Object> paymentStats = reportService.getPaymentMethodStats(sevenDaysAgoStart, todayEnd);

        // Doanh thu & đơn hàng tuần trước
        RevenueReportResponse lastWeekRev = reportService.getRevenueSummary(fourteenDaysAgoStart, prevEnd, "day");

        // 3. Tính toán chênh lệch % doanh thu
        BigDecimal thisWeekVal = thisWeekRev.getTotalRevenue();
        BigDecimal lastWeekVal = lastWeekRev.getTotalRevenue();
        double revChangePercent = 0.0;
        if (lastWeekVal.compareTo(BigDecimal.ZERO) > 0) {
            revChangePercent = thisWeekVal.subtract(lastWeekVal)
                    .divide(lastWeekVal, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        } else if (thisWeekVal.compareTo(BigDecimal.ZERO) > 0) {
            revChangePercent = 100.0;
        }

        // Chênh lệch đơn hàng
        long thisWeekOrders = thisWeekRev.getTotalOrders();
        long lastWeekOrders = lastWeekRev.getTotalOrders();
        double ordersChangePercent = 0.0;
        if (lastWeekOrders > 0) {
            ordersChangePercent = ((double) (thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100;
        } else if (thisWeekOrders > 0) {
            ordersChangePercent = 100.0;
        }

        // 4. Định dạng dữ liệu văn bản
        String dateRangeStr = String.format("%s - %s",
                sevenDaysAgoStart.toLocalDate().toString(), todayEnd.toLocalDate().toString());

        StringBuilder catBuilder = new StringBuilder();
        for (CategoryRevenueResponse cat : categoryRev) {
            catBuilder.append(String.format("- %s: Doanh thu %sđ (SL: %d, Tỷ lệ: %s%%)\n",
                    cat.getCategoryName(), cat.getRevenue().toString(), cat.getQuantity(), cat.getPercentage().toString()));
        }
        String catData = catBuilder.length() > 0 ? catBuilder.toString() : "- Không có dữ liệu danh mục\n";

        StringBuilder topBuilder = new StringBuilder();
        for (TopItemResponse item : topItems) {
            topBuilder.append(String.format("- %s (ID: %d): Bán %d cốc, Doanh thu %sđ, Lợi nhuận %sđ\n",
                    item.getName(), item.getMenuItemId(), item.getTotalSold(), item.getRevenue().toString(), item.getProfit().toString()));
        }
        String topData = topBuilder.length() > 0 ? topBuilder.toString() : "- Không có dữ liệu món bán chạy\n";

        List<Map<String, Object>> methods = (List<Map<String, Object>>) paymentStats.get("methods");
        StringBuilder payBuilder = new StringBuilder();
        for (Map<String, Object> m : methods) {
            payBuilder.append(String.format("- %s: Doanh thu %sđ (Tỷ lệ: %s%%)\n",
                    m.get("paymentMethod").toString(), m.get("revenue").toString(), m.get("percentage").toString()));
        }
        String payData = payBuilder.length() > 0 ? payBuilder.toString() : "- Không có dữ liệu thanh toán\n";

        // 5. Tải prompt và điền tham số
        String promptTemplate = loadPrompt("report-weekly.txt");
        String finalPrompt = promptTemplate
                .replace("{date_range}", dateRangeStr)
                .replace("{total_revenue}", thisWeekVal.toString())
                .replace("{last_week_revenue}", lastWeekVal.toString())
                .replace("{revenue_change_percent}", String.format("%.2f", revChangePercent))
                .replace("{total_orders}", String.valueOf(thisWeekOrders))
                .replace("{last_week_orders}", String.valueOf(lastWeekOrders))
                .replace("{orders_change_percent}", String.format("%.2f", ordersChangePercent))
                .replace("{category_revenue_data}", catData)
                .replace("{top_items_data}", topData)
                .replace("{new_customers}", String.valueOf(customerStats.getNewCustomers()))
                .replace("{active_customers}", String.valueOf(customerStats.getActiveCustomers()))
                .replace("{returning_customers}", String.valueOf(customerStats.getReturningCustomers()))
                .replace("{points_earned}", String.valueOf(customerStats.getPointsEarned()))
                .replace("{points_redeemed}", String.valueOf(customerStats.getPointsRedeemed()))
                .replace("{payment_methods_data}", payData);

        // 6. Gọi Gemini
        String aiResponseJson = callGemini(finalPrompt, "Bạn là cố vấn báo cáo kinh doanh quán cà phê chuyên nghiệp. Chỉ trả về JSON thô.");

        try {
            AIWeeklyAnalysis analysis = objectMapper.readValue(aiResponseJson, AIWeeklyAnalysis.class);

            // Lưu báo cáo vào DB
            AIReport report = AIReport.builder()
                    .user(user)
                    .reportType(AIReportType.WEEKLY_ANALYSIS)
                    .title("Báo cáo tuần: " + dateRangeStr)
                    .content(analysis.getMarkdownReport())
                    .promptUsed(finalPrompt)
                    .metadata(aiResponseJson)
                    .build();

            aiReportRepository.save(report);
            return analysis;

        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON Weekly Analysis từ AI", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    /**
     * Tạo dự báo doanh thu 7 ngày tiếp theo
     */
    @Transactional
    public AIRevenueForecast generateRevenueForecast(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. Lấy dữ liệu doanh số 30 ngày qua
        LocalDateTime thirtyDaysAgo = LocalDate.now().minusDays(29).atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        RevenueReportResponse historical = reportService.getRevenueSummary(thirtyDaysAgo, todayEnd, "day");

        // 2. Định dạng dữ liệu chuỗi ngày bán
        StringBuilder histBuilder = new StringBuilder();
        for (RevenueReportResponse.DateRevenuePair dp : historical.getDataPoints()) {
            histBuilder.append(String.format("- Ngày: %s, Doanh thu: %sđ, Số đơn: %d\n",
                    dp.getLabel(), dp.getRevenue().toString(), dp.getOrderCount()));
        }
        String historicalData = histBuilder.length() > 0 ? histBuilder.toString() : "- Không có dữ liệu lịch sử doanh số\n";

        // 3. Tải prompt và gửi yêu cầu tới Gemini
        String promptTemplate = loadPrompt("report-forecast.txt");
        String finalPrompt = promptTemplate.replace("{historical_sales_data}", historicalData);

        String aiResponseJson = callGemini(finalPrompt, "Bạn là chuyên gia dự báo doanh thu tài chính quán cà phê. Chỉ trả về JSON thô.");

        try {
            AIRevenueForecast forecast = objectMapper.readValue(aiResponseJson, AIRevenueForecast.class);

            // Lưu báo cáo vào DB
            AIReport report = AIReport.builder()
                    .user(user)
                    .reportType(AIReportType.REVENUE_FORECAST)
                    .title("Dự báo doanh thu 7 ngày: " + LocalDate.now().toString())
                    .content(forecast.getMarkdownReport())
                    .promptUsed(finalPrompt)
                    .metadata(aiResponseJson)
                    .build();

            aiReportRepository.save(report);
            return forecast;

        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON Revenue Forecast từ AI", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    /**
     * Tạo đề xuất tối ưu hóa chi phí kinh doanh từ AI
     */
    @Transactional
    public AIReportResponse generateImprovementSuggestions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. Thu thập dữ liệu kinh doanh 30 ngày qua
        LocalDateTime thirtyDaysAgo = LocalDate.now().minusDays(29).atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);

        List<TopItemResponse> topItems = reportService.getTopItems(thirtyDaysAgo, todayEnd, 10);
        List<CategoryRevenueResponse> categoryRev = reportService.getRevenueByCategory(thirtyDaysAgo, todayEnd);
        List<LowStockAlert> lowStock = dashboardService.getLowStockAlerts();

        // 2. Định dạng dữ liệu văn bản
        StringBuilder topBuilder = new StringBuilder();
        for (TopItemResponse item : topItems) {
            topBuilder.append(String.format("- Món: %s (ID: %d), Số lượng bán: %d, Doanh thu: %sđ, Chi phí gốc: %sđ, Lợi nhuận: %sđ\n",
                    item.getName(), item.getMenuItemId(), item.getTotalSold(), item.getRevenue().toString(),
                    item.getTotalCost().toString(), item.getProfit().toString()));
        }
        String topData = topBuilder.length() > 0 ? topBuilder.toString() : "- Không có dữ liệu thực đơn\n";

        StringBuilder catBuilder = new StringBuilder();
        for (CategoryRevenueResponse cat : categoryRev) {
            catBuilder.append(String.format("- Danh mục: %s, Doanh thu: %sđ (SL: %d, Chiếm: %s%%)\n",
                    cat.getCategoryName(), cat.getRevenue().toString(), cat.getQuantity(), cat.getPercentage().toString()));
        }
        String catData = catBuilder.length() > 0 ? catBuilder.toString() : "- Không có dữ liệu danh mục\n";

        StringBuilder stockBuilder = new StringBuilder();
        for (LowStockAlert alert : lowStock) {
            stockBuilder.append(String.format("- Nguyên liệu: %s, Tồn hiện tại: %s %s (Ngưỡng tối thiểu: %s %s)\n",
                    alert.getName(), alert.getCurrentStock().toString(), alert.getUnit(),
                    alert.getMinStock().toString(), alert.getUnit()));
        }
        String stockData = stockBuilder.length() > 0 ? stockBuilder.toString() : "- Tồn kho nguyên liệu đều ở mức an toàn\n";

        // 3. Đọc prompt và thay thế tham số
        String promptTemplate = loadPrompt("report-suggestions.txt");
        String finalPrompt = promptTemplate
                .replace("{top_items_data}", topData)
                .replace("{category_revenue_data}", catData)
                .replace("{low_stock_data}", stockData);

        // 4. Gọi Gemini
        String aiResponseJson = callGemini(finalPrompt, "Bạn là cố vấn tối ưu hóa tài chính quán cà phê. Chỉ trả về JSON thô.");

        try {
            JsonNode rootNode = objectMapper.readTree(aiResponseJson);
            String markdownReport = rootNode.path("markdownReport").asText();
            String title = "Đề xuất tối ưu kinh doanh: " + LocalDate.now().toString();

            AIReport report = AIReport.builder()
                    .user(user)
                    .reportType(AIReportType.BUSINESS_INSIGHT)
                    .title(title)
                    .content(markdownReport)
                    .promptUsed(finalPrompt)
                    .metadata(aiResponseJson)
                    .build();

            report = aiReportRepository.save(report);
            return toResponseDTO(report);

        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON Business Suggestions từ AI", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    /**
     * Lấy lịch sử báo cáo của người dùng
     */
    @Transactional(readOnly = true)
    public List<AIReportResponse> getReportHistory(String username, AIReportType type) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<AIReport> list;
        if (type != null) {
            list = aiReportRepository.findByUserIdAndReportTypeOrderByCreatedAtDesc(user.getId(), type);
        } else {
            list = aiReportRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return list.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    /**
     * Đánh dấu / Bỏ đánh dấu báo cáo
     */
    @Transactional
    public AIReportResponse toggleBookmark(Long reportId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        AIReport report = aiReportRepository.findByIdAndUserId(reportId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy báo cáo"));

        report.setBookmarked(!report.isBookmarked());
        report = aiReportRepository.save(report);
        return toResponseDTO(report);
    }

    /**
     * Xóa báo cáo
     */
    @Transactional
    public void deleteReport(Long reportId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        AIReport report = aiReportRepository.findByIdAndUserId(reportId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy báo cáo"));

        aiReportRepository.delete(report);
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

    private String callGemini(String prompt, String systemInstructionText) {
        String url = baseUrl + "/models/" + model + ":generateContent";

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> contentObj = new HashMap<>();
        contentObj.put("role", "user");
        contentObj.put("parts", List.of(part));
        requestBody.put("contents", List.of(contentObj));

        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("text", systemInstructionText);
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(systemPart));
        requestBody.put("systemInstruction", systemInstruction);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody);

        try {
            log.info("Đang gửi yêu cầu Reports AI đến Gemini API (Model: {})", model);
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
            log.error("Gặp lỗi khi kết nối với Gemini API cho Reports AI", e);
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            throw new AppException(ErrorCode.AI_SERVICE_ERROR, "Không thể kết nối dịch vụ AI Gemini");
        }
    }

    private AIReportResponse toResponseDTO(AIReport report) {
        return AIReportResponse.builder()
                .id(report.getId())
                .reportType(report.getReportType())
                .title(report.getTitle())
                .content(report.getContent())
                .promptUsed(report.getPromptUsed())
                .metadata(report.getMetadata())
                .isBookmarked(report.isBookmarked())
                .createdAt(report.getCreatedAt())
                .createdBy(report.getCreatedBy())
                .build();
    }
}
