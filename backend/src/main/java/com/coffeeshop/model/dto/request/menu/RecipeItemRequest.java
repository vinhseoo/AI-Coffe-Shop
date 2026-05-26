package com.coffeeshop.model.dto.request.menu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RecipeItemRequest {

    @NotNull(message = "ID nguyên liệu không được để trống")
    private Long ingredientId;

    @NotNull(message = "Số lượng nguyên liệu không được để trống")
    @DecimalMin(value = "0.01", message = "Số lượng nguyên liệu phải lớn hơn 0")
    private BigDecimal quantity;
}
