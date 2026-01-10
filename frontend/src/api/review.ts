import request from './request'
import type { ApiResponse, PageResponse, Review, ReviewStats, CreateReviewRequest } from '../types'

// 提交评价
export const createReview = (data: CreateReviewRequest) => {
  return request.post<ApiResponse<Review>>('/reviews', data)
}

// 获取餐厅评价列表
export const getRestaurantReviews = (
  restaurantId: number,
  page: number = 0,
  size: number = 10
) => {
  return request.get<ApiResponse<PageResponse<Review>>>(
    `/restaurants/${restaurantId}/reviews`,
    { params: { page, size } }
  )
}

// 获取餐厅评价统计
export const getRestaurantReviewStats = (restaurantId: number) => {
  return request.get<ApiResponse<ReviewStats>>(
    `/restaurants/${restaurantId}/reviews/stats`
  )
}

// 检查订单是否已评价
export const checkOrderReviewed = (orderId: number) => {
  return request.get<ApiResponse<boolean>>(`/reviews/check/${orderId}`)
}

// 获取订单的评价
export const getOrderReview = (orderId: number) => {
  return request.get<ApiResponse<Review>>(`/reviews/order/${orderId}`)
}

// 获取我的评价列表
export const getMyReviews = () => {
  return request.get<ApiResponse<Review[]>>('/reviews/my')
}

// 点赞评价
export const likeReview = (reviewId: number) => {
  return request.post<ApiResponse<void>>(`/reviews/${reviewId}/like`)
}

// 取消点赞
export const unlikeReview = (reviewId: number) => {
  return request.delete<ApiResponse<void>>(`/reviews/${reviewId}/like`)
}

// 商家回复评价
export const replyReview = (reviewId: number, content: string) => {
  return request.put<ApiResponse<Review>>(
    `/merchant/reviews/${reviewId}/reply`,
    { content }
  )
}

// 获取菜品评价列表
export const getMenuItemReviews = (
  menuItemId: number,
  page: number = 0,
  size: number = 10
) => {
  return request.get<ApiResponse<PageResponse<Review>>>(
    `/menu-items/${menuItemId}/reviews`,
    { params: { page, size } }
  )
}

// 获取菜品评价统计
export const getMenuItemReviewStats = (menuItemId: number) => {
  return request.get<ApiResponse<{ totalReviews: number; averageRating: number }>>(
    `/menu-items/${menuItemId}/reviews/stats`
  )
}
