import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ChefHat, 
  CreditCard,
  Loader2,
  Store,
  Copy
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { getOrderById, cancelOrder, confirmOrder, payOrder } from '../api/order'
import { Order, OrderStatus } from '../types'
import { confirm } from '../store/useConfirmStore'
import { toast } from '../store/useToastStore'
import { useUserStore } from '../store/useUserStore'
import { useWebSocketStore, OrderStatusMessage } from '../store/useWebSocketStore'

const statusConfig: Record<OrderStatus, { 
  label: string
  color: string
  bgColor: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}> = {
  PENDING: { 
    label: '待支付', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50',
    icon: CreditCard,
    description: '订单等待支付中，请尽快完成支付'
  },
  PAID: { 
    label: '已支付', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    icon: CheckCircle,
    description: '订单已支付，等待商家确认'
  },
  CONFIRMED: { 
    label: '已确认', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50',
    icon: CheckCircle,
    description: '商家已确认订单，即将开始制作'
  },
  PREPARING: { 
    label: '制作中', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50',
    icon: ChefHat,
    description: '美食正在制作中，请耐心等待'
  },
  DELIVERING: { 
    label: '配送中', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50',
    icon: Truck,
    description: '骑手正在配送，请保持电话畅通'
  },
  COMPLETED: { 
    label: '已完成', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    icon: CheckCircle,
    description: '订单已完成，感谢您的惠顾'
  },
  CANCELLED: { 
    label: '已取消', 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-50',
    icon: XCircle,
    description: '订单已取消'
  },
}

