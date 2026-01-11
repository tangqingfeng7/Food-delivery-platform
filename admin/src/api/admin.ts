import request from './request'
import type { ApiResponse, PageResult, Statistics, User, Restaurant, Order, Category, Review, PlatformConfig } from '../types'

// ==================== 统计数据 ====================

export const getStatistics = (): Promise<ApiResponse<Statistics>> => {
  return request.get('/admin/statistics')
}

// ==================== 用户管理 ====================

export const getUsers = (params: {
  page?: number
  size?: number
  keyword?: string
  role?: string
}): Promise<ApiResponse<PageResult<User>>> => {
  return request.get('/admin/users', { params })
}

export const updateUserStatus = (id: number, enabled: boolean): Promise<ApiResponse<void>> => {
  return request.put(`/admin/users/${id}/status`, { enabled })
}

export const updateUser = (id: number, data: {
  username?: string
  phone?: string
  email?: string
  role?: string
  enabled?: boolean
}): Promise<ApiResponse<User>> => {
  return request.put(`/admin/users/${id}`, data)
}

export const rechargeBalance = (id: number, amount: number): Promise<ApiResponse<User>> => {
  return request.post(`/admin/users/${id}/recharge`, { amount })
}

// ==================== 餐厅管理 ====================

export const getRestaurants = (params: {
  page?: number
  size?: number
  keyword?: string
}): Promise<ApiResponse<PageResult<Restaurant>>> => {
  return request.get('/admin/restaurants', { params })
}

export const updateRestaurantStatus = (id: number, isOpen: boolean): Promise<ApiResponse<void>> => {
  return request.put(`/admin/restaurants/${id}/status`, { isOpen })
}

export const updateRestaurant = (id: number, data: {
  name?: string
  description?: string
  address?: string
  phone?: string
  deliveryFee?: number
  minOrder?: number
  deliveryTime?: string
  categoryId?: number
  isFeatured?: boolean
  isOpen?: boolean
  tags?: string
}): Promise<ApiResponse<Restaurant>> => {
  return request.put(`/admin/restaurants/${id}`, data)
}

// ==================== 订单管理 ====================

export const getOrders = (params: {
  page?: number
  size?: number
  status?: string
  keyword?: string
}): Promise<ApiResponse<PageResult<Order>>> => {
  return request.get('/admin/orders', { params })
}

export const updateOrderStatus = (id: number, status: string): Promise<ApiResponse<Order>> => {
  return request.put(`/admin/orders/${id}/status`, { status })
}

// ==================== 分类管理 ====================

export const getCategories = (): Promise<ApiResponse<Category[]>> => {
  return request.get('/admin/categories')
}

export const createCategory = (data: {
  name: string
  icon?: string
  color?: string
  sortOrder?: number
}): Promise<ApiResponse<Category>> => {
  return request.post('/admin/categories', data)
}

export const updateCategory = (id: number, data: {
  name: string
  icon?: string
  color?: string
  sortOrder?: number
}): Promise<ApiResponse<Category>> => {
  return request.put(`/admin/categories/${id}`, data)
}

export const deleteCategory = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`/admin/categories/${id}`)
}

// ==================== 评价管理 ====================

export const getReviews = (params: {
  page?: number
  size?: number
  keyword?: string
}): Promise<ApiResponse<PageResult<Review>>> => {
  return request.get('/admin/reviews', { params })
}

export const deleteReview = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`/admin/reviews/${id}`)
}

export const replyReview = (id: number, content: string): Promise<ApiResponse<Review>> => {
  return request.put(`/admin/reviews/${id}/reply`, { content })
}

// ==================== 通知管理 ====================

export const broadcastNotification = (data: {
  title: string
  content: string
  type?: string
}): Promise<ApiResponse<void>> => {
  return request.post('/admin/notifications/broadcast', data)
}

// ==================== 平台配置管理 ====================

// 获取平台配置
export const getPlatformConfig = (): Promise<ApiResponse<PlatformConfig>> => {
  return request.get('/admin/config/platform')
}

// 更新默认平台抽成比例
export const updateDefaultPlatformRate = (rate: number): Promise<ApiResponse<PlatformConfig>> => {
  return request.put('/admin/config/platform-rate', { rate })
}

// 更新店铺抽成比例
export const updateRestaurantPlatformRate = (id: number, rate: number): Promise<ApiResponse<Restaurant>> => {
  return request.put(`/admin/restaurants/${id}/platform-rate`, { rate })
}
