package com.coffeeshop.controller;

import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.report.*;
import com.coffeeshop.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenue(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "day") String groupBy
    ) {
        LocalDateTime fromTime = null;
        LocalDateTime toTime = null;
        try {
            if (from != null && !from.trim().isEmpty()) {
                fromTime = from.contains("T") ? LocalDateTime.parse(from.trim()) : LocalDate.parse(from.trim()).atStartOfDay();
            }
            if (to != null && !to.trim().isEmpty()) {
                toTime = to.contains("T") ? LocalDateTime.parse(to.trim()) : LocalDate.parse(to.trim()).atTime(LocalTime.MAX);
            }
        } catch (Exception e) {
            log.warn("Lỗi khi phân tích tham số ngày: from={}, to={}", from, to, e);
        }
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueSummary(fromTime, toTime, groupBy)));
    }

    @GetMapping("/hourly")
    public ResponseEntity<ApiResponse<List<RevenueReportResponse.DateRevenuePair>>> getHourlyRevenue(
            @RequestParam(required = false) String date
    ) {
        LocalDate localDate = LocalDate.now();
        try {
            if (date != null && !date.trim().isEmpty()) {
                localDate = LocalDate.parse(date.trim());
            }
        } catch (Exception e) {
            log.warn("Lỗi khi phân tích tham số ngày cho báo cáo giờ: date={}", date, e);
        }
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueByHour(localDate)));
    }

    @GetMapping("/category")
    public ResponseEntity<ApiResponse<List<CategoryRevenueResponse>>> getCategoryRevenue(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        LocalDateTime fromTime = null;
        LocalDateTime toTime = null;
        try {
            if (from != null && !from.trim().isEmpty()) {
                fromTime = from.contains("T") ? LocalDateTime.parse(from.trim()) : LocalDate.parse(from.trim()).atStartOfDay();
            }
            if (to != null && !to.trim().isEmpty()) {
                toTime = to.contains("T") ? LocalDateTime.parse(to.trim()) : LocalDate.parse(to.trim()).atTime(LocalTime.MAX);
            }
        } catch (Exception e) {
            log.warn("Lỗi khi phân tích tham số ngày: from={}, to={}", from, to, e);
        }
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueByCategory(fromTime, toTime)));
    }

    @GetMapping("/top-items")
    public ResponseEntity<ApiResponse<List<TopItemResponse>>> getTopItems(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "10") Integer limit
    ) {
        LocalDateTime fromTime = null;
        LocalDateTime toTime = null;
        try {
            if (from != null && !from.trim().isEmpty()) {
                fromTime = from.contains("T") ? LocalDateTime.parse(from.trim()) : LocalDate.parse(from.trim()).atStartOfDay();
            }
            if (to != null && !to.trim().isEmpty()) {
                toTime = to.contains("T") ? LocalDateTime.parse(to.trim()) : LocalDate.parse(to.trim()).atTime(LocalTime.MAX);
            }
        } catch (Exception e) {
            log.warn("Lỗi khi phân tích tham số ngày: from={}, to={}", from, to, e);
        }
        return ResponseEntity.ok(ApiResponse.success(reportService.getTopItems(fromTime, toTime, limit)));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<CustomerStatsResponse>> getCustomerStats(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        LocalDateTime fromTime = null;
        LocalDateTime toTime = null;
        try {
            if (from != null && !from.trim().isEmpty()) {
                fromTime = from.contains("T") ? LocalDateTime.parse(from.trim()) : LocalDate.parse(from.trim()).atStartOfDay();
            }
            if (to != null && !to.trim().isEmpty()) {
                toTime = to.contains("T") ? LocalDateTime.parse(to.trim()) : LocalDate.parse(to.trim()).atTime(LocalTime.MAX);
            }
        } catch (Exception e) {
            log.warn("Lỗi khi phân tích tham số ngày: from={}, to={}", from, to, e);
        }
        return ResponseEntity.ok(ApiResponse.success(reportService.getCustomerStats(fromTime, toTime)));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentMethodStats(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        LocalDateTime fromTime = null;
        LocalDateTime toTime = null;
        try {
            if (from != null && !from.trim().isEmpty()) {
                fromTime = from.contains("T") ? LocalDateTime.parse(from.trim()) : LocalDate.parse(from.trim()).atStartOfDay();
            }
            if (to != null && !to.trim().isEmpty()) {
                toTime = to.contains("T") ? LocalDateTime.parse(to.trim()) : LocalDate.parse(to.trim()).atTime(LocalTime.MAX);
            }
        } catch (Exception e) {
            log.warn("Lỗi khi phân tích tham số ngày: from={}, to={}", from, to, e);
        }
        return ResponseEntity.ok(ApiResponse.success(reportService.getPaymentMethodStats(fromTime, toTime)));
    }
}
