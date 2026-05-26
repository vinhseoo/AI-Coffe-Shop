package com.coffeeshop.controller;

import com.coffeeshop.model.dto.request.menu.ToppingRequest;
import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.menu.ToppingResponse;
import com.coffeeshop.service.ToppingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toppings")
@RequiredArgsConstructor
public class ToppingController {

    private final ToppingService toppingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ToppingResponse>>> getAllToppings(
            @RequestParam(value = "onlyAvailable", required = false, defaultValue = "false") boolean onlyAvailable) {
        return ResponseEntity.ok(ApiResponse.success(toppingService.getAllToppings(onlyAvailable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ToppingResponse>> createTopping(
            @Valid @RequestBody ToppingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toppingService.createTopping(request), "Tạo topping mới thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ToppingResponse>> updateTopping(
            @PathVariable Long id,
            @Valid @RequestBody ToppingRequest request) {
        return ResponseEntity.ok(ApiResponse.success(toppingService.updateTopping(id, request), "Cập nhật topping thành công"));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<ToppingResponse>> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(toppingService.toggleAvailability(id), "Cập nhật trạng thái topping thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTopping(@PathVariable Long id) {
        toppingService.deleteTopping(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa topping thành công"));
    }
}
