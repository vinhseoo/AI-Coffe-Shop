package com.coffeeshop.service.ai;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.marketing.CaptionRequest;
import com.coffeeshop.model.dto.response.marketing.CaptionResponse;
import com.coffeeshop.model.dto.response.marketing.PromotionSuggestionResponse;
import com.coffeeshop.model.entity.Ingredient;
import com.coffeeshop.model.entity.MenuItem;
import com.coffeeshop.repository.IngredientRepository;
import com.coffeeshop.repository.MenuItemRepository;
import com.fasterxml.jackson.core.type.TypeReference;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketingAIService {

    @Qualifier("geminiRestTemplate")
    private final RestTemplate restTemplate;

    private final MenuItemRepository menuItemRepository;
    private final IngredientRepository ingredientRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    @Transactional(readOnly = true)
    public CaptionResponse generateCaption(CaptionRequest request) {
        String productName = "";
        String productDescription = "";

        if (request.getMenuItemId() != null) {
            MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.MENU_ITEM_NOT_FOUND));
            productName = menuItem.getName();
            productDescription = menuItem.getDescription() != null ? menuItem.getDescription() : "Món nước ngon của quán";
        } else if (request.getCustomProduct() != null && !request.getCustomProduct().trim().isEmpty()) {
            productName = request.getCustomProduct();
            productDescription = "Sản phẩm đặc biệt tự định nghĩa";
        } else {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cần chọn món uống hoặc điền thông tin sản phẩm");
        }

        String promptTemplate = loadPrompt("marketing-caption.txt");
        String finalPrompt = promptTemplate
                .replace("{product_name}", productName)
                .replace("{product_description}", productDescription)
                .replace("{tone}", request.getTone() != null ? request.getTone() : "vui vẻ")
                .replace("{platform}", request.getPlatform() != null ? request.getPlatform() : "Facebook");

        String systemInstruction = "Bạn là chuyên gia marketing viết bài truyền thông cho quán cà phê. Bạn chỉ trả về cấu trúc JSON đúng định nghĩa. Không chèn mã ```json ở đầu và ``` ở cuối.";
        String responseJson = callGemini(finalPrompt, systemInstruction, true);

        try {
            JsonNode rootNode = objectMapper.readTree(responseJson);
            String shortCaption = rootNode.path("shortCaption").asText();
            String mediumCaption = rootNode.path("mediumCaption").asText();
            String longCaption = rootNode.path("longCaption").asText();
            
            List<String> hashtags = objectMapper.convertValue(
                    rootNode.path("hashtags"),
                    new TypeReference<List<String>>() {}
            );

            return CaptionResponse.builder()
                    .shortCaption(shortCaption)
                    .mediumCaption(mediumCaption)
                    .longCaption(longCaption)
                    .hashtags(hashtags)
                    .build();
        } catch (Exception e) {
            log.error("Lỗi parse phản hồi JSON tạo caption", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<PromotionSuggestionResponse> suggestPromotions() {
        // Gather inventory data (active ingredients)
        List<Ingredient> ingredients = ingredientRepository.findByIsActiveTrue();
        String inventoryData = ingredients.stream()
                .map(i -> String.format("- %s: Tồn hiện tại %s %s (Mức tối thiểu %s %s)",
                        i.getName(), i.getCurrentStock(), i.getUnit(), i.getMinStock(), i.getUnit()))
                .collect(Collectors.joining("\n"));
        if (inventoryData.isEmpty()) {
            inventoryData = "(Chưa có dữ liệu nguyên liệu trong kho)";
        }

        // Gather top selling items
        List<MenuItem> menuItems = menuItemRepository.findByIsAvailableTrueOrderByDisplayOrderAsc();
        String salesData = menuItems.stream()
                .limit(10)
                .map(m -> String.format("- %s: Đã bán %d ly %s",
                        m.getName(), m.getTotalSold(), m.isBestseller() ? "(BESTSELLER)" : ""))
                .collect(Collectors.joining("\n"));
        if (salesData.isEmpty()) {
            salesData = "(Chưa có dữ liệu món ăn uống trong menu)";
        }

        String promptTemplate = loadPrompt("marketing-promotion.txt");
        String finalPrompt = promptTemplate
                .replace("{inventory_data}", inventoryData)
                .replace("{sales_data}", salesData);

        String systemInstruction = "Bạn là chuyên gia gợi ý khuyến mãi dựa trên tồn kho và doanh số quán cà phê. Hãy trả về mảng JSON đúng mô tả. Không chèn ký tự ```json ở đầu và ``` ở cuối.";
        String responseJson = callGemini(finalPrompt, systemInstruction, true);

        try {
            return objectMapper.readValue(responseJson, new TypeReference<List<PromotionSuggestionResponse>>() {});
        } catch (Exception e) {
            log.error("Lỗi parse phản hồi JSON gợi ý khuyến mãi", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    public String suggestPostSchedule() {
        String prompt = "Hãy phân tích và đề xuất khung giờ vàng + ngày đăng bài mạng xã hội (Facebook, Instagram, TikTok) hiệu quả nhất cho một quán cà phê thông thường để tối đa hóa tương tác và lượng khách ghé quán. Viết chi tiết bằng tiếng Việt theo định dạng Markdown phong phú kèm emoji.";
        String systemInstruction = "Bạn là cố vấn chiến lược truyền thông quán cà phê. Hãy trả về nội dung dưới dạng Markdown đẹp mắt.";
        
        return callGemini(prompt, systemInstruction, false);
    }

    private String loadPrompt(String fileName) {
        try {
            InputStream inputStream = new ClassPathResource("prompts/" + fileName).getInputStream();
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Lỗi khi đọc file prompt template: {}", fileName, e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không thể tải cấu hình AI prompt: " + fileName);
        }
    }

    private String callGemini(String prompt, String systemInstructionText, boolean isJson) {
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

        if (isJson) {
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody);

        try {
            log.info("Đang gửi yêu cầu Marketing AI đến Gemini API (Model: {})", model);
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
            log.error("Gặp lỗi khi kết nối với Gemini API cho Marketing AI", e);
            if (e instanceof AppException) {
                throw (AppException) e;
            }
            throw new AppException(ErrorCode.AI_SERVICE_ERROR, "Không thể kết nối dịch vụ AI Gemini");
        }
    }
}
