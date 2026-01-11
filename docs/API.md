# 美食速递 - API 接口文档

## 基础信息

- **Base URL**: `http://localhost:8080/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

### 通用响应结构

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/登录过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 认证接口

### 用户登录

**POST** `/auth/login`

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码 |

**请求示例**

```json
{
  "phone": "13800138001",
  "password": "123456"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "张三",
      "phone": "13800138001",
      "email": "zhangsan@example.com",
      "avatar": null,
      "address": "北京市朝阳区建国路88号",
      "createdAt": "2024-01-01 12:00:00"
    }
  }
}
```

---

### 用户注册

**POST** `/auth/register`

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 (2-50字符) |
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码 (6-50字符) |

**请求示例**

```json
{
  "username": "新用户",
  "phone": "13800138000",
  "password": "123456"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 4,
    "username": "新用户",
    "phone": "13800138000",
    "email": null,
    "avatar": null,
    "address": null,
    "createdAt": "2024-01-15 10:30:00"
  }
}
```

**参数验证错误响应示例**

```json
{
  "code": 400,
  "message": "用户名不能为空",
  "data": {
    "username": "用户名不能为空",
    "phone": "手机号不能为空",
    "password": "密码不能为空"
  }
}
```

**验证规则**

| 参数 | 验证规则 | 错误提示 |
|------|----------|----------|
| username | 不能为空，2-50字符 | 用户名不能为空 / 用户名长度应在2-50个字符之间 |
| phone | 不能为空，符合手机号格式 | 手机号不能为空 / 手机号格式不正确 |
| password | 不能为空，6-50字符 | 密码不能为空 / 密码长度应在6-50个字符之间 |

---

### 退出登录

**POST** `/auth/logout`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

---

## 文件上传接口

### 上传图片

**POST** `/upload/image`

> 需要认证

**请求头**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件 |

**支持格式**: JPG、JPEG、PNG、GIF、WebP

**文件大小限制**: 最大 10MB

**响应示例**

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/8b9cb63e-f763-477c-9872-28b22b91c36c.png"
  }
}
```

**错误响应示例**

```json
{
  "code": 400,
  "message": "不支持的文件类型，仅支持 JPG、PNG、GIF、WebP 格式",
  "data": null
}
```

---

### 删除图片

**DELETE** `/upload/image`

> 需要认证

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 图片 URL 路径 |

**请求示例**

```
DELETE /api/upload/image?url=/uploads/xxx.png
```

**响应示例**

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 用户接口

### 获取当前用户信息

**GET** `/users/me`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "张三",
    "phone": "13800138001",
    "email": "zhangsan@example.com",
    "avatar": null,
    "address": "北京市朝阳区建国路88号",
    "createdAt": "2024-01-01 12:00:00"
  }
}
```

---

### 更新用户信息

**PUT** `/users/me`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 否 | 用户名 |
| email | string | 否 | 邮箱 |
| avatar | string | 否 | 头像URL |
| address | string | 否 | 地址 |

**请求示例**

```json
{
  "username": "张三三",
  "email": "zhangsan@example.com"
}
```

---

### 更新配送地址

**PUT** `/users/me/address`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| address | string | 是 | 配送地址 |

**请求示例**

```json
{
  "address": "北京市海淀区中关村大街1号"
}
```

---

## 分类接口

### 获取所有分类

**GET** `/categories`

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "快餐便当",
      "icon": "zap",
      "color": "from-orange-400 to-red-500",
      "restaurantCount": 2
    },
    {
      "id": 2,
      "name": "火锅烧烤",
      "icon": "flame",
      "color": "from-red-400 to-pink-500",
      "restaurantCount": 1
    }
  ]
}
```

---

### 获取分类详情

