package com.coffeeshop.model.dto.response.menu;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class MenuAnalysisItem {
    private Long menuItemId;
    private String name;
    private String quadrant; // STAR, PUZZLE, PLOW_HORSE, DOG
    private Integer totalSold;
    private BigDecimal revenue;
    private BigDecimal margin;
    private String suggestion;
}
