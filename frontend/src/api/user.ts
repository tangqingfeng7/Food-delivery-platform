import request from './request'
import { ApiResponse, User } from '../types'

// 用户登录
export const login = (data: { phone: string; password: string }) => {
  return request.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data)
}

// 用户注册
export const register = (data: {
  username: string
  phone: string
  password: string
}) => {
  return request.post<ApiResponse<User>>('/auth/register', data)
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get<ApiResponse<User>>('/users/me')
}

// 更新用户信息
export const updateUser = (data: Partial<User>) => {
  return request.put<ApiResponse<User>>('/users/me', data)
}

// 更新用户地址
export const updateAddress = (address: string) => {
  return request.put<ApiResponse<User>>('/users/me/address', { address })
}

// 退出登录
export const logout = () => {
  return request.post<ApiResponse<null>>('/auth/logout')
}

// ==================== 账号安全相关接口 ====================

// 修改密码
export const changePassword = (data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) => {
  return request.put<ApiResponse<null>>('/users/me/password', data)
}

// 修改手机号
export const changePhone = (data: {
  password: string
  newPhone: string
}) => {
  return request.put<ApiResponse<User>>('/users/me/phone', data)
}

// 注销账号
export const deleteAccount = (data: {
  password: string
  reason?: string
}) => {
  return request.delete<ApiResponse<null>>('/users/me', { data })
}

// 验证密码
export const verifyPassword = (password: string) => {
  return request.post<ApiResponse<boolean>>('/users/me/verify-password', { password })
}
