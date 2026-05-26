package com.coffeeshop.model.dto.response.menu;

import com.coffeeshop.model.entity.Ingredient;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class IngredientResponse {
    private Long id;
    private String name;
    private String unit;
    private BigDecimal currentStock;
    private BigDecimal minStock;
    private BigDecimal unitCost;
    private Long supplierId;
    private String supplierName;
    private String supplierPhone;
    private Integer expiryDays;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("isLowStock")
    private boolean isLowStock;

    public static IngredientResponse fromEntity(Ingredient ingredient) {
        if (ingredient == null) return null;
        return IngredientResponse.builder()
                .id(ingredient.getId())
                .name(ingredient.getName())
                .unit(ingredient.getUnit())
                .currentStock(ingredient.getCurrentStock())
                .minStock(ingredient.getMinStock())
                .unitCost(ingredient.getUnitCost())
                .supplierId(ingredient.getSupplier() != null ? ingredient.getSupplier().getId() : null)
                .supplierName(ingredient.getSupplier() != null ? ingredient.getSupplier().getName() : null)
                .supplierPhone(ingredient.getSupplier() != null ? ingredient.getSupplier().getPhone() : null)
                .expiryDays(ingredient.getExpiryDays())
                .isActive(ingredient.isActive())
                .isLowStock(ingredient.getCurrentStock().compareTo(ingredient.getMinStock()) < 0)
                .build();
    }
}
