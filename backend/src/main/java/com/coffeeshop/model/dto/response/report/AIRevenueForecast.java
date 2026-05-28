package com.coffeeshop.model.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRevenueForecast {
    private List<RevenueReportResponse.DateRevenuePair> predictions;
    private Double confidence;
    private List<String> assumptions;
    private String markdownReport;
}
