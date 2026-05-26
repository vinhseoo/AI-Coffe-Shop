package com.coffeeshop.model.dto.request.menu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ToppingRequest {

    @NotBlank(message = "Tên topping không được để trống")
    @Size(max = 100, message = "Tên topping không được dài quá 100 ký tự")
    private String name;

    @NotNull(message = "Giá topping không được để trống")
    @DecimalMin(value = "0", message = "Giá topping không được âm")
    private BigDecimal price;
}
