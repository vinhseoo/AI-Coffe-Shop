package com.coffeeshop.controller;

import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.dashboard.*;
import com.coffeeshop.service.DashboardService;
import com.coffeeshop.service.ai.DashboardAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;
    private final DashboardAIService dashboardAIService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DashboardOverviewResponse>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getOverview()));
    }

    @GetMapping("/revenue-summary")
    public ResponseEntity<ApiResponse<List<RevenueSummaryResponse>>> getRevenueSummary(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "day") String groupBy
    ) {
        LocalDateTime fromTime = null;
        LocalDateTime toTime = null;

        try {
            if (from != null && !from.trim().isEmpty()) {
                if (from.contains("T")) {
                    fromTime = LocalDateTime.parse(from.trim());
                } else {
                    fromTime = LocalDate.parse(from.trim()).atStartOfDay();
                }
            }
            if (to != null && !to.trim().isEmpty()) {
                if (to.contains("T")) {
                    toTime = LocalDateTime.parse(to.trim());
                } else {
                    toTime = LocalDate.parse(to.trim()).atTime(LocalTime.MAX);
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi khi phân tích ngày từ tham số query: from={}, to={}", from, to, e);
        }

        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRevenueSummary(fromTime, toTime, groupBy)));
    }

    @GetMapping("/top-selling")
    public ResponseEntity<ApiResponse<List<TopSellingItem>>> getTopSelling(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "5") Integer limit
    ) {
        LocalDateTime fromTime = null;
        LocalDateTime toTime = null;

        try {
            if (from != null && !from.trim().isEmpty()) {
                if (from.contains("T")) {
                    fromTime = LocalDateTime.parse(from.trim());
                } else {
                    fromTime = LocalDate.parse(from.trim()).atStartOfDay();
                }
            }
            if (to != null && !to.trim().isEmpty()) {
                if (to.contains("T")) {
                    toTime = LocalDateTime.parse(to.trim());
                } else {
                    toTime = LocalDate.parse(to.trim()).atTime(LocalTime.MAX);
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi khi phân tích ngày từ tham số query cho top selling: from={}, to={}", from, to, e);
        }

        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTopSelling(fromTime, toTime, limit)));
    }

    @GetMapping("/low-stock-alerts")
    public ResponseEntity<ApiResponse<List<LowStockAlert>>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getLowStockAlerts()));
    }

    @GetMapping("/ai-summary")
    public ResponseEntity<ApiResponse<AIDashboardSummary>> getAISummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardAIService.generateDailySummary()));
    }
}
