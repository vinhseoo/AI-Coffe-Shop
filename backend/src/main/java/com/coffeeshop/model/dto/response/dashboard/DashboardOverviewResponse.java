package com.coffeeshop.model.dto.response.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {
    private BigDecimal todayRevenue;
    private BigDecimal yesterdayRevenue;
    private Double revenueChangePercent;
    private Long todayOrderCount;
    private Long yesterdayOrderCount;
    private Double orderCountChangePercent;
    private BigDecimal avgOrderValue;
}
