package com.coffeeshop.model.dto.response.menu;

import com.coffeeshop.model.entity.MenuItem;
import com.coffeeshop.model.entity.Topping;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
public class MenuItemDetailResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private String imageUrl;
    @com.fasterxml.jackson.annotation.JsonProperty("isAvailable")
    private boolean isAvailable;

    @com.fasterxml.jackson.annotation.JsonProperty("isBestseller")
    private boolean isBestseller;
    private Integer totalSold;
    private Integer displayOrder;
    private List<MenuItemVariantResponse> variants;
    private List<ToppingResponse> toppings;

    public static MenuItemDetailResponse fromEntity(MenuItem item, List<Topping> toppings) {
        if (item == null) return null;

        List<MenuItemVariantResponse> variantDtos = item.getVariants() == null ? Collections.emptyList() : item.getVariants().stream()
                .map(MenuItemVariantResponse::fromEntity)
                .collect(Collectors.toList());

        List<ToppingResponse> toppingDtos = toppings == null ? null : toppings.stream()
                .map(ToppingResponse::fromEntity)
                .collect(Collectors.toList());

        return MenuItemDetailResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .name(item.getName())
                .description(item.getDescription())
                .imageUrl(item.getImageUrl())
                .isAvailable(item.isAvailable())
                .isBestseller(item.isBestseller())
                .totalSold(item.getTotalSold())
                .displayOrder(item.getDisplayOrder())
                .variants(variantDtos)
                .toppings(toppingDtos)
                .build();
    }
}
