import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, ToastType } from '../../store/useToastStore'

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap: Record<ToastType, { bg: string; border: string; icon: string; title: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    title: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
  },
}

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type]
          const colors = colorMap[toast.type]

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`
                relative pointer-events-auto min-w-[320px] max-w-[420px] p-4 rounded-2xl 
                border-2 shadow-lg backdrop-blur-sm overflow-hidden
                ${colors.bg} ${colors.border}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 mt-0.5 ${colors.icon}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${colors.title}`}>{toast.title}</h4>
                  {toast.message && (
                    <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              {/* 进度条 */}
              <motion.div
                className={`absolute bottom-0 left-0 h-1 rounded-b-2xl ${
                  toast.type === 'success' ? 'bg-green-400' :
                  toast.type === 'error' ? 'bg-red-400' :
                  toast.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (toast.duration ?? 3000) / 1000, ease: 'linear' }}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
