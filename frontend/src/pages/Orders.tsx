import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, XCircle, Truck, ChefHat, CreditCard, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { getOrders, cancelOrder, confirmOrder, payOrder } from '../api/order'
import { Order, OrderStatus, MenuItem } from '../types'
import { confirm } from '../store/useConfirmStore'
import { toast } from '../store/useToastStore'
import { useCartStore } from '../store/useCartStore'
import { useUserStore } from '../store/useUserStore'
import { useWebSocketStore, OrderStatusMessage } from '../store/useWebSocketStore'

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: '待支付', color: 'text-yellow-500 bg-yellow-50', icon: CreditCard },
  PAID: { label: '已支付', color: 'text-blue-500 bg-blue-50', icon: CheckCircle },
  CONFIRMED: { label: '已确认', color: 'text-indigo-500 bg-indigo-50', icon: CheckCircle },
  PREPARING: { label: '制作中', color: 'text-orange-500 bg-orange-50', icon: ChefHat },
  DELIVERING: { label: '配送中', color: 'text-purple-500 bg-purple-50', icon: Truck },
  COMPLETED: { label: '已完成', color: 'text-green-500 bg-green-50', icon: CheckCircle },
  CANCELLED: { label: '已取消', color: 'text-gray-500 bg-gray-50', icon: XCircle },
}

// 轮询间隔时间（毫秒）- 作为 WebSocket 的备用方案
const POLLING_INTERVAL = 30000