**GET** `/categories/{id}`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 分类ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "快餐便当",
    "icon": "zap",
    "color": "from-orange-400 to-red-500",
    "restaurantCount": 2
  }
}
```

---

## 餐厅接口

### 获取餐厅列表

**GET** `/restaurants`

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| categoryId | number | 否 | - | 分类ID |
| keyword | string | 否 | - | 搜索关键词 |
| sortBy | string | 否 | rating | 排序方式: rating/distance/deliveryTime/minOrder |
| page | number | 否 | 0 | 页码 (从0开始) |
| size | number | 否 | 12 | 每页数量 |
| userLat | number | 否 | - | 用户纬度，用于计算真实距离和配送时间 |
| userLng | number | 否 | - | 用户经度，用于计算真实距离和配送时间 |

> 当提供用户位置参数时，返回的 `distance` 和 `deliveryTime` 字段将根据用户与餐厅的距离动态计算。

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "老北京炸酱面馆",
        "description": "传承百年老北京风味",
        "image": "https://images.unsplash.com/...",
        "logo": "https://images.unsplash.com/...",
        "rating": 4.8,
        "reviewCount": 1256,
        "deliveryTime": "25-35",
        "deliveryFee": 3.00,
        "minOrder": 20.00,
        "distance": 1.2,
        "address": "北京市朝阳区建国路88号",
        "latitude": 39.9087243,
        "longitude": 116.4550507,
        "phone": "010-88888001",
        "openTime": "10:00",
        "closeTime": "22:00",
        "isOpen": true,
        "isNew": true,
        "categoryId": 4,
        "categoryName": "中式正餐",
        "tags": ["面食", "北京菜", "老字号"],
        "createdAt": "2024-01-01 12:00:00"
      }
    ],
    "totalElements": 8,
    "totalPages": 1,
    "size": 12,
    "number": 0
  }
}
```

---

### 获取推荐餐厅

**GET** `/restaurants/featured`

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| limit | number | 否 | 6 | 返回数量 |
| userLat | number | 否 | - | 用户纬度，用于计算真实距离和配送时间 |
| userLng | number | 否 | - | 用户经度，用于计算真实距离和配送时间 |

> 当提供用户位置参数时，返回的 `distance` 和 `deliveryTime` 字段将根据用户与餐厅的距离动态计算。

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "老北京炸酱面馆",
      "rating": 4.8,
      ...
    }
  ]
}
```

---

### 获取餐厅详情

**GET** `/restaurants/{id}`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 餐厅ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userLat | number | 否 | 用户纬度，用于计算真实距离和配送时间 |
| userLng | number | 否 | 用户经度，用于计算真实距离和配送时间 |

> 当提供用户位置参数时：
> - `distance` 字段将是根据用户位置和餐厅位置使用 Haversine 公式计算的真实距离（公里）
> - `deliveryTime` 字段将返回预计送达时间点（如 "15:30"），计算公式：当前时间 + 15分钟（准备时间）+ 距离 × 3分钟/公里
> - `rating` 字段将根据评价表实时计算平均分，如果没有评价则显示默认评分 5.0
> - `reviewCount` 字段将从评价表实时统计评价数量
> 
> 注意：如果餐厅没有设置经纬度，则 `distance` 和 `deliveryTime` 将使用数据库中的默认值

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "老北京炸酱面馆",
    "description": "传承百年老北京风味，正宗炸酱面，地道京味小吃",
    "image": "https://images.unsplash.com/...",
    "logo": "https://images.unsplash.com/...",
    "rating": 4.8,
    "reviewCount": 1256,
    "deliveryTime": "25-35",
    "deliveryFee": 3.00,
    "minOrder": 20.00,
    "distance": 1.2,
    "address": "北京市朝阳区建国路88号",
    "latitude": 39.9087243,
    "longitude": 116.4550507,
    "phone": "010-88888001",
    "openTime": "10:00",
    "closeTime": "22:00",
    "isOpen": true,
    "isNew": true,
    "categoryId": 4,
    "categoryName": "中式正餐",
    "tags": ["面食", "北京菜", "老字号"],
    "createdAt": "2024-01-01 12:00:00"
  }
}
```

---

### 获取餐厅菜品分类

**GET** `/restaurants/{id}/menu-categories`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 餐厅ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "restaurantId": 1,
      "name": "推荐",
      "sortOrder": 1,
      "itemCount": 2
    },
    {
      "id": 2,
      "restaurantId": 1,
      "name": "招牌面食",
      "sortOrder": 2,
      "itemCount": 3
    }
  ]
}
```

---

### 获取餐厅菜品列表

**GET** `/restaurants/{id}/menu-items`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 餐厅ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | number | 否 | 菜品分类ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "restaurantId": 1,
      "name": "老北京炸酱面",
      "description": "精选黄酱，手工面条，配以黄瓜丝、萝卜丝、豆芽等多种菜码",
      "price": 28.00,
      "originalPrice": 35.00,
      "image": "https://images.unsplash.com/...",
      "categoryId": 1,
      "categoryName": "推荐",
      "sales": 999,
      "isHot": true,
      "isNew": false,
      "isAvailable": true
    }
  ]
}
```

