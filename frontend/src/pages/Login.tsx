import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, Lock, Eye, EyeOff, Loader2, UtensilsCrossed } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { login } from '../api/user'
import { useUserStore } from '../store/useUserStore'

const Login = () => {
  const navigate = useNavigate()
  const { login: storeLogin } = useUserStore()
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.phone || !formData.password) {
      setError('请填写完整信息')
      return
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setError('请输入正确的手机号')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const res = await login(formData)
      
      if (res.data.code === 200) {
        const { token, user } = res.data.data
        storeLogin(user, token)
        navigate('/')
      } else {
        setError(res.data.message || '登录失败')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-gradient">美食速递</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
          <p className="text-gray-500">登录您的账号，开始点餐</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="请输入手机号"
                  maxLength={11}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {/* Demo Account */}
          <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-100">
            <p className="text-sm text-orange-700 font-medium mb-2">测试账号</p>
            <p className="text-sm text-orange-600">手机号: 13800138001</p>
            <p className="text-sm text-orange-600">密码: 123456</p>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            还没有账号？
            <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium ml-1">
              立即注册
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
