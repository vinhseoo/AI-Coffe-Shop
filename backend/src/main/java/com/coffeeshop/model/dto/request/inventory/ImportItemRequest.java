package com.coffeeshop.model.dto.request.inventory;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ImportItemRequest {

    @NotNull(message = "ID nguyên liệu không được để trống")
    private Long ingredientId;

    @NotNull(message = "Số lượng nhập không được để trống")
    @DecimalMin(value = "0.01", message = "Số lượng nhập phải > 0")
    private BigDecimal quantity;

    @NotNull(message = "Giá vốn đơn vị không được để trống")
    @DecimalMin(value = "0", message = "Giá vốn đơn vị phải >= 0")
    private BigDecimal unitCost;

    private String note;
}
