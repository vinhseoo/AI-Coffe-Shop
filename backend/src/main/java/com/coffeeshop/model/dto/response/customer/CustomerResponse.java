package com.coffeeshop.model.dto.response.customer;

import com.coffeeshop.model.entity.Customer;
import com.coffeeshop.model.enums.CustomerTier;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private LocalDate birthday;
    private int totalOrders;
    private BigDecimal totalSpent;
    private int loyaltyPoints;
    private CustomerTier tier;
    private String note;
    private LocalDateTime lastVisitAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CustomerResponse fromEntity(Customer c) {
        if (c == null) return null;
        return CustomerResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .phone(c.getPhone())
                .email(c.getEmail())
                .birthday(c.getBirthday())
                .totalOrders(c.getTotalOrders())
                .totalSpent(c.getTotalSpent())
                .loyaltyPoints(c.getLoyaltyPoints())
                .tier(c.getTier())
                .note(c.getNote())
                .lastVisitAt(c.getLastVisitAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
