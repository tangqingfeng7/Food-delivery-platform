package com.takeaway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket 配置类
 * 使用 STOMP 协议实现消息推送
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // 配置消息代理，客户端订阅的目的地前缀
        config.enableSimpleBroker("/topic", "/queue");
        // 配置应用程序目的地前缀，客户端发送消息的目的地前缀
        config.setApplicationDestinationPrefixes("/app");
        // 配置用户目的地前缀，用于点对点消息
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // 注册 STOMP 端点，客户端连接的地址
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // 同时支持原生 WebSocket 连接（不使用 SockJS）
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}
