package com.coffeeshop.service;

import com.coffeeshop.model.dto.request.order.CreateOrderRequest;
import com.coffeeshop.model.dto.response.order.OrderResponse;
import com.coffeeshop.model.entity.*;
import com.coffeeshop.model.enums.*;
import com.coffeeshop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private MenuItemVariantRepository menuItemVariantRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private RecipeIngredientRepository recipeIngredientRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InventoryLogRepository inventoryLogRepository;

    @Autowired
    private ShopSettingsRepository shopSettingsRepository;

    private MenuItemVariant variantS;
    private MenuItemVariant variantM;
    private Ingredient ingredientCoffee;
    private Ingredient ingredientMilk;

    @BeforeEach
    void setUp() {
        // Create Category
        Category category = Category.builder()
                .name("Cà phê")
                .isActive(true)
                .build();
        category = categoryRepository.save(category);

        // Create MenuItem
        MenuItem menuItem = MenuItem.builder()
                .category(category)
                .name("Cà phê sữa")
                .isAvailable(true)
                .build();
        menuItem = menuItemRepository.save(menuItem);

        // Create Variants (S, M)
        variantS = MenuItemVariant.builder()
                .menuItem(menuItem)
                .size(ProductSize.S)
                .price(BigDecimal.valueOf(29000))
                .costPrice(BigDecimal.valueOf(10000))
                .isAvailable(true)
                .build();
        variantS = menuItemVariantRepository.save(variantS);

        variantM = MenuItemVariant.builder()
                .menuItem(menuItem)
                .size(ProductSize.M)
                .price(BigDecimal.valueOf(35000))
                .costPrice(BigDecimal.valueOf(12000))
                .isAvailable(true)
                .build();
        variantM = menuItemVariantRepository.save(variantM);

        // Create Ingredients
        ingredientCoffee = Ingredient.builder()
                .name("Bột Cà phê")
                .unit("g")
                .currentStock(BigDecimal.valueOf(1000))
                .minStock(BigDecimal.valueOf(100))
                .unitCost(BigDecimal.valueOf(200))
                .isActive(true)
                .build();
        ingredientCoffee = ingredientRepository.save(ingredientCoffee);

        ingredientMilk = Ingredient.builder()
                .name("Sữa đặc")
                .unit("ml")
                .currentStock(BigDecimal.valueOf(500))
                .minStock(BigDecimal.valueOf(50))
                .unitCost(BigDecimal.valueOf(100))
                .isActive(true)
                .build();
        ingredientMilk = ingredientRepository.save(ingredientMilk);

        // Create Recipes
        // Variant S: 15g Coffee, 20ml Milk
        RecipeIngredient recipeS1 = RecipeIngredient.builder()
                .menuItemVariant(variantS)
                .ingredient(ingredientCoffee)
                .quantity(BigDecimal.valueOf(15))
                .build();
        RecipeIngredient recipeS2 = RecipeIngredient.builder()
                .menuItemVariant(variantS)
                .ingredient(ingredientMilk)
                .quantity(BigDecimal.valueOf(20))
                .build();
        recipeIngredientRepository.save(recipeS1);
        recipeIngredientRepository.save(recipeS2);

        // Variant M: 20g Coffee, 30ml Milk
        RecipeIngredient recipeM1 = RecipeIngredient.builder()
                .menuItemVariant(variantM)
                .ingredient(ingredientCoffee)
                .quantity(BigDecimal.valueOf(20))
                .build();
        RecipeIngredient recipeM2 = RecipeIngredient.builder()
                .menuItemVariant(variantM)
                .ingredient(ingredientMilk)
                .quantity(BigDecimal.valueOf(30))
                .build();
        recipeIngredientRepository.save(recipeM1);
        recipeIngredientRepository.save(recipeM2);
    }

    @Test
    void createOrder_shouldDeductStockAndCreateLogs() {
        // Create Order Request: 2 x Variant S, 1 x Variant M
        CreateOrderRequest request = new CreateOrderRequest();
        request.setOrderType(OrderType.DINE_IN);
        request.setTableNumber("Bàn số 5");
        request.setNote("Ít đá");

        List<CreateOrderRequest.OrderItemRequest> items = new ArrayList<>();
        
        CreateOrderRequest.OrderItemRequest item1 = new CreateOrderRequest.OrderItemRequest();
        item1.setMenuItemVariantId(variantS.getId());
        item1.setQuantity(2);
        item1.setNote("Nhiều sữa");
        items.add(item1);

        CreateOrderRequest.OrderItemRequest item2 = new CreateOrderRequest.OrderItemRequest();
        item2.setMenuItemVariantId(variantM.getId());
        item2.setQuantity(1);
        items.add(item2);

        request.setItems(items);

        // Execute
        OrderResponse response = orderService.createOrder(request);

        // Assert Order Metadata
        assertThat(response).isNotNull();
        assertThat(response.getId()).isNotNull();
        assertThat(response.getOrderCode()).startsWith("OD-");
        assertThat(response.getStatus()).isEqualTo(OrderStatus.PREPARING);
        assertThat(response.getPaymentStatus()).isEqualTo(PaymentStatus.UNPAID);
        assertThat(response.getTableNumber()).isEqualTo("Bàn số 5");

        // Calculations:
        // subtotal = (2 * 29000) + (1 * 35000) = 58000 + 35000 = 93000
        BigDecimal subtotalVal = BigDecimal.valueOf(93000);
        BigDecimal taxRate = BigDecimal.valueOf(10.00); // default 10%
        List<ShopSettings> settings = shopSettingsRepository.findAll();
        if (!settings.isEmpty() && settings.get(0).getTaxRate() != null) {
            taxRate = settings.get(0).getTaxRate();
        }
        BigDecimal taxVal = subtotalVal.multiply(taxRate.divide(BigDecimal.valueOf(100)));
        BigDecimal totalVal = subtotalVal.add(taxVal);

        assertThat(response.getSubtotal()).isEqualByComparingTo(subtotalVal);
        assertThat(response.getTaxAmount()).isEqualByComparingTo(taxVal);
        assertThat(response.getTotalAmount()).isEqualByComparingTo(totalVal);

        // Assert Stock Deductions:
        // Coffee expected usage: (2 * 15g) + (1 * 20g) = 30 + 20 = 50g
        // Coffee stock expected: 1000 - 50 = 950g
        Ingredient updatedCoffee = ingredientRepository.findById(ingredientCoffee.getId()).orElseThrow();
        assertThat(updatedCoffee.getCurrentStock()).isEqualByComparingTo(BigDecimal.valueOf(950));

        // Milk expected usage: (2 * 20ml) + (1 * 30ml) = 40 + 30 = 70ml
        // Milk stock expected: 500 - 70 = 430ml
        Ingredient updatedMilk = ingredientRepository.findById(ingredientMilk.getId()).orElseThrow();
        assertThat(updatedMilk.getCurrentStock()).isEqualByComparingTo(BigDecimal.valueOf(430));

        // Assert Inventory Logs:
        List<InventoryLog> logs = inventoryLogRepository.findAll().stream()
                .filter(l -> l.getNote().contains(response.getOrderCode()))
                .collect(java.util.stream.Collectors.toList());
        assertThat(logs).hasSize(4);

        // Verify total Coffee quantity deducted is 50g
        BigDecimal totalCoffeeQty = logs.stream()
                .filter(l -> l.getIngredient().getId().equals(ingredientCoffee.getId()))
                .map(InventoryLog::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalCoffeeQty).isEqualByComparingTo(BigDecimal.valueOf(50));

        // Verify total Milk quantity deducted is 70ml
        BigDecimal totalMilkQty = logs.stream()
                .filter(l -> l.getIngredient().getId().equals(ingredientMilk.getId()))
                .map(InventoryLog::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalMilkQty).isEqualByComparingTo(BigDecimal.valueOf(70));

        // Verify all actions are AUTO_DEDUCT
        logs.forEach(l -> {
            assertThat(l.getAction()).isEqualTo(InventoryAction.AUTO_DEDUCT);
            assertThat(l.getNote()).contains(response.getOrderCode());
        });
    }

    @Test
    void cancelOrder_shouldRestoreStockAndCreateImportLogs() {
        // Create Order first
        CreateOrderRequest request = new CreateOrderRequest();
        request.setOrderType(OrderType.TAKEAWAY);
        List<CreateOrderRequest.OrderItemRequest> items = new ArrayList<>();
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setMenuItemVariantId(variantM.getId());
        item.setQuantity(2); // 2 * 20g = 40g coffee, 2 * 30ml = 60ml milk
        items.add(item);
        request.setItems(items);

        OrderResponse response = orderService.createOrder(request);
        
        // Assert initial deduction
        Ingredient coffeePostOrder = ingredientRepository.findById(ingredientCoffee.getId()).orElseThrow();
        assertThat(coffeePostOrder.getCurrentStock()).isEqualByComparingTo(BigDecimal.valueOf(960)); // 1000 - 40

        Ingredient milkPostOrder = ingredientRepository.findById(ingredientMilk.getId()).orElseThrow();
        assertThat(milkPostOrder.getCurrentStock()).isEqualByComparingTo(BigDecimal.valueOf(440)); // 500 - 60

        // Cancel order
        OrderResponse cancelledResponse = orderService.updateOrderStatus(response.getId(), OrderStatus.CANCELLED);
        assertThat(cancelledResponse.getStatus()).isEqualTo(OrderStatus.CANCELLED);

        // Assert restored stock
        Ingredient coffeePostCancel = ingredientRepository.findById(ingredientCoffee.getId()).orElseThrow();
        assertThat(coffeePostCancel.getCurrentStock()).isEqualByComparingTo(BigDecimal.valueOf(1000)); // Restored

        Ingredient milkPostCancel = ingredientRepository.findById(ingredientMilk.getId()).orElseThrow();
        assertThat(milkPostCancel.getCurrentStock()).isEqualByComparingTo(BigDecimal.valueOf(500)); // Restored

        // Assert logs (should have 2 AUTO_DEDUCT logs + 2 IMPORT logs = 4 logs total)
        List<InventoryLog> logs = inventoryLogRepository.findAll().stream()
                .filter(l -> l.getNote().contains(response.getOrderCode()))
                .collect(java.util.stream.Collectors.toList());
        assertThat(logs).hasSize(4);

        long importLogsCount = logs.stream()
                .filter(l -> l.getAction() == InventoryAction.IMPORT && l.getNote().contains("Hoàn kho do hủy đơn hàng"))
                .count();
        assertThat(importLogsCount).isEqualTo(2);
    }

    @Test
    void updatePayment_shouldChangePaymentStatusAndMethod() {
        // Create Order
        CreateOrderRequest request = new CreateOrderRequest();
        request.setOrderType(OrderType.TAKEAWAY);
        List<CreateOrderRequest.OrderItemRequest> items = new ArrayList<>();
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setMenuItemVariantId(variantS.getId());
        item.setQuantity(1);
        items.add(item);
        request.setItems(items);

        OrderResponse response = orderService.createOrder(request);
        assertThat(response.getPaymentStatus()).isEqualTo(PaymentStatus.UNPAID);

        // Confirm Payment
        OrderResponse paidResponse = orderService.updatePayment(response.getId(), PaymentMethod.TRANSFER);
        assertThat(paidResponse.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(paidResponse.getPaymentMethod()).isEqualTo(PaymentMethod.TRANSFER);
    }
}
