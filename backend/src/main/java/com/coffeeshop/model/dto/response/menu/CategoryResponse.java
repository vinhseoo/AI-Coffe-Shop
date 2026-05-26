package com.coffeeshop.model.dto.response.menu;

import com.coffeeshop.model.entity.Category;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private Integer displayOrder;
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive;

    public static CategoryResponse fromEntity(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.isActive())
                .build();
    }
}
