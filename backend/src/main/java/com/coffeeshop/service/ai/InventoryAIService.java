package com.coffeeshop.service.ai;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.response.inventory.InventoryAnomalyResponse;
import com.coffeeshop.model.dto.response.inventory.InventoryForecastResponse;
import com.coffeeshop.model.entity.Ingredient;
import com.coffeeshop.repository.IngredientRepository;
import com.coffeeshop.repository.InventoryLogRepository;
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
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryAIService {

    @Qualifier("geminiRestTemplate")
    private final RestTemplate restTemplate;

    private final IngredientRepository ingredientRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.model:gemini-1.5-pro}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    /**
     * Dự báo nhu cầu nguyên liệu dựa trên dữ liệu tiêu thụ 30 ngày.
     */
    @Transactional(readOnly = true)
    public InventoryForecastResponse forecastDemand() {
        List<Ingredient> ingredients = ingredientRepository.findByIsActiveTrue();
        if (ingredients.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không có nguyên liệu nào để phân tích");
        }

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // Build consumption data cho mỗi nguyên liệu
        StringBuilder dataBuilder = new StringBuilder();
        for (Ingredient ing : ingredients) {
            BigDecimal consumption30d = inventoryLogRepository.sumConsumptionSince(ing.getId(), thirtyDaysAgo);
            if (consumption30d == null) consumption30d = BigDecimal.ZERO;

            dataBuilder.append(String.format(
                    "- %s (ID: %d, Đơn vị: %s, Tồn kho: %s, Tồn tối thiểu: %s, Giá vốn: %s, Tiêu thụ 30 ngày: %s)\n",
                    ing.getName(), ing.getId(), ing.getUnit(),
                    ing.getCurrentStock(), ing.getMinStock(),
                    ing.getUnitCost(), consumption30d));
        }

        String promptTemplate = loadPrompt("inventory-forecast.txt");
        String finalPrompt = promptTemplate.replace("{inventory_data}", dataBuilder.toString());

        String aiResponseJson = callGemini(finalPrompt);

        try {
            return objectMapper.readValue(aiResponseJson, InventoryForecastResponse.class);
        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON trả về từ AI cho Inventory Forecast", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    /**
     * Phát hiện bất thường trong tiêu thụ nguyên liệu.
     */
    @Transactional(readOnly = true)
    public InventoryAnomalyResponse detectAnomalies() {
        List<Ingredient> ingredients = ingredientRepository.findByIsActiveTrue();
        if (ingredients.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không có nguyên liệu nào để phân tích");
        }

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // So sánh tiêu thụ 7 ngày gần nhất vs trung bình 30 ngày
        StringBuilder dataBuilder = new StringBuilder();
        for (Ingredient ing : ingredients) {
            BigDecimal consumption7d = inventoryLogRepository.sumConsumptionSince(ing.getId(), sevenDaysAgo);
            BigDecimal consumption30d = inventoryLogRepository.sumConsumptionSince(ing.getId(), thirtyDaysAgo);
            if (consumption7d == null) consumption7d = BigDecimal.ZERO;
            if (consumption30d == null) consumption30d = BigDecimal.ZERO;

            dataBuilder.append(String.format(
                    "- %s (Tồn kho: %s/%s %s, Tiêu thụ 7 ngày: %s, Tiêu thụ 30 ngày: %s, Hạn sử dụng: %s ngày)\n",
                    ing.getName(), ing.getCurrentStock(), ing.getMinStock(), ing.getUnit(),
                    consumption7d, consumption30d,
                    ing.getExpiryDays() != null ? ing.getExpiryDays() : "N/A"));
        }

        String promptTemplate = loadPrompt("inventory-anomaly.txt");
        String finalPrompt = promptTemplate.replace("{inventory_data}", dataBuilder.toString());

        String aiResponseJson = callGemini(finalPrompt);

        try {
            return objectMapper.readValue(aiResponseJson, InventoryAnomalyResponse.class);
        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON trả về từ AI cho Inventory Anomaly", e);
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
        systemPart.put("text", "Bạn là một trợ lý AI chuyên gia quản lý kho nguyên vật liệu quán cà phê. Luôn trả lời ở định dạng JSON thô.");
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(systemPart));
        requestBody.put("systemInstruction", systemInstruction);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody);

        try {
            log.info("Đang gửi yêu cầu Inventory AI đến Gemini API (Model: {})", model);
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
            log.error("Gặp lỗi khi kết nối với Gemini API cho Inventory AI", e);
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            throw new AppException(ErrorCode.AI_SERVICE_ERROR, "Không thể kết nối dịch vụ AI Gemini");
        }
    }
}
