import request from './request'
import { ApiResponse, Category } from '../types'

// 获取所有分类
export const getCategories = () => {
  return request.get<ApiResponse<Category[]>>('/categories')
}

// 获取分类详情
export const getCategoryById = (id: number) => {
  return request.get<ApiResponse<Category>>(`/categories/${id}`)
}
