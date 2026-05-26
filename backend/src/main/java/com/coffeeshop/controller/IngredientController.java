package com.coffeeshop.controller;

import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.menu.IngredientResponse;
import com.coffeeshop.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<IngredientResponse>>> getAllIngredients() {
        List<IngredientResponse> response = ingredientService.getAllActiveIngredients().stream()
                .map(IngredientResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
