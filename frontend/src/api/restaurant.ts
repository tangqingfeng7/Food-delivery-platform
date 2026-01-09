import request from './request'
import { ApiResponse, PageResponse, Restaurant, MenuItem, MenuCategory } from '../types'

// 获取餐厅列表
export const getRestaurants = (params?: {
  categoryId?: number
  keyword?: string
  sortBy?: string
  page?: number
  size?: number
}) => {
  return request.get<ApiResponse<PageResponse<Restaurant>>>('/restaurants', { params })
}

// 获取推荐餐厅
export const getFeaturedRestaurants = (limit?: number) => {
  return request.get<ApiResponse<Restaurant[]>>('/restaurants/featured', {
    params: { limit: limit || 6 },
  })
}

// 获取餐厅详情
export const getRestaurantById = (id: number) => {
  return request.get<ApiResponse<Restaurant>>(`/restaurants/${id}`)
}

// 获取餐厅菜品分类
export const getMenuCategories = (restaurantId: number) => {
  return request.get<ApiResponse<MenuCategory[]>>(`/restaurants/${restaurantId}/menu-categories`)
}

// 获取餐厅菜品列表
export const getMenuItems = (restaurantId: number, categoryId?: number) => {
  return request.get<ApiResponse<MenuItem[]>>(`/restaurants/${restaurantId}/menu-items`, {
    params: { categoryId },
  })
}

// 搜索餐厅
export const searchRestaurants = (keyword: string) => {
  return request.get<ApiResponse<Restaurant[]>>('/restaurants/search', {
    params: { keyword },
  })
}
