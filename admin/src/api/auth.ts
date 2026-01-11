import request from './request'
import type { ApiResponse, User } from '../types'

interface LoginRequest {
  phone: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

// 登录
export const login = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return request.post('/auth/login', data)
}

// 获取当前用户信息
export const getCurrentUser = (): Promise<ApiResponse<User>> => {
  return request.get('/users/me')
}
