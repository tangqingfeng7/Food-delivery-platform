import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { queryAlipayPaymentStatus } from '../api/payment'
import { toast } from '../store/useToastStore'

// 支付状态类型
type PaymentStatus = 'loading' | 'success' | 'failed' | 'pending'

const PaymentResult = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<PaymentStatus>('loading')
  const [retryCount, setRetryCount] = useState(0)
  
  const orderNo = searchParams.get('orderNo')
  
  // 最大重试次数
  const MAX_RETRY = 5
  // 轮询间隔（毫秒）
  const POLL_INTERVAL = 2000

  useEffect(() => {
    if (!orderNo) {
      setStatus('failed')
      return
    }

    checkPaymentStatus()
  }, [orderNo])

  // 查询支付状态
  const checkPaymentStatus = async () => {
    if (!orderNo) return

    try {
      const result = await queryAlipayPaymentStatus(orderNo)
      
      if (result.paid) {
        setStatus('success')
        toast.success('支付成功')
      } else if (result.status === 'TRADE_CLOSED' || result.status === 'TRADE_FINISHED') {
        setStatus('failed')
      } else if (retryCount < MAX_RETRY) {
        // 支付可能还在处理中，继续轮询
        setStatus('pending')
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          checkPaymentStatus()
        }, POLL_INTERVAL)
      } else {
        // 超过最大重试次数
        setStatus('pending')
      }
    } catch (error) {
      console.error('查询支付状态失败:', error)
      if (retryCount < MAX_RETRY) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          checkPaymentStatus()
        }, POLL_INTERVAL)
      } else {
        setStatus('failed')
      }
    }
  }

  // 手动刷新状态
  const handleRefresh = () => {
    setStatus('loading')
    setRetryCount(0)
    checkPaymentStatus()
  }

  // 跳转到订单列表
  const handleViewOrders = () => {
    navigate('/orders')
  }

  // 继续购物
  const handleContinueShopping = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-md mx-auto px-4">
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
          <h1 className="text-2xl font-bold text-gray-800">支付结果</h1>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 text-center">
            {/* Loading State */}
            {status === 'loading' && (
              <div className="py-8">
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  正在查询支付结果...
                </h2>
                <p className="text-gray-500">请稍候</p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  支付成功
                </h2>
                <p className="text-gray-500 mb-8">
                  订单号：{orderNo}
                </p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleViewOrders}>
                    查看订单
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleContinueShopping}>
                    继续购物
                  </Button>
                </div>
              </div>
            )}

            {/* Failed State */}
            {status === 'failed' && (
              <div className="py-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  支付失败
                </h2>
                <p className="text-gray-500 mb-8">
                  {orderNo ? '支付未成功，请重试' : '订单信息不完整'}
                </p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleViewOrders}>
                    返回订单
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleContinueShopping}>
                    返回首页
                  </Button>
                </div>
              </div>
            )}

            {/* Pending State */}
            {status === 'pending' && (
              <div className="py-8">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-12 h-12 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  等待支付结果
                </h2>
                <p className="text-gray-500 mb-4">
                  支付可能还在处理中
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  如果您已完成支付，请点击刷新按钮查询最新状态
                </p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新状态
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleViewOrders}>
                    查看订单
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="p-4 bg-blue-50 border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">温馨提示</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- 如支付成功但页面显示失败，请稍后刷新或查看订单</li>
              <li>- 支付遇到问题请联系客服处理</li>
              <li>- 请勿重复支付同一订单</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentResult
