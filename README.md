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
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # 状态管理
│   │   ├── types/          # TypeScript 类型
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

前端启动后访问：http://localhost:3000

## 测试账号

| 用户名 | 手机号 | 密码 |
|-------|--------|------|
| 张三 | 13800138001 | 123456 |
| 李四 | 13800138002 | 123456 |
| 王五 | 13800138003 | 123456 |

## API 文档

详细的 API 接口文档请查看：[API 文档](docs/API.md)

启动后端服务后，也可访问在线 Swagger 文档：http://localhost:8080/swagger-ui.html

## 功能特性

- 用户注册/登录
- 餐厅浏览和搜索
- 菜品分类展示
- 购物车管理
- 订单创建和管理
- 收藏餐厅
- 收货地址管理（支持地图定位选择）
- 消息通知（系统通知、订单通知、优惠活动）
- 响应式设计
- 高级动画效果

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

## License

MIT
