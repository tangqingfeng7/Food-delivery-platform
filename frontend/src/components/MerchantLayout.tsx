import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ClipboardList,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
} from 'lucide-react'
import { useUserStore } from '../store/useUserStore'

const MerchantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useUserStore()

  // 检查是否登录和角色
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/merchant/login')
      return
    }
    if (user?.role !== 'MERCHANT') {
      navigate('/merchant/login')
    }
  }, [isLoggedIn, user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/merchant/login')
  }

  const navItems = [
    { path: '/merchant', label: '仪表板', icon: LayoutDashboard, exact: true },
    { path: '/merchant/shop', label: '店铺管理', icon: Store },
    { path: '/merchant/menu', label: '菜品管理', icon: UtensilsCrossed },
    { path: '/merchant/orders', label: '订单管理', icon: ClipboardList },
    { path: '/merchant/reviews', label: '评价管理', icon: MessageSquare },
  ]

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  if (!isLoggedIn || user?.role !== 'MERCHANT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 桌面端侧边栏 */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col bg-white border-r border-gray-200 z-30"
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-200 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800">商家后台</span>
              </motion.div>
            ) : (
              <motion.div
                key="mini-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center cursor-pointer"
                onClick={() => setSidebarOpen(true)}
              >
                <Store className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, item.exact)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* 用户信息和退出 */}
        <div className="p-3 border-t border-gray-200">
          <AnimatePresence>
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-3 py-2 mb-2"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium">
                  {user?.username?.charAt(0) || 'M'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{user?.username}</p>
                  <p className="text-xs text-gray-500">商家账号</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-2 mb-2"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium">
                  {user?.username?.charAt(0) || 'M'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  退出登录
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* 移动端头部 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-gray-800">商家后台</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.username?.charAt(0) || 'M'}
          </div>
        </div>
      </div>

      {/* 移动端侧边栏 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-800">商家后台</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 用户信息 */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium text-lg">
                    {user?.username?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user?.username}</p>
                    <p className="text-sm text-gray-500">商家账号</p>
                  </div>
                </div>
              </div>

              {/* 导航菜单 */}
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path, item.exact)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* 退出按钮 */}
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">退出登录</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 主内容区域 */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        } pt-16 lg:pt-0 min-h-screen`}
      >
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MerchantLayout
