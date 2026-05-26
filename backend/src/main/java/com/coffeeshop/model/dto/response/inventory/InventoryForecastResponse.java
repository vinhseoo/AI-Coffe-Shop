package com.coffeeshop.model.dto.response.inventory;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryForecastResponse {
    private List<IngredientForecastItem> predictions;
    private List<IngredientForecastItem> urgentItems;
    private BigDecimal totalEstimatedCost;
    private String summary;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IngredientForecastItem {
        private Long ingredientId;
        private String ingredientName;
        private String unit;
        private BigDecimal currentStock;
        private BigDecimal predictedConsumption7Days;
        private int daysUntilRunOut;
        private BigDecimal suggestedImportQuantity;
        private BigDecimal estimatedCost;
        private String priority; // HIGH, MEDIUM, LOW
    }
}