---

### 获取单个菜品详情

**GET** `/restaurants/menu-items/{menuItemId}`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| menuItemId | number | 菜品ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "restaurantId": 1,
    "name": "老北京炸酱面",
    "description": "精选黄酱，手工面条，配以黄瓜丝、萝卜丝、豆芽等多种菜码",
    "price": 28.00,
    "originalPrice": 35.00,
    "image": "https://images.unsplash.com/...",
    "categoryId": 1,
    "categoryName": "推荐",
    "sales": 999,
    "isHot": true,
    "isNew": false,
    "isAvailable": true
  }
}
```

---

### 搜索餐厅

**GET** `/restaurants/search`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| page | number | 否 | 页码 |
| size | number | 否 | 每页数量 |

---

## 订单接口

### 创建订单

**POST** `/orders`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| restaurantId | number | 是 | 餐厅ID |
| items | array | 是 | 商品列表 |
| items[].menuItemId | number | 是 | 菜品ID |
| items[].quantity | number | 是 | 数量 |
| address | string | 是 | 配送地址 |
| phone | string | 是 | 联系电话 |
| remark | string | 否 | 备注 |

**请求示例**

```json
{
  "restaurantId": 1,
  "items": [
    { "menuItemId": 1, "quantity": 2 },
    { "menuItemId": 3, "quantity": 1 }
  ],
  "address": "北京市朝阳区建国路88号",
  "phone": "13800138001",
  "remark": "少辣，不要香菜"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "id": 1,
    "orderNo": "ORD1705312000001ABCD",
    "userId": 1,
    "restaurantId": 1,
    "restaurantName": "老北京炸酱面馆",
    "restaurantImage": "https://images.unsplash.com/...",
    "items": [
      {
        "id": 1,
        "menuItemId": 1,
        "menuItemName": "老北京炸酱面",
        "menuItemImage": "https://images.unsplash.com/...",
        "price": 28.00,
        "quantity": 2
      }
    ],
    "totalAmount": 94.00,
    "deliveryFee": 3.00,
    "discountAmount": 0.00,
    "payAmount": 97.00,
    "status": "PENDING",
    "address": "北京市朝阳区建国路88号",
    "phone": "13800138001",
    "remark": "少辣，不要香菜",
    "deliveryTime": null,
    "createdAt": "2024-01-15 12:00:00",
    "updatedAt": "2024-01-15 12:00:00"
  }
}
```

---

### 获取订单列表

**GET** `/orders`

**请求头**

```
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| status | string | 否 | - | 订单状态 |
| page | number | 否 | 0 | 页码 |
| size | number | 否 | 20 | 每页数量 |

**订单状态说明**

| 状态 | 说明 |
|------|------|
| PENDING | 待支付 |
| PAID | 已支付 |
| CONFIRMED | 已确认 |
| PREPARING | 制作中 |
| DELIVERING | 配送中 |
| COMPLETED | 已完成 |
| CANCELLED | 已取消 |

---

### 获取订单详情

**GET** `/orders/{id}`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 订单ID |

---

### 取消订单

**PUT** `/orders/{id}/cancel`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 订单ID |

> 注意：仅待支付和已支付状态的订单可以取消

---

### 支付订单

**PUT** `/orders/{id}/pay`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 订单ID |

> 注意：仅待支付状态的订单可以支付

---

### 确认收货

**PUT** `/orders/{id}/confirm`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 订单ID |

> 注意：仅配送中状态的订单可以确认收货

---

## 收藏接口

### 获取收藏列表

