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
public class AIWeeklyAnalysis {
    private String summary;
    private List<String> trends;
    private List<String> highlights;
    private List<String> suggestions;
    private String markdownReport;
}
