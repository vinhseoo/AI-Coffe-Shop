package com.coffeeshop.model.dto.request.menu;

import com.coffeeshop.model.enums.ProductSize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class MenuItemRequest {

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tên món không được để trống")
    @Size(max = 200, message = "Tên món không được vượt quá 200 ký tự")
    private String name;

    private String description;

    // Fallback: Nếu không gửi danh sách variants, ta có thể dùng price & size trực tiếp
    private BigDecimal price;
    private ProductSize size;

    private Integer displayOrder;
    private Boolean isBestseller;

    @Valid
    private List<VariantRequest> variants;
}
