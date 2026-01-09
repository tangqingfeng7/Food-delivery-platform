package com.takeaway.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateMenuItemRequest {

    private String name;

    private String description;

    private BigDecimal price;

    private BigDecimal originalPrice;

    private String image;

    private Long categoryId;

    private Boolean isHot;

    private Boolean isNew;

    private Boolean isAvailable;

    private Integer sortOrder;
}
