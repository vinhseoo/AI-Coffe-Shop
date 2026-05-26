package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.inventory.IngredientRequest;
import com.coffeeshop.model.dto.response.menu.IngredientResponse;
import com.coffeeshop.model.entity.Ingredient;
import com.coffeeshop.model.entity.Supplier;
import com.coffeeshop.repository.IngredientRepository;
import com.coffeeshop.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final SupplierRepository supplierRepository;

    /**
     * Lấy tất cả nguyên liệu active (dùng cho Menu module — Recipe Editor dropdown).
     */
    @Transactional(readOnly = true)
    public List<IngredientResponse> getAllActiveIngredients() {
        return ingredientRepository.findByIsActiveTrue().stream()
                .map(IngredientResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy nguyên liệu active có phân trang + tìm kiếm.
     */
    @Transactional(readOnly = true)
    public Page<IngredientResponse> searchIngredients(String name, Pageable pageable) {
        Page<Ingredient> page;
        if (name != null && !name.isBlank()) {
            page = ingredientRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name, pageable);
        } else {
            page = ingredientRepository.findByIsActiveTrue(pageable);
        }
        return page.map(IngredientResponse::fromEntity);
    }

    /**
     * Lấy chi tiết nguyên liệu theo ID.
     */
    @Transactional(readOnly = true)
    public IngredientResponse getIngredientById(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INGREDIENT_NOT_FOUND));
        return IngredientResponse.fromEntity(ingredient);
    }

    /**
     * Tạo nguyên liệu mới.
     */
    @Transactional
    public IngredientResponse createIngredient(IngredientRequest request) {
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        }

        Ingredient ingredient = Ingredient.builder()
                .name(request.getName())
                .unit(request.getUnit())
                .minStock(request.getMinStock())
                .unitCost(request.getUnitCost())
                .supplier(supplier)
                .expiryDays(request.getExpiryDays())
                .isActive(true)
                .build();

        ingredient = ingredientRepository.save(ingredient);
        log.info("Tạo nguyên liệu mới thành công: {}", ingredient.getName());
        return IngredientResponse.fromEntity(ingredient);
    }

    /**
     * Cập nhật nguyên liệu.
     */
    @Transactional
    public IngredientResponse updateIngredient(Long id, IngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INGREDIENT_NOT_FOUND));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        }

        ingredient.setName(request.getName());
        ingredient.setUnit(request.getUnit());
        ingredient.setMinStock(request.getMinStock());
        ingredient.setUnitCost(request.getUnitCost());
        ingredient.setSupplier(supplier);
        ingredient.setExpiryDays(request.getExpiryDays());

        ingredient = ingredientRepository.save(ingredient);
        log.info("Cập nhật nguyên liệu thành công: {}", ingredient.getName());
        return IngredientResponse.fromEntity(ingredient);
    }

    /**
     * Soft delete: đánh dấu nguyên liệu là inactive.
     */
    @Transactional
    public void deleteIngredient(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INGREDIENT_NOT_FOUND));
        ingredient.setActive(false);
        ingredientRepository.save(ingredient);
        log.info("Ngưng sử dụng nguyên liệu: {}", ingredient.getName());
    }

    /**
     * Lấy danh sách nguyên liệu tồn kho thấp (currentStock < minStock).
     */
    @Transactional(readOnly = true)
    public List<IngredientResponse> getLowStockIngredients() {
        return ingredientRepository.findLowStockIngredients().stream()
                .map(IngredientResponse::fromEntity)
                .collect(Collectors.toList());
    }
}