**GET** `/favorites`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "restaurantId": 1,
      "restaurantName": "老北京炸酱面馆",
      "restaurantImage": "https://...",
      "restaurantLogo": "https://...",
      "rating": 4.8,
      "reviewCount": 1256,
      "deliveryTime": "25-35",
      "deliveryFee": 3.00,
      "minOrder": 20.00,
      "tags": "面食,北京菜,老字号",
      "createdAt": "2026-01-09 12:00:00"
    }
  ]
}
```

---

### 添加收藏

**POST** `/favorites`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| restaurantId | number | 是 | 餐厅ID |

**请求示例**

```json
{
  "restaurantId": 1
}
```

---

### 取消收藏

**DELETE** `/favorites/{restaurantId}`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| restaurantId | number | 餐厅ID |

---

### 检查是否已收藏

**GET** `/favorites/check/{restaurantId}`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| restaurantId | number | 餐厅ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

---

## 收货地址接口

### 获取地址列表

**GET** `/addresses`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "张三",
      "phone": "13800138001",
      "address": "北京市朝阳区建国路88号",
      "latitude": 39.9087243,
      "longitude": 116.4550507,
      "isDefault": true,
      "createdAt": "2024-01-01 12:00:00"
    }
  ]
}
```

---

### 获取默认地址

**GET** `/addresses/default`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "张三",
    "phone": "13800138001",
    "address": "北京市朝阳区建国路88号",
    "latitude": 39.9087243,
    "longitude": 116.4550507,
    "isDefault": true,
    "createdAt": "2024-01-01 12:00:00"
  }
}
```

---

### 添加地址

**POST** `/addresses`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 联系人姓名 |
| phone | string | 是 | 联系电话 |
| address | string | 是 | 详细地址 |
| latitude | number | 否 | 纬度（通过地图选择获取） |
| longitude | number | 否 | 经度（通过地图选择获取） |
| isDefault | boolean | 否 | 是否设为默认地址 |

**请求示例**

```json
{
  "name": "张三",
  "phone": "13800138001",
  "address": "北京市朝阳区建国路88号",
  "latitude": 39.9087243,
  "longitude": 116.4550507,
  "isDefault": true
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "张三",
    "phone": "13800138001",
    "address": "北京市朝阳区建国路88号",
    "latitude": 39.9087243,
    "longitude": 116.4550507,
    "isDefault": true,
    "createdAt": "2024-01-01 12:00:00"
  }
}
```

---

### 更新地址

**PUT** `/addresses/{id}`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 地址ID |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 联系人姓名 |
| phone | string | 否 | 联系电话 |
| address | string | 否 | 详细地址 |
| latitude | number | 否 | 纬度（通过地图选择获取） |
| longitude | number | 否 | 经度（通过地图选择获取） |
| isDefault | boolean | 否 | 是否设为默认地址 |

**请求示例**

```json
{
  "name": "李四",
  "phone": "13900139001",
  "latitude": 39.9087243,
  "longitude": 116.4550507
}
```

---

### 删除地址

**DELETE** `/addresses/{id}`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 地址ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 设置默认地址

**PUT** `/addresses/{id}/default`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 地址ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "张三",
    "phone": "13800138001",
    "address": "北京市朝阳区建国路88号",
    "latitude": 39.9087243,
    "longitude": 116.4550507,
    "isDefault": true,
    "createdAt": "2024-01-01 12:00:00"
  }
}
```

---

## 消息通知接口

### 获取所有通知

**GET** `/notifications`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "订单已完成",
      "content": "您的订单 ORD1705312000001ABCD 已完成，感谢您的惠顾！",
      "type": "ORDER",
      "isRead": false,
      "relatedId": 1,
      "createdAt": "2024-01-15 12:30:00"
    },
    {
      "id": 2,
      "userId": 1,
      "title": "新年优惠活动",
      "content": "新年期间全场满50减10，快来抢购！",
      "type": "PROMO",
      "isRead": true,
      "relatedId": null,
      "createdAt": "2024-01-14 10:00:00"
    }
  ]
}
```

**通知类型说明**

| 类型 | 说明 |
|------|------|
| SYSTEM | 系统通知 |
| ORDER | 订单通知 |
| PROMO | 优惠活动 |

---

### 获取未读通知

**GET** `/notifications/unread`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "订单已完成",
      "content": "您的订单 ORD1705312000001ABCD 已完成，感谢您的惠顾！",
      "type": "ORDER",
      "isRead": false,
      "relatedId": 1,
      "createdAt": "2024-01-15 12:30:00"
    }
  ]
}
```

---

### 获取未读通知数量

