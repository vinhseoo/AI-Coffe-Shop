package com.coffeeshop.model.dto.response.customer;

import com.coffeeshop.model.entity.LoyaltyTransaction;
import com.coffeeshop.model.enums.LoyaltyAction;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransactionResponse {

    private Long id;
    private Long customerId;
    private Long orderId;
    private int points;
    private LoyaltyAction action;
    private String description;
    private LocalDateTime createdAt;

    public static LoyaltyTransactionResponse fromEntity(LoyaltyTransaction t) {
        if (t == null) return null;
        return LoyaltyTransactionResponse.builder()
                .id(t.getId())
                .customerId(t.getCustomer() != null ? t.getCustomer().getId() : null)
                .orderId(t.getOrderId())
                .points(t.getPoints())
                .action(t.getAction())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
