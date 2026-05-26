package com.coffeeshop.model.dto.request.menu;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RecipeRequest {

    @NotEmpty(message = "Danh sách nguyên liệu không được rỗng")
    @Valid
    private List<RecipeItemRequest> items;
}
