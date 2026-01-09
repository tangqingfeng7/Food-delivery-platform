import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, MapPin, Phone, FileText, ShoppingBag, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useCartStore } from '../store/useCartStore'
import { useUserStore } from '../store/useUserStore'
import { createOrder } from '../api/order'
import { getImageUrl } from '../api/upload'
import { toast } from '../store/useToastStore'

const Cart = () => {
  const navigate = useNavigate()
  const { items, restaurantName, addItem, removeItem, deleteItem, clearCart, getTotalPrice } = useCartStore()
  const { user, isLoggedIn } = useUserStore()
  
  const [address, setAddress] = useState(user?.address || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)

  const totalPrice = getTotalPrice()
  const deliveryFee = 5 // 配送费可以从餐厅数据获取
  const finalPrice = totalPrice + deliveryFee

  const handleSubmitOrder = async () => {
    if (!isLoggedIn) {
      toast.warning('请先登录', '登录后才能下单哦')
      navigate('/login')
      return
    }

    if (!address.trim()) {
      toast.warning('请填写配送地址', '我们需要知道送餐地点')
      return
    }

    if (!phone.trim()) {
      toast.warning('请填写联系电话', '方便骑手联系您')
      return
    }

    if (items.length === 0) {
      toast.warning('购物车为空', '先去选购美食吧')
      return
    }

    try {
      setLoading(true)
      const orderData = {
        restaurantId: items[0].restaurantId,
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
        })),
        address,
        phone,
        remark,
      }

      await createOrder(orderData)
      clearCart()
      toast.success('订单创建成功！', '美食正在路上，请耐心等待')
      navigate(`/orders`)
    } catch (error) {
      console.error('创建订单失败:', error)
      toast.error('创建订单失败', '请稍后重试')
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
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">确认订单</h1>
            <p className="text-gray-500">{restaurantName}</p>
          </div>
        </motion.div>

        {/* Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              配送信息
            </h2>
            <div className="space-y-4">
              <Input
                label="配送地址"
                placeholder="请输入详细配送地址"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-5 h-5" />}
              />
              <Input
                label="联系电话"
                placeholder="请输入联系电话"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-5 h-5" />}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 focus-within:border-orange-500 transition-colors">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <textarea
                    placeholder="如有特殊要求请备注，如：少辣、不要香菜等"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-700 resize-none min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Cart Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">商品清单</h2>
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                清空购物车
              </button>
            </div>
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
                  >
                    <img
                      src={getImageUrl(item.menuItem.image)}
                      alt={item.menuItem.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{item.menuItem.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            ¥{item.menuItem.price}/份
                          </p>
                        </div>
                        <button
                          onClick={() => deleteItem(item.menuItem.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-semibold text-orange-500">
                          ¥{(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.menuItem.id)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          <span className="font-semibold text-gray-800 w-6 text-center">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addItem(item.menuItem, item.restaurantId, item.restaurantName)}
                            className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Price Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="font-semibold text-gray-800 mb-4">价格明细</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>商品金额</span>
                <span>¥{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>配送费</span>
                <span>¥{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>优惠</span>
                <span className="text-green-500">-¥0.00</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <span className="font-semibold text-gray-800">合计</span>
                <span className="text-xl font-bold text-orange-500">
                  ¥{finalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">合计</p>
            <p className="text-2xl font-bold text-orange-500">¥{finalPrice.toFixed(2)}</p>
          </div>
          <Button
            size="lg"
            onClick={handleSubmitOrder}
            isLoading={loading}
            className="min-w-[160px]"
          >
            提交订单
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Cart
