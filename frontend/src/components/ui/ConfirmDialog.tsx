import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { useConfirmStore, ConfirmType } from '../../store/useConfirmStore'
import Button from './Button'

const iconMap: Record<ConfirmType, typeof AlertTriangle> = {
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap: Record<ConfirmType, { iconBg: string; icon: string; button: string }> = {
  danger: {
    iconBg: 'bg-red-100',
    icon: 'text-red-500',
    button: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    iconBg: 'bg-amber-100',
    icon: 'text-amber-500',
    button: 'bg-amber-500 hover:bg-amber-600',
  },
  info: {
    iconBg: 'bg-blue-100',
    icon: 'text-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600',
  },
}

const ConfirmDialog = () => {
  const { isOpen, type, title, message, confirmText, cancelText, onConfirm, onCancel, closeConfirm } = useConfirmStore()

  const Icon = iconMap[type]
  const colors = colorMap[type]

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    onCancel()
    closeConfirm()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="pointer-events-auto w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="p-6 pt-8">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div className={`w-16 h-16 rounded-2xl ${colors.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-gray-500 text-center mb-8">
                  {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                  >
                    {cancelText}
                  </Button>
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 py-3 px-6 rounded-xl text-white font-medium transition-colors ${colors.button}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog
