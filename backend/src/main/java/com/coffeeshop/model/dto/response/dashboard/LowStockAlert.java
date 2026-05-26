package com.coffeeshop.model.dto.response.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockAlert {
    private Long ingredientId;
    private String name;
    private BigDecimal currentStock;
    private BigDecimal minStock;
    private String unit;
}
