package com.coffeeshop.service;

import com.coffeeshop.model.dto.response.dashboard.*;
import com.coffeeshop.model.entity.Ingredient;
import com.coffeeshop.repository.IngredientRepository;
import com.coffeeshop.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DashboardService {

    private final OrderRepository orderRepository;
    private final IngredientRepository ingredientRepository;

    /**
     * Lấy các chỉ số tổng quan hôm nay so với hôm qua
     */
    public DashboardOverviewResponse getOverview() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);

        LocalDateTime yesterdayStart = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime yesterdayEnd = LocalDate.now().minusDays(1).atTime(LocalTime.MAX);

        BigDecimal todayRevenue = orderRepository.calculateRevenueBetween(todayStart, todayEnd);
        BigDecimal yesterdayRevenue = orderRepository.calculateRevenueBetween(yesterdayStart, yesterdayEnd);

        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;
        if (yesterdayRevenue == null) yesterdayRevenue = BigDecimal.ZERO;

        Double revenueChangePercent = 0.0;
        if (yesterdayRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueChangePercent = todayRevenue.subtract(yesterdayRevenue)
                    .divide(yesterdayRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        } else if (todayRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueChangePercent = 100.0;
        }

        Long todayOrderCount = orderRepository.countOrdersBetween(todayStart, todayEnd);
        Long yesterdayOrderCount = orderRepository.countOrdersBetween(yesterdayStart, yesterdayEnd);

        if (todayOrderCount == null) todayOrderCount = 0L;
        if (yesterdayOrderCount == null) yesterdayOrderCount = 0L;

        Double orderCountChangePercent = 0.0;
        if (yesterdayOrderCount > 0) {
            orderCountChangePercent = ((double) (todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100;
        } else if (todayOrderCount > 0) {
            orderCountChangePercent = 100.0;
        }

        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (todayOrderCount > 0) {
            avgOrderValue = todayRevenue.divide(BigDecimal.valueOf(todayOrderCount), 2, RoundingMode.HALF_UP);
        }

        return DashboardOverviewResponse.builder()
                .todayRevenue(todayRevenue)
                .yesterdayRevenue(yesterdayRevenue)
                .revenueChangePercent(Math.round(revenueChangePercent * 100.0) / 100.0)
                .todayOrderCount(todayOrderCount)
                .yesterdayOrderCount(yesterdayOrderCount)
                .orderCountChangePercent(Math.round(orderCountChangePercent * 100.0) / 100.0)
                .avgOrderValue(avgOrderValue)
                .build();
    }

    /**
     * Lấy thống kê doanh thu gom nhóm theo Ngày, Tuần, Tháng
     */
    public List<RevenueSummaryResponse> getRevenueSummary(LocalDateTime from, LocalDateTime to, String groupBy) {
        if (from == null) {
            from = LocalDate.now().minusDays(7).atStartOfDay();
        }
        if (to == null) {
            to = LocalDate.now().atTime(LocalTime.MAX);
        }

        List<Object[]> results;
        if ("week".equalsIgnoreCase(groupBy)) {
            results = orderRepository.getWeeklyRevenueSummary(from, to);
        } else if ("month".equalsIgnoreCase(groupBy)) {
            results = orderRepository.getMonthlyRevenueSummary(from, to);
        } else {
            results = orderRepository.getDailyRevenueSummary(from, to);
        }

        List<RevenueSummaryResponse> summaryList = new ArrayList<>();
        for (Object[] row : results) {
            String label = row[0] != null ? row[0].toString() : "";
            BigDecimal revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            Long orderCount = row[2] != null ? Long.valueOf(row[2].toString()) : 0L;
            summaryList.add(new RevenueSummaryResponse(label, revenue, orderCount));
        }
        return summaryList;
    }

    /**
     * Lấy Top sản phẩm bán chạy nhất
     */
    public List<TopSellingItem> getTopSelling(LocalDateTime from, LocalDateTime to, Integer limit) {
        if (from == null) {
            from = LocalDate.now().atStartOfDay(); // mặc định hôm nay
        }
        if (to == null) {
            to = LocalDate.now().atTime(LocalTime.MAX);
        }
        if (limit == null || limit <= 0) {
            limit = 5;
        }

        List<Object[]> results = orderRepository.getTopSellingItems(from, to, limit);
        List<TopSellingItem> items = new ArrayList<>();
        for (Object[] row : results) {
            Long menuItemId = row[0] != null ? Long.valueOf(row[0].toString()) : null;
            String name = row[1] != null ? row[1].toString() : "";
            Long totalSold = row[2] != null ? Long.valueOf(row[2].toString()) : 0L;
            BigDecimal revenue = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
            String imageUrl = row[4] != null ? row[4].toString() : null;
            items.add(new TopSellingItem(menuItemId, name, totalSold, revenue, imageUrl));
        }
        return items;
    }

    /**
     * Lấy danh sách nguyên liệu cảnh báo tồn kho thấp
     */
    public List<LowStockAlert> getLowStockAlerts() {
        List<Ingredient> ingredients = ingredientRepository.findLowStockIngredients();
        return ingredients.stream()
                .map(ing -> LowStockAlert.builder()
                        .ingredientId(ing.getId())
                        .name(ing.getName())
                        .currentStock(ing.getCurrentStock())
                        .minStock(ing.getMinStock())
                        .unit(ing.getUnit())
                        .build())
                .collect(Collectors.toList());
    }
}
