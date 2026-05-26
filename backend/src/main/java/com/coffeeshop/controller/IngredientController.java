package com.coffeeshop.controller;

import com.coffeeshop.model.dto.request.inventory.IngredientRequest;
import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.PagedResponse;
import com.coffeeshop.model.dto.response.menu.IngredientResponse;
import com.coffeeshop.service.IngredientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;

    /**
     * Lấy danh sách nguyên liệu: hỗ trợ phân trang + tìm kiếm.
     * Nếu không có param page thì trả về tất cả nguyên liệu active (cho dropdown).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllIngredients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (page != null) {
            // Trả về kết quả phân trang
            Page<IngredientResponse> result = ingredientService.searchIngredients(
                    search, PageRequest.of(page - 1, size, Sort.by("name")));
            PagedResponse<IngredientResponse> paged = PagedResponse.<IngredientResponse>builder()
                    .content(result.getContent())
                    .pageNumber(result.getNumber() + 1)
                    .pageSize(result.getSize())
                    .totalElements(result.getTotalElements())
                    .totalPages(result.getTotalPages())
                    .last(result.isLast())
                    .build();
            return ResponseEntity.ok(ApiResponse.success(paged));
        } else {
            // Trả về tất cả active (cho dropdown chọn nguyên liệu)
            List<IngredientResponse> response = ingredientService.getAllActiveIngredients();
            return ResponseEntity.ok(ApiResponse.success(response));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientResponse>> getIngredient(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(ingredientService.getIngredientById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IngredientResponse>> createIngredient(@Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(ApiResponse.success(ingredientService.createIngredient(request), "Tạo nguyên liệu mới thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientResponse>> updateIngredient(@PathVariable Long id, @Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(ApiResponse.success(ingredientService.updateIngredient(id, request), "Cập nhật nguyên liệu thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Ngưng sử dụng nguyên liệu thành công"));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<IngredientResponse>>> getLowStockIngredients() {
        return ResponseEntity.ok(ApiResponse.success(ingredientService.getLowStockIngredients()));
    }
}

