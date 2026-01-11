import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  ChefHat,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Store,
  Wallet,
  ArrowDownToLine,
  X,
  Percent,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import { getMerchantStatistics, getMyRestaurant, getMerchantBalance, withdrawBalance } from '../../api/merchant'
import { MerchantStatistics, Restaurant } from '../../types'
import { toast } from '../../store/useToastStore'

const MerchantDashboard = () => {
  const [statistics, setStatistics] = useState<MerchantStatistics | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, restaurantRes, balanceRes] = await Promise.all([
        getMerchantStatistics().catch(() => null),
        getMyRestaurant(),
        getMerchantBalance().catch(() => null),
      ])

      if (statsRes?.data.data) {
        setStatistics(statsRes.data.data)
      }
      if (restaurantRes?.data.data) {
        setRestaurant(restaurantRes.data.data)
      }
      if (balanceRes?.data.data) {
        setBalance(balanceRes.data.data.balance || 0)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('提现失败', '请输入有效的提现金额')
      return
    }
    if (amount > balance) {
      toast.error('提现失败', '提现金额不能超过可用余额')
      return
    }

    try {
      setWithdrawing(true)
      const res = await withdrawBalance({ amount })
      if (res.data.code === 200) {
        toast.success('提现成功', '提现申请已提交')
        setBalance(res.data.data?.remainingBalance || 0)
        setShowWithdrawModal(false)
        setWithdrawAmount('')
      } else {
        toast.error('提现失败', res.data.message || '请稍后重试')
      }
    } catch {
      toast.error('提现失败', '请稍后重试')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    )
  }

  // 如果没有店铺，显示创建店铺提示
  if (!restaurant) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">欢迎入驻</h2>
            <p className="text-gray-500 mb-6">
              您还没有创建店铺，创建店铺后即可开始接单经营
            </p>
            <Link
              to="/merchant/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              创建店铺
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Card>
        </motion.div>
      </div>
    )
  }

  const statCards = [
    {
      label: '今日订单',
      value: statistics?.todayOrders || 0,
      icon: ShoppingBag,
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
    },
    {
      label: '今日实际收入',
      value: `¥${(statistics?.todayIncome || 0).toFixed(2)}`,
      subValue: `营业额 ¥${(statistics?.todayRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-50',
    },
    {
      label: '总订单数',
      value: statistics?.totalOrders || 0,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50',
    },
    {
      label: '累计实际收入',
      value: `¥${(statistics?.totalIncome || 0).toFixed(2)}`,
      subValue: `营业额 ¥${(statistics?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'orange',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-50',
    },
  ]

  const orderStatusCards = [
    {
      label: '待确认',
      value: statistics?.paidOrders || 0,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      link: '/merchant/orders?status=PAID',
    },
    {
      label: '制作中',
      value: statistics?.preparingOrders || 0,
      icon: ChefHat,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      link: '/merchant/orders?status=PREPARING',
    },
    {
      label: '配送中',
      value: statistics?.deliveringOrders || 0,
      icon: Truck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      link: '/merchant/orders?status=DELIVERING',
    },
    {
      label: '已完成',
      value: statistics?.completedOrders || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      link: '/merchant/orders?status=COMPLETED',
    },
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">仪表板</h1>
          <p className="text-gray-500 mt-1">欢迎回来，{restaurant.name}</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          restaurant.isOpen 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {restaurant.isOpen ? '营业中' : '休息中'}
        </div>
      </div>

      {/* 店铺余额卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm opacity-90">店铺余额</span>
              </div>
              <p className="text-3xl font-bold">¥{balance.toFixed(2)}</p>
              <p className="text-sm opacity-75 mt-1">用户支付后自动到账</p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
            >
              <ArrowDownToLine className="w-5 h-5" />
              <span>提现</span>
            </button>
          </div>
        </Card>
      </motion.div>

      {/* 平台抽成信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">平台服务费</p>
                <p className="text-lg font-bold">抽成比例：{statistics?.platformRatePercent || 8}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">今日抽成</p>
              <p className="text-xl font-bold">¥{(statistics?.todayPlatformFee || 0).toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">累计 ¥{(statistics?.totalPlatformFee || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    {'subValue' in stat && stat.subValue && (
                      <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.lightBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.bgColor.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* 订单状态概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">订单状态</h2>
            <Link
              to="/merchant/orders"
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {orderStatusCards.map((status) => {
              const Icon = status.icon
              return (
                <Link
                  key={status.label}
                  to={status.link}
                  className={`${status.bgColor} rounded-xl p-4 hover:shadow-md transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${status.color}`} />
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{status.value}</p>
                      <p className="text-sm text-gray-500">{status.label}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* 菜品概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">菜品统计</h2>
              <Link
                to="/merchant/menu"
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                管理菜品
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-gray-800">{statistics?.totalMenuItems || 0}</p>
                <p className="text-sm text-gray-500">菜品总数</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-green-600">{statistics?.availableMenuItems || 0}</p>
                <p className="text-sm text-gray-500">上架菜品</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 店铺信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">店铺信息</h2>
              <Link
                to="/merchant/shop"
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                编辑店铺
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Store className="w-8 h-8 text-blue-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{restaurant.name}</p>
                <p className="text-sm text-gray-500 truncate">{restaurant.address}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {restaurant.openTime} - {restaurant.closeTime}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 提现弹窗 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">余额提现</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">可提现余额</label>
                <p className="text-2xl font-bold text-emerald-600">¥{balance.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">提现金额</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="请输入提现金额"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setWithdrawAmount(balance.toString())}
                  className="text-sm text-emerald-600 hover:text-emerald-700 mt-2"
                >
                  全部提现
                </button>
              </div>

              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>提示：</strong>提现功能为预留接口，实际提现需要接入第三方支付。
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing || !withdrawAmount}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {withdrawing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    '确认提现'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}

export default MerchantDashboard
