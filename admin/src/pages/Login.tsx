import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Phone, Lock, Loader2 } from 'lucide-react'
import { login } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { showToast } = useToastStore()
  
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phone || !password) {
      showToast('请填写手机号和密码', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await login({ phone, password })
      
      if (res.code === 200 && res.data) {
        const { token, user } = res.data
        
        // 验证是否是管理员
        if (user.role !== 'ADMIN') {
          showToast('您没有管理员权限', 'error')
          return
        }
        
        setAuth(user, token)
        showToast('登录成功', 'success')
        navigate('/')
      } else {
        showToast(res.message || '登录失败', 'error')
      }
    } catch (err: any) {
      showToast('登录失败，请检查账号密码', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">美食速递管理后台</h1>
          <p className="text-primary-200 mt-2">请使用管理员账号登录</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  登录中...
                </>
              ) : (
                '登 录'
              )}
            </button>
          </form>

          {/* 测试账号提示 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              测试账号：13800000000 / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
