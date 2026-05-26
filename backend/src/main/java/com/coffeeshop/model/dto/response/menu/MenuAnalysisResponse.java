package com.coffeeshop.model.dto.response.menu;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class MenuAnalysisResponse {
    private List<MenuAnalysisItem> stars;
    private List<MenuAnalysisItem> puzzles;
    private List<MenuAnalysisItem> plowHorses;
    private List<MenuAnalysisItem> dogs;
    private String summary;
}
