package com.coffeeshop.controller;

import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.menu.MenuAnalysisResponse;
import com.coffeeshop.model.dto.response.menu.NewMenuSuggestion;
import com.coffeeshop.model.dto.response.menu.PriceSuggestion;
import com.coffeeshop.service.ai.MenuAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/menu/ai")
@RequiredArgsConstructor
public class MenuAIController {

    private final MenuAIService menuAIService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<MenuAnalysisResponse>> analyzeMenu() {
        return ResponseEntity.ok(ApiResponse.success(menuAIService.analyzeMenuEngineering()));
    }

    @PostMapping("/suggest-new")
    public ResponseEntity<ApiResponse<NewMenuSuggestion>> suggestNewMenu() {
        return ResponseEntity.ok(ApiResponse.success(menuAIService.suggestNewMenu()));
    }

    @PostMapping("/suggest-price")
    public ResponseEntity<ApiResponse<PriceSuggestion>> suggestPrice(
            @RequestParam("menuItemId") Long menuItemId,
            @RequestParam("targetMargin") BigDecimal targetMargin) {
        return ResponseEntity.ok(ApiResponse.success(menuAIService.suggestPrice(menuItemId, targetMargin)));
    }
}
