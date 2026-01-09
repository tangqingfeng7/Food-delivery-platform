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
