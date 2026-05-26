package com.coffeeshop.model.dto.response.settings;

import com.coffeeshop.model.entity.ShopSettings;
import lombok.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopSettingsResponse {

    private Long id;
    private String shopName;
    private String address;
    private String phone;
    private String openingTime;
    private String closingTime;
    private String logoUrl;
    private String description;
    private String wifiPassword;
    private String socialFacebook;
    private String socialInstagram;
    private String currency;
    private BigDecimal taxRate;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public static ShopSettingsResponse fromEntity(ShopSettings s) {
        return ShopSettingsResponse.builder()
                .id(s.getId())
                .shopName(s.getShopName())
                .address(s.getAddress())
                .phone(s.getPhone())
                .openingTime(s.getOpeningTime() != null ? s.getOpeningTime().format(TIME_FMT) : null)
                .closingTime(s.getClosingTime() != null ? s.getClosingTime().format(TIME_FMT) : null)
                .logoUrl(s.getLogoUrl())
                .description(s.getDescription())
                .wifiPassword(s.getWifiPassword())
                .socialFacebook(s.getSocialFacebook())
                .socialInstagram(s.getSocialInstagram())
                .currency(s.getCurrency())
                .taxRate(s.getTaxRate())
                .build();
    }
}
