import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    // 自动移除
    const duration = toast.duration ?? 3000
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

// 便捷方法
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message }),
}
