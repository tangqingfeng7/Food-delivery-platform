# 美食速递 - 全栈外卖平台

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-green?logo=springboot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Java-17-orange?logo=openjdk" alt="Java">
  <img src="https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

一个功能完整的外卖平台解决方案，包含用户端、商户端、管理后台三大模块，支持在线支付、实时订单推送、地图定位等核心功能。

---

## 技术栈

| 前端 | 后端 |
|------|------|
| React 18 + TypeScript | Spring Boot 3.2 + Java 17 |
| Vite 5 + Tailwind CSS | Spring Security + JWT |
| Zustand + React Router | Spring Data JPA + MySQL 8 |
| Framer Motion + Lucide | WebSocket + OpenAPI |

---

## 功能模块

### 用户端
注册登录 / 餐厅浏览 / 购物车 / 订单管理 / 在线支付 / 地址管理 / 收藏 / 评价 / 消息通知

### 商户端
店铺管理 / 菜品管理 / 订单处理 / 评价回复 / 经营统计 / 余额管理

### 管理后台
数据仪表盘 / 用户管理 / 餐厅管理 / 订单管理 / 分类管理 / 评价管理 / 系统广播

---

## 项目结构

```
├── frontend/          # 用户端前端 (端口 3000)
├── admin/             # 管理后台 (端口 3001)
├── backend/           # 后端服务 (端口 8080)
├── database/          # 数据库脚本
└── docs/              # 项目文档
```

---

## 快速启动

```bash
# 1. 初始化数据库
mysql -u root -p < database/init.sql
mysql -u root -p < database/seed.sql

# 2. 启动后端
cd backend && mvn spring-boot:run

# 3. 启动前端
cd frontend && npm install && npm run dev

# 4. 启动管理后台
cd admin && npm install && npm run dev
```

详细步骤请查看 [快速开始文档](docs/QUICK_START.md)

---

## 测试账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 管理员 | 13800000000 | 123456 |
| 商户 | 13900000001 | 123456 |
| 用户 | 13800138001 | 123456 |

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [快速开始](docs/QUICK_START.md) | 环境搭建、项目启动、常见问题 |
| [配置说明](docs/CONFIG.md) | 高德地图、支付宝、微信支付等配置 |
| [开发说明](docs/DEVELOPMENT.md) | 开发规范、项目架构、部署指南 |
| [API 文档](docs/API.md) | 完整的接口文档 |

---

## 许可证

[MIT License](LICENSE)