**GET** `/notifications/unread/count`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": 3
}
```

---

### 标记单条通知为已读

**PUT** `/notifications/{id}/read`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 通知ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 标记所有通知为已读

**PUT** `/notifications/read-all`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 删除单条通知

**DELETE** `/notifications/{id}`

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 通知ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 删除所有通知

**DELETE** `/notifications`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 商家接口

> 商家接口需要 MERCHANT 角色权限

### 商家注册

**POST** `/auth/merchant/register`

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码 |

**响应示例**

```json
{
  "code": 200,
  "message": "商家注册成功",
  "data": {
    "id": 1,
    "username": "商家A",
    "phone": "13900139001",
    "role": "MERCHANT",
    "createdAt": "2024-01-01 10:00:00"
  }
}
```

---

### 获取我的店铺

**GET** `/merchant/restaurant`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "美味快餐店",
    "description": "专注美食",
    "image": "https://example.com/image.jpg",
    "logo": "https://example.com/logo.jpg",
    "rating": 4.8,
    "reviewCount": 100,
    "deliveryTime": "30-45",
    "deliveryFee": 5.00,
    "minOrder": 20.00,
    "address": "北京市朝阳区xxx",
    "latitude": 39.9087243,
    "longitude": 116.4550507,
    "phone": "010-12345678",
    "openTime": "09:00",
    "closeTime": "22:00",
    "isOpen": true,
    "categoryId": 1,
    "categoryName": "快餐便当",
    "tags": ["快餐", "便当"],
    "createdAt": "2024-01-01 10:00:00"
  }
}
```

---

### 创建店铺

**POST** `/merchant/restaurant`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 店铺名称 |
| description | string | 否 | 店铺简介 |
| image | string | 否 | 封面图URL |
| logo | string | 否 | LogoURL |
| deliveryTime | string | 否 | 配送时间 |
| deliveryFee | number | 否 | 配送费 |
| minOrder | number | 否 | 起送价 |
| address | string | 是 | 店铺地址 |
| latitude | number | 否 | 店铺纬度 |
| longitude | number | 否 | 店铺经度 |
| phone | string | 是 | 联系电话 |
| openTime | string | 否 | 开始营业时间 |
| closeTime | string | 否 | 结束营业时间 |
| categoryId | number | 是 | 分类ID |
| tags | string | 否 | 标签，逗号分隔 |

---

### 更新店铺信息

**PUT** `/merchant/restaurant`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**: 同创建店铺，所有参数可选

---

### 更新营业状态

**PUT** `/merchant/restaurant/status`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isOpen | boolean | 是 | 是否营业 |

---

### 获取菜品分类列表

**GET** `/merchant/menu-categories`

**请求头**

```
Authorization: Bearer <token>
```

---

### 创建菜品分类

**POST** `/merchant/menu-categories`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 分类名称 |
| sortOrder | number | 否 | 排序值 |

---

### 更新菜品分类

**PUT** `/merchant/menu-categories/{id}`

---

### 删除菜品分类

**DELETE** `/merchant/menu-categories/{id}`

---

### 获取菜品列表

**GET** `/merchant/menu-items`

**请求头**

```
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | number | 否 | 分类ID |

---

### 创建菜品

**POST** `/merchant/menu-items`

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 菜品名称 |
| description | string | 否 | 菜品描述 |
| price | number | 是 | 价格 |
| originalPrice | number | 否 | 原价 |
| image | string | 否 | 图片URL |
| categoryId | number | 否 | 分类ID |
| isHot | boolean | 否 | 是否热销 |
| isNew | boolean | 否 | 是否新品 |
| isAvailable | boolean | 否 | 是否上架 |
| sortOrder | number | 否 | 排序值 |

---

### 更新菜品

**PUT** `/merchant/menu-items/{id}`

---

### 删除菜品

**DELETE** `/merchant/menu-items/{id}`

---

### 更新菜品状态

**PUT** `/merchant/menu-items/{id}/status`

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isAvailable | boolean | 是 | 是否上架 |

---

### 获取店铺订单列表

**GET** `/merchant/orders`

**请求头**

```
Authorization: Bearer <token>
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 订单状态 |
| page | number | 否 | 页码，默认0 |
| size | number | 否 | 每页数量，默认10 |

---

### 获取订单详情

**GET** `/merchant/orders/{id}`

---

### 确认订单

**PUT** `/merchant/orders/{id}/confirm`

---

### 开始制作

