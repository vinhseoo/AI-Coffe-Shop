package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.order.CreateOrderRequest;
import com.coffeeshop.model.dto.response.order.OrderResponse;
import com.coffeeshop.model.entity.*;
import com.coffeeshop.model.enums.InventoryAction;
import com.coffeeshop.model.enums.OrderStatus;
import com.coffeeshop.model.enums.OrderType;
import com.coffeeshop.model.enums.PaymentStatus;
import com.coffeeshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemVariantRepository menuItemVariantRepository;
    private final ToppingRepository toppingRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final ShopSettingsRepository shopSettingsRepository;
    private final LoyaltyService loyaltyService;

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrders(
            String search, OrderStatus status, OrderType type, PaymentStatus paymentStatus, Pageable pageable) {
        Page<Order> page = orderRepository.searchOrders(search, status, type, paymentStatus, pageable);
        return page.map(OrderResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không tìm thấy đơn hàng"));
        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Load Shop Settings for Tax Rate
        BigDecimal taxRate = BigDecimal.valueOf(10.00); // default 10%
        List<ShopSettings> settings = shopSettingsRepository.findAll();
        if (!settings.isEmpty() && settings.get(0).getTaxRate() != null) {
            taxRate = settings.get(0).getTaxRate();
        }

        BigDecimal subtotal = BigDecimal.ZERO;

        Order order = Order.builder()
                .orderType(request.getOrderType())
                .tableNumber(request.getTableNumber())
                .note(request.getNote())
                .promotionId(request.getPromotionId())
                .customerId(request.getCustomerId())
                .status(OrderStatus.PREPARING) // Starts as preparing
                .paymentStatus(PaymentStatus.UNPAID)
                .discountAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            MenuItemVariant variant = menuItemVariantRepository.findById(itemReq.getMenuItemVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, 
                            "Không tìm thấy biến thể nước uống ID: " + itemReq.getMenuItemVariantId()));

            BigDecimal itemSubtotal = variant.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            
            OrderItem orderItem = OrderItem.builder()
                    .menuItemVariant(variant)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(variant.getPrice())
                    .subtotal(itemSubtotal)
                    .note(itemReq.getNote())
                    .toppings(new ArrayList<>())
                    .build();

            // Calculate toppings
            if (itemReq.getToppings() != null) {
                for (CreateOrderRequest.OrderItemToppingRequest toppingReq : itemReq.getToppings()) {
                    Topping topping = toppingRepository.findById(toppingReq.getToppingId())
                            .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, 
                                    "Không tìm thấy Topping ID: " + toppingReq.getToppingId()));

                    BigDecimal toppingSubtotal = topping.getPrice()
                            .multiply(BigDecimal.valueOf(toppingReq.getQuantity()))
                            .multiply(BigDecimal.valueOf(itemReq.getQuantity()));

                    OrderItemTopping orderItemTopping = OrderItemTopping.builder()
                            .topping(topping)
                            .quantity(toppingReq.getQuantity())
                            .unitPrice(topping.getPrice())
                            .subtotal(toppingSubtotal)
                            .build();

                    orderItem.addTopping(orderItemTopping);
                    itemSubtotal = itemSubtotal.add(toppingSubtotal);
                }
            }

            orderItem.setSubtotal(itemSubtotal);
            order.addItem(orderItem);
            subtotal = subtotal.add(itemSubtotal);
        }

        // Apply tax and calculate totals
        BigDecimal taxMultiplier = taxRate.divide(BigDecimal.valueOf(100));
        BigDecimal taxAmount = subtotal.multiply(taxMultiplier);
        BigDecimal totalAmount = subtotal.add(taxAmount);

        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(totalAmount);

        // Pre-save to generate orderCode
        order = orderRepository.save(order);

        // Auto-deduct stock
        deductStockForOrder(order);

        log.info("Đặt đơn hàng mới thành công: {} (Tổng tiền: {})", order.getOrderCode(), order.getTotalAmount());
        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không tìm thấy đơn hàng"));

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == status) {
            return OrderResponse.fromEntity(order);
        }

        order.setStatus(status);

        if (status == OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
            loyaltyService.earnPoints(order);
        } else if (status == OrderStatus.CANCELLED) {
            // Restore stock if it was cancelled
            if (oldStatus == OrderStatus.PREPARING || oldStatus == OrderStatus.COMPLETED) {
                restoreStockForOrder(order);
            }
            if (oldStatus == OrderStatus.COMPLETED) {
                loyaltyService.revertPoints(order);
            }
        }

        order = orderRepository.save(order);
        log.info("Cập nhật trạng thái đơn hàng: {} từ {} -> {}", order.getOrderCode(), oldStatus, status);
        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse updatePayment(Long id, com.coffeeshop.model.enums.PaymentMethod method) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không tìm thấy đơn hàng"));

        order.setPaymentMethod(method);
        order.setPaymentStatus(PaymentStatus.PAID);

        order = orderRepository.save(order);
        log.info("Đơn hàng {} đã được thanh toán bằng {}", order.getOrderCode(), method);
        return OrderResponse.fromEntity(order);
    }

    private void deductStockForOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            List<RecipeIngredient> recipe = recipeIngredientRepository.findByMenuItemVariantId(item.getMenuItemVariant().getId());
            for (RecipeIngredient ri : recipe) {
                BigDecimal requiredQty = ri.getQuantity().multiply(BigDecimal.valueOf(item.getQuantity()));
                Ingredient ing = ri.getIngredient();

                // Deduct stock
                ing.setCurrentStock(ing.getCurrentStock().subtract(requiredQty));
                ingredientRepository.save(ing);

                // Create InventoryLog AUTO_DEDUCT entry
                InventoryLog logEntry = InventoryLog.builder()
                        .ingredient(ing)
                        .action(InventoryAction.AUTO_DEDUCT)
                        .quantity(requiredQty)
                        .unitCost(ing.getUnitCost())
                        .totalCost(requiredQty.multiply(ing.getUnitCost()))
                        .note("Trừ kho tự động cho đơn hàng: " + order.getOrderCode())
                        .build();
                inventoryLogRepository.save(logEntry);

                log.info("Trừ kho tự động: {} -{} {} cho đơn {}", ing.getName(), requiredQty, ing.getUnit(), order.getOrderCode());
            }
        }
    }

    private void restoreStockForOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            List<RecipeIngredient> recipe = recipeIngredientRepository.findByMenuItemVariantId(item.getMenuItemVariant().getId());
            for (RecipeIngredient ri : recipe) {
                BigDecimal requiredQty = ri.getQuantity().multiply(BigDecimal.valueOf(item.getQuantity()));
                Ingredient ing = ri.getIngredient();

                // Restore stock
                ing.setCurrentStock(ing.getCurrentStock().add(requiredQty));
                ingredientRepository.save(ing);

                // Create InventoryLog IMPORT entry for refund
                InventoryLog logEntry = InventoryLog.builder()
                        .ingredient(ing)
                        .action(InventoryAction.IMPORT)
                        .quantity(requiredQty)
                        .unitCost(ing.getUnitCost())
                        .totalCost(requiredQty.multiply(ing.getUnitCost()))
                        .note("Hoàn kho do hủy đơn hàng: " + order.getOrderCode())
                        .build();
                inventoryLogRepository.save(logEntry);

                log.info("Hoàn kho do hủy đơn: {} +{} {} cho đơn {}", ing.getName(), requiredQty, ing.getUnit(), order.getOrderCode());
            }
        }
    }
}
