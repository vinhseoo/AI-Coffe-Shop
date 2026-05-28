package com.coffeeshop.model.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopItemResponse {
    private Long menuItemId;
    private String name;
    private Long totalSold;
    private BigDecimal revenue;
    private BigDecimal totalCost;
    private BigDecimal profit;
    private String imageUrl;
}
