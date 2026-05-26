package com.coffeeshop.model.dto.response.dashboard;

import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIDashboardSummary {
    private String summary;
    private List<String> suggestions;
}
