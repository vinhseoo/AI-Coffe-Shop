package com.coffeeshop.controller;

import com.coffeeshop.model.dto.request.order.CreateOrderRequest;
import com.coffeeshop.model.dto.request.order.PaymentRequest;
import com.coffeeshop.model.dto.request.order.UpdateOrderStatusRequest;
import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.PagedResponse;
import com.coffeeshop.model.dto.response.order.OrderResponse;
import com.coffeeshop.model.enums.OrderStatus;
import com.coffeeshop.model.enums.OrderType;
import com.coffeeshop.model.enums.PaymentStatus;
import com.coffeeshop.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(orderService.createOrder(request), "Đặt đơn hàng thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) OrderType type,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<OrderResponse> result = orderService.getOrders(
                search, status, type, paymentStatus, 
                PageRequest.of(page - 1, size, Sort.by("id").descending())
        );

        PagedResponse<OrderResponse> paged = PagedResponse.<OrderResponse>builder()
                .content(result.getContent())
                .pageNumber(result.getNumber() + 1)
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.success(paged));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateOrderStatus(id, request.getStatus()), 
                "Cập nhật trạng thái đơn hàng thành công"
        ));
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updatePayment(id, request.getPaymentMethod()), 
                "Xác nhận thanh toán thành công"
        ));
    }
}
