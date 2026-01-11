import { useEffect, useState } from 'react'
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Star,
  TrendingUp,
  UserPlus,
  Clock,
  Percent,
  Settings,
} from 'lucide-react'
import { getStatistics, getPlatformConfig, updateDefaultPlatformRate } from '../api/admin'
import { useToastStore } from '../store/useToastStore'
import Modal from '../components/ui/Modal'
import type { Statistics, PlatformConfig } from '../types'

interface StatCardProps {
  title: string
  value: string | number
  subValue?: string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, subValue, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && (
            <p className="text-sm text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { showToast } = useToastStore()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 平台抽成设置弹窗
  const [rateModal, setRateModal] = useState(false)
  const [newRate, setNewRate] = useState('')
  const [rateLoading, setRateLoading] = useState(false)

  useEffect(() => {
    loadStatistics()
    loadPlatformConfig()
  }, [])

  const loadStatistics = async () => {
    try {
      const res = await getStatistics()
      if (res.code === 200) {
        setStatistics(res.data)
      }
    } catch (err: unknown) {
      console.error('加载统计数据失败', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPlatformConfig = async () => {
    try {
      const res = await getPlatformConfig()
      if (res.code === 200) {
        setPlatformConfig(res.data)
      }
    } catch (err: unknown) {
      console.error('加载平台配置失败', err)
    }
  }

  const handleUpdateRate = async () => {
    const rate = parseFloat(newRate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      showToast('请输入有效的抽成比例（0-100）', 'error')
      return
    }

    setRateLoading(true)
    try {
      const res = await updateDefaultPlatformRate(rate)
      if (res.code === 200) {
        showToast('平台抽成比例更新成功', 'success')
        setPlatformConfig(res.data)
        setRateModal(false)
      } else {
        showToast(res.message || '更新失败', 'error')
      }
    } catch (err: unknown) {
      showToast('更新失败', 'error')
    } finally {
      setRateLoading(false)
    }
  }

  const openRateModal = () => {
    setNewRate(platformConfig?.defaultPlatformRatePercent?.toString() || '8')
    setRateModal(true)
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '¥0.00'
    return `¥${value.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">欢迎回来，管理员</h1>
        <p className="mt-2 text-primary-100">
          这是您的管理后台控制面板，可以在这里查看平台运营数据
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总用户数"
          value={statistics?.totalUsers ?? 0}
          subValue={`今日新增 ${statistics?.newUsersToday ?? 0}`}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="餐厅数量"
          value={statistics?.totalRestaurants ?? 0}
          subValue={`营业中 ${statistics?.openRestaurants ?? 0}`}
          icon={<Store className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="总订单数"
          value={statistics?.totalOrders ?? 0}
          subValue={`待处理 ${statistics?.pendingOrders ?? 0}`}
          icon={<ShoppingBag className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
        />
        <StatCard
          title="平台总营收"
          value={formatCurrency(statistics?.totalRevenue)}
          subValue={`今日 ${formatCurrency(statistics?.todayRevenue)}`}
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      {/* 平台收入统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">平台抽成收入</h3>
            </div>
            <button
              onClick={openRateModal}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="设置抽成比例"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-orange-100 text-sm">累计抽成收入</p>
              <p className="text-3xl font-bold">{formatCurrency(statistics?.totalPlatformIncome)}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/20">
              <span className="text-orange-100">今日抽成</span>
              <span className="font-semibold">{formatCurrency(statistics?.todayPlatformIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-100">当前抽成比例</span>
              <span className="font-semibold">{platformConfig?.defaultPlatformRatePercent ?? 8}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Percent className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">抽成设置说明</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>平台抽成是指每笔订单完成后，平台从商家收入中扣除的服务费比例。</p>
            <ul className="list-disc list-inside space-y-1">
              <li>默认抽成比例：<span className="font-medium text-orange-600">{platformConfig?.defaultPlatformRatePercent ?? 8}%</span></li>
              <li>可为单独店铺设置不同的抽成比例</li>
              <li>抽成在用户支付成功后自动计算</li>
              <li>商家余额 = 订单金额 - 平台抽成</li>
            </ul>
            <button
              onClick={openRateModal}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              修改默认抽成比例
            </button>
          </div>
        </div>
      </div>

      {/* 更多统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">评价统计</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">总评价数</span>
              <span className="font-medium">{statistics?.totalReviews ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">今日新增</span>
              <span className="font-medium text-green-600">+{statistics?.newReviewsToday ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">用户活跃度</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">活跃用户</span>
              <span className="font-medium">{statistics?.activeUsers ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">活跃率</span>
              <span className="font-medium text-primary-600">
                {statistics?.totalUsers 
                  ? ((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">今日概览</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">完成订单</span>
              <span className="font-medium">{statistics?.completedOrdersToday ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">新增餐厅</span>
              <span className="font-medium text-green-600">+{statistics?.newRestaurantsToday ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/users" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-700">用户管理</span>
          </a>
          <a href="/restaurants" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Store className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-700">餐厅管理</span>
          </a>
          <a href="/orders" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Clock className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-700">订单管理</span>
          </a>
          <a href="/notifications" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-700">发送通知</span>
          </a>
        </div>
      </div>

      {/* 平台抽成设置弹窗 */}
      <Modal
        isOpen={rateModal}
        onClose={() => setRateModal(false)}
        title="设置默认平台抽成比例"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              抽成比例 (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                placeholder="请输入抽成比例"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              例如：输入 8 表示 8% 的抽成比例，平台将从每笔订单中扣除 8% 作为服务费
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>注意：</strong>修改后的抽成比例将应用于所有新创建的店铺，以及未单独设置抽成比例的现有店铺。
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setRateModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={handleUpdateRate}
              disabled={rateLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {rateLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
