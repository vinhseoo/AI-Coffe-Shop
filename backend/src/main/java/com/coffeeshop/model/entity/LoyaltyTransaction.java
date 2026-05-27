package com.coffeeshop.model.entity;

import com.coffeeshop.model.enums.LoyaltyAction;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loyalty_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "order_id")
    private Long orderId;

    @Column(nullable = false)
    private int points;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoyaltyAction action;

    @Column(length = 500)
    private String description;
}
