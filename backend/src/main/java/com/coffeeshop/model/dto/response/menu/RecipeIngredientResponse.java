package com.coffeeshop.model.dto.response.menu;

import com.coffeeshop.model.entity.RecipeIngredient;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class RecipeIngredientResponse {
    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private String unit;
    private BigDecimal quantity;

    public static RecipeIngredientResponse fromEntity(RecipeIngredient recipe) {
        if (recipe == null) return null;
        return RecipeIngredientResponse.builder()
                .id(recipe.getId())
                .ingredientId(recipe.getIngredient().getId())
                .ingredientName(recipe.getIngredient().getName())
                .unit(recipe.getIngredient().getUnit())
                .quantity(recipe.getQuantity())
                .build();
    }
}
