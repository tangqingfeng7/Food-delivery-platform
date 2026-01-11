package com.takeaway.service;

import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.request.AlipayTradePagePayRequest;
import com.alipay.api.request.AlipayTradeQueryRequest;
import com.alipay.api.response.AlipayTradeQueryResponse;
import com.takeaway.config.AlipayConfig;
import com.takeaway.entity.Order;
import com.takeaway.repository.OrderRepository;
import com.takeaway.repository.RestaurantRepository;
import com.takeaway.repository.SystemConfigRepository;
import com.takeaway.entity.Restaurant;
import com.takeaway.entity.SystemConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * 支付宝支付服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlipayService {

    private final AlipayClient alipayClient;
    private final AlipayConfig alipayConfig;
    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final WebSocketService webSocketService;

    // 兜底默认平台抽成比例
    private static final BigDecimal FALLBACK_PLATFORM_RATE = BigDecimal.valueOf(0.08);

    /**
     * 创建支付宝支付表单
     * @param orderId 订单ID
     * @return 支付表单HTML
     */
    public String createPayForm(Long orderId) {
        if (orderId == null) {
            throw new IllegalArgumentException("订单ID不能为空");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("订单状态不正确，无法支付");
        }

        try {
            // 创建支付请求
            AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
            
            // 设置同步跳转地址（支付完成后跳转）
            request.setReturnUrl(alipayConfig.getReturnUrl() + "?orderNo=" + order.getOrderNo());
            
            // 设置业务参数
            String bizContent = String.format(
                    "{\"out_trade_no\":\"%s\"," +
                    "\"total_amount\":\"%.2f\"," +
                    "\"subject\":\"%s\"," +
                    "\"product_code\":\"FAST_INSTANT_TRADE_PAY\"}",
                    order.getOrderNo(),
                    order.getPayAmount(),
                    "订单支付-" + order.getRestaurant().getName()
            );
            request.setBizContent(bizContent);

            // 生成支付表单HTML
            String form = alipayClient.pageExecute(request).getBody();
            log.info("生成支付宝支付表单，订单号: {}", order.getOrderNo());
            
            return form;
        } catch (AlipayApiException e) {
            log.error("创建支付宝支付失败", e);
            throw new RuntimeException("创建支付失败: " + e.getMessage());
        }
    }

    /**
     * 查询支付宝订单状态并更新本地订单
     * @param orderNo 订单号
     * @return 订单支付状态
     */
    @Transactional
    public String queryAndUpdateOrder(String orderNo) {
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        // 如果订单已经是已支付状态，直接返回
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            return order.getStatus().name();
        }

        try {
            // 查询支付宝订单状态
            AlipayTradeQueryRequest request = new AlipayTradeQueryRequest();
            request.setBizContent("{\"out_trade_no\":\"" + orderNo + "\"}");

            AlipayTradeQueryResponse response = alipayClient.execute(request);
            
            if (response.isSuccess()) {
                String tradeStatus = response.getTradeStatus();
                log.info("查询订单状态，订单号: {}, 状态: {}", orderNo, tradeStatus);

                // 交易成功
                if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
                    // 更新订单状态
                    updateOrderToPaid(order, "alipay");
                    return "PAID";
                }
                
                return tradeStatus;
            } else {
                log.warn("查询订单状态失败，订单号: {}, 错误: {}", orderNo, response.getSubMsg());
                return "UNKNOWN";
            }
        } catch (AlipayApiException e) {
            log.error("查询支付宝订单状态失败", e);
            throw new RuntimeException("查询支付状态失败: " + e.getMessage());
        }
    }

    /**
     * 更新订单为已支付状态
     */
    private void updateOrderToPaid(Order order, String paymentMethod) {
        String oldStatus = order.getStatus().name();
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());

        // 计算平台抽成
        Restaurant restaurant = order.getRestaurant();
        BigDecimal platformRate = getPlatformRate(restaurant);
        BigDecimal payAmount = order.getPayAmount();

        // 平台抽成金额 = 支付金额 × 抽成比例
        BigDecimal platformFee = payAmount.multiply(platformRate).setScale(2, RoundingMode.HALF_UP);
        // 商家实际收入 = 支付金额 - 平台抽成
        BigDecimal merchantIncome = payAmount.subtract(platformFee);

        order.setPlatformRate(platformRate);
        order.setPlatformFee(platformFee);
        order.setMerchantIncome(merchantIncome);

        orderRepository.save(order);

        // 将商家实际收入存入店铺余额
        BigDecimal currentBalance = restaurant.getBalance() != null ? restaurant.getBalance() : BigDecimal.ZERO;
        restaurant.setBalance(currentBalance.add(merchantIncome));
        restaurantRepository.save(restaurant);

        // 推送订单状态更新消息
        webSocketService.sendOrderStatusUpdate(order, oldStatus);
        // 推送新订单通知给商家
        webSocketService.sendNewOrderNotification(order);

        log.info("订单支付成功，订单号: {}, 支付方式: {}", order.getOrderNo(), paymentMethod);
    }

    /**
     * 获取店铺的平台抽成比例
     */
    private BigDecimal getPlatformRate(Restaurant restaurant) {
        if (restaurant.getPlatformRate() != null) {
            return restaurant.getPlatformRate();
        }

        return systemConfigRepository.findByConfigKey(SystemConfig.KEY_DEFAULT_PLATFORM_RATE)
                .map(SystemConfig::getValueAsBigDecimal)
                .orElse(FALLBACK_PLATFORM_RATE);
    }
}
