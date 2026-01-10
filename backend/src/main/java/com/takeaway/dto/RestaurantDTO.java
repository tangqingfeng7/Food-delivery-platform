package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDTO {

    private Long id;
    private String name;
    private String description;
    private String image;
    private String logo;
    private BigDecimal rating;
    private Integer reviewCount;
    private String deliveryTime;
    private BigDecimal deliveryFee;
    private BigDecimal minOrder;
    private BigDecimal distance;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String openTime;
    private String closeTime;
    private Boolean isOpen;
    private Boolean isNew;
    private Long categoryId;
    private String categoryName;
    private List<String> tags;
    private String createdAt;
}
