package com.coffeeshop.controller;

import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.report.*;
import com.coffeeshop.model.enums.AIReportType;
import com.coffeeshop.service.ai.ReportAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports/ai")
@RequiredArgsConstructor
@Slf4j
public class ReportAIController {

    private final ReportAIService reportAIService;

    @PostMapping("/weekly")
    public ResponseEntity<ApiResponse<AIWeeklyAnalysis>> generateWeeklyAnalysis(Authentication authentication) {
        log.info("Yêu cầu tạo báo cáo kinh doanh tuần từ user: {}", authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(
                reportAIService.generateWeeklyAnalysis(authentication.getName()),
                "Đã tạo báo cáo phân tích tuần thành công"
        ));
    }

    @PostMapping("/forecast")
    public ResponseEntity<ApiResponse<AIRevenueForecast>> generateRevenueForecast(Authentication authentication) {
        log.info("Yêu cầu dự báo doanh thu 7 ngày từ user: {}", authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(
                reportAIService.generateRevenueForecast(authentication.getName()),
                "Đã phân tích dự báo doanh số thành công"
        ));
    }

    @PostMapping("/suggestions")
    public ResponseEntity<ApiResponse<AIReportResponse>> generateImprovementSuggestions(Authentication authentication) {
        log.info("Yêu cầu tạo đề xuất tối ưu kinh doanh từ user: {}", authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(
                reportAIService.generateImprovementSuggestions(authentication.getName()),
                "Đã phân tích đề xuất kinh doanh thành công"
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AIReportResponse>>> getReportHistory(
            Authentication authentication,
            @RequestParam(required = false) AIReportType type
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                reportAIService.getReportHistory(authentication.getName(), type)
        ));
    }

    @PutMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<AIReportResponse>> toggleBookmark(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                reportAIService.toggleBookmark(id, authentication.getName()),
                "Đã cập nhật trạng thái bookmark báo cáo"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(
            @PathVariable Long id,
            Authentication authentication
    ) {
        reportAIService.deleteReport(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa báo cáo thành công"));
    }
}
