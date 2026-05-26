package com.coffeeshop.model.dto.request.menu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được dài quá 100 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả không được dài quá 500 ký tự")
    private String description;

    @Size(max = 50, message = "Icon không được dài quá 50 ký tự")
    private String icon;

    private Integer displayOrder;
}
