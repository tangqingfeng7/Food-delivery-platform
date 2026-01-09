package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateMenuCategoryRequest {

    @NotBlank(message = "分类名称不能为空")
    private String name;

    private Integer sortOrder = 0;
}
