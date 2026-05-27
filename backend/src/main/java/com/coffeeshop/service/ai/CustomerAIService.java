package com.coffeeshop.service.ai;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.response.customer.CustomerResponse;
import com.coffeeshop.model.dto.response.customer.CustomerSegmentResponse;
import com.coffeeshop.model.entity.Customer;
import com.coffeeshop.model.enums.CustomerTier;
import com.coffeeshop.repository.CustomerRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerAIService {

    @Qualifier("geminiRestTemplate")
    private final RestTemplate restTemplate;

    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.model:gemini-1.5-pro}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    @Transactional(readOnly = true)
    public CustomerSegmentResponse getCustomerSegmentation() {
        List<Customer> allCustomers = customerRepository.findAll();
        if (allCustomers.isEmpty()) {
            return CustomerSegmentResponse.builder()
                    .vipCustomers(new ArrayList<>())
                    .loyalCustomers(new ArrayList<>())
                    .normalCustomers(new ArrayList<>())
                    .atRiskCustomers(new ArrayList<>())
                    .aiAnalysis("Chưa có khách hàng nào trong hệ thống để phân tích.")
                    .marketingSuggestions(List.of("Đăng ký thành viên cho khách hàng tại POS để bắt đầu thu thập dữ liệu."))
                    .build();
        }

        // Count totals and by tier
        long totalCustomers = allCustomers.size();
        long normalCount = allCustomers.stream().filter(c -> c.getTier() == CustomerTier.NORMAL).count();
        long silverCount = allCustomers.stream().filter(c -> c.getTier() == CustomerTier.SILVER).count();
        long goldCount = allCustomers.stream().filter(c -> c.getTier() == CustomerTier.GOLD).count();
        long platinumCount = allCustomers.stream().filter(c -> c.getTier() == CustomerTier.PLATINUM).count();

        // Top 5 VIPs
        List<Customer> vips = customerRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "totalSpent"))
        ).getContent();

        StringBuilder vipBuilder = new StringBuilder();
        for (Customer c : vips) {
            vipBuilder.append(String.format("- %s (%s): Tiêu dùng %sđ, Hạng %s, Điểm %d\n",
                    c.getName(), c.getPhone(), c.getTotalSpent().toString(), c.getTier().name(), c.getLoyaltyPoints()));
        }

        // At risk (inactive > 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Customer> atRisk = customerRepository.findInactiveCustomers(thirtyDaysAgo);

        StringBuilder atRiskBuilder = new StringBuilder();
        int atRiskLimit = Math.min(atRisk.size(), 5);
        for (int i = 0; i < atRiskLimit; i++) {
            Customer c = atRisk.get(i);
            LocalDateTime lastVisit = c.getLastVisitAt() != null ? c.getLastVisitAt() : c.getCreatedAt();
            long daysInactive = ChronoUnit.DAYS.between(lastVisit, LocalDateTime.now());
            atRiskBuilder.append(String.format("- %s (%s): Tiêu dùng %sđ, Không hoạt động %d ngày\n",
                    c.getName(), c.getPhone(), c.getTotalSpent().toString(), daysInactive));
        }
        if (atRisk.isEmpty()) {
            atRiskBuilder.append("(Không có khách hàng nào ngừng ghé quán quá 30 ngày)\n");
        }

        // Load prompt template
        String promptTemplate = loadPrompt("customer-segment.txt");
        String finalPrompt = promptTemplate
                .replace("{total_customers}", String.valueOf(totalCustomers))
                .replace("{normal_count}", String.valueOf(normalCount))
                .replace("{silver_count}", String.valueOf(silverCount))
                .replace("{gold_count}", String.valueOf(goldCount))
                .replace("{platinum_count}", String.valueOf(platinumCount))
                .replace("{top_vip_data}", vipBuilder.toString())
                .replace("{at_risk_data}", atRiskBuilder.toString());

        String aiResponseJson = callGemini(finalPrompt);

        try {
            JsonNode rootNode = objectMapper.readTree(aiResponseJson);
            String aiAnalysis = rootNode.path("aiAnalysis").asText();
            List<String> marketingSuggestions = new ArrayList<>();
            JsonNode sugNode = rootNode.path("marketingSuggestions");
            if (sugNode.isArray()) {
                for (JsonNode n : sugNode) {
                    marketingSuggestions.add(n.asText());
                }
            }

            // Segment actual customer responses to send back to frontend
            List<CustomerResponse> vipResponse = vips.stream()
                    .map(CustomerResponse::fromEntity)
                    .collect(Collectors.toList());

            List<CustomerResponse> loyalResponse = allCustomers.stream()
                    .filter(c -> c.getTier() == CustomerTier.GOLD || c.getTier() == CustomerTier.PLATINUM)
                    .limit(10)
                    .map(CustomerResponse::fromEntity)
                    .collect(Collectors.toList());

            List<CustomerResponse> atRiskResponse = atRisk.stream()
                    .limit(10)
                    .map(CustomerResponse::fromEntity)
                    .collect(Collectors.toList());

            List<CustomerResponse> normalResponse = allCustomers.stream()
                    .filter(c -> c.getTier() == CustomerTier.NORMAL || c.getTier() == CustomerTier.SILVER)
                    .limit(10)
                    .map(CustomerResponse::fromEntity)
                    .collect(Collectors.toList());

            return CustomerSegmentResponse.builder()
                    .vipCustomers(vipResponse)
                    .loyalCustomers(loyalResponse)
                    .normalCustomers(normalResponse)
                    .atRiskCustomers(atRiskResponse)
                    .aiAnalysis(aiAnalysis)
                    .marketingSuggestions(marketingSuggestions)
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi phân tích phản hồi JSON từ Customer AI", e);
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
        systemPart.put("text", "Bạn là chuyên gia cố vấn AI về quan hệ khách hàng chuỗi cà phê. Chỉ phản hồi bằng dữ liệu JSON thô.");
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(systemPart));
        requestBody.put("systemInstruction", systemInstruction);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody);

        try {
            log.info("Đang gửi yêu cầu Customer AI đến Gemini API (Model: {})", model);
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
            log.error("Gặp lỗi khi kết nối với Gemini API cho Customer AI", e);
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            throw new AppException(ErrorCode.AI_SERVICE_ERROR, "Không thể kết nối dịch vụ AI Gemini");
        }
    }
}
