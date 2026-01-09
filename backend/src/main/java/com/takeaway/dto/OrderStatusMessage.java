package com.takeaway.dto;

import com.takeaway.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单状态更新消息 DTO
 * 用于 WebSocket 推送订单状态变化
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusMessage {
    
    /**
     * 消息类型
     */
    private String type;
    
    /**
     * 订单ID
     */
    private Long orderId;
    
    /**
     * 订单号
     */
    private String orderNo;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 餐厅ID
     */
    private Long restaurantId;
    
    /**
     * 餐厅名称
     */
    private String restaurantName;
    
    /**
     * 旧状态
     */
    private String oldStatus;
    
    /**
     * 新状态
     */
    private String newStatus;
    
    /**
     * 状态标签（中文）
     */
    private String statusLabel;
    
    /**
     * 实付金额
     */
    private BigDecimal payAmount;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 消息内容
     */
    private String message;
    
    /**
     * 从订单实体创建状态更新消息
     */
    public static OrderStatusMessage fromOrder(Order order, String oldStatus) {
        String statusLabel = getStatusLabel(order.getStatus().name());
        String message = String.format("您的订单「%s」已变为「%s」", order.getOrderNo(), statusLabel);
        
        return OrderStatusMessage.builder()
                .type("ORDER_STATUS_UPDATE")
                .orderId(order.getId())
                .orderNo(order.getOrderNo())
                .userId(order.getUser().getId())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .oldStatus(oldStatus)
                .newStatus(order.getStatus().name())
                .statusLabel(statusLabel)
                .payAmount(order.getPayAmount())
                .updatedAt(LocalDateTime.now())
                .message(message)
                .build();
    }
    
    /**
     * 获取状态中文标签
     */
    private static String getStatusLabel(String status) {
        return switch (status) {
            case "PENDING" -> "待支付";
            case "PAID" -> "已支付";
            case "CONFIRMED" -> "已确认";
            case "PREPARING" -> "制作中";
            case "DELIVERING" -> "配送中";
            case "COMPLETED" -> "已完成";
            case "CANCELLED" -> "已取消";
            default -> status;
        };
    }
}
