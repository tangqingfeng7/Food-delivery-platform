import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, MapPin, Phone, FileText, ShoppingBag, ArrowLeft, Store, ChevronRight, ChevronDown, ChevronUp, Wallet, Check } from 'lucide-react'
import { RiWechatPayFill, RiAlipayFill } from 'react-icons/ri'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useCartStore } from '../store/useCartStore'
import { useUserStore } from '../store/useUserStore'
import { createOrder } from '../api/order'
import { getCurrentUser } from '../api/user'
import { getRestaurantById } from '../api/restaurant'
import { getImageUrl } from '../api/upload'
import { createPayment, PaymentMethod } from '../api/payment'
import { toast } from '../store/useToastStore'
import { Restaurant } from '../types'

// 每个店铺的配送信息
interface RestaurantDeliveryInfo {
  address: string
  phone: string
  remark: string
}

const Cart = () => {
  const navigate = useNavigate()
  const { 
    items, 
    addItem, 
    removeItem, 
    deleteItem, 
    clearCart, 
    clearRestaurantCart,
    getTotalPrice, 
    getCartByRestaurant 
  } = useCartStore()
  const { user, isLoggedIn, setUser } = useUserStore()
  
  const [loading, setLoading] = useState(false)
  const [restaurantDetails, setRestaurantDetails] = useState<Map<number, Restaurant>>(new Map())
  // 每个店铺的配送信息
  const [deliveryInfoMap, setDeliveryInfoMap] = useState<Map<number, RestaurantDeliveryInfo>>(new Map())
  // 展开/收起配送信息
  const [expandedDelivery, setExpandedDelivery] = useState<Set<number>>(new Set())
  // 支付方式
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat')
  // 用户余额
  const userBalance = user?.balance || 0

  const restaurantCarts = getCartByRestaurant()
  const totalPrice = getTotalPrice()

  // 初始化每个店铺的配送信息
  useEffect(() => {
    const newMap = new Map<number, RestaurantDeliveryInfo>()
    restaurantCarts.forEach(cart => {
      if (!deliveryInfoMap.has(cart.restaurantId)) {
        newMap.set(cart.restaurantId, {
          address: user?.address || '',
          phone: user?.phone || '',
          remark: '',
        })
      } else {
        newMap.set(cart.restaurantId, deliveryInfoMap.get(cart.restaurantId)!)
      }
    })
    if (newMap.size !== deliveryInfoMap.size || 
        [...newMap.keys()].some(k => !deliveryInfoMap.has(k))) {
      setDeliveryInfoMap(newMap)
      // 默认展开第一个店铺的配送信息
      if (restaurantCarts.length > 0 && expandedDelivery.size === 0) {
        setExpandedDelivery(new Set([restaurantCarts[0].restaurantId]))
      }
    }
  }, [restaurantCarts, user])

  // 更新指定店铺的配送信息
  const updateDeliveryInfo = (restaurantId: number, field: keyof RestaurantDeliveryInfo, value: string) => {
    const newMap = new Map(deliveryInfoMap)
    const info = newMap.get(restaurantId) || { address: '', phone: '', remark: '' }
    newMap.set(restaurantId, { ...info, [field]: value })
    setDeliveryInfoMap(newMap)
  }

  // 切换配送信息展开/收起
  const toggleDeliveryExpand = (restaurantId: number) => {
    const newSet = new Set(expandedDelivery)
    if (newSet.has(restaurantId)) {
      newSet.delete(restaurantId)
    } else {
      newSet.add(restaurantId)
    }
    setExpandedDelivery(newSet)
  }

  // 获取各个餐厅的详细信息（配送费、起送价等）
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      const uniqueRestaurantIds = [...new Set(items.map(item => item.restaurantId))]
      const details = new Map<number, Restaurant>()
      
      for (const id of uniqueRestaurantIds) {
        try {
          const res = await getRestaurantById(id)
          details.set(id, res.data.data)
        } catch (error) {
          console.error(`获取餐厅 ${id} 信息失败:`, error)
        }
      }
      
      setRestaurantDetails(details)
    }

    if (items.length > 0) {
      fetchRestaurantDetails()
    }
  }, [items])

  // 计算总配送费
  const getTotalDeliveryFee = () => {
    let total = 0
    restaurantCarts.forEach(cart => {
      const restaurant = restaurantDetails.get(cart.restaurantId)
      if (restaurant) {
        total += restaurant.deliveryFee
      }
    })
    return total
  }

  // 计算最终价格
  const finalPrice = totalPrice + getTotalDeliveryFee()

  // 检查是否所有店铺都满足起送价
  const checkMinOrder = () => {
    for (const cart of restaurantCarts) {
      const restaurant = restaurantDetails.get(cart.restaurantId)
      if (restaurant && cart.totalPrice < restaurant.minOrder) {
        return false
      }
    }
    return true
  }

  // 获取未满足起送价的店铺列表
  const getUnmetMinOrderRestaurants = () => {
    const unmet: { name: string; current: number; required: number }[] = []
    restaurantCarts.forEach(cart => {
      const restaurant = restaurantDetails.get(cart.restaurantId)
      if (restaurant && cart.totalPrice < restaurant.minOrder) {
        unmet.push({
          name: cart.restaurantName,
          current: cart.totalPrice,
          required: restaurant.minOrder,
        })
      }
    })
    return unmet
  }

  // 验证配送信息
  const validateDeliveryInfo = () => {
    for (const cart of restaurantCarts) {
      const info = deliveryInfoMap.get(cart.restaurantId)
      if (!info?.address?.trim()) {
        toast.warning('请填写配送地址', `${cart.restaurantName} 的配送地址不能为空`)
        setExpandedDelivery(new Set([...expandedDelivery, cart.restaurantId]))
        return false
      }
      if (!info?.phone?.trim()) {
        toast.warning('请填写联系电话', `${cart.restaurantName} 的联系电话不能为空`)
        setExpandedDelivery(new Set([...expandedDelivery, cart.restaurantId]))
        return false
      }
    }
    return true
  }

  // 获取支付方式名称
  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'wechat': return '微信支付'
      case 'alipay': return '支付宝'
      case 'balance': return '余额支付'
    }
  }

  const handleSubmitOrder = async () => {
    if (!isLoggedIn) {
      toast.warning('请先登录', '登录后才能下单哦')
      navigate('/login')
      return
    }

    if (items.length === 0) {
      toast.warning('购物车为空', '先去选购美食吧')
      return
    }

    // 验证配送信息
    if (!validateDeliveryInfo()) {
      return
    }

    // 检查起送价
    const unmet = getUnmetMinOrderRestaurants()
    if (unmet.length > 0) {
      toast.warning(
        '未满足起送价',
        `${unmet[0].name} 还差 ¥${(unmet[0].required - unmet[0].current).toFixed(2)} 起送`
      )
      return
    }

    // 余额支付检查余额是否足够
    if (paymentMethod === 'balance' && userBalance < finalPrice) {
      toast.warning('余额不足', `当前余额 ¥${userBalance.toFixed(2)}，需要 ¥${finalPrice.toFixed(2)}`)
      return
    }

    try {
      setLoading(true)
      
      // 为每个店铺创建订单
      const orderResults = await Promise.all(
        restaurantCarts.map(cart => {
          const info = deliveryInfoMap.get(cart.restaurantId) || { address: '', phone: '', remark: '' }
          const orderData = {
            restaurantId: cart.restaurantId,
            items: cart.items.map(item => ({
              menuItemId: item.menuItem.id,
              quantity: item.quantity,
            })),
            address: info.address,
            phone: info.phone,
            remark: info.remark,
          }
          return createOrder(orderData)
        })
      )

      // 获取创建的订单ID
      const orderIds = orderResults.map(res => res.data?.data?.id || 0).filter(id => id > 0)
      
      // 对每个订单调用支付接口
      for (const orderId of orderIds) {
        const paymentResult = await createPayment({
          orderId: orderId,
          amount: finalPrice / orderIds.length,
          paymentMethod: paymentMethod,
        })

        if (!paymentResult.success) {
          throw new Error(paymentResult.message || '支付失败')
        }
      }

      // 刷新用户信息以更新余额
      try {
        const userRes = await getCurrentUser()
        if (userRes.data?.data) {
          setUser(userRes.data.data)
        }
      } catch (e) {
        console.error('刷新用户信息失败:', e)
      }

      clearCart()
      
      // 支付成功提示
      if (restaurantCarts.length > 1) {
        toast.success('支付成功！', `${getPaymentMethodName()}支付 ¥${finalPrice.toFixed(2)}，已创建 ${restaurantCarts.length} 个订单`)
      } else {
        toast.success('支付成功！', `${getPaymentMethodName()}支付 ¥${finalPrice.toFixed(2)}，美食正在路上`)
      }
      
      navigate('/orders')
    } catch (error) {
      console.error('支付失败:', error)
      toast.error('支付失败', '请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">购物车是空的</h2>
            <p className="text-gray-500 mb-8">快去选购心仪的美食吧</p>
            <Button onClick={() => navigate('/restaurants')}>
              去逛逛
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">确认订单</h1>
            <p className="text-gray-500 text-sm">
              {restaurantCarts.length > 1 
                ? `${restaurantCarts.length} 个店铺 · ${items.reduce((sum, item) => sum + item.quantity, 0)} 件商品` 
                : `${items.reduce((sum, item) => sum + item.quantity, 0)} 件商品`}
            </p>
          </div>
        </motion.div>

        {/* Cart Items by Restaurant */}
        {restaurantCarts.map((cart, cartIndex) => {
          const restaurant = restaurantDetails.get(cart.restaurantId)
          const meetsMinOrder = restaurant ? cart.totalPrice >= restaurant.minOrder : true
          const deliveryInfo = deliveryInfoMap.get(cart.restaurantId) || { address: '', phone: '', remark: '' }
          const isExpanded = expandedDelivery.has(cart.restaurantId)
          
          return (
            <motion.div
              key={cart.restaurantId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + cartIndex * 0.1 }}
            >
              <Card className="mb-4 overflow-hidden">
                {/* Restaurant Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:text-orange-500 transition-colors"
                      onClick={() => navigate(`/restaurant/${cart.restaurantId}`)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{cart.restaurantName}</h3>
                        {restaurant && (
                          <p className="text-xs text-gray-500">
                            配送费 ¥{restaurant.deliveryFee} · 起送 ¥{restaurant.minOrder}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <button
                      onClick={() => clearRestaurantCart(cart.restaurantId)}
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      清空
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4">
                  <AnimatePresence>
                    {cart.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="flex gap-3 py-3 border-b border-gray-100 last:border-0"
                      >
                        <img
                          src={getImageUrl(item.menuItem.image)}
                          alt={item.menuItem.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-800 text-sm truncate">{item.menuItem.name}</h4>
                            <button
                              onClick={() => deleteItem(item.menuItem.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-orange-500 text-sm">
                              ¥{(item.menuItem.price * item.quantity).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeItem(item.menuItem.id)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </motion.button>
                              <span className="font-semibold text-gray-800 w-5 text-center text-sm">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => addItem(item.menuItem, item.restaurantId, item.restaurantName)}
                                className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Delivery Info */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => toggleDeliveryExpand(cart.restaurantId)}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">配送信息</span>
                      {deliveryInfo.address && (
                        <span className="text-gray-400 truncate max-w-[150px]">
                          · {deliveryInfo.address}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          <div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 focus-within:border-orange-500 transition-colors">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="请输入配送地址"
                                value={deliveryInfo.address}
                                onChange={(e) => updateDeliveryInfo(cart.restaurantId, 'address', e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 focus-within:border-orange-500 transition-colors">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="请输入联系电话"
                                value={deliveryInfo.phone}
                                onChange={(e) => updateDeliveryInfo(cart.restaurantId, 'phone', e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-gray-200 focus-within:border-orange-500 transition-colors">
                              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                              <textarea
                                placeholder="备注（选填）：少辣、不要香菜等"
                                value={deliveryInfo.remark}
                                onChange={(e) => updateDeliveryInfo(cart.restaurantId, 'remark', e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm text-gray-700 resize-none min-h-[50px]"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Restaurant Subtotal */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">小计</span>
                    <span className="font-semibold text-gray-800">¥{cart.totalPrice.toFixed(2)}</span>
                  </div>
                  {restaurant && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">配送费</span>
                      <span className="text-gray-500">+¥{restaurant.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {!meetsMinOrder && restaurant && (
                    <p className="text-xs text-red-500 mt-2">
                      还差 ¥{(restaurant.minOrder - cart.totalPrice).toFixed(2)} 起送
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + restaurantCarts.length * 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">支付方式</h3>
            </div>
            <div className="p-2">
              {/* 微信支付 */}
              <button
                onClick={() => setPaymentMethod('wechat')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <RiWechatPayFill className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">微信支付</span>
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded">推荐</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  paymentMethod === 'wechat' 
                    ? 'border-orange-500 bg-orange-500' 
                    : 'border-gray-300'
                }`}>
                  {paymentMethod === 'wechat' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>

              {/* 支付宝 */}
              <button
                onClick={() => setPaymentMethod('alipay')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <RiAlipayFill className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-800">支付宝</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  paymentMethod === 'alipay' 
                    ? 'border-orange-500 bg-orange-500' 
                    : 'border-gray-300'
                }`}>
                  {paymentMethod === 'alipay' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>

              {/* 余额支付 */}
              <button
                onClick={() => setPaymentMethod('balance')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-800">余额支付</span>
                  <p className="text-xs text-gray-500">当前余额: ¥{userBalance.toFixed(2)}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  paymentMethod === 'balance' 
                    ? 'border-orange-500 bg-orange-500' 
                    : 'border-gray-300'
                }`}>
                  {paymentMethod === 'balance' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Price Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + restaurantCarts.length * 0.1 }}
          className="mt-4"
        >
          <Card className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>商品金额</span>
                <span>¥{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>配送费 ({restaurantCarts.length} 个店铺)</span>
                <span>¥{getTotalDeliveryFee().toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between">
                <span className="font-semibold text-gray-800">合计</span>
                <span className="text-lg font-bold text-orange-500">
                  ¥{finalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Multi-order notice */}
        {restaurantCarts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + restaurantCarts.length * 0.1 }}
            className="mt-4 p-3 bg-orange-50 rounded-xl text-xs text-orange-700"
          >
            您选择了 {restaurantCarts.length} 个店铺的商品，提交后将分别创建 {restaurantCarts.length} 个订单
          </motion.div>
        )}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
              <span>合计</span>
              <span className="text-gray-400">|</span>
              <span>{getPaymentMethodName()}</span>
            </div>
            <p className="text-xl font-bold text-orange-500">¥{finalPrice.toFixed(2)}</p>
          </div>
          <Button
            size="lg"
            onClick={handleSubmitOrder}
            isLoading={loading}
            disabled={!checkMinOrder() || (paymentMethod === 'balance' && userBalance < finalPrice)}
            className="min-w-[140px]"
          >
            {loading ? '支付中...' : '确认支付'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Cart
