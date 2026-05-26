package com.coffeeshop.model.dto.request.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierRequest {

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Size(max = 200, message = "Tên nhà cung cấp không vượt quá 200 ký tự")
    private String name;

    @Size(max = 20, message = "Số điện thoại không vượt quá 20 ký tự")
    private String phone;

    @Size(max = 100, message = "Email không vượt quá 100 ký tự")
    private String email;

    @Size(max = 500, message = "Địa chỉ không vượt quá 500 ký tự")
    private String address;

    private String note;
}
