package com.coffeeshop.model.dto.request.promotion;

import com.coffeeshop.model.enums.PromotionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PromotionRequest {

    @NotBlank(message = "Tên chương trình khuyến mãi không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Loại khuyến mãi không được để trống")
    private PromotionType type;

    @NotNull(message = "Giá trị khuyến mãi không được để trống")
    @Min(value = 0, message = "Giá trị khuyến mãi phải >= 0")
    private BigDecimal value;

    private BigDecimal minOrderValue;

    private BigDecimal maxDiscount;

    private List<Long> applicableItems; // List of menu item/variant IDs

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer usageLimit;

    private Boolean isActive;
}
