import { create } from 'zustand'

export type ConfirmType = 'danger' | 'warning' | 'info'

interface ConfirmState {
  isOpen: boolean
  type: ConfirmType
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  openConfirm: (options: {
    type?: ConfirmType
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
  }) => void
  closeConfirm: () => void
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  type: 'warning',
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  onConfirm: () => {},
  onCancel: () => {},
  openConfirm: (options) =>
    set({
      isOpen: true,
      type: options.type ?? 'warning',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? '确定',
      cancelText: options.cancelText ?? '取消',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel ?? (() => {}),
    }),
  closeConfirm: () =>
    set({
      isOpen: false,
    }),
}))

// 便捷方法 - 返回 Promise
export const confirm = (options: {
  type?: ConfirmType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}): Promise<boolean> => {
  return new Promise((resolve) => {
    useConfirmStore.getState().openConfirm({
      ...options,
      onConfirm: () => {
        useConfirmStore.getState().closeConfirm()
        resolve(true)
      },
      onCancel: () => {
        useConfirmStore.getState().closeConfirm()
        resolve(false)
      },
    })
  })
}
