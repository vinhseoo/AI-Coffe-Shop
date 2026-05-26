package com.coffeeshop.model.dto.response.menu;

import com.coffeeshop.model.entity.Topping;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ToppingResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    @com.fasterxml.jackson.annotation.JsonProperty("isAvailable")
    private boolean isAvailable;

    public static ToppingResponse fromEntity(Topping topping) {
        if (topping == null) return null;
        return ToppingResponse.builder()
                .id(topping.getId())
                .name(topping.getName())
                .price(topping.getPrice())
                .isAvailable(topping.isAvailable())
                .build();
    }
}
