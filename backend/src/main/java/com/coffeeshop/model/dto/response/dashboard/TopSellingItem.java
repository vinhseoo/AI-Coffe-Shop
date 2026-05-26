package com.coffeeshop.model.dto.response.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopSellingItem {
    private Long menuItemId;
    private String name;
    private Long totalSold;
    private BigDecimal revenue;
    private String imageUrl;
}
