package com.coffeeshop.model.dto.response.inventory;

import com.coffeeshop.model.entity.InventoryLog;
import com.coffeeshop.model.enums.InventoryAction;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class InventoryLogResponse {
    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private String unit;
    private InventoryAction action;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private String note;
    private Long referenceId;
    private String createdBy;
    private LocalDateTime createdAt;

    public static InventoryLogResponse fromEntity(InventoryLog log) {
        if (log == null) return null;
        return InventoryLogResponse.builder()
                .id(log.getId())
                .ingredientId(log.getIngredient().getId())
                .ingredientName(log.getIngredient().getName())
                .unit(log.getIngredient().getUnit())
                .action(log.getAction())
                .quantity(log.getQuantity())
                .unitCost(log.getUnitCost())
                .totalCost(log.getTotalCost())
                .note(log.getNote())
                .referenceId(log.getReferenceId())
                .createdBy(log.getCreatedBy())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
