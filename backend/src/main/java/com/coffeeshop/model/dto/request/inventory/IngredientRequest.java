package com.coffeeshop.model.dto.request.inventory;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class IngredientRequest {

    @NotBlank(message = "Tên nguyên liệu không được để trống")
    @Size(max = 200, message = "Tên nguyên liệu không vượt quá 200 ký tự")
    private String name;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Size(max = 50, message = "Đơn vị tính không vượt quá 50 ký tự")
    private String unit;

    @NotNull(message = "Mức tồn kho tối thiểu không được để trống")
    @DecimalMin(value = "0", message = "Mức tồn kho tối thiểu phải >= 0")
    private BigDecimal minStock;

    @NotNull(message = "Giá vốn đơn vị không được để trống")
    @DecimalMin(value = "0", message = "Giá vốn đơn vị phải >= 0")
    private BigDecimal unitCost;

    private Long supplierId;

    @Min(value = 1, message = "Số ngày hết hạn phải >= 1")
    private Integer expiryDays;
}
