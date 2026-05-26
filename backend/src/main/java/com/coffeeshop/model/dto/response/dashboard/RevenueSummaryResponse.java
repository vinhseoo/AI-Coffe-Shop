package com.coffeeshop.model.dto.response.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummaryResponse {
    private String label;
    private BigDecimal revenue;
    private Long orderCount;
}
