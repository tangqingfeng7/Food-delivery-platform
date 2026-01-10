package com.takeaway.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateRestaurantRequest {

    private String name;

    private String description;

    private String image;

    private String logo;

    private String deliveryTime;

    private BigDecimal deliveryFee;

    private BigDecimal minOrder;

    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String phone;

    private String openTime;

    private String closeTime;

    private Long categoryId;

    private String tags;
}