// 轮询间隔时间（毫秒）- 作为 WebSocket 的备用方案
const POLLING_INTERVAL = 15000

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const { user } = useUserStore()
  const { connect, disconnect, subscribeToUserOrders, status: wsStatus } = useWebSocketStore()

  // 处理 WebSocket 订单状态更新消息
  const handleOrderStatusUpdate = useCallback((message: OrderStatusMessage) => {
    // 只处理当前订单的更新
    if (order && message.orderId === order.id) {
      console.log('收到当前订单状态更新:', message)
      toast.info('订单状态更新', `订单已变为「${message.statusLabel}」`)
      
      // 更新订单状态
      setOrder(prev => prev ? { ...prev, status: message.newStatus as OrderStatus } : null)
    }
  }, [order?.id])

  // 连接 WebSocket
  useEffect(() => {
    if (user?.id) {
      connect(user.id)
    }

    return () => {
      disconnect()
    }
  }, [user?.id])

  // WebSocket 连接成功后订阅
  useEffect(() => {
    if (wsStatus === 'connected' && user?.id) {
      subscribeToUserOrders(user.id, handleOrderStatusUpdate)
    }
  }, [wsStatus, user?.id, handleOrderStatusUpdate])

  // 初始加载
  useEffect(() => {
    if (id) {
      fetchOrder(Number(id))
    }
  }, [id])

  // 轮询作为备用方案（WebSocket 未连接且订单未完成时使用）
  useEffect(() => {
    if (!id || !order || !isPolling) return
    
    // 已完成或已取消的订单不需要轮询
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') return
    
    // 如果 WebSocket 已连接，不需要轮询
    if (wsStatus === 'connected') return

    const intervalId = setInterval(() => {
      fetchOrderSilently(Number(id))
    }, POLLING_INTERVAL)

    return () => clearInterval(intervalId)
  }, [id, order?.status, isPolling, wsStatus])

  // 页面可见性变化时控制轮询
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPolling(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchOrder = async (orderId: number) => {
    try {
      setLoading(true)
      const res = await getOrderById(orderId)
      setOrder(res.data.data)
    } catch (error) {
      console.error('获取订单详情失败:', error)
      toast.error('获取订单详情失败')
    } finally {
      setLoading(false)
    }
  }

  // 静默获取订单（不显示 loading，用于轮询）
  const fetchOrderSilently = async (orderId: number) => {
    try {
      const res = await getOrderById(orderId)
      const newOrder = res.data.data
      
      // 检查状态是否变化
      if (order && newOrder.status !== order.status) {
        const statusLabel = statusConfig[newOrder.status]?.label || newOrder.status
        toast.info('订单状态更新', `订单已变为「${statusLabel}」`)
      }
      
      setOrder(newOrder)
    } catch (error) {
      console.error('获取订单详情失败:', error)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    
    const confirmed = await confirm({
      type: 'danger',
      title: '取消订单',
      message: '确定要取消该订单吗？取消后将无法恢复。',
      confirmText: '确认取消',
      cancelText: '再想想',
    })
    
    if (!confirmed) return
    
    try {
      setActionLoading(true)
      await cancelOrder(order.id)
      toast.success('订单已取消')
      fetchOrder(order.id)
    } catch (error) {
      console.error('取消订单失败:', error)
      toast.error('取消订单失败', '请稍后重试')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePayOrder = async () => {
    if (!order) return
    
    // 模拟支付确认对话框
    const confirmed = await confirm({
      type: 'info',
      title: '确认支付',
      message: `确认支付 ¥${order.payAmount.toFixed(2)} 吗？（当前为模拟支付）`,
      confirmText: '确认支付',
      cancelText: '取消',
    })
    
    if (!confirmed) return
    
    try {
      setActionLoading(true)
      
      // TODO: 后续接入真实支付接口
      // 1. 调用后端创建支付订单接口，获取支付参数
      // 2. 调用第三方支付SDK（如微信支付、支付宝）
      // 3. 支付成功后回调，更新订单状态
      // 示例：
      // const paymentParams = await createPayment(order.id)
      // await thirdPartyPay(paymentParams)
      
      // 当前：模拟支付成功，直接调用后端更新订单状态
      await payOrder(order.id)
      toast.success('支付成功', '订单已支付，请等待商家确认')
      fetchOrder(order.id)
    } catch (error) {
      console.error('支付失败:', error)
      toast.error('支付失败', '请稍后重试')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!order) return
    
    const confirmed = await confirm({
      type: 'info',
      title: '确认收货',
      message: '确认已收到商品？确认后订单将完成。',
      confirmText: '确认收货',
      cancelText: '取消',
    })
    
    if (!confirmed) return
    
    try {
      setActionLoading(true)
      await confirmOrder(order.id)
      toast.success('已确认收货', '感谢您的惠顾')
      fetchOrder(order.id)
    } catch (error) {
      console.error('确认收货失败:', error)
      toast.error('确认收货失败', '请稍后重试')
    } finally {
      setActionLoading(false)
    }
  }

  const copyOrderNo = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNo)
      toast.success('复制成功', '订单号已复制到剪贴板')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">订单不存在</p>
        <Button onClick={() => navigate('/orders')}>返回订单列表</Button>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen py-8 pb-32">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">订单详情</h1>
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 mb-6 ${statusInfo.bgColor}`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center ${statusInfo.color}`}>
                <StatusIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.label}</h2>
                <p className="text-gray-600 mt-1">{statusInfo.description}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Restaurant Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-4 mb-6">
            <div 
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate(`/restaurant/${order.restaurantId}`)}
            >
              <img
                src={order.restaurantImage}
                alt={order.restaurantName}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{order.restaurantName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Store className="w-4 h-4" />
                  点击进入店铺
                </p>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </div>
          </Card>
        </motion.div>

        {/* Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              配送信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{order.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{order.phone}</span>
              </div>
              {order.remark && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{order.remark}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">商品清单</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.menuItemImage}
                    alt={item.menuItemName}
                    className="w-16 h-16 rounded-xl object-cover"
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
            </div>
          </Card>
        </motion.div>

        {/* Price Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">价格明细</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>商品金额</span>
                <span>¥{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>配送费</span>
                <span>¥{order.deliveryFee.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>优惠</span>
                  <span className="text-green-500">-¥{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <span className="font-semibold text-gray-800">实付金额</span>
                <span className="text-xl font-bold text-orange-500">
                  ¥{order.payAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">订单信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>订单编号</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800">{order.orderNo}</span>
                  <button 
                    onClick={copyOrderNo}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>下单时间</span>
                <span className="text-gray-800">{formatDate(order.createdAt)}</span>
              </div>
              {order.deliveryTime && (
                <div className="flex justify-between text-gray-600">
                  <span>送达时间</span>
                  <span className="text-gray-800">{formatDate(order.deliveryTime)}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {(order.status === 'PENDING' || order.status === 'DELIVERING') && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200">
          <div className="max-w-3xl mx-auto flex gap-3">
            {order.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelOrder}
                  disabled={actionLoading}
                >
                  取消订单
                </Button>
                <Button
                  className="flex-1"
                  onClick={handlePayOrder}
                  isLoading={actionLoading}
                >
                  立即支付 ¥{order.payAmount.toFixed(2)}
                </Button>
              </>
            )}
            {order.status === 'DELIVERING' && (
              <Button
                className="flex-1"
                onClick={handleConfirmOrder}
                isLoading={actionLoading}
              >
                确认收货
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
