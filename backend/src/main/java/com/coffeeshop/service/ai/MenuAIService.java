package com.coffeeshop.service.ai;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.response.menu.MenuAnalysisResponse;
import com.coffeeshop.model.dto.response.menu.NewMenuSuggestion;
import com.coffeeshop.model.dto.response.menu.PriceSuggestion;
import com.coffeeshop.model.entity.Ingredient;
import com.coffeeshop.model.entity.MenuItemVariant;
import com.coffeeshop.model.entity.RecipeIngredient;
import com.coffeeshop.repository.IngredientRepository;
import com.coffeeshop.repository.MenuItemVariantRepository;
import com.coffeeshop.repository.RecipeIngredientRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuAIService {

    @Qualifier("geminiRestTemplate")
    private final RestTemplate restTemplate;

    private final MenuItemVariantRepository menuItemVariantRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.model:gemini-1.5-pro}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    @Transactional(readOnly = true)
    public MenuAnalysisResponse analyzeMenuEngineering() {
        List<MenuItemVariant> variants = menuItemVariantRepository.findAll();
        if (variants.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Thực đơn trống, không có gì để phân tích");
        }

        // Tạo chuỗi dữ liệu biến thể thực đơn gửi cho AI
        String menuData = variants.stream()
                .map(v -> String.format("- Variant ID: %d, Tên món: %s, Size: %s, Giá bán: %s, Giá vốn: %s, Số lượng bán (món): %d",
                        v.getId(),
                        v.getMenuItem().getName(),
                        v.getSize().toString(),
                        v.getPrice().toString(),
                        v.getCostPrice().toString(),
                        v.getMenuItem().getTotalSold()))
                .collect(Collectors.joining("\n"));

        String promptTemplate = loadPrompt("menu-analysis.txt");
        String finalPrompt = promptTemplate.replace("{menu_data}", menuData);

        String aiResponseJson = callGemini(finalPrompt);

        try {
            return objectMapper.readValue(aiResponseJson, MenuAnalysisResponse.class);
        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON trả về từ AI cho Menu Analysis", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public NewMenuSuggestion suggestNewMenu() {
        List<Ingredient> ingredients = ingredientRepository.findByIsActiveTrue();
        if (ingredients.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Kho nguyên liệu trống, không thể gợi ý món mới");
        }

        String ingredientsData = ingredients.stream()
                .map(ing -> String.format("- %s (Đơn vị: %s, Giá gốc: %s)",
                        ing.getName(), ing.getUnit(), ing.getUnitCost().toString()))
                .collect(Collectors.joining("\n"));

        String promptTemplate = loadPrompt("menu-suggest-new.txt");
        String finalPrompt = promptTemplate.replace("{ingredients_data}", ingredientsData);

        String aiResponseJson = callGemini(finalPrompt);

        try {
            return objectMapper.readValue(aiResponseJson, NewMenuSuggestion.class);
        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON trả về từ AI cho New Menu Suggestion", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public PriceSuggestion suggestPrice(Long variantId, BigDecimal targetMargin) {
        MenuItemVariant variant = menuItemVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy biến thể"));

        List<RecipeIngredient> recipes = recipeIngredientRepository.findByMenuItemVariantId(variantId);
        if (recipes.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Biến thể này chưa có công thức nguyên liệu, vui lòng bổ sung công thức trước");
        }

        String recipeDetails = recipes.stream()
                .map(r -> String.format("- %s: %s %s (Giá vốn đơn vị: %s)",
                        r.getIngredient().getName(),
                        r.getQuantity().toString(),
                        r.getIngredient().getUnit(),
                        r.getIngredient().getUnitCost().toString()))
                .collect(Collectors.joining("\n"));

        String promptTemplate = loadPrompt("menu-suggest-price.txt");
        String finalPrompt = promptTemplate
                .replace("{item_name}", variant.getMenuItem().getName() + " (Size " + variant.getSize() + ")")
                .replace("{cost_price}", variant.getCostPrice().toString())
                .replace("{recipe_details}", recipeDetails)
                .replace("{target_margin}", targetMargin.toString());

        String aiResponseJson = callGemini(finalPrompt);

        try {
            return objectMapper.readValue(aiResponseJson, PriceSuggestion.class);
        } catch (Exception e) {
            log.error("Lỗi khi phân tích JSON trả về từ AI cho Price Suggestion", e);
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
        systemPart.put("text", "Bạn là một trợ lý AI phân tích và đưa ra câu trả lời luôn ở định dạng JSON thô.");
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(systemPart));
        requestBody.put("systemInstruction", systemInstruction);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody);

        try {
            log.info("Đang gửi yêu cầu đến Gemini API (Model: {}): {}", model, url);
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
            log.error("Gặp lỗi khi kết nối với Gemini API", e);
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            throw new AppException(ErrorCode.AI_SERVICE_ERROR, "Không thể kết nối dịch vụ AI Gemini");
        }
    }
}
