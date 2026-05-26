package com.coffeeshop.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "shop_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopSettings extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "shop_name", nullable = false, length = 200)
    private String shopName;

    @Column(length = 500)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(name = "opening_time")
    @Builder.Default
    private LocalTime openingTime = LocalTime.of(7, 0);

    @Column(name = "closing_time")
    @Builder.Default
    private LocalTime closingTime = LocalTime.of(22, 0);

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "wifi_password", length = 100)
    private String wifiPassword;

    @Column(name = "social_facebook", length = 300)
    private String socialFacebook;

    @Column(name = "social_instagram", length = 300)
    private String socialInstagram;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;
}
