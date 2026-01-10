package com.takeaway.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateRestaurantRequest {

    @NotBlank(message = "店铺名称不能为空")
    private String name;

    private String description;

    private String image;

    private String logo;

    private String deliveryTime;

    private BigDecimal deliveryFee;

    private BigDecimal minOrder;

    @NotBlank(message = "店铺地址不能为空")
    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @NotBlank(message = "联系电话不能为空")
    private String phone;

    private String openTime;

    private String closeTime;

    @NotNull(message = "请选择店铺分类")
    private Long categoryId;

    private String tags;
}
