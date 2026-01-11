# 配置说明

本文档详细说明美食速递平台的各项配置，包括第三方服务集成。

---

## 目录

- [基础配置](#基础配置)
- [高德地图配置](#高德地图配置)
- [支付宝支付配置](#支付宝支付配置)
- [微信支付配置](#微信支付配置)
- [文件上传配置](#文件上传配置)
- [JWT 配置](#jwt-配置)
- [WebSocket 配置](#websocket-配置)
- [生产环境配置](#生产环境配置)

---

## 基础配置

### 后端配置文件

配置文件路径：`backend/src/main/resources/application.yml`

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/takeaway_db?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: true

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

### 前端环境变量

创建 `frontend/.env.local` 文件：

```bash
# API 地址
VITE_API_BASE_URL=http://localhost:8080/api

# WebSocket 地址
VITE_WS_URL=http://localhost:8080/ws
```

---

## 高德地图配置

地址选择功能需要配置高德地图 JS API。

### 1. 申请 Key

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册/登录开发者账号
3. 进入「控制台」->「应用管理」->「创建新应用」
4. 添加 Key，选择「Web端(JS API)」
5. 设置安全密钥（jscode）

### 2. 配置前端

修改 `frontend/src/config/map.ts`：

```typescript
// 高德地图 JS API Key
export const AMAP_KEY = 'your_amap_key'

// 高德地图安全密钥
export const AMAP_SECURITY_CODE = 'your_security_code'

// 地图默认中心点（北京）
export const DEFAULT_CENTER = {
  lng: 116.397428,
  lat: 39.90923
}

// 地图默认缩放级别
export const DEFAULT_ZOOM = 15
```

### 3. 安全设置

在高德开放平台设置域名白名单：
- 开发环境：`localhost`
- 生产环境：`your-domain.com`

---

## 支付宝支付配置

项目集成了支付宝电脑网站支付功能。

### 1. 申请商户

1. 访问 [支付宝开放平台](https://open.alipay.com/)
2. 注册/登录企业账号
3. 进入「控制台」->「我的应用」->「创建应用」
4. 选择「网页/移动应用」
5. 在应用详情中添加「电脑网站支付」能力
6. 提交审核并等待通过

### 2. 配置密钥

1. 下载 [支付宝密钥生成工具](https://opendocs.alipay.com/common/02kipk)
2. 生成 RSA2(SHA256) 密钥对
3. 将**应用公钥**上传到开放平台
4. 获取**支付宝公钥**
5. 妥善保存**应用私钥**（不要泄露）

### 3. 后端配置

修改 `backend/src/main/resources/application.yml`：

```yaml
alipay:
  # 应用 ID（从开放平台获取）
  app-id: 2021000000000000
  
  # 应用私钥（RSA2 私钥，很长的一串字符）
  private-key: MIIEvgIBADANBgkqhkiG9w0BAQEFAAS...
  
  # 支付宝公钥（从开放平台获取）
  alipay-public-key: MIIBIjANBgkqhkiG9w0BAQEFAAO...
  
  # 支付完成后跳转地址
  return-url: http://localhost:5173/payment/result
  
  # 网关地址
  # 沙箱环境（开发测试）
  gateway-url: https://openapi-sandbox.dl.alipaydev.com/gateway.do
  # 正式环境（上线使用）
  # gateway-url: https://openapi.alipay.com/gateway.do
```

### 4. 沙箱测试

开发阶段使用沙箱环境测试：

1. 在开放平台进入「沙箱环境」
2. 获取沙箱应用 ID 和密钥
3. 下载沙箱版支付宝 App
4. 使用沙箱买家账号测试支付

### 5. 支付流程

```
用户点击支付 
    ↓
前端调用 /api/payment/alipay/create/{orderId}
    ↓
后端生成支付表单 HTML
    ↓
前端将表单插入页面并自动提交
    ↓
跳转至支付宝收银台
    ↓
用户完成支付
    ↓
支付宝跳转回 return_url
    ↓
前端轮询 /api/payment/alipay/query 确认状态
    ↓
订单状态更新为已支付
```

---

## 微信支付配置

项目集成了微信 Native 支付（扫码支付）。

### 1. 申请商户

1. 访问 [微信支付商户平台](https://pay.weixin.qq.com/)
2. 注册商户账号
3. 完成商户认证
4. 申请 Native 支付能力
5. 关联公众号或小程序（获取 AppID）

### 2. 配置 API 证书

1. 登录商户平台 -> 账户中心 -> API安全
2. 申请 API 证书，下载证书文件
3. 设置 APIv3 密钥（32位字符串）
4. 记录商户证书序列号

### 3. 后端配置

修改 `backend/src/main/resources/application.yml`：

```yaml
wechat:
  pay:
    # 商户号（从商户平台获取）
    merchant-id: 1600000000
    
    # 商户 API 私钥内容（证书文件中的私钥）
    private-key: |
      -----BEGIN PRIVATE KEY-----
      MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
      ...
      -----END PRIVATE KEY-----
    
    # 商户证书序列号
    merchant-serial-number: 3B5A7D8E9F0123456789ABCDEF
    
    # APIv3 密钥（32位字符串）
    api-v3-key: your32CharacterApiV3KeyHere1234
    
    # 公众号或小程序 AppID
    app-id: wx1234567890abcdef
    
    # 支付结果回调地址（必须公网可访问的 HTTPS）
    notify-url: https://your-domain.com/api/payment/wechat/notify
    
    # 支付完成后跳转地址
    return-url: http://localhost:5173/payment/result
```

### 4. 回调地址配置

> 重要：`notify-url` 必须是公网可访问的 HTTPS 地址

本地开发时可使用内网穿透工具：

```bash
# 使用 ngrok
ngrok http 8080

# 将生成的 https 地址配置为 notify-url
# 如：https://abc123.ngrok.io/api/payment/wechat/notify
```

### 5. 支付流程

```
用户点击支付
    ↓
前端调用 /api/payment/wechat/create/{orderId}
    ↓
后端调用微信 API 生成支付二维码
    ↓
前端显示二维码（使用 qrcode 库）
    ↓
用户扫码支付
    ↓
微信服务器回调 notify-url
    ↓
前端轮询 /api/payment/wechat/query 确认状态
    ↓
订单状态更新为已支付
```

---

## 文件上传配置

### 后端配置

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB      # 单个文件最大大小
      max-request-size: 10MB   # 请求最大大小

upload:
  path: ./uploads              # 文件存储路径
  allowed-types: jpg,jpeg,png,gif,webp  # 允许的文件类型
```

### 生产环境建议

- 使用 OSS（阿里云、腾讯云等）存储文件
- 配置 CDN 加速静态资源
- 设置合理的文件大小限制

---

## JWT 配置

```yaml
jwt:
  # 密钥（生产环境请使用更复杂的密钥）
  secret: your-very-long-and-secure-secret-key-here
  
  # Token 有效期（毫秒）
  expiration: 86400000  # 24 小时
  
  # Token 前缀
  prefix: Bearer
  
  # Header 名称
  header: Authorization
```

### 安全建议

- 生产环境使用随机生成的长密钥
- 定期轮换密钥
- 设置合理的过期时间
- 考虑实现 Token 刷新机制

---

## WebSocket 配置

### 后端配置

WebSocket 端点配置在 `WebSocketConfig.java` 中：

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }
}
```

### 前端连接

```typescript
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  reconnectDelay: 5000,
  onConnect: () => {
    // 订阅用户订单更新
    client.subscribe(`/user/${userId}/queue/orders`, (message) => {
      const data = JSON.parse(message.body)
      console.log('订单更新:', data)
    })
  }
})

client.activate()
```

---

## 生产环境配置

### 后端生产配置

创建 `application-prod.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://prod-db-host:3306/takeaway_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate  # 生产环境不自动更新表结构

jwt:
  secret: ${JWT_SECRET}

alipay:
  gateway-url: https://openapi.alipay.com/gateway.do
  app-id: ${ALIPAY_APP_ID}
  private-key: ${ALIPAY_PRIVATE_KEY}
  alipay-public-key: ${ALIPAY_PUBLIC_KEY}
```

启动命令：

```bash
java -jar takeaway-platform-1.0.0.jar --spring.profiles.active=prod
```

### 前端生产配置

创建 `.env.production`：

```bash
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_WS_URL=https://api.your-domain.com/ws
```

构建生产版本：

```bash
npm run build
```

### 环境变量安全

- 敏感配置使用环境变量
- 不要将密钥提交到代码仓库
- 使用配置中心管理生产配置

---

## 下一步

- [快速开始](QUICK_START.md) - 快速搭建开发环境
- [开发说明](DEVELOPMENT.md) - 开发规范和指南
- [API 文档](API.md) - 完整接口文档
