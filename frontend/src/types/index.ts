// 用户角色类型
export type UserRole = 'USER' | 'MERCHANT' | 'ADMIN'

// 用户相关类型
export interface User {
  id: number
  username: string
  phone: string
  email: string
  avatar: string
  address: string
  role: UserRole
  createdAt: string
}

// 收货地址类型
export interface Address {
  id: number
  userId: number
  name: string
  phone: string
  address: string
  latitude: number | null
  longitude: number | null
  isDefault: boolean
  createdAt: string
}

// 收藏餐厅类型
export interface Favorite {
  id: number
  restaurantId: number
  restaurantName: string
  restaurantImage: string
  restaurantLogo: string
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  minOrder: number
  tags: string
  createdAt: string
}

// 餐厅相关类型
export interface Restaurant {
  id: number
  name: string
  description: string
  image: string
  logo: string
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  minOrder: number
  distance: number
  address: string
  latitude: number | null
  longitude: number | null
  phone: string
  openTime: string
  closeTime: string
  isOpen: boolean
  isNew: boolean
  categoryId: number
  categoryName: string
  tags: string[]
  createdAt: string
}

// 分类类型
export interface Category {
  id: number
  name: string
  icon: string
  color: string
  restaurantCount: number
}

// 菜品类型
export interface MenuItem {
  id: number
  restaurantId: number
  name: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  categoryId: number
  categoryName: string
  sales: number
  isHot: boolean
  isNew: boolean
  isAvailable: boolean
}

// 菜品分类类型
export interface MenuCategory {
  id: number
  restaurantId: number
  name: string
  sortOrder: number
  itemCount: number
}

// 购物车项类型
export interface CartItem {
  id: number
  menuItem: MenuItem
  quantity: number
  restaurantId: number
  restaurantName: string
}

// 订单类型
export interface Order {
  id: number
  orderNo: string
  userId: number
  restaurantId: number
  restaurantName: string
  restaurantImage: string
  items: OrderItem[]
  totalAmount: number
  deliveryFee: number
  discountAmount: number
  payAmount: number
  status: OrderStatus
  address: string
  phone: string
  remark: string
  deliveryTime: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  menuItemId: number
  menuItemName: string
  menuItemImage: string
  price: number
  quantity: number
}

export type OrderStatus = 
  | 'PENDING'      // 待支付
  | 'PAID'         // 已支付
  | 'CONFIRMED'    // 已确认
  | 'PREPARING'    // 制作中
  | 'DELIVERING'   // 配送中
  | 'COMPLETED'    // 已完成
  | 'CANCELLED'    // 已取消

// API响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// 通知类型
export type NotificationType = 'SYSTEM' | 'ORDER' | 'PROMO'

// 消息通知类型
export interface Notification {
  id: number
  userId: number
  title: string
  content: string
  type: NotificationType
  isRead: boolean
  relatedId: number | null
  createdAt: string
}

// ==================== 评价相关类型 ====================

// 评价类型
export interface Review {
  id: number
  orderId: number
  userId: number
  username: string
  userAvatar: string | null
  restaurantId: number
  tasteRating: number
  packagingRating: number
  deliveryRating: number
  overallRating: number
  content: string | null
  images: string[]
  isAnonymous: boolean
  likeCount: number
  isLiked: boolean
  replyContent: string | null
  replyTime: string | null
  createdAt: string
  orderItems: OrderItem[]
}

// 创建评价请求类型
export interface CreateReviewRequest {
  orderId: number
  tasteRating: number
  packagingRating: number
  deliveryRating: number
  content?: string
  images?: string[]
  isAnonymous?: boolean
}

// 评价统计类型
export interface ReviewStats {
  totalReviews: number
  averageRating: number
  avgTasteRating: number
  avgPackagingRating: number
  avgDeliveryRating: number
  ratingDistribution: Record<string, number>
}

// ==================== 商家相关类型 ====================

// 商家统计数据类型
export interface MerchantStatistics {
  todayOrders: number
  todayRevenue: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  paidOrders: number
  preparingOrders: number
  deliveringOrders: number
  completedOrders: number
  totalMenuItems: number
  availableMenuItems: number
}

// 创建店铺请求类型
export interface CreateRestaurantRequest {
  name: string
  description?: string
  image?: string
  logo?: string
  deliveryTime?: string
  deliveryFee?: number
  minOrder?: number
  address: string
  latitude?: number
  longitude?: number
  phone: string
  openTime?: string
  closeTime?: string
  categoryId: number
  tags?: string
}

// 更新店铺请求类型
export interface UpdateRestaurantRequest {
  name?: string
  description?: string
  image?: string
  logo?: string
  deliveryTime?: string
  deliveryFee?: number
  minOrder?: number
  address?: string
  latitude?: number
  longitude?: number
  phone?: string
  openTime?: string
  closeTime?: string
  categoryId?: number
  tags?: string
}

// 创建菜品分类请求类型
export interface CreateMenuCategoryRequest {
  name: string
  sortOrder?: number
}

// 更新菜品分类请求类型
export interface UpdateMenuCategoryRequest {
  name?: string
  sortOrder?: number
}

// 创建菜品请求类型
export interface CreateMenuItemRequest {
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  categoryId?: number
  isHot?: boolean
  isNew?: boolean
  isAvailable?: boolean
  sortOrder?: number
}

// 更新菜品请求类型
export interface UpdateMenuItemRequest {
  name?: string
  description?: string
  price?: number
  originalPrice?: number
  image?: string
  categoryId?: number
  isHot?: boolean
  isNew?: boolean
  isAvailable?: boolean
  sortOrder?: number
}
