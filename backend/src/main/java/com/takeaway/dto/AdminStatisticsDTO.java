package com.takeaway.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * 管理后台统计数据 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatisticsDTO {
    
    // 用户统计
    private Long totalUsers;
    private Long activeUsers;
    private Long newUsersToday;
    
    // 餐厅统计
    private Long totalRestaurants;
    private Long openRestaurants;
    private Long newRestaurantsToday;
    
    // 订单统计
    private Long totalOrders;
    private Long pendingOrders;
    private Long completedOrdersToday;
    
    // 营收统计
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    
    // 平台收入统计（抽成收入）
    private BigDecimal totalPlatformIncome;
    private BigDecimal todayPlatformIncome;
    
    // 评价统计
    private Long totalReviews;
    private Long newReviewsToday;
}
