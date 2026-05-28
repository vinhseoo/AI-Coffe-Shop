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
public class CategoryRevenueResponse {
    private String categoryName;
    private BigDecimal revenue;
    private Long quantity;
    private Double percentage;
}
