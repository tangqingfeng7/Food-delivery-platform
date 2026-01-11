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
    private Boolean isFeatured;
    private Long categoryId;
    private String categoryName;
    private List<String> tags;
    private BigDecimal balance;
    private BigDecimal platformRate;  // 平台抽成比例（如 0.08 表示 8%）
    private BigDecimal platformRatePercent;  // 平台抽成百分比（如 8 表示 8%）
    private String createdAt;
    
    // 设置 tags（从逗号分隔的字符串转换）
    public void setTagsFromString(String tagsStr) {
        if (tagsStr != null && !tagsStr.isEmpty()) {
            this.tags = java.util.Arrays.asList(tagsStr.split(","));
        }
    }
    
    // 设置 createdAt（从 LocalDateTime 转换）
    public void setCreatedAtFromLocalDateTime(java.time.LocalDateTime dateTime) {
        if (dateTime != null) {
            this.createdAt = dateTime.toString();
        }
    }
}
