package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateMenuItemRequest {

    @NotBlank(message = "菜品名称不能为空")
    private String name;

    private String description;

    @NotNull(message = "菜品价格不能为空")
    private BigDecimal price;

    private BigDecimal originalPrice;

    private String image;

    private Long categoryId;

    private Boolean isHot = false;

    private Boolean isNew = false;

    private Boolean isAvailable = true;

    private Integer sortOrder = 0;
}
