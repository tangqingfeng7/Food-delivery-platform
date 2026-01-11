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
    private String username;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantImage;
    private String restaurantLogo;
    private List<OrderItemDTO> items;
    private BigDecimal totalAmount;
    private BigDecimal deliveryFee;
    private BigDecimal discountAmount;
    private BigDecimal payAmount;
    private BigDecimal platformFee;  // 平台抽成金额
    private BigDecimal platformRate;  // 平台抽成比例
    private BigDecimal merchantIncome;  // 商家实际收入
    private String status;
    private String address;
    private String phone;
    private String remark;
    private String deliveryTime;
    private String createdAt;
    private String updatedAt;
    private String completedAt;
    
    // 设置 createdAt（从 LocalDateTime 转换）
    public void setCreatedAtFromLocalDateTime(java.time.LocalDateTime dateTime) {
        if (dateTime != null) {
            this.createdAt = dateTime.toString();
        }
    }
    
    // 设置 completedAt（从 LocalDateTime 转换）
    public void setCompletedAtFromLocalDateTime(java.time.LocalDateTime dateTime) {
        if (dateTime != null) {
            this.completedAt = dateTime.toString();
        }
    }
}
