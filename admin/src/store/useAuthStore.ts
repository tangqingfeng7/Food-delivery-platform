import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('admin_user') || 'null'),
  token: localStorage.getItem('admin_token'),
  isAuthenticated: !!localStorage.getItem('admin_token'),

  setAuth: (user, token) => {
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  checkAuth: () => {
    const token = localStorage.getItem('admin_token')
    const user = JSON.parse(localStorage.getItem('admin_user') || 'null')
    
    // 验证是否是管理员角色
    if (token && user && user.role === 'ADMIN') {
      // 只在状态与当前不同时才更新，避免无限渲染循环
      const currentState = get()
      if (currentState.token !== token || !currentState.isAuthenticated) {
        set({ user, token, isAuthenticated: true })
      }
      return true
    }
    
    // 只在当前已认证时才执行登出
    if (get().isAuthenticated) {
      get().logout()
    }
    return false
  },
}))
