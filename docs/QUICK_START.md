# 快速开始

本文档指导您快速搭建和运行美食速递外卖平台。

---

## 目录

- [环境要求](#环境要求)
- [1. 克隆项目](#1-克隆项目)
- [2. 数据库初始化](#2-数据库初始化)
- [3. 配置后端](#3-配置后端)
- [4. 启动后端服务](#4-启动后端服务)
- [5. 启动用户端前端](#5-启动用户端前端)
- [6. 启动管理后台](#6-启动管理后台)
- [验证安装](#验证安装)
- [常见问题](#常见问题)

---

## 环境要求

请确保您的开发环境满足以下要求：

| 环境 | 版本要求 | 检查命令 |
|------|----------|----------|
| Node.js | 18.0+ | `node -v` |
| npm | 9.0+ | `npm -v` |
| Java | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -v` |
| MySQL | 8.0+ | `mysql --version` |

---

## 1. 克隆项目

```bash
git clone <repository-url>
cd TEst
```

---

## 2. 数据库初始化

### 方式一：命令行导入

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本（创建数据库和表结构）
source database/init.sql

# 插入测试数据
source database/seed.sql
```

### 方式二：使用 MySQL 客户端工具

1. 使用 Navicat、DBeaver 等工具连接 MySQL
2. 依次执行 `database/init.sql` 和 `database/seed.sql`

### 验证数据库

```sql
USE takeaway_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM restaurants;
```

---

## 3. 配置后端

编辑配置文件 `backend/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/takeaway_db?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: your_password  # 修改为你的数据库密码
```

### 其他可选配置

```yaml
# JWT 密钥（生产环境请修改）
jwt:
  secret: your-secret-key
  expiration: 86400000  # Token 有效期（毫秒），默认 24 小时

# 文件上传路径
upload:
  path: ./uploads
```

---

## 4. 启动后端服务

```bash
cd backend
```

### 方式一：Maven 直接运行（开发环境推荐）

```bash
mvn spring-boot:run
```

### 方式二：打包后运行

```bash
# 打包（跳过测试）
mvn clean package -DskipTests

# 运行 jar 包
java -jar target/takeaway-platform-1.0.0.jar
```

### 验证后端启动

后端启动成功后，访问以下地址验证：

| 服务 | 地址 |
|------|------|
| API 根路径 | http://localhost:8080/api |
| Swagger 文档 | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |

控制台应显示类似信息：

```
Started TakeawayPlatformApplication in x.xxx seconds
Tomcat started on port(s): 8080 (http)
```

---

## 5. 启动用户端前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 访问地址

| 页面 | 地址 |
|------|------|
| 用户端首页 | http://localhost:3000 |
| 商户登录入口 | http://localhost:3000/merchant/login |
| 商户注册入口 | http://localhost:3000/merchant/register |

### 生产构建

```bash
npm run build
npm run preview  # 预览构建结果
```

---

## 6. 启动管理后台

```bash
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 访问地址

| 页面 | 地址 |
|------|------|
| 管理后台 | http://localhost:3001 |

### 生产构建

```bash
npm run build
npm run preview  # 预览构建结果
```

---

## 验证安装

完成以上步骤后，使用测试账号验证系统功能：

### 1. 用户端测试

1. 访问 http://localhost:3000
2. 使用测试账号登录：`13800138001` / `123456`
3. 浏览餐厅、添加购物车、创建订单

### 2. 商户端测试

1. 访问 http://localhost:3000/merchant/login
2. 使用商户账号登录：`13900000001` / `123456`
3. 查看店铺信息、管理菜品、处理订单

### 3. 管理后台测试

1. 访问 http://localhost:3001
2. 使用管理员账号登录：`13800000000` / `123456`
3. 查看仪表盘、管理用户、管理餐厅

---

## 常见问题

### Q: 后端启动报数据库连接错误？

**A:** 请检查：
1. MySQL 服务是否启动
2. `application.yml` 中数据库地址、用户名、密码是否正确
3. 数据库 `takeaway_db` 是否已创建

### Q: 前端启动后页面空白？

**A:** 请检查：
1. 后端服务是否正常运行
2. 浏览器控制台是否有 CORS 错误
3. API 请求地址是否正确（检查 `vite.config.ts` 中的代理配置）

### Q: npm install 失败？

**A:** 尝试以下方法：
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### Q: Maven 构建失败？

**A:** 尝试以下方法：
```bash
# 清除本地仓库缓存
mvn dependency:purge-local-repository

# 强制更新依赖
mvn clean install -U
```

### Q: 端口被占用？

**A:** 修改端口配置：
- 后端：修改 `application.yml` 中的 `server.port`
- 前端：修改 `vite.config.ts` 中的 `server.port`

---

## 下一步

- [配置说明](CONFIG.md) - 高德地图、支付宝、微信支付等第三方服务配置
- [开发说明](DEVELOPMENT.md) - 开发规范、项目结构、部署指南
- [API 文档](API.md) - 完整的接口文档
