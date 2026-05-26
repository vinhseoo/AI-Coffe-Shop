package com.coffeeshop.model.dto.request.settings;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ShopSettingsRequest {

    @NotBlank(message = "Tên quán không được để trống")
    @Size(max = 200, message = "Tên quán không được vượt quá 200 ký tự")
    private String shopName;

    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;

    // Format: "HH:mm" (e.g. "07:00")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "Giờ mở cửa không đúng định dạng HH:mm")
    private String openingTime;

    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "Giờ đóng cửa không đúng định dạng HH:mm")
    private String closingTime;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;

    @Size(max = 100, message = "Mật khẩu wifi không được vượt quá 100 ký tự")
    private String wifiPassword;

    @Size(max = 300, message = "Link Facebook không được vượt quá 300 ký tự")
    private String socialFacebook;

    @Size(max = 300, message = "Link Instagram không được vượt quá 300 ký tự")
    private String socialInstagram;

    @DecimalMin(value = "0.0", message = "Thuế suất không được nhỏ hơn 0")
    @DecimalMax(value = "100.0", message = "Thuế suất không được vượt quá 100%")
    private BigDecimal taxRate;
}
