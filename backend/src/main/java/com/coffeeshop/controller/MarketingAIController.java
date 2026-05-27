package com.coffeeshop.controller;

import com.coffeeshop.model.dto.request.marketing.CaptionRequest;
import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.marketing.CaptionResponse;
import com.coffeeshop.model.dto.response.marketing.PromotionSuggestionResponse;
import com.coffeeshop.service.ai.MarketingAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing/ai")
@RequiredArgsConstructor
public class MarketingAIController {

    private final MarketingAIService marketingAIService;

    @PostMapping("/caption")
    public ResponseEntity<ApiResponse<CaptionResponse>> generateCaption(@Valid @RequestBody CaptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(marketingAIService.generateCaption(request)));
    }

    @GetMapping("/promotions")
    public ResponseEntity<ApiResponse<List<PromotionSuggestionResponse>>> suggestPromotions() {
        return ResponseEntity.ok(ApiResponse.success(marketingAIService.suggestPromotions()));
    }

    @GetMapping("/schedule")
    public ResponseEntity<ApiResponse<String>> suggestPostSchedule() {
        return ResponseEntity.ok(ApiResponse.success(marketingAIService.suggestPostSchedule()));
    }
}
