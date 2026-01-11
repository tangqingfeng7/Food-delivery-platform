import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, MapPin, Phone, Settings, LogOut, ChevronRight, 
  Package, Heart, CreditCard, HelpCircle, Bell, Shield, FileText
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useUserStore } from '../store/useUserStore'
import { confirm } from '../store/useConfirmStore'
import { getAddresses } from '../api/address'
import { getUnreadCount } from '../api/notification'
import { getImageUrl } from '../api/upload'
import { Address } from '../types'

const Profile = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, refreshUser } = useUserStore()
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0)

  useEffect(() => {
    if (isLoggedIn) {
      // 刷新用户信息（获取最新余额等数据）
      refreshUser()
      fetchDefaultAddress()
      fetchUnreadNotificationCount()
    }
  }, [isLoggedIn])

  const fetchDefaultAddress = async () => {
    try {
      const res = await getAddresses()
      const addresses = res.data.data
      // 找到默认地址
      const defaultAddr = addresses.find((addr: Address) => addr.isDefault)
      setDefaultAddress(defaultAddr || null)
    } catch (error) {
      console.error('获取默认地址失败:', error)
    }
  }

  const fetchUnreadNotificationCount = async () => {
    try {
      const res = await getUnreadCount()
      setUnreadNotificationCount(res.data.data)
    } catch (error) {
      console.error('获取未读通知数量失败:', error)
    }
  }

  const menuItems = [
    {
      title: '订单管理',
      items: [
        { icon: Package, label: '我的订单', path: '/orders', badge: '' },
        { icon: Heart, label: '收藏餐厅', path: '/favorites', badge: '' },
        { icon: MapPin, label: '收货地址', path: '/addresses', badge: '' },
      ],
    },
    {
      title: '账户设置',
      items: [
        { icon: CreditCard, label: '支付方式', path: '/payment', badge: '' },
        { icon: Bell, label: '消息通知', path: '/notifications', badge: unreadNotificationCount > 0 ? String(unreadNotificationCount) : '' },
        { icon: Shield, label: '账号安全', path: '/account-security', badge: '' },
      ],
    },
    {
      title: '其他',
      items: [
        { icon: HelpCircle, label: '帮助中心', path: '/help', badge: '' },
        { icon: FileText, label: '关于我们', path: '/about', badge: '' },
        { icon: Settings, label: '设置', path: '/settings', badge: '' },
      ],
    },
  ]

  const handleLogout = async () => {
    const confirmed = await confirm({
      type: 'danger',
      title: '确认退出',
      message: '确定要退出登录吗？',
      confirmText: '退出登录',
      cancelText: '取消',
    })
    
    if (confirmed) {
      logout()
      navigate('/')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">未登录</h2>
            <p className="text-gray-500 mb-8">登录后享受更多服务</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                注册
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={getImageUrl(user.avatar)} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{user?.username || '用户'}</h2>
                <div className="flex items-center gap-4 text-orange-100 text-sm">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{user?.phone || '未绑定手机'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile/edit')}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-orange-100 text-sm">优惠券</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-orange-100 text-sm">积分</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{user?.balance?.toFixed(2) || '0.00'}</p>
                <p className="text-orange-100 text-sm">余额</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* User Info - 默认地址 */}
        {defaultAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="p-4 mb-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/addresses')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">默认地址</p>
                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 text-xs">
                      默认
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">{defaultAddress.name} {defaultAddress.phone}</p>
                  <p className="text-gray-600 text-sm">{defaultAddress.address}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Menu Items */}
        {menuItems.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + sectionIndex * 0.05 }}
          >
            <Card className="mb-6 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="font-medium text-gray-800">{section.title}</h3>
              </div>
              <div>
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.button
                      key={item.label}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="flex-1 text-left text-gray-800">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-500 hover:bg-red-50"
            leftIcon={<LogOut className="w-5 h-5" />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
