import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { getCurrentUser } from '../api/user'

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  
  // 设置用户
  setUser: (user: User) => void
  // 设置token
  setToken: (token: string) => void
  // 登录
  login: (user: User, token: string) => void
  // 退出登录
  logout: () => void
  // 更新用户信息
  updateUser: (data: Partial<User>) => void
  // 刷新用户信息（从服务器获取最新数据）
  refreshUser: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setUser: (user: User) => {
        set({ user, isLoggedIn: true })
      },

      setToken: (token: string) => {
        localStorage.setItem('token', token)
        set({ token })
      },

      login: (user: User, token: string) => {
        localStorage.setItem('token', token)
        set({ user, token, isLoggedIn: true })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isLoggedIn: false })
      },

      updateUser: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...data } })
        }
      },

      refreshUser: async () => {
        const { isLoggedIn } = get()
        if (!isLoggedIn) return
        
        try {
          const res = await getCurrentUser()
          if (res.data.data) {
            set({ user: res.data.data })
          }
        } catch (error) {
          console.error('刷新用户信息失败:', error)
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
