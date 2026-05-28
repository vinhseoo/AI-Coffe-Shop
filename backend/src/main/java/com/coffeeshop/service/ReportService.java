package com.coffeeshop.service;

import com.coffeeshop.model.dto.response.report.*;
import com.coffeeshop.model.enums.LoyaltyAction;
import com.coffeeshop.repository.CustomerRepository;
import com.coffeeshop.repository.LoyaltyTransactionRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    /**
     * Lấy doanh thu lũy kế theo Ngày, Tuần, Tháng
     */
    public RevenueReportResponse getRevenueSummary(LocalDateTime from, LocalDateTime to, String groupBy) {
        if (from == null) from = LocalDate.now().minusDays(30).atStartOfDay();
        if (to == null) to = LocalDate.now().atTime(LocalTime.MAX);
        if (groupBy == null) groupBy = "day";

        List<Object[]> results;
        if ("week".equalsIgnoreCase(groupBy)) {
            results = orderRepository.getWeeklyRevenueSummary(from, to);
        } else if ("month".equalsIgnoreCase(groupBy)) {
            results = orderRepository.getMonthlyRevenueSummary(from, to);
        } else {
            results = orderRepository.getDailyRevenueSummary(from, to);
        }

        List<RevenueReportResponse.DateRevenuePair> dataPoints = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        Long totalOrders = 0L;

        for (Object[] row : results) {
            String label = row[0] != null ? row[0].toString() : "";
            BigDecimal revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            Long orderCount = row[2] != null ? Long.valueOf(row[2].toString()) : 0L;

            dataPoints.add(new RevenueReportResponse.DateRevenuePair(label, revenue, orderCount));
            totalRevenue = totalRevenue.add(revenue);
            totalOrders += orderCount;
        }

        return RevenueReportResponse.builder()
                .dataPoints(dataPoints)
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .build();
    }

    /**
     * Lấy doanh thu theo giờ (Peak hours) của một ngày cụ thể
     */
    public List<RevenueReportResponse.DateRevenuePair> getRevenueByHour(LocalDate date) {
        if (date == null) date = LocalDate.now();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        List<Object[]> results = orderRepository.getHourlyRevenueSummary(start, end);
        List<RevenueReportResponse.DateRevenuePair> dataPoints = new ArrayList<>();

        // Khởi tạo mảng 24 giờ
        BigDecimal[] hourlyRevenue = new BigDecimal[24];
        Long[] hourlyOrders = new Long[24];
        for (int i = 0; i < 24; i++) {
            hourlyRevenue[i] = BigDecimal.ZERO;
            hourlyOrders[i] = 0L;
        }

        for (Object[] row : results) {
            int hourVal = row[0] != null ? Integer.parseInt(row[0].toString()) : 0;
            BigDecimal revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            Long orderCount = row[2] != null ? Long.valueOf(row[2].toString()) : 0L;

            if (hourVal >= 0 && hourVal < 24) {
                hourlyRevenue[hourVal] = revenue;
                hourlyOrders[hourVal] = orderCount;
            }
        }

        for (int i = 0; i < 24; i++) {
            String label = String.format("%02d:00", i);
            dataPoints.add(new RevenueReportResponse.DateRevenuePair(label, hourlyRevenue[i], hourlyOrders[i]));
        }

        return dataPoints;
    }

    /**
     * Lấy phân bổ doanh thu theo Danh mục sản phẩm (Category)
     */
    public List<CategoryRevenueResponse> getRevenueByCategory(LocalDateTime from, LocalDateTime to) {
        if (from == null) from = LocalDate.now().minusDays(30).atStartOfDay();
        if (to == null) to = LocalDate.now().atTime(LocalTime.MAX);

        List<Object[]> results = orderRepository.getRevenueByCategory(from, to);
        List<CategoryRevenueResponse> list = new ArrayList<>();
        BigDecimal totalAll = BigDecimal.ZERO;

        for (Object[] row : results) {
            String name = row[0] != null ? row[0].toString() : "Khác";
            BigDecimal revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            Long quantity = row[2] != null ? Long.valueOf(row[2].toString()) : 0L;

            list.add(CategoryRevenueResponse.builder()
                    .categoryName(name)
                    .revenue(revenue)
                    .quantity(quantity)
                    .percentage(0.0)
                    .build());
            totalAll = totalAll.add(revenue);
        }

        if (totalAll.compareTo(BigDecimal.ZERO) > 0) {
            for (CategoryRevenueResponse item : list) {
                double pct = item.getRevenue().divide(totalAll, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
                item.setPercentage(Math.round(pct * 100.0) / 100.0);
            }
        }

        return list;
    }

    /**
     * Lấy lợi nhuận và doanh thu của top sản phẩm
     */
    public List<TopItemResponse> getTopItems(LocalDateTime from, LocalDateTime to, Integer limit) {
        if (from == null) from = LocalDate.now().minusDays(30).atStartOfDay();
        if (to == null) to = LocalDate.now().atTime(LocalTime.MAX);
        if (limit == null || limit <= 0) limit = 10;

        List<Object[]> results = orderRepository.getProfitByItem(from, to, limit);
        List<TopItemResponse> items = new ArrayList<>();

        for (Object[] row : results) {
            Long menuItemId = row[0] != null ? Long.valueOf(row[0].toString()) : null;
            String name = row[1] != null ? row[1].toString() : "";
            Long totalSold = row[2] != null ? Long.valueOf(row[2].toString()) : 0L;
            BigDecimal revenue = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
            BigDecimal totalCost = row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO;
            String imageUrl = row[5] != null ? row[5].toString() : null;

            BigDecimal profit = revenue.subtract(totalCost);

            items.add(TopItemResponse.builder()
                    .menuItemId(menuItemId)
                    .name(name)
                    .totalSold(totalSold)
                    .revenue(revenue)
                    .totalCost(totalCost)
                    .profit(profit)
                    .imageUrl(imageUrl)
                    .build());
        }

        return items;
    }

    /**
     * Thống kê khách hàng thành viên & Tích điểm
     */
    public CustomerStatsResponse getCustomerStats(LocalDateTime from, LocalDateTime to) {
        if (from == null) from = LocalDate.now().minusDays(30).atStartOfDay();
        if (to == null) to = LocalDate.now().atTime(LocalTime.MAX);

        Long newCustomers = customerRepository.countByCreatedAtBetween(from, to);
        Long activeCustomers = orderRepository.countActiveCustomersBetween(from, to);
        Long returningCustomers = orderRepository.countReturningCustomersBetween(from, to);

        Long pointsEarned = loyaltyTransactionRepository.sumPointsByActionAndCreatedAtBetween(LoyaltyAction.EARN, from, to);
        Long pointsRedeemed = loyaltyTransactionRepository.sumPointsByActionAndCreatedAtBetween(LoyaltyAction.REDEEM, from, to);

        // Tránh null value
        if (newCustomers == null) newCustomers = 0L;
        if (activeCustomers == null) activeCustomers = 0L;
        if (returningCustomers == null) returningCustomers = 0L;
        if (pointsEarned == null) pointsEarned = 0L;
        // Trả về trị tuyệt đối cho pointsRedeemed (nếu lưu số âm)
        if (pointsRedeemed == null) pointsRedeemed = 0L;
        pointsRedeemed = Math.abs(pointsRedeemed);

        return CustomerStatsResponse.builder()
                .newCustomers(newCustomers)
                .activeCustomers(activeCustomers)
                .returningCustomers(returningCustomers)
                .pointsEarned(pointsEarned)
                .pointsRedeemed(pointsRedeemed)
                .build();
    }

    /**
     * Thống kê tỷ lệ và doanh thu theo Phương thức thanh toán
     */
    public Map<String, Object> getPaymentMethodStats(LocalDateTime from, LocalDateTime to) {
        if (from == null) from = LocalDate.now().minusDays(30).atStartOfDay();
        if (to == null) to = LocalDate.now().atTime(LocalTime.MAX);

        List<Object[]> results = orderRepository.getPaymentMethodStats(from, to);
        List<Map<String, Object>> data = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        Long totalCount = 0L;

        for (Object[] row : results) {
            String method = row[0] != null ? row[0].toString() : "Khác";
            BigDecimal revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            Long count = row[2] != null ? Long.valueOf(row[2].toString()) : 0L;

            Map<String, Object> map = new HashMap<>();
            map.put("paymentMethod", method);
            map.put("revenue", revenue);
            map.put("orderCount", count);
            map.put("percentage", 0.0);

            data.add(map);
            totalRevenue = totalRevenue.add(revenue);
            totalCount += count;
        }

        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            for (Map<String, Object> map : data) {
                BigDecimal revenue = (BigDecimal) map.get("revenue");
                double pct = revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
                map.put("percentage", Math.round(pct * 100.0) / 100.0);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("methods", data);
        response.put("totalRevenue", totalRevenue);
        response.put("totalOrders", totalCount);
        return response;
    }
}
