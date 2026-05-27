package com.coffeeshop.model.dto.response.customer;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSegmentResponse {

    private List<CustomerResponse> vipCustomers;
    private List<CustomerResponse> loyalCustomers;
    private List<CustomerResponse> normalCustomers;
    private List<CustomerResponse> atRiskCustomers;
    private String aiAnalysis;
    private List<String> marketingSuggestions;
}
