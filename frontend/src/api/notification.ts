import request from './request'
import { ApiResponse, Notification } from '../types'

/**
 * 获取所有通知
 */
export const getNotifications = () => {
  return request.get<ApiResponse<Notification[]>>('/notifications')
}

/**
 * 获取未读通知
 */
export const getUnreadNotifications = () => {
  return request.get<ApiResponse<Notification[]>>('/notifications/unread')
}

/**
 * 获取未读通知数量
 */
export const getUnreadCount = () => {
  return request.get<ApiResponse<number>>('/notifications/unread/count')
}

/**
 * 标记单条通知为已读
 */
export const markAsRead = (id: number) => {
  return request.put<ApiResponse<void>>(`/notifications/${id}/read`)
}

/**
 * 标记所有通知为已读
 */
export const markAllAsRead = () => {
  return request.put<ApiResponse<void>>('/notifications/read-all')
}

/**
 * 删除单条通知
 */
export const deleteNotification = (id: number) => {
  return request.delete<ApiResponse<void>>(`/notifications/${id}`)
}

/**
 * 删除所有通知
 */
export const deleteAllNotifications = () => {
  return request.delete<ApiResponse<void>>('/notifications')
}
