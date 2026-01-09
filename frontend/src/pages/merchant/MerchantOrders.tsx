import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  Package,
  AlertCircle,
  XCircle,
  Loader2,
  Eye,
  X,
  MapPin,
  Phone,
  MessageSquare,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  getMerchantOrders,
  getMerchantOrderById,
  getMyRestaurant,
  confirmMerchantOrder,
  startPreparingOrder,
  startDeliveringOrder,
  completeMerchantOrder,
} from '../../api/merchant'
import { toast } from '../../store/useToastStore'
import { Order, OrderStatus } from '../../types'
import { useWebSocketStore, OrderStatusMessage } from '../../store/useWebSocketStore'

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  PENDING: { label: '待支付', icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  PAID: { label: '待确认', icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  CONFIRMED: { label: '已确认', icon: CheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  PREPARING: { label: '制作中', icon: ChefHat, color: 'text-indigo-500', bgColor: 'bg-indigo-100' },
  DELIVERING: { label: '配送中', icon: Truck, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  COMPLETED: { label: '已完成', icon: Package, color: 'text-green-500', bgColor: 'bg-green-100' },
  CANCELLED: { label: '已取消', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
}

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'PAID', label: '待确认' },
  { key: 'CONFIRMED', label: '已确认' },
  { key: 'PREPARING', label: '制作中' },
  { key: 'DELIVERING', label: '配送中' },
  { key: 'COMPLETED', label: '已完成' },
]

const MerchantOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [restaurantId, setRestaurantId] = useState<number | null>(null)

  const activeTab = searchParams.get('status') || 'all'
  const { connect, disconnect, subscribeToMerchantOrders, status: wsStatus } = useWebSocketStore()

  // 获取订单列表（定义在前面以便 handleOrderMessage 可以引用）
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getMerchantOrders({
        status: activeTab !== 'all' ? activeTab : undefined,
        page,
        size: 10,
      })
      if (res.data.data) {
        setOrders(res.data.data.content)
        setTotalPages(res.data.data.totalPages)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab, page])

  // 处理 WebSocket 订单消息
  const handleOrderMessage = useCallback((message: OrderStatusMessage) => {
    console.log('商家端收到订单消息:', message)
    
    if (message.type === 'NEW_ORDER') {
      // 新订单通知
      toast.success('新订单提醒', message.message)
      // 刷新订单列表
      fetchOrders()
    } else {
      // 订单状态更新
      toast.info('订单状态更新', `订单 ${message.orderNo} 已变为「${message.statusLabel}」`)
      
      // 更新本地订单列表
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === message.orderId
            ? { ...order, status: message.newStatus as OrderStatus }
            : order
        )
      )
    }
  }, [fetchOrders])

  // 获取餐厅 ID 并连接 WebSocket
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        const res = await getMyRestaurant()
        if (res.data.data?.id) {
          setRestaurantId(res.data.data.id)
          // 连接 WebSocket（使用餐厅 ID 作为用户标识）
          connect(res.data.data.id)
        }
      } catch (error) {
        console.error('获取餐厅信息失败:', error)
      }
    }

    initWebSocket()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // WebSocket 连接成功后订阅商家订单频道
  useEffect(() => {
    if (wsStatus === 'connected' && restaurantId) {
      subscribeToMerchantOrders(restaurantId, handleOrderMessage)
    }
  }, [wsStatus, restaurantId, handleOrderMessage, subscribeToMerchantOrders])

  // 加载订单列表
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleTabChange = (tab: string) => {
    setPage(0)
    if (tab === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ status: tab })
    }
  }

  const handleViewDetail = async (order: Order) => {
    try {
      const res = await getMerchantOrderById(order.id)
      if (res.data.data) {
        setSelectedOrder(res.data.data)
        setShowDetail(true)
      }
    } catch (error) {
      toast.error('获取订单详情失败')
    }
  }

  const handleConfirmOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId)
      await confirmMerchantOrder(orderId)
      toast.success('订单已确认')
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        const res = await getMerchantOrderById(orderId)
        setSelectedOrder(res.data.data)
      }
    } catch (error: any) {
      toast.error('操作失败', error.response?.data?.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStartPreparing = async (orderId: number) => {
    try {
      setActionLoading(orderId)
      await startPreparingOrder(orderId)
      toast.success('开始制作')
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        const res = await getMerchantOrderById(orderId)
        setSelectedOrder(res.data.data)
      }
    } catch (error: any) {
      toast.error('操作失败', error.response?.data?.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStartDelivering = async (orderId: number) => {
    try {
      setActionLoading(orderId)
      await startDeliveringOrder(orderId)
      toast.success('开始配送')
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        const res = await getMerchantOrderById(orderId)
        setSelectedOrder(res.data.data)
      }
    } catch (error: any) {
      toast.error('操作失败', error.response?.data?.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteOrder = async (orderId: number) => {
    try {
      setActionLoading(orderId)
      await completeMerchantOrder(orderId)
      toast.success('订单已完成')
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        const res = await getMerchantOrderById(orderId)
        setSelectedOrder(res.data.data)
      }
    } catch (error: any) {
      toast.error('操作失败', error.response?.data?.message)
    } finally {
      setActionLoading(null)
    }
  }

  const renderActionButton = (order: Order) => {
    const isLoading = actionLoading === order.id

    switch (order.status) {
      case 'PAID':
        return (
          <Button
            size="sm"
            onClick={() => handleConfirmOrder(order.id)}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '确认订单'}
          </Button>
        )
      case 'CONFIRMED':
        return (
          <Button
            size="sm"
            onClick={() => handleStartPreparing(order.id)}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '开始制作'}
          </Button>
        )
      case 'PREPARING':
        return (
          <Button
            size="sm"
            onClick={() => handleStartDelivering(order.id)}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '开始配送'}
          </Button>
        )
      case 'DELIVERING':
        return (
          <Button
            size="sm"
            onClick={() => handleCompleteOrder(order.id)}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '完成订单'}
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">订单管理</h1>
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
          <p className="text-gray-500 mt-1">查看和处理店铺订单</p>
        </div>
        <button
          onClick={() => fetchOrders()}
          className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          title="刷新订单"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 状态筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 订单列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无订单</h3>
          <p className="text-gray-500">当前筛选条件下没有订单</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">订单号: {order.orderNo}</p>
                      <p className="text-sm text-gray-500 mt-1">{order.createdAt}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  </div>

                  {/* 订单项 */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.menuItemImage ? (
                            <img
                              src={item.menuItemImage}
                              alt={item.menuItemName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.menuItemName}</p>
                          <p className="text-sm text-gray-500">¥{item.price} x {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 收货信息 */}
                  <div className="py-3 border-t border-gray-100 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{order.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.phone}</span>
                    </div>
                    {order.remark && (
                      <div className="flex items-start gap-2 mt-1">
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-orange-600">{order.remark}</span>
                      </div>
                    )}
                  </div>

                  {/* 底部操作 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-gray-500">实付金额：</span>
                      <span className="text-lg font-bold text-orange-500">¥{order.payAmount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看详情
                      </Button>
                      {renderActionButton(order)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-lg transition-all ${
                page === i
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* 订单详情弹窗 */}
      <AnimatePresence>
        {showDetail && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">订单详情</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* 订单状态 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">订单状态</span>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusConfig[selectedOrder.status].bgColor} ${statusConfig[selectedOrder.status].color}`}>
                    {(() => {
                      const StatusIcon = statusConfig[selectedOrder.status].icon
                      return <StatusIcon className="w-4 h-4" />
                    })()}
                    <span className="text-sm font-medium">{statusConfig[selectedOrder.status].label}</span>
                  </div>
                </div>

                {/* 订单信息 */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">订单号</span>
                    <span className="text-gray-800">{selectedOrder.orderNo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">下单时间</span>
                    <span className="text-gray-800">{selectedOrder.createdAt}</span>
                  </div>
                </div>

                {/* 订单商品 */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">订单商品</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.menuItemImage ? (
                            <img
                              src={item.menuItemImage}
                              alt={item.menuItemName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.menuItemName}</p>
                          <p className="text-sm text-gray-500">¥{item.price} x {item.quantity}</p>
                        </div>
                        <span className="font-medium text-gray-800">
                          ¥{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 收货信息 */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">收货信息</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.phone}</span>
                    </div>
                    {selectedOrder.remark && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-orange-600">{selectedOrder.remark}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 金额明细 */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">金额明细</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">商品总额</span>
                      <span className="text-gray-800">¥{selectedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">配送费</span>
                      <span className="text-gray-800">¥{selectedOrder.deliveryFee}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">优惠</span>
                        <span className="text-green-500">-¥{selectedOrder.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium text-gray-800">实付金额</span>
                      <span className="font-bold text-orange-500">¥{selectedOrder.payAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部操作 */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                {renderActionButton(selectedOrder)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MerchantOrders
