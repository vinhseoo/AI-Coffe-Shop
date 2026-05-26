package com.coffeeshop.model.dto.response.order;

import com.coffeeshop.model.entity.Order;
import com.coffeeshop.model.entity.OrderItem;
import com.coffeeshop.model.entity.OrderItemTopping;
import com.coffeeshop.model.enums.OrderStatus;
import com.coffeeshop.model.enums.OrderType;
import com.coffeeshop.model.enums.PaymentMethod;
import com.coffeeshop.model.enums.PaymentStatus;
import com.coffeeshop.model.enums.ProductSize;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private OrderType orderType;
    private OrderStatus status;
    private String tableNumber;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String note;
    private Long promotionId;
    private Long customerId;
    private String customerName; // for future extension
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private String createdBy;
    private List<OrderItemResponse> items;

    @Getter
    @Setter
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long menuItemVariantId;
        private Long menuItemId;
        private String menuItemName;
        private ProductSize size;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String note;
        private List<OrderItemToppingResponse> toppings;
    }

    @Getter
    @Setter
    @Builder
    public static class OrderItemToppingResponse {
        private Long id;
        private Long toppingId;
        private String toppingName;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal subtotal;
    }

    public static OrderResponse fromEntity(Order order) {
        if (order == null) return null;

        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> {
                    List<OrderItemToppingResponse> toppingResponses = item.getToppings().stream()
                            .map(t -> OrderItemToppingResponse.builder()
                                    .id(t.getId())
                                    .toppingId(t.getTopping().getId())
                                    .toppingName(t.getTopping().getName())
                                    .quantity(t.getQuantity())
                                    .price(t.getUnitPrice())
                                    .subtotal(t.getSubtotal())
                                    .build())
                            .collect(Collectors.toList());

                    return OrderItemResponse.builder()
                            .id(item.getId())
                            .menuItemVariantId(item.getMenuItemVariant().getId())
                            .menuItemId(item.getMenuItemVariant().getMenuItem().getId())
                            .menuItemName(item.getMenuItemVariant().getMenuItem().getName())
                            .size(item.getMenuItemVariant().getSize())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotal(item.getSubtotal())
                            .note(item.getNote())
                            .toppings(toppingResponses)
                            .build();
                })
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .tableNumber(order.getTableNumber())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .note(order.getNote())
                .promotionId(order.getPromotionId())
                .customerId(order.getCustomerId())
                .completedAt(order.getCompletedAt())
                .createdAt(order.getCreatedAt())
                .createdBy(order.getCreatedBy())
                .items(itemResponses)
                .build();
    }
}