const Orders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [isPolling, setIsPolling] = useState(true)
  const { addItem } = useCartStore()
  const { user } = useUserStore()
  const { connect, disconnect, subscribeToUserOrders, status: wsStatus } = useWebSocketStore()

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'PENDING', label: '待支付' },
    { key: 'PREPARING', label: '进行中' },
    { key: 'COMPLETED', label: '已完成' },
  ]

  // 处理 WebSocket 订单状态更新消息
  const handleOrderStatusUpdate = useCallback((message: OrderStatusMessage) => {
    console.log('收到订单状态更新:', message)
    
    // 显示提示
    toast.info('订单状态更新', `${message.restaurantName} 的订单已变为「${message.statusLabel}」`)
    
    // 更新本地订单列表中的状态
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === message.orderId 
          ? { ...order, status: message.newStatus as OrderStatus }
          : order
      )
    )
  }, [])

  // 连接 WebSocket 并订阅
  useEffect(() => {
    if (user?.id) {
      // 连接 WebSocket
      connect(user.id)
    }

    return () => {
      // 组件卸载时断开连接
      disconnect()
    }
  }, [user?.id])

  // WebSocket 连接成功后订阅
  useEffect(() => {
    if (wsStatus === 'connected' && user?.id) {
      subscribeToUserOrders(user.id, handleOrderStatusUpdate)
    }
  }, [wsStatus, user?.id, handleOrderStatusUpdate])

  // 初始加载和切换标签时获取订单
  useEffect(() => {
    fetchOrders()
  }, [activeTab])

  // 轮询作为备用方案（WebSocket 未连接时使用）
  useEffect(() => {
    // 如果 WebSocket 已连接，降低轮询频率
    if (wsStatus === 'connected' || !isPolling) return

    const intervalId = setInterval(() => {
      fetchOrdersSilently()
    }, POLLING_INTERVAL)

    return () => clearInterval(intervalId)
  }, [activeTab, isPolling, wsStatus])

  // 页面可见性变化时控制轮询
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPolling(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const status = activeTab === 'all' ? undefined : activeTab
      const res = await getOrders({ status, page: 0, size: 20 })
      setOrders(res.data.data.content)
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 静默获取订单（不显示 loading，用于轮询）
  const fetchOrdersSilently = async () => {
    try {
      const status = activeTab === 'all' ? undefined : activeTab
      const res = await getOrders({ status, page: 0, size: 20 })
      const newOrders = res.data.data.content
      
      // 检查是否有状态变化，有变化时提示用户
      orders.forEach(oldOrder => {
        const newOrder = newOrders.find((o: Order) => o.id === oldOrder.id)
        if (newOrder && newOrder.status !== oldOrder.status) {
          const statusLabel = statusConfig[newOrder.status]?.label || newOrder.status
          toast.info(`订单状态更新`, `${newOrder.restaurantName} 的订单已变为「${statusLabel}」`)
        }
      })
      
      setOrders(newOrders)
    } catch (error) {
      console.error('获取订单失败:', error)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '取消订单',
      message: '确定要取消该订单吗？取消后将无法恢复。',
      confirmText: '确认取消',
      cancelText: '再想想',
    })
    
    if (!confirmed) return
    
    try {
      await cancelOrder(orderId)
      toast.success('订单已取消')
      fetchOrders()
    } catch (error) {
      console.error('取消订单失败:', error)
      toast.error('取消订单失败', '请稍后重试')
    }
  }

  const handleConfirmOrder = async (orderId: number) => {
    const confirmed = await confirm({
      type: 'info',
      title: '确认收货',
      message: '确认已收到商品？确认后订单将完成。',
      confirmText: '确认收货',
      cancelText: '取消',
    })
    
    if (!confirmed) return
    
    try {
      await confirmOrder(orderId)
      toast.success('已确认收货', '感谢您的惠顾')
      fetchOrders()
    } catch (error) {
      console.error('确认收货失败:', error)
      toast.error('确认收货失败', '请稍后重试')
    }
  }

  const handlePayOrder = async (orderId: number) => {
    const confirmed = await confirm({
      type: 'info',
      title: '确认支付',
      message: '确认支付该订单吗？',
      confirmText: '确认支付',
      cancelText: '取消',
    })
    
    if (!confirmed) return
    
    try {
      await payOrder(orderId)
      toast.success('支付成功', '订单已支付')
      fetchOrders()
    } catch (error) {
      console.error('支付失败:', error)
      toast.error('支付失败', '请稍后重试')
    }
  }

  const handleReorder = async (order: Order) => {
    // 将订单商品添加到购物车
    order.items.forEach(item => {
      // 将 OrderItem 转换为 MenuItem 格式
      const menuItem: MenuItem = {
        id: item.menuItemId,
        restaurantId: order.restaurantId,
        name: item.menuItemName,
        description: '',
        price: item.price,
        originalPrice: null,
        image: item.menuItemImage,
        categoryId: 0,
        categoryName: '',
        sales: 0,
        isHot: false,
        isNew: false,
        isAvailable: true,
      }
      
      // 添加对应数量的商品
      for (let i = 0; i < item.quantity; i++) {
        addItem(menuItem, order.restaurantId, order.restaurantName)
      }
    })
    
    toast.success('已添加到购物车', '即将跳转到购物车')
    
    // 跳转到购物车页面
    navigate('/cart')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">我的订单</h1>
            {/* WebSocket 连接状态指示器 */}
            <div 
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                wsStatus === 'connected' 
                  ? 'bg-green-100 text-green-600' 
                  : wsStatus === 'connecting'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
              title={wsStatus === 'connected' ? '实时更新已开启' : '实时更新未连接'}
            >
              {wsStatus === 'connected' ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span>{wsStatus === 'connected' ? '实时' : wsStatus === 'connecting' ? '连接中' : '离线'}</span>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
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

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">暂无订单</h2>
            <p className="text-gray-500 mb-8">快去下一单吧</p>
            <Button onClick={() => navigate('/restaurants')}>
              去点餐
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order.status]
              const StatusIcon = statusInfo.icon
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    {/* Order Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.restaurantImage}
                          alt={order.restaurantName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-800">{order.restaurantName}</h3>
                          <p className="text-xs text-gray-500">订单号: {order.orderNo}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img
                              src={item.menuItemImage}
                              alt={item.menuItemName}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="text-gray-800">{item.menuItemName}</h4>
                              <p className="text-sm text-gray-500">
                                ¥{item.price} x {item.quantity}
                              </p>
                            </div>
                            <span className="font-medium text-gray-800">
                              ¥{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-gray-500 text-center">
                            还有{order.items.length - 3}件商品...
                          </p>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <span>共{order.items.reduce((sum, item) => sum + item.quantity, 0)}件商品</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">实付金额</span>
                          <span className="text-xl font-bold text-orange-500">
                            ¥{order.payAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="mt-4 flex gap-3 justify-end">
                        {order.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              取消订单
                            </Button>
                            <Button size="sm" onClick={() => handlePayOrder(order.id)}>
                              去支付
                            </Button>
                          </>
                        )}
                        {order.status === 'DELIVERING' && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmOrder(order.id)}
                          >
                            确认收货
                          </Button>
                        )}
                        {order.status === 'COMPLETED' && (
                          <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                            再来一单
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/order/${order.id}`)}
                        >
                          查看详情
                        </Button>
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

export default Orders
