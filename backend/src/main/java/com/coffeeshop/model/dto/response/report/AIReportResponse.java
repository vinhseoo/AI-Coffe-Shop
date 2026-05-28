package com.coffeeshop.model.dto.response.report;

import com.coffeeshop.model.enums.AIReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIReportResponse {
    private Long id;
    private AIReportType reportType;
    private String title;
    private String content;
    private String promptUsed;
    private String metadata;
    private boolean isBookmarked;
    private LocalDateTime createdAt;
    private String createdBy;
}
