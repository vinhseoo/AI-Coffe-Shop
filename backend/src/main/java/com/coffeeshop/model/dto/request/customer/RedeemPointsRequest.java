package com.coffeeshop.model.dto.request.customer;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RedeemPointsRequest {

    @NotNull(message = "Số điểm đổi không được để trống")
    @Min(value = 1, message = "Số điểm đổi tối thiểu phải là 1")
    private Integer points;

    @NotBlank(message = "Lý do đổi điểm không được để trống")
    private String description;
}
