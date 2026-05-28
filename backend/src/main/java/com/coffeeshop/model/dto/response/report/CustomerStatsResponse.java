package com.coffeeshop.model.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerStatsResponse {
    private Long newCustomers;
    private Long activeCustomers;
    private Long returningCustomers;
    private Long pointsEarned;
    private Long pointsRedeemed;
}
