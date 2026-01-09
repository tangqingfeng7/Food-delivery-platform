import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bell, Package, Tag, Info, Trash2, CheckCheck, 
  Loader2, RefreshCw, Clock, ChevronRight 
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  deleteAllNotifications 
} from '../api/notification'
import { Notification, NotificationType } from '../types'
import { confirm } from '../store/useConfirmStore'
import { toast } from '../store/useToastStore'

// 通知类型配置
const typeConfig: Record<NotificationType, { 
  label: string
  color: string
  bgColor: string
  icon: React.ComponentType<{ className?: string }> 
}> = {
  SYSTEM: { label: '系统通知', color: 'text-blue-500', bgColor: 'bg-blue-100', icon: Info },
  ORDER: { label: '订单通知', color: 'text-orange-500', bgColor: 'bg-orange-100', icon: Package },
  PROMO: { label: '优惠活动', color: 'text-green-500', bgColor: 'bg-green-100', icon: Tag },
}

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('all')

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'SYSTEM', label: '系统通知' },
    { key: 'ORDER', label: '订单通知' },
    { key: 'PROMO', label: '优惠活动' },
  ]

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await getNotifications()
      setNotifications(res.data.data)
    } catch (error) {
      console.error('获取通知失败:', error)
      toast.error('获取通知失败', '请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 按标签筛选通知
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab)

  // 未读消息数量
  const unreadCount = notifications.filter(n => !n.isRead).length

  // 标记单条为已读
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return
    
    try {
      await markAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 标记全部为已读
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      toast.info('没有未读消息')
      return
    }

    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('已全部标记为已读')
    } catch (error) {
      console.error('标记全部已读失败:', error)
      toast.error('操作失败', '请稍后重试')
    }
  }

  // 删除单条通知
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const confirmed = await confirm({
      type: 'danger',
      title: '删除通知',
      message: '确定要删除这条通知吗？',
      confirmText: '删除',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('通知已删除')
    } catch (error) {
      console.error('删除通知失败:', error)
      toast.error('删除失败', '请稍后重试')
    }
  }

  // 删除全部通知
  const handleDeleteAll = async () => {
    if (notifications.length === 0) {
      toast.info('没有通知可删除')
      return
    }

    const confirmed = await confirm({
      type: 'danger',
      title: '清空通知',
      message: '确定要删除所有通知吗？此操作不可恢复。',
      confirmText: '全部删除',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      await deleteAllNotifications()
      setNotifications([])
      toast.success('已清空所有通知')
    } catch (error) {
      console.error('清空通知失败:', error)
      toast.error('操作失败', '请稍后重试')
    }
  }

  // 点击通知
  const handleNotificationClick = async (notification: Notification) => {
    // 标记为已读
    await handleMarkAsRead(notification)
    
    // 如果是订单通知且有关联ID，跳转到订单详情
    if (notification.type === 'ORDER' && notification.relatedId) {
      navigate(`/order/${notification.relatedId}`)
    }
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // 一分钟内
    if (diff < 60 * 1000) {
      return '刚刚'
    }
    // 一小时内
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`
    }
    // 一天内
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
    }
    // 超过一天
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen py-8 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">消息通知</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                {unreadCount}条未读
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
              title="刷新"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-3 mb-6"
        >
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            全部已读
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            清空通知
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-600 hover:bg-orange-50 shadow-md'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <Bell className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">暂无通知</h2>
            <p className="text-gray-500">有新消息时会第一时间通知你</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredNotifications.map((notification, index) => {
              const config = typeConfig[notification.type]
              const Icon = config.icon

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card 
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      !notification.isRead ? 'border-l-4 border-l-orange-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                              {notification.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${config.bgColor} ${config.color}`}>
                              {config.label}
                            </span>
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                          </div>
                          <p className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                            {notification.content}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(notification.createdAt)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {notification.type === 'ORDER' && notification.relatedId && (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Notifications