**PUT** `/merchant/orders/{id}/preparing`

---

### 开始配送

**PUT** `/merchant/orders/{id}/delivering`

---

### 完成订单

**PUT** `/merchant/orders/{id}/complete`

---

### 获取店铺统计数据

**GET** `/merchant/statistics`

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "todayOrders": 15,
    "todayRevenue": 1500.00,
    "totalOrders": 500,
    "totalRevenue": 50000.00,
    "pendingOrders": 2,
    "paidOrders": 3,
    "preparingOrders": 2,
    "deliveringOrders": 1,
    "completedOrders": 450,
    "totalMenuItems": 30,
    "availableMenuItems": 25
  }
}
```

---

## WebSocket 实时推送

### 基础信息

- **WebSocket URL**: `ws://localhost:8080/ws`
- **SockJS URL**: `http://localhost:8080/ws`
- **协议**: STOMP over WebSocket/SockJS
- **用途**: 订单状态实时更新推送

### 连接方式

#### 使用 SockJS + STOMP（推荐）

```javascript
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  reconnectDelay: 5000,
  onConnect: () => {
    console.log('WebSocket 连接成功')
  },
})

client.activate()
```

#### 使用原生 WebSocket

```javascript
import { Client } from '@stomp/stompjs'

const client = new Client({
  brokerURL: 'ws://localhost:8080/ws',
  reconnectDelay: 5000,
})

client.activate()
```

---

### 订阅主题

#### 用户订单状态更新

**订阅地址**: `/user/{userId}/queue/orders`

用户订阅此地址后，当其订单状态发生变化时会收到推送消息。

```javascript
client.subscribe(`/user/${userId}/queue/orders`, (message) => {
  const data = JSON.parse(message.body)
  console.log('订单状态更新:', data)
})
```

#### 商家订单通知

**订阅地址**: `/topic/merchant/{restaurantId}/orders`

商家订阅此地址后，可以接收到店铺相关的订单状态变化和新订单通知。

```javascript
client.subscribe(`/topic/merchant/${restaurantId}/orders`, (message) => {
  const data = JSON.parse(message.body)
  console.log('店铺订单更新:', data)
})
```

---

### 消息格式

#### 订单状态更新消息

```json
{
  "type": "ORDER_STATUS_UPDATE",
  "orderId": 1,
  "orderNo": "ORD1705312000001ABCD",
  "userId": 1,
  "restaurantId": 1,
  "restaurantName": "老北京炸酱面馆",
  "oldStatus": "PAID",
  "newStatus": "CONFIRMED",
  "statusLabel": "已确认",
  "payAmount": 97.00,
  "updatedAt": "2024-01-15T12:30:00",
  "message": "您的订单「ORD1705312000001ABCD」已变为「已确认」"
}
```

#### 新订单通知消息

```json
{
  "type": "NEW_ORDER",
  "orderId": 1,
  "orderNo": "ORD1705312000001ABCD",
  "userId": 1,
  "restaurantId": 1,
  "restaurantName": "老北京炸酱面馆",
  "newStatus": "PAID",
  "payAmount": 97.00,
  "message": "您有新订单，请及时处理"
}
```

---

### 消息字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 消息类型：ORDER_STATUS_UPDATE / NEW_ORDER |
| orderId | number | 订单ID |
| orderNo | string | 订单编号 |
| userId | number | 用户ID |
| restaurantId | number | 餐厅ID |
| restaurantName | string | 餐厅名称 |
| oldStatus | string | 旧状态（仅状态更新时有值） |
| newStatus | string | 新状态 |
| statusLabel | string | 状态中文标签 |
| payAmount | number | 实付金额 |
| updatedAt | string | 更新时间 |
| message | string | 提示消息 |

---

### 触发场景

以下操作会触发 WebSocket 消息推送：

| 操作 | 消息类型 | 接收方 |
|------|----------|--------|
| 用户支付订单 | ORDER_STATUS_UPDATE | 用户 + 商家 |
| 用户取消订单 | ORDER_STATUS_UPDATE | 用户 + 商家 |
| 用户确认收货 | ORDER_STATUS_UPDATE | 用户 + 商家 |
| 商家确认订单 | ORDER_STATUS_UPDATE | 用户 + 商家 |
| 商家开始制作 | ORDER_STATUS_UPDATE | 用户 + 商家 |
| 商家开始配送 | ORDER_STATUS_UPDATE | 用户 + 商家 |
| 商家完成订单 | ORDER_STATUS_UPDATE | 用户 + 商家 |

