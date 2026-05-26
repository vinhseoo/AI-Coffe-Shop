package com.coffeeshop.service;

import com.coffeeshop.model.dto.response.dashboard.*;
import com.coffeeshop.model.entity.*;
import com.coffeeshop.model.enums.*;
import com.coffeeshop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class DashboardServiceTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private MenuItemVariantRepository menuItemVariantRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    private MenuItemVariant variantS;
    private MenuItemVariant variantM;
    private Ingredient ingredientCoffee;

    private Order insertOrderDirect(String code, OrderType type, OrderStatus status, PaymentStatus payStatus, double subtotal, double total, LocalDateTime createdAt) {
        entityManager.createNativeQuery("INSERT INTO orders (order_code, order_type, status, subtotal, discount_amount, tax_amount, total_amount, payment_status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, 0.00, 0.00, ?, ?, ?, ?)")
                .setParameter(1, code)
                .setParameter(2, type.name())
                .setParameter(3, status.name())
                .setParameter(4, BigDecimal.valueOf(subtotal))
                .setParameter(5, BigDecimal.valueOf(total))
                .setParameter(6, payStatus.name())
                .setParameter(7, createdAt)
                .setParameter(8, createdAt)
                .executeUpdate();

        entityManager.flush();
        entityManager.clear();
        return orderRepository.findByOrderCode(code).orElseThrow();
    }

    @BeforeEach
    void setUp() {
        // Clean database or rely on transactional rollback
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();

        // 1. Setup Menu
        Category category = Category.builder()
                .name("Đồ uống")
                .isActive(true)
                .build();
        category = categoryRepository.save(category);

        MenuItem menuItem = MenuItem.builder()
                .category(category)
                .name("Trà sữa trân châu")
                .isAvailable(true)
                .build();
        menuItem = menuItemRepository.save(menuItem);

        variantS = MenuItemVariant.builder()
                .menuItem(menuItem)
                .size(ProductSize.S)
                .price(BigDecimal.valueOf(30000))
                .costPrice(BigDecimal.valueOf(10000))
                .isAvailable(true)
                .build();
        variantS = menuItemVariantRepository.save(variantS);

        variantM = MenuItemVariant.builder()
                .menuItem(menuItem)
                .size(ProductSize.M)
                .price(BigDecimal.valueOf(40000))
                .costPrice(BigDecimal.valueOf(12000))
                .isAvailable(true)
                .build();
        variantM = menuItemVariantRepository.save(variantM);

        // 2. Setup Ingredients
        ingredientCoffee = Ingredient.builder()
                .name("Sữa tươi")
                .unit("ml")
                .currentStock(BigDecimal.valueOf(20)) // < minStock (100) -> should trigger alert
                .minStock(BigDecimal.valueOf(100))
                .unitCost(BigDecimal.valueOf(50))
                .isActive(true)
                .build();
        ingredientCoffee = ingredientRepository.save(ingredientCoffee);
    }

    @Test
    void getOverview_shouldCalculateCorrectMetrics() {
        // Setup today's order direct
        insertOrderDirect("OD-TODAY-1", OrderType.DINE_IN, OrderStatus.COMPLETED, PaymentStatus.PAID, 70000, 77000, LocalDateTime.now().with(LocalTime.of(12, 0)));

        // Setup yesterday's order direct
        insertOrderDirect("OD-YEST-1", OrderType.TAKEAWAY, OrderStatus.COMPLETED, PaymentStatus.PAID, 40000, 44000, LocalDateTime.now().minusDays(1).with(LocalTime.of(15, 0)));

        // Act
        DashboardOverviewResponse overview = dashboardService.getOverview();

        // Assert
        assertThat(overview).isNotNull();
        assertThat(overview.getTodayRevenue()).isEqualByComparingTo(BigDecimal.valueOf(77000));
        assertThat(overview.getYesterdayRevenue()).isEqualByComparingTo(BigDecimal.valueOf(44000));
        
        // Growth: ((77000 - 44000) / 44000) * 100 = 75.0%
        assertThat(overview.getRevenueChangePercent()).isEqualTo(75.0);
        assertThat(overview.getTodayOrderCount()).isEqualTo(1L);
        assertThat(overview.getYesterdayOrderCount()).isEqualTo(1L);
        assertThat(overview.getOrderCountChangePercent()).isEqualTo(0.0);
        assertThat(overview.getAvgOrderValue()).isEqualByComparingTo(BigDecimal.valueOf(77000));
    }

    @Test
    void getRevenueSummary_shouldReturnGroupedData() {
        LocalDateTime day1 = LocalDate.now().minusDays(2).atTime(10, 0);
        LocalDateTime day2 = LocalDate.now().minusDays(1).atTime(11, 0);

        insertOrderDirect("OD-DAY1-1", OrderType.DINE_IN, OrderStatus.COMPLETED, PaymentStatus.PAID, 50000, 55000, day1);
        insertOrderDirect("OD-DAY2-1", OrderType.TAKEAWAY, OrderStatus.COMPLETED, PaymentStatus.PAID, 100000, 110000, day2);

        // Act
        List<RevenueSummaryResponse> summary = dashboardService.getRevenueSummary(
                LocalDate.now().minusDays(5).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX),
                "day"
        );

        // Assert
        assertThat(summary).isNotEmpty();
        RevenueSummaryResponse firstPoint = summary.stream()
                .filter(p -> p.getLabel().equals(day1.toLocalDate().toString()))
                .findFirst().orElseThrow();
        assertThat(firstPoint.getRevenue()).isEqualByComparingTo(BigDecimal.valueOf(55000));
        assertThat(firstPoint.getOrderCount()).isEqualTo(1L);

        RevenueSummaryResponse secondPoint = summary.stream()
                .filter(p -> p.getLabel().equals(day2.toLocalDate().toString()))
                .findFirst().orElseThrow();
        assertThat(secondPoint.getRevenue()).isEqualByComparingTo(BigDecimal.valueOf(110000));
        assertThat(secondPoint.getOrderCount()).isEqualTo(1L);
    }

    @Test
    void getTopSelling_shouldReturnSortedItems() {
        // Create Order direct
        Order order = insertOrderDirect("OD-TOPSELLING", OrderType.DINE_IN, OrderStatus.COMPLETED, PaymentStatus.PAID, 100000, 110000, LocalDateTime.now().with(LocalTime.of(10, 0)));

        // Create OrderItems
        OrderItem item1 = OrderItem.builder()
                .order(order)
                .menuItemVariant(variantS)
                .quantity(3) // 3 sold
                .unitPrice(BigDecimal.valueOf(30000))
                .subtotal(BigDecimal.valueOf(90000))
                .build();
        orderItemRepository.save(item1);

        OrderItem item2 = OrderItem.builder()
                .order(order)
                .menuItemVariant(variantM)
                .quantity(1) // 1 sold
                .unitPrice(BigDecimal.valueOf(40000))
                .subtotal(BigDecimal.valueOf(40000))
                .build();
        orderItemRepository.save(item2);

        // Act
        List<TopSellingItem> topSelling = dashboardService.getTopSelling(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX),
                5
        );

        // Assert
        assertThat(topSelling).hasSize(1);
        TopSellingItem bestSeller = topSelling.get(0);
        assertThat(bestSeller.getName()).isEqualTo("Trà sữa trân châu");
        assertThat(bestSeller.getTotalSold()).isEqualTo(4L);
        assertThat(bestSeller.getRevenue()).isEqualByComparingTo(BigDecimal.valueOf(130000));
    }

    @Test
    void getLowStockAlerts_shouldReturnIngredientBelowMinStock() {
        // Act
        List<LowStockAlert> alerts = dashboardService.getLowStockAlerts();

        // Assert
        assertThat(alerts).isNotEmpty();
        LowStockAlert alert = alerts.stream()
                .filter(a -> a.getName().equals("Sữa tươi"))
                .findFirst().orElseThrow();
        assertThat(alert.getCurrentStock()).isEqualByComparingTo(BigDecimal.valueOf(20));
        assertThat(alert.getMinStock()).isEqualByComparingTo(BigDecimal.valueOf(100));
    }
}
