package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {

    private Long id;
    private Long restaurantId;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String image;
    private Long categoryId;
    private String categoryName;
    private Integer sales;
    private Boolean isHot;
    private Boolean isNew;
    private Boolean isAvailable;
}
