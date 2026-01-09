package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private String menuItemImage;
    private BigDecimal price;
    private Integer quantity;
}
