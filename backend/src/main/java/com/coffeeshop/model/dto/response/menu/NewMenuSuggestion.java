package com.coffeeshop.model.dto.response.menu;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class NewMenuSuggestion {
    private String name;
    private String description;
    private BigDecimal suggestedPrice;
    private List<RequiredIngredient> requiredIngredients;
    private String reasoning;

    @Getter
    @Setter
    @Builder
    public static class RequiredIngredient {
        private String name;
        private BigDecimal quantity;
        private String unit;
    }
}
