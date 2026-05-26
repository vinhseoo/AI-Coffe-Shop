package com.coffeeshop.model.dto.response.menu;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@Builder
public class PriceSuggestion {
    private BigDecimal suggestedPrice;
    private Map<String, BigDecimal> costBreakdown;
    private BigDecimal targetMargin;
    private String reasoning;
}
