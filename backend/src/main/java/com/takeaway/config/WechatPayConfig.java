package com.takeaway.config;

import com.wechat.pay.java.core.Config;
import com.wechat.pay.java.core.RSAAutoCertificateConfig;
import com.wechat.pay.java.service.payments.nativepay.NativePayService;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 微信支付配置类
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "wechat.pay")
public class WechatPayConfig {

    /**
     * 商户号
     */
    private String merchantId;

    /**
     * 商户API私钥路径
     */
    private String privateKeyPath;

    /**
     * 商户API私钥内容（与 privateKeyPath 二选一）
     */
    private String privateKey;

    /**
     * 商户证书序列号
     */
    private String merchantSerialNumber;

    /**
     * APIv3密钥
     */
    private String apiV3Key;

    /**
     * AppID（公众号或小程序的AppID）
     */
    private String appId;

    /**
     * 支付通知回调地址
     */
    private String notifyUrl;

    /**
     * 支付完成后的跳转地址（前端页面）
     */
    private String returnUrl;

    /**
     * 创建微信支付配置
     */
    @Bean
    public Config wechatPayConfig() {
        // 使用 RSAAutoCertificateConfig 自动下载微信平台证书
        return new RSAAutoCertificateConfig.Builder()
                .merchantId(merchantId)
                .privateKey(privateKey)
                .merchantSerialNumber(merchantSerialNumber)
                .apiV3Key(apiV3Key)
                .build();
    }

    /**
     * 创建 Native 支付服务（扫码支付）
     */
    @Bean
    public NativePayService nativePayService(Config config) {
        return new NativePayService.Builder().config(config).build();
    }
}
