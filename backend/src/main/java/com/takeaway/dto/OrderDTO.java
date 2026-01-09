package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private Long id;
    private String orderNo;
    private Long userId;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantImage;
    private List<OrderItemDTO> items;
    private BigDecimal totalAmount;
    private BigDecimal deliveryFee;
    private BigDecimal discountAmount;
    private BigDecimal payAmount;
    private String status;
    private String address;
    private String phone;
    private String remark;
    private String deliveryTime;
    private String createdAt;
    private String updatedAt;
}
