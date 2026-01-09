package com.takeaway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MerchantStatisticsDTO {

    // 今日统计
    private Long todayOrders;           // 今日订单数
    private BigDecimal todayRevenue;    // 今日收入

    // 总计统计
    private Long totalOrders;           // 总订单数
    private BigDecimal totalRevenue;    // 总收入

    // 订单状态统计
    private Long pendingOrders;         // 待支付订单
    private Long paidOrders;            // 已支付待确认
    private Long preparingOrders;       // 制作中订单
    private Long deliveringOrders;      // 配送中订单
    private Long completedOrders;       // 已完成订单

    // 菜品统计
    private Long totalMenuItems;        // 菜品总数
    private Long availableMenuItems;    // 上架菜品数
}
