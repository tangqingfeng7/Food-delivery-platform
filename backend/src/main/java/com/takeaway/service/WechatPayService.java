package com.takeaway.service;

import com.takeaway.config.WechatPayConfig;
import com.takeaway.entity.Order;
import com.takeaway.entity.Restaurant;
import com.takeaway.entity.SystemConfig;
import com.takeaway.repository.OrderRepository;
import com.takeaway.repository.RestaurantRepository;
import com.takeaway.repository.SystemConfigRepository;
import com.wechat.pay.java.service.payments.model.Transaction;
import com.wechat.pay.java.service.payments.nativepay.NativePayService;
import com.wechat.pay.java.service.payments.nativepay.model.Amount;
import com.wechat.pay.java.service.payments.nativepay.model.PrepayRequest;
import com.wechat.pay.java.service.payments.nativepay.model.PrepayResponse;
import com.wechat.pay.java.service.payments.nativepay.model.QueryOrderByOutTradeNoRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * 微信支付服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WechatPayService {

    private final NativePayService nativePayService;
    private final WechatPayConfig wechatPayConfig;
    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final WebSocketService webSocketService;

    // 兜底默认平台抽成比例
    private static final BigDecimal FALLBACK_PLATFORM_RATE = BigDecimal.valueOf(0.08);

    /**
     * 创建微信支付二维码（Native支付）
     * @param orderId 订单ID
     * @return 支付二维码URL
     */
    public String createNativePayment(Long orderId) {
        if (orderId == null) {
            throw new IllegalArgumentException("订单ID不能为空");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("订单状态不正确，无法支付");
        }

        try {
            // 构建预支付请求
            PrepayRequest request = new PrepayRequest();
            request.setAppid(wechatPayConfig.getAppId());
            request.setMchid(wechatPayConfig.getMerchantId());
            request.setDescription("订单支付-" + order.getRestaurant().getName());
            request.setOutTradeNo(order.getOrderNo());
            request.setNotifyUrl(wechatPayConfig.getNotifyUrl());

            // 设置金额（单位：分）
            Amount amount = new Amount();
            int totalFee = order.getPayAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .intValue();
            amount.setTotal(totalFee);
            amount.setCurrency("CNY");
            request.setAmount(amount);

            // 调用微信支付预支付接口
            PrepayResponse response = nativePayService.prepay(request);
            String codeUrl = response.getCodeUrl();

            log.info("生成微信支付二维码，订单号: {}, 二维码URL: {}", order.getOrderNo(), codeUrl);

            return codeUrl;
        } catch (Exception e) {
            log.error("创建微信支付失败", e);
            throw new RuntimeException("创建微信支付失败: " + e.getMessage());
        }
    }

    /**
     * 查询微信订单状态并更新本地订单
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
            // 查询微信订单状态
            QueryOrderByOutTradeNoRequest request = new QueryOrderByOutTradeNoRequest();
            request.setMchid(wechatPayConfig.getMerchantId());
            request.setOutTradeNo(orderNo);

            Transaction transaction = nativePayService.queryOrderByOutTradeNo(request);
            Transaction.TradeStateEnum tradeState = transaction.getTradeState();

            log.info("查询微信订单状态，订单号: {}, 状态: {}", orderNo, tradeState);

            // 交易成功
            if (tradeState == Transaction.TradeStateEnum.SUCCESS) {
                updateOrderToPaid(order, "wechat");
                return "PAID";
            }

            return tradeState.name();
        } catch (Exception e) {
            log.error("查询微信订单状态失败", e);
            throw new RuntimeException("查询支付状态失败: " + e.getMessage());
        }
    }

    /**
     * 处理微信支付回调通知
     * @param orderNo 订单号
     * @param transactionId 微信支付交易号
     * @return 是否处理成功
     */
    @Transactional
    public boolean handlePaymentNotify(String orderNo, String transactionId) {
        try {
            Order order = orderRepository.findByOrderNo(orderNo).orElse(null);
            if (order == null) {
                log.error("订单不存在，订单号: {}", orderNo);
                return false;
            }

            // 如果订单已经是已支付状态，直接返回成功
            if (order.getStatus() != Order.OrderStatus.PENDING) {
                log.info("订单已处理，订单号: {}, 当前状态: {}", orderNo, order.getStatus());
                return true;
            }

            // 更新订单状态
            updateOrderToPaid(order, "wechat");
            log.info("微信支付回调处理成功，订单号: {}, 微信交易号: {}", orderNo, transactionId);

            return true;
        } catch (Exception e) {
            log.error("处理微信支付回调失败", e);
            return false;
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
