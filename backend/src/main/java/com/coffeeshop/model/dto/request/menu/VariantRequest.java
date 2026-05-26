package com.coffeeshop.model.dto.request.menu;

import com.coffeeshop.model.enums.ProductSize;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class VariantRequest {

    @NotNull(message = "Kích thước không được để trống")
    private ProductSize size;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0", message = "Giá bán không được âm")
    private BigDecimal price;
}
