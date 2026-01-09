package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDTO {
    
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantImage;
    private String restaurantLogo;
    private BigDecimal rating;
    private Integer reviewCount;
    private String deliveryTime;
    private BigDecimal deliveryFee;
    private BigDecimal minOrder;
    private String tags;
    private String createdAt;
}
