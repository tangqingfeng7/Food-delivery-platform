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
} from 'lucide-react'
import Card from '../../components/ui/Card'
import { getMerchantStatistics, getMyRestaurant } from '../../api/merchant'
import { MerchantStatistics, Restaurant } from '../../types'

const MerchantDashboard = () => {
  const [statistics, setStatistics] = useState<MerchantStatistics | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, restaurantRes] = await Promise.all([
        getMerchantStatistics().catch(() => null),
        getMyRestaurant(),
      ])

      if (statsRes?.data.data) {
        setStatistics(statsRes.data.data)
      }
      if (restaurantRes?.data.data) {
        setRestaurant(restaurantRes.data.data)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
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
      label: '今日收入',
      value: `¥${(statistics?.todayRevenue || 0).toFixed(2)}`,
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
      label: '总收入',
      value: `¥${(statistics?.totalRevenue || 0).toFixed(2)}`,
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
    </div>
  )
}

export default MerchantDashboard
