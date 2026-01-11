package com.takeaway.controller;

import com.takeaway.dto.ApiResponse;
import com.takeaway.service.AlipayService;
import com.takeaway.service.WechatPayService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 支付接口控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final AlipayService alipayService;
    private final WechatPayService wechatPayService;

    @Autowired
    public PaymentController(AlipayService alipayService,
                             @Autowired(required = false) WechatPayService wechatPayService) {
        this.alipayService = alipayService;
        this.wechatPayService = wechatPayService;
    }

    /**
     * 创建支付宝支付
     * 返回支付表单HTML，前端需要将其插入页面并自动提交
     * @param orderId 订单ID
     * @return 支付表单HTML
     */
    @PostMapping("/alipay/create/{orderId}")
    public ApiResponse<Map<String, String>> createAlipayPayment(@PathVariable Long orderId) {
        try {
            String payForm = alipayService.createPayForm(orderId);
            
            Map<String, String> result = new HashMap<>();
            result.put("payForm", payForm);
            
            return ApiResponse.success("支付表单生成成功", result);
        } catch (Exception e) {
            log.error("创建支付宝支付失败", e);
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 查询支付宝支付状态
     * 前端在支付完成跳转回来后调用此接口查询订单状态
     * @param orderNo 订单号
     * @return 支付状态
     */
    @GetMapping("/alipay/query")
    public ApiResponse<Map<String, Object>> queryAlipayPayment(@RequestParam String orderNo) {
        try {
            String status = alipayService.queryAndUpdateOrder(orderNo);
            
            Map<String, Object> result = new HashMap<>();
            result.put("orderNo", orderNo);
            result.put("status", status);
            result.put("paid", "PAID".equals(status) || "TRADE_SUCCESS".equals(status) || "TRADE_FINISHED".equals(status));
            
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("查询支付状态失败", e);
            return ApiResponse.error(400, e.getMessage());
        }
    }

    // ==================== 微信支付接口 ====================

    /**
     * 创建微信支付二维码（Native支付，扫码支付）
     * 返回微信支付二维码URL，前端需生成二维码供用户扫描
     * @param orderId 订单ID
     * @return 支付二维码URL
     */
    @PostMapping("/wechat/create/{orderId}")
    public ApiResponse<Map<String, String>> createWechatPayment(@PathVariable Long orderId) {
        if (wechatPayService == null) {
            return ApiResponse.error(503, "微信支付未配置，请在application.yml中配置wechat.pay相关参数并设置enabled=true");
        }
        try {
            String codeUrl = wechatPayService.createNativePayment(orderId);
            
            Map<String, String> result = new HashMap<>();
            result.put("codeUrl", codeUrl);
            result.put("returnUrl", "/payment/result");
            
            return ApiResponse.success("支付二维码生成成功", result);
        } catch (Exception e) {
            log.error("创建微信支付失败", e);
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 查询微信支付状态
     * 前端轮询调用此接口查询订单支付状态
     * @param orderNo 订单号
     * @return 支付状态
     */
    @GetMapping("/wechat/query")
    public ApiResponse<Map<String, Object>> queryWechatPayment(@RequestParam String orderNo) {
        if (wechatPayService == null) {
            return ApiResponse.error(503, "微信支付未配置");
        }
        try {
            String status = wechatPayService.queryAndUpdateOrder(orderNo);
            
            Map<String, Object> result = new HashMap<>();
            result.put("orderNo", orderNo);
            result.put("status", status);
            result.put("paid", "PAID".equals(status) || "SUCCESS".equals(status));
            
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("查询微信支付状态失败", e);
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 微信支付异步通知回调
     * 接收微信服务器发送的支付结果通知
     * @param requestBody 通知内容（JSON格式）
     * @return 处理结果
     */
    @PostMapping("/wechat/notify")
    public Map<String, String> wechatPayNotify(@RequestBody String requestBody) {
        Map<String, String> response = new HashMap<>();
        if (wechatPayService == null) {
            response.put("code", "FAIL");
            response.put("message", "微信支付未配置");
            return response;
        }
        try {
            // 注意：生产环境需要验证签名
            // 这里简化处理，实际应使用微信支付SDK的回调处理工具
            log.info("收到微信支付回调通知: {}", requestBody);
            
            // TODO: 解析通知内容，验证签名，获取订单号和交易号
            // 实际处理逻辑需根据微信支付API文档完善
            
            response.put("code", "SUCCESS");
            response.put("message", "成功");
        } catch (Exception e) {
            log.error("处理微信支付回调失败", e);
            response.put("code", "FAIL");
            response.put("message", e.getMessage());
        }
        return response;
    }
}
