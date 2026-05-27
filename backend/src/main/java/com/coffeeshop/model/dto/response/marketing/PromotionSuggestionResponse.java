package com.coffeeshop.model.dto.response.marketing;

import com.coffeeshop.model.enums.PromotionType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class PromotionSuggestionResponse {
    private String name;
    private String description;
    private PromotionType type;
    private BigDecimal value;
    private BigDecimal minOrderValue;
    private String reasoning;
}
