package com.coffeeshop.model.entity;

import com.coffeeshop.model.enums.OrderStatus;
import com.coffeeshop.model.enums.OrderType;
import com.coffeeshop.model.enums.PaymentMethod;
import com.coffeeshop.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "table_number", length = 50)
    private String tableNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "promotion_id")
    private Long promotionId;

    @Column(name = "customer_id")
    private Long customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.orderCode == null || this.orderCode.isEmpty()) {
            long timestamp = System.currentTimeMillis() % 1000000;
            int random = (int) (Math.random() * 900) + 100;
            this.orderCode = "OD-" + timestamp + random;
        }
        if (this.discountAmount == null) this.discountAmount = BigDecimal.ZERO;
        if (this.taxAmount == null) this.taxAmount = BigDecimal.ZERO;
    }

    public void addItem(OrderItem item) {
        if (items == null) items = new ArrayList<>();
        items.add(item);
        item.setOrder(this);
    }
}
