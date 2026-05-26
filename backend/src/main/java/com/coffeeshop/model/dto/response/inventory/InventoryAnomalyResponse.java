package com.coffeeshop.model.dto.response.inventory;

import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAnomalyResponse {
    private List<AnomalyItem> anomalies;
    private String summary;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyItem {
        private Long ingredientId;
        private String ingredientName;
        private String anomalyType; // RAPID_DEPLETION, NEAR_EXPIRY, UNUSUALLY_LOW
        private String description;
        private String severity; // HIGH, MEDIUM, LOW
    }
}
