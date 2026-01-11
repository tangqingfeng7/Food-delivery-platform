# 美食速递 - 外卖平台

一个完整的外卖平台项目，包含前端和后端。

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI**: Tailwind CSS
- **动画**: Framer Motion
- **状态管理**: Zustand
- **HTTP**: Axios
- **路由**: React Router v6
- **图标**: Lucide React

### 后端
- **框架**: Spring Boot 3.2
- **语言**: Java 17
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **数据库**: MySQL 8.0
- **API文档**: SpringDoc OpenAPI

## 项目结构

```
├── frontend/                # 用户端前端项目 (端口3000)
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # 状态管理
│   │   ├── types/          # TypeScript 类型
│   │   └── ...
│   └── ...
├── admin/                   # 管理后台前端项目 (端口3001)
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/     # 通用组件
│   │   ├── layouts/        # 布局组件
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # 状态管理
│   │   └── ...
│   └── ...
├── backend/                 # 后端项目
│   ├── src/main/java/com/takeaway/
│   │   ├── config/         # 配置类
│   │   ├── controller/     # 控制器
│   │   ├── dto/            # 数据传输对象
│   │   ├── entity/         # 实体类
│   │   ├── repository/     # 数据仓库
│   │   ├── security/       # 安全相关
│   │   └── service/        # 服务层
│   └── ...
└── database/               # 数据库脚本
    ├── init.sql            # 初始化表结构
    └── seed.sql            # 种子数据
```

## 快速开始

### 1. 数据库配置

确保已安装 MySQL 8.0+，然后执行数据库初始化脚本：

```bash
# 创建数据库和表结构
mysql -u root -p < database/init.sql

# 插入测试数据
mysql -u root -p < database/seed.sql
```

### 2. 后端启动

```bash
cd backend

# 修改数据库配置 (src/main/resources/application.yml)
# 设置正确的数据库用户名和密码

# 使用 Maven 启动
mvn spring-boot:run

# 或者打包后运行
mvn clean package
java -jar target/takeaway-platform-1.0.0.jar
```

后端启动后访问：
- API: http://localhost:8080/api
- Swagger文档: http://localhost:8080/swagger-ui.html

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端启动后访问：
- 用户端首页: http://localhost:3000
- 商户后台入口: http://localhost:3000/merchant/login

### 4. 管理后台启动

```bash
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

管理后台启动后访问：http://localhost:3001

## 测试账号

### 管理员账号

| 用户名 | 手机号 | 密码 |
|-------|--------|------|
| admin | 13800000000 | 123456 |

### 商户账号

| 店铺名称 | 手机号 | 密码 |
|---------|--------|------|
| 老北京炸酱面馆 | 13900000001 | 123456 |
| 川香阁麻辣烫 | 13900000002 | 123456 |
| 日式拉面屋 | 13900000003 | 123456 |

### 普通用户账号

| 用户名 | 手机号 | 密码 |
|-------|--------|------|
| 张三 | 13800138001 | 123456 |
| 李四 | 13800138002 | 123456 |
| 王五 | 13800138003 | 123456 |

## API 文档

详细的 API 接口文档请查看：[API 文档](docs/API.md)

启动后端服务后，也可访问在线 Swagger 文档：http://localhost:8080/swagger-ui.html

## 功能特性

### 用户端
- 用户注册/登录
- 餐厅浏览和搜索
- 菜品分类展示
- 购物车管理
- 订单创建和管理
- 在线支付（支付宝、微信支付、余额支付）
- 收藏餐厅
- 收货地址管理（支持地图定位选择）
- 消息通知（系统通知、订单通知、优惠活动）
- 评价系统
- 响应式设计
- 高级动画效果

### 商户后台
- 商户注册/登录
- 店铺信息管理
- 菜品管理（增删改查）
- 订单管理（接单、制作、配送）
- 评价管理（查看、回复评价）
- 经营数据统计

### 管理后台
- 平台数据统计仪表盘
- 用户管理（查看、启用/禁用）
- 餐厅管理（上架/下架）
- 订单管理（查看详情）
- 分类管理（增删改查）
- 评价管理（查看、删除违规评价）
- 系统通知广播

## 开发说明

### 环境要求
- Node.js 18+
- Java 17+
- MySQL 8.0+
- Maven 3.8+

### 配置说明

后端配置文件：`backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/takeaway_db
    username: root
    password: your_password
