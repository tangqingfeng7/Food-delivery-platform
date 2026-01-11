import request from './request'
import {
  ApiResponse,
  PageResponse,
  User,
  Restaurant,
  MenuCategory,
  MenuItem,
  Order,
  MerchantStatistics,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from '../types'

// ==================== 认证相关 ====================

// 商家注册
export const merchantRegister = (data: {
  username: string
  phone: string
  password: string
}) => {
  return request.post<ApiResponse<User>>('/auth/merchant/register', data)
}

// ==================== 店铺管理 ====================

// 获取我的店铺
export const getMyRestaurant = () => {
  return request.get<ApiResponse<Restaurant | null>>('/merchant/restaurant')
}

// 检查是否有店铺
export const hasRestaurant = () => {
  return request.get<ApiResponse<boolean>>('/merchant/restaurant/exists')
}

// 创建店铺
export const createRestaurant = (data: CreateRestaurantRequest) => {
  return request.post<ApiResponse<Restaurant>>('/merchant/restaurant', data)
}

// 更新店铺信息
export const updateRestaurant = (data: UpdateRestaurantRequest) => {
  return request.put<ApiResponse<Restaurant>>('/merchant/restaurant', data)
}

// 更新营业状态
export const updateRestaurantStatus = (isOpen: boolean) => {
  return request.put<ApiResponse<Restaurant>>('/merchant/restaurant/status', { isOpen })
}

// ==================== 菜品分类管理 ====================

// 获取菜品分类列表
export const getMerchantMenuCategories = () => {
  return request.get<ApiResponse<MenuCategory[]>>('/merchant/menu-categories')
}

// 创建菜品分类
export const createMenuCategory = (data: CreateMenuCategoryRequest) => {
  return request.post<ApiResponse<MenuCategory>>('/merchant/menu-categories', data)
}

// 更新菜品分类
export const updateMenuCategory = (id: number, data: UpdateMenuCategoryRequest) => {
  return request.put<ApiResponse<MenuCategory>>(`/merchant/menu-categories/${id}`, data)
}

// 删除菜品分类
export const deleteMenuCategory = (id: number) => {
  return request.delete<ApiResponse<null>>(`/merchant/menu-categories/${id}`)
}

// ==================== 菜品管理 ====================

// 获取菜品列表
export const getMerchantMenuItems = (categoryId?: number) => {
  const params = categoryId ? { categoryId } : {}
  return request.get<ApiResponse<MenuItem[]>>('/merchant/menu-items', { params })
}

// 创建菜品
export const createMenuItem = (data: CreateMenuItemRequest) => {
  return request.post<ApiResponse<MenuItem>>('/merchant/menu-items', data)
}

// 更新菜品
export const updateMenuItem = (id: number, data: UpdateMenuItemRequest) => {
  return request.put<ApiResponse<MenuItem>>(`/merchant/menu-items/${id}`, data)
}

// 删除菜品
export const deleteMenuItem = (id: number) => {
  return request.delete<ApiResponse<null>>(`/merchant/menu-items/${id}`)
}

// 更新菜品状态（上下架）
export const updateMenuItemStatus = (id: number, isAvailable: boolean) => {
  return request.put<ApiResponse<MenuItem>>(`/merchant/menu-items/${id}/status`, { isAvailable })
}

// ==================== 订单管理 ====================

// 获取店铺订单列表
export const getMerchantOrders = (params: {
  status?: string
  page?: number
  size?: number
}) => {
  return request.get<ApiResponse<PageResponse<Order>>>('/merchant/orders', { params })
}

// 获取订单详情
export const getMerchantOrderById = (id: number) => {
  return request.get<ApiResponse<Order>>(`/merchant/orders/${id}`)
}

// 确认订单
export const confirmMerchantOrder = (id: number) => {
  return request.put<ApiResponse<Order>>(`/merchant/orders/${id}/confirm`)
}

// 开始制作
export const startPreparingOrder = (id: number) => {
  return request.put<ApiResponse<Order>>(`/merchant/orders/${id}/preparing`)
}

// 开始配送
export const startDeliveringOrder = (id: number) => {
  return request.put<ApiResponse<Order>>(`/merchant/orders/${id}/delivering`)
}

// 完成订单
export const completeMerchantOrder = (id: number) => {
  return request.put<ApiResponse<Order>>(`/merchant/orders/${id}/complete`)
}

// ==================== 统计数据 ====================

// 获取店铺统计数据
export const getMerchantStatistics = () => {
  return request.get<ApiResponse<MerchantStatistics>>('/merchant/statistics')
}

// ==================== 余额与提现 ====================

// 获取店铺余额
export const getMerchantBalance = () => {
  return request.get<ApiResponse<{ balance: number }>>('/merchant/balance')
}

// 店铺提现（预留接口）
export const withdrawBalance = (data: {
  amount: number
  withdrawMethod?: 'bank' | 'wechat' | 'alipay'
  bankAccount?: string
  bankName?: string
  accountName?: string
}) => {
  return request.post<ApiResponse<{ withdrawAmount: number; remainingBalance: number }>>('/merchant/withdraw', data)
}
