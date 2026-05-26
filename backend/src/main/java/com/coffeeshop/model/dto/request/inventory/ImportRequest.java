package com.coffeeshop.model.dto.request.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ImportRequest {

    @NotEmpty(message = "Danh sách nguyên liệu nhập không được để trống")
    @Valid
    private List<ImportItemRequest> items;

    private String note;
}
