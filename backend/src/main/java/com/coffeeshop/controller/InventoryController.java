package com.coffeeshop.controller;

import com.coffeeshop.model.dto.request.inventory.ImportRequest;
import com.coffeeshop.model.dto.request.inventory.StockActionRequest;
import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.PagedResponse;
import com.coffeeshop.model.dto.response.inventory.InventoryLogResponse;
import com.coffeeshop.model.enums.InventoryAction;
import com.coffeeshop.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<List<InventoryLogResponse>>> importStock(@Valid @RequestBody ImportRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.importStock(request), "Nhập kho thành công"));
    }

    @PostMapping("/export")
    public ResponseEntity<ApiResponse<InventoryLogResponse>> exportStock(@Valid @RequestBody StockActionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.exportStock(request), "Xuất kho thành công"));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryLogResponse>> adjustStock(@Valid @RequestBody StockActionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.adjustStock(request), "Điều chỉnh tồn kho thành công"));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<PagedResponse<InventoryLogResponse>>> getLogs(
            @RequestParam(required = false) Long ingredientId,
            @RequestParam(required = false) InventoryAction action,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<InventoryLogResponse> result = inventoryService.getLogs(
                ingredientId, action, PageRequest.of(page - 1, size, Sort.by("id").descending()));
        
        PagedResponse<InventoryLogResponse> paged = PagedResponse.<InventoryLogResponse>builder()
                .content(result.getContent())
                .pageNumber(result.getNumber() + 1)
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(paged));
    }
}
