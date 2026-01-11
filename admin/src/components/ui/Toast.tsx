import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/useToastStore'

export default function Toast() {
  const { message, type, isVisible, hideToast } = useToastStore()

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type]}`}>
        {icons[type]}
        <span className="text-gray-700">{message}</span>
        <button onClick={hideToast} className="ml-2 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
