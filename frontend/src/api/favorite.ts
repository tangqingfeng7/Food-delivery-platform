import request from './request'
import { ApiResponse, Favorite } from '../types'

// 获取收藏列表
export const getFavorites = () => {
  return request.get<ApiResponse<Favorite[]>>('/favorites')
}

// 添加收藏
export const addFavorite = (restaurantId: number) => {
  return request.post<ApiResponse<Favorite>>('/favorites', { restaurantId })
}

// 取消收藏
export const removeFavorite = (restaurantId: number) => {
  return request.delete<ApiResponse<null>>(`/favorites/${restaurantId}`)
}

// 检查是否已收藏
export const checkFavorite = (restaurantId: number) => {
  return request.get<ApiResponse<boolean>>(`/favorites/check/${restaurantId}`)
}
