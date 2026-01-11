# 开发说明

本文档包含美食速递平台的开发规范、项目架构和部署指南。

---

## 目录

- [开发规范](#开发规范)
- [项目架构](#项目架构)
- [前后端联调](#前后端联调)
- [代码风格](#代码风格)
- [Git 工作流](#git-工作流)
- [测试](#测试)
- [构建部署](#构建部署)
- [性能优化](#性能优化)

---

## 开发规范

### 基本原则

| 规范 | 说明 |
|------|------|
| 类型安全 | 使用 TypeScript 进行开发，避免使用 `any` 类型 |
| 代码规范 | 遵循 ESLint 规则，提交前确保无 lint 错误 |
| 数据来源 | 禁止使用模拟数据，所有数据从后端 API 获取 |
| UI 组件 | 使用 Tailwind CSS 样式，图标使用 Lucide React |
| 弹窗通知 | 使用自定义 Toast 和 ConfirmDialog 组件，禁止原生 alert/confirm |
| 语言规范 | 代码注释和 UI 文案使用中文 |

### 前端开发规范

#### 组件规范

```typescript
// 组件文件命名：PascalCase
// 例如：RestaurantCard.tsx

// 组件定义示例
import { FC } from 'react'

interface RestaurantCardProps {
  restaurant: Restaurant
  onFavorite?: (id: number) => void
}

export const RestaurantCard: FC<RestaurantCardProps> = ({ 
  restaurant, 
  onFavorite 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* 组件内容 */}
    </div>
  )
}
```

#### API 调用规范

```typescript
// API 文件位置：src/api/*.ts
// 使用 axios 实例，统一处理请求/响应

import request from './request'
import { Restaurant, ApiResponse } from '@/types'

// 获取餐厅列表
export const getRestaurants = (params?: {
  categoryId?: number
  keyword?: string
  page?: number
  size?: number
}) => {
  return request.get<ApiResponse<PageData<Restaurant>>>('/restaurants', { params })
}

// 获取餐厅详情
export const getRestaurantById = (id: number) => {
  return request.get<ApiResponse<Restaurant>>(`/restaurants/${id}`)
}
```

#### 状态管理规范

```typescript
// 使用 Zustand 进行状态管理
// Store 文件位置：src/store/*.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      clearCart: () => set({ items: [] })
    }),
    { name: 'cart-storage' }
  )
)
```

### 后端开发规范

#### 分层架构

```
Controller 层：处理 HTTP 请求，参数校验
    ↓
Service 层：业务逻辑处理
    ↓
Repository 层：数据库操作
    ↓
Entity 层：数据模型
```

#### 统一响应格式

```java
// 统一返回 ApiResponse 对象
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "success", data);
    }
    
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}
```

#### Controller 示例

```java
@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    
    private final RestaurantService restaurantService;
    
    @GetMapping
    public ApiResponse<Page<RestaurantDTO>> getRestaurants(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        Page<RestaurantDTO> restaurants = restaurantService
            .getRestaurants(categoryId, keyword, PageRequest.of(page, size));
        return ApiResponse.success(restaurants);
    }
}
```

---

## 项目架构

### 前端架构

```
frontend/src/
├── api/                 # API 接口封装
│   ├── request.ts      # Axios 实例配置
│   ├── restaurant.ts   # 餐厅相关接口
│   ├── order.ts        # 订单相关接口
│   └── ...
├── components/          # 通用组件
│   ├── ui/             # 基础 UI 组件（Button, Input, Modal 等）
│   ├── Navbar.tsx      # 导航栏
│   ├── Footer.tsx      # 页脚
│   └── ...
├── pages/               # 页面组件
│   ├── Home.tsx        # 首页
│   ├── RestaurantDetail.tsx
│   ├── merchant/       # 商户端页面
│   └── ...
├── store/               # 状态管理
│   ├── useUserStore.ts
│   ├── useCartStore.ts
│   └── ...
├── types/               # TypeScript 类型定义
│   └── index.ts
├── config/              # 配置文件
│   └── map.ts
├── App.tsx              # 根组件
├── main.tsx             # 入口文件
└── index.css            # 全局样式
```

### 后端架构

```
backend/src/main/java/com/takeaway/
├── config/              # 配置类
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   ├── CorsConfig.java
│   └── ...
├── controller/          # 控制器
│   ├── AuthController.java
│   ├── RestaurantController.java
│   ├── OrderController.java
│   └── ...
├── service/             # 服务层
│   ├── UserService.java
│   ├── RestaurantService.java
│   └── ...
├── repository/          # 数据访问层
│   ├── UserRepository.java
│   ├── RestaurantRepository.java
│   └── ...
├── entity/              # 实体类
│   ├── User.java
│   ├── Restaurant.java
│   └── ...
├── dto/                 # 数据传输对象
│   ├── UserDTO.java
│   ├── RestaurantDTO.java
│   └── ...
├── security/            # 安全相关
│   ├── JwtTokenProvider.java
│   └── JwtAuthenticationFilter.java
└── TakeawayPlatformApplication.java
```

---

## 前后端联调

### 数据一致性原则

确保前后端数据模型一致，遵循以下流程：

```
1. 数据库表结构设计
        ↓
2. 后端实体类（Entity）
        ↓
3. 后端 DTO（数据传输对象）
        ↓
4. 后端 API 接口
        ↓
5. 前端类型定义（types/index.ts）
        ↓
6. 前端 API 调用
```

### 类型同步示例

```sql
-- 数据库表
CREATE TABLE restaurants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    is_open BOOLEAN DEFAULT TRUE
);
```

```java
// 后端实体类
@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private BigDecimal rating;
    private Boolean isOpen;
}
```

```typescript
// 前端类型定义
interface Restaurant {
  id: number
  name: string
  description: string
  rating: number
  isOpen: boolean
}
```

### 接口调试

1. 使用 Swagger UI 测试后端接口
2. 使用浏览器开发者工具查看网络请求
3. 检查请求/响应数据格式是否匹配

---

## 代码风格

### TypeScript/React

```typescript
// 使用 ESLint + Prettier 规范代码风格
// 配置文件：.eslintrc.cjs

// 命名规范
const userName = 'string'          // 变量：camelCase
const MAX_COUNT = 100              // 常量：UPPER_SNAKE_CASE
interface UserProfile {}           // 接口/类型：PascalCase
function getUserById() {}          // 函数：camelCase
const UserCard: FC = () => {}      // 组件：PascalCase
```

### Java

```java
// 遵循阿里巴巴 Java 开发规范

// 命名规范
private String userName;           // 变量：camelCase
private static final int MAX_COUNT = 100;  // 常量：UPPER_SNAKE_CASE
public class UserService {}        // 类：PascalCase
public void getUserById() {}       // 方法：camelCase
```

---

## Git 工作流

### 分支规范

| 分支 | 用途 |
|------|------|
| main | 主分支，生产环境代码 |
| develop | 开发分支，集成最新开发代码 |
| feature/* | 功能分支，开发新功能 |
| fix/* | 修复分支，修复 bug |
| release/* | 发布分支，版本发布准备 |

### 提交规范

```bash
# 提交信息格式
<type>(<scope>): <subject>

# 类型说明
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构
perf:     性能优化
test:     测试相关
chore:    构建/工具相关

# 示例
feat(order): 添加订单取消功能
fix(cart): 修复购物车数量计算错误
docs(readme): 更新安装说明
```

---

## 测试

### 后端测试

```bash
cd backend

# 运行所有测试
mvn test

# 运行指定测试类
mvn test -Dtest=UserServiceTest

# 生成测试报告
mvn surefire-report:report
```

### 前端测试

```bash
cd frontend

# 类型检查
npm run typecheck

# Lint 检查
npm run lint

# 修复 Lint 错误
npm run lint:fix
```

---

## 构建部署

### 前端构建

```bash
# 用户端
cd frontend
npm run build
# 输出目录：dist/

# 管理后台
cd admin
npm run build
# 输出目录：dist/
```

### 后端构建

```bash
cd backend

# 打包（跳过测试）
mvn clean package -DskipTests

# 输出文件：target/takeaway-platform-1.0.0.jar
```

### Docker 部署

```dockerfile
# 后端 Dockerfile
FROM openjdk:17-slim
WORKDIR /app
COPY target/takeaway-platform-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: takeaway_db
    volumes:
      - mysql-data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/takeaway_db
      SPRING_DATASOURCE_PASSWORD: root
    ports:
      - "8080:8080"

  frontend:
    build: ./frontend
    ports:
      - "80:80"

volumes:
  mysql-data:
```

### Nginx 配置

```nginx
# 前端静态资源
server {
    listen 80;
    server_name your-domain.com;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket 代理
    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 性能优化

### 前端优化

| 优化项 | 说明 |
|--------|------|
| 代码分割 | 使用 React.lazy 动态导入路由组件 |
| 图片优化 | 使用 WebP 格式，配置图片懒加载 |
| 缓存策略 | 配置 Service Worker，缓存静态资源 |
| 状态管理 | 使用 Zustand persist 持久化关键状态 |
| 请求优化 | 接口防抖、取消重复请求 |

### 后端优化

| 优化项 | 说明 |
|--------|------|
| 数据库索引 | 为常用查询字段添加索引 |
| 分页查询 | 避免全表查询，使用分页 |
| 缓存 | 使用 Redis 缓存热点数据 |
| 连接池 | 配置合理的数据库连接池参数 |
| 异步处理 | 耗时操作使用异步处理 |

---

## 下一步

- [快速开始](QUICK_START.md) - 快速搭建开发环境
- [配置说明](CONFIG.md) - 第三方服务配置
- [API 文档](API.md) - 完整接口文档
