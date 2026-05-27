package com.coffeeshop.model.dto.response.promotion;

import com.coffeeshop.model.entity.Promotion;
import com.coffeeshop.model.enums.PromotionType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
public class PromotionResponse {
    private Long id;
    private String name;
    private String description;
    private PromotionType type;
    private BigDecimal value;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscount;
    private List<Long> applicableItems;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private int usedCount;
    private boolean isActive;
    private boolean isAiSuggested;
    private LocalDateTime createdAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static PromotionResponse fromEntity(Promotion promotion) {
        if (promotion == null) return null;

        List<Long> itemsList = new ArrayList<>();
        if (promotion.getApplicableItems() != null && !promotion.getApplicableItems().trim().isEmpty()) {
            try {
                itemsList = objectMapper.readValue(promotion.getApplicableItems(), new TypeReference<List<Long>>() {});
            } catch (Exception e) {
                // Ignore parsing errors, return empty list
            }
        }

        return PromotionResponse.builder()
                .id(promotion.getId())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .type(promotion.getType())
                .value(promotion.getValue())
                .minOrderValue(promotion.getMinOrderValue())
                .maxDiscount(promotion.getMaxDiscount())
                .applicableItems(itemsList)
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .usageLimit(promotion.getUsageLimit())
                .usedCount(promotion.getUsedCount())
                .isActive(promotion.isActive())
                .isAiSuggested(promotion.isAiSuggested())
                .createdAt(promotion.getCreatedAt())
                .build();
    }
}
