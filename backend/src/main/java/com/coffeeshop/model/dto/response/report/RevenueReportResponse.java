package com.coffeeshop.model.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportResponse {
    private List<DateRevenuePair> dataPoints;
    private BigDecimal totalRevenue;
    private Long totalOrders;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DateRevenuePair {
        private String label; // e.g. "2026-05-28" or "W22" or "2026-05"
        private BigDecimal revenue;
        private Long orderCount;
    }
}
