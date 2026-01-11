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
  Copy,
  Star,
  X,
  Wallet
} from 'lucide-react'
import { RiWechatPayFill, RiAlipayFill } from 'react-icons/ri'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ReviewForm from '../components/ReviewForm'
import { getOrderById, cancelOrder, confirmOrder, payOrder } from '../api/order'
import { createAlipayPayment, submitAlipayForm, createBalancePayment } from '../api/payment'
import { checkOrderReviewed } from '../api/review'
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
  const [isReviewed, setIsReviewed] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
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

  // 检查已完成订单是否已评价
  useEffect(() => {
    if (order && order.status === 'COMPLETED') {
      checkIfReviewed(order.id)
    }
  }, [order?.id, order?.status])

  const checkIfReviewed = async (orderId: number) => {
    try {
      const res = await checkOrderReviewed(orderId)
      setIsReviewed(res.data.data)
    } catch (error) {
      console.error('检查评价状态失败:', error)
    }
  }

  const handleReviewSuccess = () => {
    setShowReviewModal(false)
    setIsReviewed(true)
    toast.success('感谢您的评价!')
  }

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

  // 打开支付方式选择弹窗
  const handlePayOrder = () => {
    if (!order) return
    setShowPaymentModal(true)
  }

  // 处理支付宝支付
  const handleAlipayPayment = async () => {
    if (!order) return
    
    try {
      setActionLoading(true)
      setShowPaymentModal(false)
      
      toast.info('正在跳转到支付宝...')
      
      const result = await createAlipayPayment({
        orderId: order.id,
        amount: order.payAmount,
        paymentMethod: 'alipay'
      })
      
      if (result.success && result.alipayForm) {
        // 跳转到支付宝收银台
        submitAlipayForm(result.alipayForm)
      } else {
        toast.error('创建支付失败', result.message || '请稍后重试')
      }
    } catch (error) {
      console.error('支付宝支付失败:', error)
      toast.error('支付失败', '请稍后重试')
    } finally {
      setActionLoading(false)
    }
  }

  // 处理余额支付
  const handleBalancePayment = async () => {
    if (!order) return
    
    const userBalance = user?.balance || 0
    if (userBalance < order.payAmount) {
      toast.error('余额不足', `当前余额 ¥${userBalance.toFixed(2)}，需要 ¥${order.payAmount.toFixed(2)}`)
      return
    }
    
    const confirmed = await confirm({
      type: 'info',
      title: '余额支付',
      message: `确认使用余额支付 ¥${order.payAmount.toFixed(2)} 吗？`,
      confirmText: '确认支付',
      cancelText: '取消',
    })
    
    if (!confirmed) return
    
    try {
      setActionLoading(true)
      setShowPaymentModal(false)
      
      const result = await createBalancePayment({
        orderId: order.id,
        amount: order.payAmount,
        paymentMethod: 'balance'
      })
      
      if (result.success) {
        toast.success('支付成功', '订单已支付，请等待商家确认')
        fetchOrder(order.id)
      } else {
        toast.error('支付失败', result.message || '请稍后重试')
      }
    } catch (error) {
      console.error('余额支付失败:', error)
      toast.error('支付失败', '请稍后重试')
    } finally {
      setActionLoading(false)
    }
  }

  // 处理微信支付（模拟）
  const handleWechatPayment = async () => {
    if (!order) return
    
    const confirmed = await confirm({
      type: 'info',
      title: '微信支付',
      message: `确认支付 ¥${order.payAmount.toFixed(2)} 吗？（当前为模拟支付）`,
      confirmText: '确认支付',
      cancelText: '取消',
    })
    
    if (!confirmed) return
    
    try {
      setActionLoading(true)
      setShowPaymentModal(false)
      
      // 模拟支付延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      await payOrder(order.id)
      toast.success('支付成功', '订单已支付，请等待商家确认')
      fetchOrder(order.id)
    } catch (error) {
      console.error('微信支付失败:', error)
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
      {(order.status === 'PENDING' || order.status === 'DELIVERING' || (order.status === 'COMPLETED' && !isReviewed)) && (
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
            {order.status === 'COMPLETED' && !isReviewed && (
              <Button
                className="flex-1"
                onClick={() => setShowReviewModal(true)}
              >
                <Star className="w-4 h-4 mr-2" />
                去评价
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <ReviewForm
              orderId={order.id}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewModal(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="w-full max-w-lg bg-white rounded-t-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">选择支付方式</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Payment Amount */}
            <div className="p-4 bg-orange-50 mx-4 mt-4 rounded-xl">
              <p className="text-gray-600 text-sm">支付金额</p>
              <p className="text-2xl font-bold text-orange-500">¥{order.payAmount.toFixed(2)}</p>
            </div>

            {/* Payment Methods */}
            <div className="p-4 space-y-3">
              {/* 支付宝 */}
              <button
                onClick={handleAlipayPayment}
                disabled={actionLoading}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <RiAlipayFill className="w-7 h-7 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-800">支付宝</span>
                  <p className="text-sm text-gray-500">支持花呗、余额等多种方式</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>

              {/* 微信支付 */}
              <button
                onClick={handleWechatPayment}
                disabled={actionLoading}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <RiWechatPayFill className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">微信支付</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">模拟</span>
                  </div>
                  <p className="text-sm text-gray-500">推荐使用，安全便捷</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>

              {/* 余额支付 */}
              <button
                onClick={handleBalancePayment}
                disabled={actionLoading}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-800">余额支付</span>
                  <p className="text-sm text-gray-500">当前余额：¥{(user?.balance || 0).toFixed(2)}</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
            </div>

            {/* Safe padding for mobile */}
            <div className="h-8" />
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
