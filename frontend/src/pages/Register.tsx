import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Phone, Lock, Eye, EyeOff, Loader2, UtensilsCrossed, Check } from 'lucide-react'
import Button from '../components/ui/Button'
import { register } from '../api/user'

const Register = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.username || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('请填写完整信息')
      return false
    }

    if (formData.username.length < 2 || formData.username.length > 20) {
      setError('用户名长度应为2-20个字符')
      return false
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setError('请输入正确的手机号')
      return false
    }

    if (formData.password.length < 6) {
      setError('密码长度不能少于6位')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setError('')
      
      const res = await register({
        username: formData.username,
        phone: formData.phone,
        password: formData.password,
      })
      
      if (res.data.code === 200) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(res.data.message || '注册失败')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { level: 0, text: '', color: '' }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) return { level: 1, text: '弱', color: 'bg-red-500' }
    if (strength <= 3) return { level: 2, text: '中', color: 'bg-yellow-500' }
    return { level: 3, text: '强', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">注册成功！</h2>
          <p className="text-gray-500">正在跳转到登录页面...</p>
        </motion.div>
      </div>
    )
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
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full blur-3xl"
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">创建账号</h1>
          <p className="text-gray-500">注册新账号，探索美食世界</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="请输入用户名"
                  maxLength={20}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>
            </div>

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
                  placeholder="请输入密码（至少6位）"
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
              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full w-1/3 rounded-full transition-all ${passwordStrength.level >= 1 ? passwordStrength.color : 'bg-gray-200'}`} />
                    <div className={`h-full w-1/3 rounded-full transition-all ${passwordStrength.level >= 2 ? passwordStrength.color : 'bg-gray-200'}`} />
                    <div className={`h-full w-1/3 rounded-full transition-all ${passwordStrength.level >= 3 ? passwordStrength.color : 'bg-gray-200'}`} />
                  </div>
                  <span className={`text-xs ${passwordStrength.level === 1 ? 'text-red-500' : passwordStrength.level === 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="请再次输入密码"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">两次输入的密码不一致</p>
              )}
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
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-500">
            已有账号？
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium ml-1">
              立即登录
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
