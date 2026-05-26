package com.coffeeshop.controller;

import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.inventory.InventoryAnomalyResponse;
import com.coffeeshop.model.dto.response.inventory.InventoryForecastResponse;
import com.coffeeshop.service.ai.InventoryAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory/ai")
@RequiredArgsConstructor
public class InventoryAIController {

    private final InventoryAIService inventoryAIService;

    @PostMapping("/forecast")
    public ResponseEntity<ApiResponse<InventoryForecastResponse>> forecastDemand() {
        return ResponseEntity.ok(ApiResponse.success(inventoryAIService.forecastDemand()));
    }

    @PostMapping("/anomaly")
    public ResponseEntity<ApiResponse<InventoryAnomalyResponse>> detectAnomalies() {
        return ResponseEntity.ok(ApiResponse.success(inventoryAIService.detectAnomalies()));
    }
}