---

### 前端集成示例

```typescript
import { useEffect } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const useOrderWebSocket = (userId: number, onMessage: (data: any) => void) => {
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        // 订阅用户订单更新
        client.subscribe(`/user/${userId}/queue/orders`, (message) => {
          const data = JSON.parse(message.body)
          onMessage(data)
        })
      },
    })

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [userId, onMessage])
}
```

---

## 评价接口

### 提交评价

**POST** `/reviews`

> 需要认证，仅已完成订单可评价

**请求头**

```
Authorization: Bearer <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | number | 是 | 订单ID |
| tasteRating | number | 是 | 口味评分 1-5 |
| packagingRating | number | 是 | 包装评分 1-5 |
| deliveryRating | number | 是 | 配送评分 1-5 |
| content | string | 否 | 评价内容 |
| images | string[] | 否 | 评价图片URL数组 |
| isAnonymous | boolean | 否 | 是否匿名，默认false |

**请求示例**

```json
{
  "orderId": 1,
  "tasteRating": 5,
  "packagingRating": 4,
  "deliveryRating": 5,
  "content": "味道很好，配送也很快！",
  "images": ["/uploads/review1.jpg"],
  "isAnonymous": false
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "评价提交成功",
  "data": {
    "id": 1,
    "orderId": 1,
    "userId": 1,
    "username": "张三",
    "userAvatar": "/uploads/avatar.jpg",
    "restaurantId": 1,
    "tasteRating": 5,
    "packagingRating": 4,
    "deliveryRating": 5,
    "overallRating": 4.7,
    "content": "味道很好，配送也很快！",
    "images": ["/uploads/review1.jpg"],
    "isAnonymous": false,
    "likeCount": 0,
    "isLiked": false,
    "replyContent": null,
    "replyTime": null,
    "createdAt": "2024-01-15T12:30:00",
    "orderItems": [
      {
        "id": 1,
        "menuItemId": 1,
        "menuItemName": "老北京炸酱面",
        "menuItemImage": "/uploads/menu1.jpg",
        "price": 28.00,
        "quantity": 2
      }
    ]
  }
}
```

---

### 获取餐厅评价列表

**GET** `/restaurants/{restaurantId}/reviews`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| restaurantId | number | 餐厅ID |

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 0 | 页码 |
| size | number | 否 | 10 | 每页数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "orderId": 1,
        "userId": 1,
        "username": "张三",
        "userAvatar": "/uploads/avatar.jpg",
        "restaurantId": 1,
        "tasteRating": 5,
        "packagingRating": 4,
        "deliveryRating": 5,
        "overallRating": 4.7,
        "content": "味道很好，配送也很快！",
        "images": ["/uploads/review1.jpg"],
        "isAnonymous": false,
        "likeCount": 10,
        "isLiked": true,
        "replyContent": "感谢您的好评！",
        "replyTime": "2024-01-15T14:00:00",
        "createdAt": "2024-01-15T12:30:00",
        "orderItems": [
          {
            "id": 1,
            "menuItemId": 1,
            "menuItemName": "老北京炸酱面",
            "menuItemImage": "/uploads/menu1.jpg",
            "price": 28.00,
            "quantity": 2
          },
          {
            "id": 2,
            "menuItemId": 3,
            "menuItemName": "卤煮火烧",
            "menuItemImage": "/uploads/menu3.jpg",
            "price": 32.00,
            "quantity": 1
          }
        ]
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "size": 10,
    "number": 0
  }
}
```

**评价对象字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 评价ID |
| orderId | number | 订单ID |
| userId | number | 用户ID |
| username | string | 用户名（匿名时显示"匿名用户"） |
| userAvatar | string | 用户头像（匿名时为null） |
| restaurantId | number | 餐厅ID |
| tasteRating | number | 口味评分 1-5 |
| packagingRating | number | 包装评分 1-5 |
| deliveryRating | number | 配送评分 1-5 |
| overallRating | number | 综合评分（三项平均） |
| content | string | 评价内容 |
| images | string[] | 评价图片URL数组 |
| isAnonymous | boolean | 是否匿名 |
| likeCount | number | 点赞数 |
| isLiked | boolean | 当前用户是否已点赞 |
| replyContent | string | 商家回复内容 |
| replyTime | string | 商家回复时间 |
| createdAt | string | 评价创建时间 |
| orderItems | array | 订单商品列表 |