```

### 高德地图配置（地址定位功能）

收货地址功能支持地图定位选择，需要配置高德地图 API Key：

1. 访问 [高德开放平台](https://lbs.amap.com/) 注册开发者账号
2. 创建应用，获取 Web 端 JS API 的 Key
3. 在应用管理中配置安全密钥
4. 修改 `frontend/src/config/map.ts`：

```typescript
// 填入您的 Key
export const AMAP_KEY = 'your_amap_key'
// 填入您的安全密钥
export const AMAP_SECURITY_CODE = 'your_security_code'
```

### 支付宝支付配置

项目已集成支付宝电脑网站支付功能（轮询模式，无需公网服务器）。

#### 1. 申请支付宝商户

1. 访问 [支付宝开放平台](https://open.alipay.com/) 注册/登录
2. 进入「控制台」->「我的应用」->「创建应用」
3. 选择「网页/移动应用」，填写应用名称
4. 在应用详情中添加「电脑网站支付」能力
5. 提交审核并等待通过

#### 2. 配置密钥

1. 下载 [支付宝密钥生成工具](https://opendocs.alipay.com/common/02kipk)
2. 生成 RSA2 密钥对
3. 将**应用公钥**上传到开放平台，获取**支付宝公钥**
4. 保存好应用私钥（不要泄露）

#### 3. 修改配置文件

修改 `backend/src/main/resources/application.yml`：

```yaml
alipay:
  app-id: 你的AppID              # 从开放平台获取
  private-key: 你的应用私钥       # RSA2 私钥（很长的一串字符）
  alipay-public-key: 支付宝公钥   # 从开放平台获取
  return-url: http://localhost:5173/payment/result  # 支付完成跳转地址
  gateway-url: https://openapi-sandbox.dl.alipaydev.com/gateway.do  # 沙箱环境
  # gateway-url: https://openapi.alipay.com/gateway.do  # 正式环境
```

#### 4. 支付流程说明

```
用户点击支付 -> 选择支付宝 -> 跳转支付宝收银台 -> 完成支付 -> 跳回结果页 -> 轮询确认状态 -> 订单更新
```

- **沙箱环境**：开发测试时使用沙箱网关和沙箱账号
- **正式环境**：上线时切换为正式网关地址

### 微信支付配置

项目已集成微信 Native 支付功能（扫码支付，适合PC端）。

#### 1. 申请微信支付商户

1. 访问 [微信支付商户平台](https://pay.weixin.qq.com/) 注册商户号
2. 完成商户认证
3. 申请 Native 支付能力
4. 关联公众号或小程序（获取 AppID）

#### 2. 配置 API 证书和密钥

1. 登录商户平台 -> 账户中心 -> API安全
2. 申请 API 证书，下载证书文件
3. 设置 APIv3 密钥（32位字符串）
4. 记录商户证书序列号

#### 3. 修改配置文件

修改 `backend/src/main/resources/application.yml`：

```yaml
wechat:
  pay:
    merchant-id: 你的商户号              # 从商户平台获取
    private-key: |                      # 商户API私钥内容
      -----BEGIN PRIVATE KEY-----
      你的私钥内容...
      -----END PRIVATE KEY-----
    merchant-serial-number: 证书序列号   # 从商户平台获取
    api-v3-key: 你的APIv3密钥           # 32位字符串
    app-id: 你的AppID                   # 公众号或小程序的AppID
    notify-url: https://你的域名/api/payment/wechat/notify  # 回调地址（需公网可访问）
    return-url: http://localhost:5173/payment/result
```

#### 4. 支付流程说明

```
用户点击支付 -> 选择微信 -> 显示支付二维码 -> 用户扫码支付 -> 轮询确认状态 -> 订单更新
```

**注意事项**：
- 微信支付回调地址 `notify-url` 必须是公网可访问的 HTTPS 地址
- 本地开发时可使用 ngrok 等工具进行内网穿透
- 前端需要安装二维码生成库（如 `qrcode`）来显示支付二维码

## License

MIT
