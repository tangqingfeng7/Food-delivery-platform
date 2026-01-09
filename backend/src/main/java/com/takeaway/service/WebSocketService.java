package com.takeaway.service;

import com.takeaway.dto.OrderStatusMessage;
import com.takeaway.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * WebSocket 消息服务
 * 负责向客户端推送实时消息
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 推送订单状态更新消息给指定用户
     * @param order 订单实体
     * @param oldStatus 旧状态
     */
    public void sendOrderStatusUpdate(Order order, String oldStatus) {
        try {
            OrderStatusMessage message = OrderStatusMessage.fromOrder(order, oldStatus);
            
            // 推送给指定用户（使用 topic 模式，避免匿名连接无法路由的问题）
            String userDestination = "/topic/user/" + order.getUser().getId() + "/orders";
            messagingTemplate.convertAndSend(userDestination, message);
            
            // 同时推送到公共订单主题（用于商家端监听）
            String merchantDestination = "/topic/merchant/" + order.getRestaurant().getId() + "/orders";
            messagingTemplate.convertAndSend(merchantDestination, message);
            
            log.info("订单状态更新消息已推送 - 订单号: {}, 用户ID: {}, 新状态: {}", 
                    order.getOrderNo(), order.getUser().getId(), order.getStatus());
        } catch (Exception e) {
            log.error("推送订单状态更新消息失败 - 订单号: {}, 错误: {}", order.getOrderNo(), e.getMessage());
        }
    }

    /**
     * 推送新订单通知给商家
     * @param order 订单实体
     */
    public void sendNewOrderNotification(Order order) {
        try {
            OrderStatusMessage message = OrderStatusMessage.builder()
                    .type("NEW_ORDER")
                    .orderId(order.getId())
                    .orderNo(order.getOrderNo())
                    .userId(order.getUser().getId())
                    .restaurantId(order.getRestaurant().getId())
                    .restaurantName(order.getRestaurant().getName())
                    .newStatus(order.getStatus().name())
                    .payAmount(order.getPayAmount())
                    .message("您有新订单，请及时处理")
                    .build();
            
            String destination = "/topic/merchant/" + order.getRestaurant().getId() + "/orders";
            messagingTemplate.convertAndSend(destination, message);
            
            log.info("新订单通知已推送 - 订单号: {}, 餐厅ID: {}", order.getOrderNo(), order.getRestaurant().getId());
        } catch (Exception e) {
            log.error("推送新订单通知失败 - 订单号: {}, 错误: {}", order.getOrderNo(), e.getMessage());
        }
    }
    
    /**
     * 推送消息给所有用户（广播）
     * @param destination 目的地
     * @param message 消息内容
     */
    public void broadcast(String destination, Object message) {
        try {
            messagingTemplate.convertAndSend("/topic" + destination, message);
            log.info("广播消息已发送 - 目的地: {}", destination);
        } catch (Exception e) {
            log.error("广播消息失败 - 目的地: {}, 错误: {}", destination, e.getMessage());
        }
    }
}
