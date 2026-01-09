import request from './request'
import { ApiResponse, Address } from '../types'

// 获取地址列表
export const getAddresses = () => {
  return request.get<ApiResponse<Address[]>>('/addresses')
}

// 添加地址
export const addAddress = (data: {
  name: string
  phone: string
  address: string
  isDefault?: boolean
}) => {
  return request.post<ApiResponse<Address>>('/addresses', data)
}

// 更新地址
export const updateAddress = (id: number, data: {
  name?: string
  phone?: string
  address?: string
  isDefault?: boolean
}) => {
  return request.put<ApiResponse<Address>>(`/addresses/${id}`, data)
}

// 删除地址
export const deleteAddress = (id: number) => {
  return request.delete<ApiResponse<null>>(`/addresses/${id}`)
}

// 设置默认地址
export const setDefaultAddress = (id: number) => {
  return request.put<ApiResponse<Address>>(`/addresses/${id}/default`)
}
