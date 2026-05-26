package com.coffeeshop.model.dto.response.menu;

import com.coffeeshop.model.entity.MenuItemVariant;
import com.coffeeshop.model.enums.ProductSize;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class MenuItemVariantResponse {
    private Long id;
    private Long menuItemId;
    private ProductSize size;
    private BigDecimal price;
    private BigDecimal costPrice;
    @com.fasterxml.jackson.annotation.JsonProperty("isAvailable")
    private boolean isAvailable;

    public static MenuItemVariantResponse fromEntity(MenuItemVariant variant) {
        if (variant == null) return null;
        return MenuItemVariantResponse.builder()
                .id(variant.getId())
                .menuItemId(variant.getMenuItem().getId())
                .size(variant.getSize())
                .price(variant.getPrice())
                .costPrice(variant.getCostPrice())
                .isAvailable(variant.isAvailable())
                .build();
    }
}
