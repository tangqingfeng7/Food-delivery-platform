import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, ShoppingCart, User, Menu, X, UtensilsCrossed, LogIn, LogOut, ClipboardList } from 'lucide-react'
import { useUserStore } from '../store/useUserStore'
import { useCartStore } from '../store/useCartStore'
import { getImageUrl } from '../api/upload'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useUserStore()
  const { items } = useCartStore()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false)
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/')
  }

  const navLinks = [
    { path: '/', label: '首页', icon: Home },
    { path: '/restaurants', label: '餐厅', icon: UtensilsCrossed },
    { path: '/cart', label: '购物车', icon: ShoppingCart, badge: cartItemCount },
    { path: '/orders', label: '订单', icon: ClipboardList },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass shadow-lg shadow-orange-500/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
            >
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-display font-bold text-gradient">
              美食速递
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </motion.div>
                  {/* Cart Badge */}
                  {link.badge !== undefined && link.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
            
            {/* User Section */}
            {isLoggedIn ? (
              <div className="relative ml-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUserMenu(!showUserMenu)
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                    {user?.avatar ? (
                      <img src={getImageUrl(user.avatar)} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="font-medium max-w-[80px] truncate">{user?.username}</span>
                </motion.button>
                
                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      >
                        <User className="w-5 h-5" />
                        <span>个人中心</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      >
                        <ClipboardList className="w-5 h-5" />
                        <span>我的订单</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-all border-t border-gray-100"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>退出登录</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="ml-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">登录</span>
                </motion.div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-orange-50 text-orange-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                          : 'text-gray-600 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                      {link.badge !== undefined && link.badge > 0 ? (
                        <span className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${
                          isActive ? 'bg-white text-orange-500' : 'bg-red-500 text-white'
                        }`}>
                          {link.badge > 99 ? '99+' : link.badge}
                        </span>
                      ) : null}
                    </Link>
                  </motion.div>
                )
              })}
              
              {/* User Section in Mobile */}
              <div className="pt-2 border-t border-gray-200/50">
                {isLoggedIn ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.1 }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-orange-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                          {user?.avatar ? (
                            <img src={getImageUrl(user.avatar)} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user?.username?.charAt(0) || 'U'
                          )}
                        </div>
                        <span className="font-medium">{user?.username}</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navLinks.length + 1) * 0.1 }}
                    >
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">退出登录</span>
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">登录 / 注册</span>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
