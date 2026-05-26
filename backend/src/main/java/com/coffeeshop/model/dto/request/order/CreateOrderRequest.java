package com.coffeeshop.model.dto.request.order;

import com.coffeeshop.model.enums.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {

    @NotNull(message = "Loại đơn hàng không được để trống")
    private OrderType orderType;

    private String tableNumber;

    private String note;

    private Long promotionId;

    private Long customerId;

    @NotEmpty(message = "Đơn hàng phải có ít nhất một món")
    @Valid
    private List<OrderItemRequest> items;

    @Getter
    @Setter
    public static class OrderItemRequest {

        @NotNull(message = "ID biến thể món ăn không được để trống")
        private Long menuItemVariantId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải >= 1")
        private Integer quantity;

        private String note;

        private List<OrderItemToppingRequest> toppings;
    }

    @Getter
    @Setter
    public static class OrderItemToppingRequest {

        @NotNull(message = "ID topping không được để trống")
        private Long toppingId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng topping phải >= 1")
        private Integer quantity;
    }
}
