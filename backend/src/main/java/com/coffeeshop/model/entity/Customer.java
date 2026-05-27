package com.coffeeshop.model.entity;

import com.coffeeshop.model.enums.CustomerTier;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    private LocalDate birthday;

    @Column(name = "total_orders", nullable = false)
    @Builder.Default
    private int totalOrders = 0;

    @Column(name = "total_spent", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(name = "loyalty_points", nullable = false)
    @Builder.Default
    private int loyaltyPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CustomerTier tier = CustomerTier.NORMAL;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "last_visit_at")
    private LocalDateTime lastVisitAt;
}
