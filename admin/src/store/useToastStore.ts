import { create } from 'zustand'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  isVisible: false,

  showToast: (message, type = 'info') => {
    set({ message, type, isVisible: true })
    setTimeout(() => {
      set({ isVisible: false })
    }, 3000)
  },

  hideToast: () => {
    set({ isVisible: false })
  },
}))
