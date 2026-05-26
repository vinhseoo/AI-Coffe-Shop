package com.coffeeshop.model.entity;

import com.coffeeshop.model.enums.ProductSize;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(
    name = "menu_item_variants",
    uniqueConstraints = @UniqueConstraint(name = "uk_menu_item_size", columnNames = {"menu_item_id", "size"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemVariant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private ProductSize size = ProductSize.M;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @Column(name = "cost_price", nullable = false, precision = 12, scale = 0)
    @Builder.Default
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private boolean isAvailable = true;
}
