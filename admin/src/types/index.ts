// 用户类型
export interface User {
  id: number
  username: string
  phone: string
  email?: string
  avatar?: string
  address?: string
  role: string
  enabled: boolean
  balance: number
  createdAt: string
}

// 餐厅类型
export interface Restaurant {
  id: number
  name: string
  description?: string
  image?: string
  logo?: string
  rating: number
  reviewCount: number
  deliveryTime?: string
  deliveryFee: number
  minOrder: number
  distance?: number
  address?: string
  phone?: string
  isOpen: boolean
  isNew: boolean
  isFeatured: boolean
  categoryId?: number
  categoryName?: string
  tags?: string
  balance: number
  platformRate: number  // 平台抽成比例（如 0.08 表示 8%）
  platformRatePercent: number  // 平台抽成百分比（如 8 表示 8%）
  createdAt: string
}

// 订单类型
export interface Order {
  id: number
  orderNo: string
  userId: number
  username?: string
  restaurantId: number
  restaurantName: string
  restaurantImage?: string
  restaurantLogo?: string
  totalAmount: number
  deliveryFee: number
  discountAmount: number
  payAmount: number
  platformFee: number  // 平台抽成金额
  platformRate: number  // 平台抽成比例
  merchantIncome: number  // 商家实际收入
  status: string
  address?: string
  phone?: string
  remark?: string
  createdAt: string
  completedAt?: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  menuItemId: number
  menuItemName: string
  menuItemImage?: string
  price: number
  quantity: number
}

// 分类类型
export interface Category {
  id: number
  name: string
  icon?: string
  color?: string
  sortOrder: number
  restaurantCount: number
}

// 评价类型
export interface Review {
  id: number
  orderId: number
  userId: number
  username: string
  userAvatar?: string
  restaurantId: number
  restaurantName: string
  tasteRating: number
  packagingRating: number
  deliveryRating: number
  overallRating: number
  content?: string
  images?: string
  isAnonymous: boolean
  likeCount: number
  replyContent?: string
  replyTime?: string
  createdAt: string
}

// 统计数据类型
export interface Statistics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalRestaurants: number
  openRestaurants: number
  newRestaurantsToday: number
  totalOrders: number
  pendingOrders: number
  completedOrdersToday: number
  totalRevenue: number
  todayRevenue: number
  totalPlatformIncome: number  // 平台总抽成收入
  todayPlatformIncome: number  // 今日平台抽成收入
  totalReviews: number
  newReviewsToday: number
}

// 平台配置类型
export interface PlatformConfig {
  defaultPlatformRate: number  // 默认平台抽成比例（如 0.08 表示 8%）
  defaultPlatformRatePercent: number  // 默认平台抽成百分比（如 8 表示 8%）
  updatedAt?: string
}

// 分页结果类型
export interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// API 响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