**orderItems 商品对象字段**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 订单项ID |
| menuItemId | number | 菜品ID |
| menuItemName | string | 菜品名称 |
| menuItemImage | string | 菜品图片URL |
| price | number | 菜品单价 |
| quantity | number | 购买数量 |

---

### 获取餐厅评价统计

**GET** `/restaurants/{restaurantId}/reviews/stats`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| restaurantId | number | 餐厅ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalReviews": 50,
    "averageRating": 4.5,
    "avgTasteRating": 4.6,
    "avgPackagingRating": 4.3,
    "avgDeliveryRating": 4.5,
    "ratingDistribution": {
      "5": 30,
      "4": 15,
      "3": 3,
      "2": 1,
      "1": 1
    }
  }
}
```

---

### 检查订单是否已评价

**GET** `/reviews/check/{orderId}`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| orderId | number | 订单ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

---

### 获取订单的评价

**GET** `/reviews/order/{orderId}`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| orderId | number | 订单ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "orderId": 1,
    "userId": 1,
    "username": "张三",
    ...
  }
}
```

---

### 获取我的评价列表

**GET** `/reviews/my`

> 需要认证

**请求头**

```
Authorization: Bearer <token>
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "orderId": 1,
      ...
    }
  ]
}
```

---

### 点赞评价

**POST** `/reviews/{id}/like`

> 需要认证

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 评价ID |

**响应示例**

```json
{
  "code": 200,
  "message": "点赞成功",
  "data": null
}
```

---

### 取消点赞

**DELETE** `/reviews/{id}/like`

> 需要认证

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 评价ID |

**响应示例**

```json
{
  "code": 200,
  "message": "已取消点赞",
  "data": null
}
```

---

### 商家回复评价

**PUT** `/merchant/reviews/{id}/reply`

> 需要商家认证

**请求头**

```
Authorization: Bearer <token>
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 评价ID |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 回复内容 |

**请求示例**

```json
{
  "content": "感谢您的好评，欢迎下次光临！"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "回复成功",
  "data": {
    "id": 1,
    "orderId": 1,
    ...
    "replyContent": "感谢您的好评，欢迎下次光临！",
    "replyTime": "2024-01-15T14:00:00"
  }
}
```

---

### 获取菜品评价列表

**GET** `/menu-items/{menuItemId}/reviews`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| menuItemId | number | 菜品ID |

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 0 | 页码 |
| size | number | 否 | 10 | 每页数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "orderId": 1,
        "userId": 1,
        "username": "张三",
        "userAvatar": "/uploads/avatar.jpg",
        "restaurantId": 1,
        "tasteRating": 5,
        "packagingRating": 4,
        "deliveryRating": 5,
        "overallRating": 4.7,
        "content": "味道很好，配送也很快！",
        "images": ["/uploads/review1.jpg"],
        "isAnonymous": false,
        "likeCount": 10,
        "isLiked": true,
        "replyContent": "感谢您的好评！",
        "replyTime": "2024-01-15T14:00:00",
        "createdAt": "2024-01-15T12:30:00",
        "orderItems": [
          {
            "id": 1,
            "menuItemId": 1,
            "menuItemName": "老北京炸酱面",
            "menuItemImage": "/uploads/menu1.jpg",
            "price": 28.00,
            "quantity": 2
          }
        ]
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "size": 10,
    "number": 0
  }
}
```

**说明**

- 此接口返回包含指定菜品的所有评价
- 评价按创建时间倒序排列
- `orderItems` 中会标注当前菜品，方便用户查看该评价是否针对当前菜品

---

### 获取菜品评价统计

**GET** `/menu-items/{menuItemId}/reviews/stats`

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| menuItemId | number | 菜品ID |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalReviews": 25,
    "averageRating": 4.6
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| totalReviews | number | 包含该菜品的评价总数 |
| averageRating | number | 包含该菜品的订单的平均评分 |

---

## 在线文档

启动后端服务后，可访问 Swagger UI 查看在线 API 文档：

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
