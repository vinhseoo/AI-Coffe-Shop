package com.coffeeshop.model.dto.response.menu;

import com.coffeeshop.model.entity.Ingredient;
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
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive;

    public static IngredientResponse fromEntity(Ingredient ingredient) {
        if (ingredient == null) return null;
        return IngredientResponse.builder()
                .id(ingredient.getId())
                .name(ingredient.getName())
                .unit(ingredient.getUnit())
                .currentStock(ingredient.getCurrentStock())
                .minStock(ingredient.getMinStock())
                .unitCost(ingredient.getUnitCost())
                .isActive(ingredient.isActive())
                .build();
    }
}
