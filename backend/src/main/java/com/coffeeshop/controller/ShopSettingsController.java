package com.coffeeshop.controller;

import com.coffeeshop.model.dto.request.settings.ShopSettingsRequest;
import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.settings.ShopSettingsResponse;
import com.coffeeshop.service.ShopSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class ShopSettingsController {

    private final ShopSettingsService shopSettingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<ShopSettingsResponse>> getSettings(Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success(shopSettingsService.getSettings(authentication.getName())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ShopSettingsResponse>> updateSettings(
            Authentication authentication,
            @Valid @RequestBody ShopSettingsRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        shopSettingsService.updateSettings(authentication.getName(), request),
                        "Cập nhật thông tin quán thành công"));
    }
}
