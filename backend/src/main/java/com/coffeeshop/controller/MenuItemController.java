package com.coffeeshop.controller;

import com.coffeeshop.model.dto.request.menu.MenuItemRequest;
import com.coffeeshop.model.dto.request.menu.RecipeRequest;
import com.coffeeshop.model.dto.request.menu.VariantRequest;
import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.PagedResponse;
import com.coffeeshop.model.dto.response.menu.MenuItemDetailResponse;
import com.coffeeshop.model.dto.response.menu.MenuItemResponse;
import com.coffeeshop.model.dto.response.menu.MenuItemVariantResponse;
import com.coffeeshop.model.dto.response.menu.RecipeIngredientResponse;
import com.coffeeshop.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<MenuItemResponse>>> searchMenuItems(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size) {
        
        int pageIndex = page > 0 ? page - 1 : 0;
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by("displayOrder").ascending().and(Sort.by("name").ascending()));
        
        Page<MenuItemResponse> pageResult = menuItemService.searchMenuItems(categoryId, search, pageable);
        
        PagedResponse<MenuItemResponse> pagedResponse = PagedResponse.<MenuItemResponse>builder()
                .content(pageResult.getContent())
                .pageNumber(pageResult.getNumber() + 1)
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
                
        return ResponseEntity.ok(ApiResponse.success(pagedResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemDetailResponse>> getMenuItemDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getMenuItemDetail(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(menuItemService.createMenuItem(request), "Thêm sản phẩm mới thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.updateMenuItem(id, request), "Cập nhật sản phẩm thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa sản phẩm thành công"));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.toggleAvailability(id), "Cập nhật trạng thái thành công"));
    }

    // ==========================================
    // VARIANT ENDPOINTS
    // ==========================================

    @PostMapping("/{id}/variants")
    public ResponseEntity<ApiResponse<MenuItemVariantResponse>> addVariant(
            @PathVariable Long id,
            @Valid @RequestBody VariantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(menuItemService.addVariant(id, request), "Thêm kích thước mới thành công"));
    }

    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<MenuItemVariantResponse>> updateVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody VariantRequest request) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.updateVariant(variantId, request), "Cập nhật biến thể thành công"));
    }

    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable Long variantId) {
        menuItemService.deleteVariant(variantId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa kích thước thành công"));
    }

    @PatchMapping("/variants/{variantId}/toggle")
    public ResponseEntity<ApiResponse<MenuItemVariantResponse>> toggleVariantAvailability(@PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.toggleVariantAvailability(variantId), "Cập nhật trạng thái biến thể thành công"));
    }

    // ==========================================
    // RECIPE ENDPOINTS (Variant Level)
    // ==========================================

    @GetMapping("/variants/{variantId}/recipe")
    public ResponseEntity<ApiResponse<List<RecipeIngredientResponse>>> getRecipe(@PathVariable Long variantId) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getRecipe(variantId)));
    }

    @PostMapping("/variants/{variantId}/recipe")
    public ResponseEntity<ApiResponse<List<RecipeIngredientResponse>>> saveRecipe(
            @PathVariable Long variantId,
            @Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.saveRecipe(variantId, request), "Cập nhật công thức thành công"));
    }
}
