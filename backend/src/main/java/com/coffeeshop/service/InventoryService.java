package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.inventory.ImportItemRequest;
import com.coffeeshop.model.dto.request.inventory.ImportRequest;
import com.coffeeshop.model.dto.request.inventory.StockActionRequest;
import com.coffeeshop.model.dto.response.inventory.InventoryLogResponse;
import com.coffeeshop.model.entity.Ingredient;
import com.coffeeshop.model.entity.InventoryLog;
import com.coffeeshop.model.enums.InventoryAction;
import com.coffeeshop.repository.IngredientRepository;
import com.coffeeshop.repository.InventoryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryLogRepository inventoryLogRepository;
    private final IngredientRepository ingredientRepository;

    /**
     * Nhập kho hàng loạt: tăng tồn kho, cập nhật giá vốn, ghi log.
     */
    @Transactional
    public List<InventoryLogResponse> importStock(ImportRequest request) {
        List<InventoryLogResponse> results = new ArrayList<>();

        for (ImportItemRequest item : request.getItems()) {
            Ingredient ingredient = ingredientRepository.findById(item.getIngredientId())
                    .orElseThrow(() -> new AppException(ErrorCode.INGREDIENT_NOT_FOUND,
                            "Không tìm thấy nguyên liệu ID: " + item.getIngredientId()));

            // Tăng tồn kho
            ingredient.setCurrentStock(ingredient.getCurrentStock().add(item.getQuantity()));

            // Cập nhật giá vốn đơn vị mới (lấy giá nhập gần nhất)
            ingredient.setUnitCost(item.getUnitCost());

            ingredientRepository.save(ingredient);

            // Tạo log
            BigDecimal totalCost = item.getQuantity().multiply(item.getUnitCost());
            String note = item.getNote();
            if (request.getNote() != null && !request.getNote().isBlank()) {
                note = (note != null ? note + " | " : "") + request.getNote();
            }

            InventoryLog logEntry = InventoryLog.builder()
                    .ingredient(ingredient)
                    .action(InventoryAction.IMPORT)
                    .quantity(item.getQuantity())
                    .unitCost(item.getUnitCost())
                    .totalCost(totalCost)
                    .note(note)
                    .build();

            logEntry = inventoryLogRepository.save(logEntry);
            results.add(InventoryLogResponse.fromEntity(logEntry));

            log.info("Nhập kho: {} +{} {} (giá vốn: {})", ingredient.getName(), item.getQuantity(), ingredient.getUnit(), item.getUnitCost());
        }

        return results;
    }

    /**
     * Xuất kho: giảm tồn kho, ghi log.
     */
    @Transactional
    public InventoryLogResponse exportStock(StockActionRequest request) {
        Ingredient ingredient = ingredientRepository.findById(request.getIngredientId())
                .orElseThrow(() -> new AppException(ErrorCode.INGREDIENT_NOT_FOUND));

        // Kiểm tra đủ hàng
        if (ingredient.getCurrentStock().compareTo(request.getQuantity()) < 0) {
            throw new AppException(ErrorCode.OUT_OF_STOCK,
                    String.format("Không đủ tồn kho cho %s: hiện có %s %s, yêu cầu xuất %s",
                            ingredient.getName(), ingredient.getCurrentStock(), ingredient.getUnit(), request.getQuantity()));
        }

        ingredient.setCurrentStock(ingredient.getCurrentStock().subtract(request.getQuantity()));
        ingredientRepository.save(ingredient);

        BigDecimal totalCost = request.getQuantity().multiply(ingredient.getUnitCost());
        InventoryLog logEntry = InventoryLog.builder()
                .ingredient(ingredient)
                .action(InventoryAction.EXPORT)
                .quantity(request.getQuantity())
                .unitCost(ingredient.getUnitCost())
                .totalCost(totalCost)
                .note(request.getNote())
                .build();

        logEntry = inventoryLogRepository.save(logEntry);
        log.info("Xuất kho: {} -{} {}", ingredient.getName(), request.getQuantity(), ingredient.getUnit());
        return InventoryLogResponse.fromEntity(logEntry);
    }

    /**
     * Điều chỉnh tồn kho: set giá trị mới, ghi log chênh lệch.
     */
    @Transactional
    public InventoryLogResponse adjustStock(StockActionRequest request) {
        Ingredient ingredient = ingredientRepository.findById(request.getIngredientId())
                .orElseThrow(() -> new AppException(ErrorCode.INGREDIENT_NOT_FOUND));

        BigDecimal oldStock = ingredient.getCurrentStock();
        BigDecimal newStock = request.getQuantity();
        BigDecimal diff = newStock.subtract(oldStock);

        ingredient.setCurrentStock(newStock);
        ingredientRepository.save(ingredient);

        String adjustNote = String.format("Điều chỉnh: %s → %s (%s%s)",
                oldStock, newStock, diff.signum() >= 0 ? "+" : "", diff);
        if (request.getNote() != null && !request.getNote().isBlank()) {
            adjustNote = adjustNote + " | " + request.getNote();
        }

        InventoryLog logEntry = InventoryLog.builder()
                .ingredient(ingredient)
                .action(InventoryAction.ADJUST)
                .quantity(diff.abs())
                .unitCost(ingredient.getUnitCost())
                .totalCost(BigDecimal.ZERO)
                .note(adjustNote)
                .build();

        logEntry = inventoryLogRepository.save(logEntry);
        log.info("Điều chỉnh kho: {} từ {} → {} {}", ingredient.getName(), oldStock, newStock, ingredient.getUnit());
        return InventoryLogResponse.fromEntity(logEntry);
    }

    /**
     * Lấy lịch sử kho có phân trang + filter.
     */
    @Transactional(readOnly = true)
    public Page<InventoryLogResponse> getLogs(Long ingredientId, InventoryAction action, Pageable pageable) {
        Page<InventoryLog> page;

        if (ingredientId != null && action != null) {
            page = inventoryLogRepository.findByIngredientIdAndAction(ingredientId, action, pageable);
        } else if (ingredientId != null) {
            page = inventoryLogRepository.findByIngredientId(ingredientId, pageable);
        } else if (action != null) {
            page = inventoryLogRepository.findByAction(action, pageable);
        } else {
            page = inventoryLogRepository.findAllOrderByCreatedAtDesc(pageable);
        }

        return page.map(InventoryLogResponse::fromEntity);
    }
}
