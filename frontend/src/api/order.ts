import request from './request'
import { ApiResponse, PageResponse, Order } from '../types'

// 创建订单
export const createOrder = (data: {
  restaurantId: number
  items: { menuItemId: number; quantity: number }[]
  address: string
  phone: string
  remark?: string
}) => {
  return request.post<ApiResponse<Order>>('/orders', data)
}

// 获取订单列表
export const getOrders = (params?: {
  status?: string
  page?: number
  size?: number
}) => {
  return request.get<ApiResponse<PageResponse<Order>>>('/orders', { params })
}

// 获取订单详情
export const getOrderById = (id: number) => {
  return request.get<ApiResponse<Order>>(`/orders/${id}`)
}

// 取消订单
export const cancelOrder = (id: number) => {
  return request.put<ApiResponse<Order>>(`/orders/${id}/cancel`)
}

// 确认收货
export const confirmOrder = (id: number) => {
  return request.put<ApiResponse<Order>>(`/orders/${id}/confirm`)
}

// 支付订单
export const payOrder = (id: number) => {
  return request.put<ApiResponse<Order>>(`/orders/${id}/pay`)
}
