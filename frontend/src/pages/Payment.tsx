import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Wallet } from 'lucide-react'
import { RiWechatPayFill, RiAlipayFill } from 'react-icons/ri'
import Card from '../components/ui/Card'
import { useUserStore } from '../store/useUserStore'
import { toast } from '../store/useToastStore'

// 支付方式类型
type PaymentMethod = 'wechat' | 'alipay' | 'balance'

interface PaymentOption {
  id: PaymentMethod
  name: string
  icon: string
  color: string
  bgColor: string
  description: string
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'wechat',
    name: '微信支付',
    icon: '/icons/wechat-pay.svg',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: '推荐使用，安全便捷',
  },
  {
    id: 'alipay',
    name: '支付宝',
    icon: '/icons/alipay.svg',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: '支持花呗、余额等多种方式',
  },
  {
    id: 'balance',
    name: '余额支付',
    icon: '',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: '使用账户余额支付',
  },
]

const Payment = () => {
  const navigate = useNavigate()
  const { isLoggedIn } = useUserStore()
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('wechat')

  // 模拟用户余额
  const userBalance = 0.00

  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedPayment(method)
    toast.success('设置成功', `已将 ${paymentOptions.find(p => p.id === method)?.name} 设为默认支付方式`)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">请先登录</h2>
            <p className="text-gray-500 mb-8">登录后管理您的支付方式</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              去登录
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
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
          <h1 className="text-2xl font-bold text-gray-800">支付方式</h1>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">选择默认支付方式</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {paymentOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => handleSelectPayment(option.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl ${option.bgColor} flex items-center justify-center`}>
                    {option.id === 'wechat' && (
                      <RiWechatPayFill className="w-7 h-7 text-green-500" />
                    )}
                    {option.id === 'alipay' && (
                      <RiAlipayFill className="w-7 h-7 text-blue-500" />
                    )}
                    {option.id === 'balance' && (
                      <Wallet className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{option.name}</span>
                      {option.id === 'wechat' && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded">推荐</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {option.id === 'balance' 
                        ? `当前余额：¥${userBalance.toFixed(2)}`
                        : option.description}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedPayment === option.id 
                      ? 'border-orange-500 bg-orange-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedPayment === option.id && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Balance Recharge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">账户余额</h3>
                <p className="text-2xl font-bold text-orange-500 mt-1">¥{userBalance.toFixed(2)}</p>
              </div>
              <button
                onClick={() => toast.info('充值功能', '充值功能即将上线')}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm"
              >
                充值
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="p-4 bg-blue-50 border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">支付安全提示</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- 请勿向他人透露支付密码和验证码</li>
              <li>- 我们不会以任何理由要求您转账</li>
              <li>- 如遇可疑情况请及时联系客服</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Payment
