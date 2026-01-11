import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Phone, MapPin, Mail, Camera, Loader2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useUserStore } from '../store/useUserStore'
import { toast } from '../store/useToastStore'
import { uploadImage, getImageUrl } from '../api/upload'
import { updateUser as updateUserApi } from '../api/user'

const ProfileEdit = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn, updateUser } = useUserStore()
  
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    address: '',
    avatar: '',
  })
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        avatar: user.avatar || '',
      })
    }
  }, [user, isLoggedIn, navigate])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      toast.warning('请输入用户名')
      return
    }

    try {
      setLoading(true)
      // 调用 API 更新用户信息
      const response = await updateUserApi(formData)
      if (response.data.code === 200) {
        // 更新本地状态
        updateUser(response.data.data)
        toast.success('保存成功', '个人资料已更新')
        navigate(-1)
      } else {
        toast.error('保存失败', response.data.message)
      }
    } catch (error: any) {
      console.error('更新失败:', error)
      toast.error('保存失败', error.response?.data?.message || '请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 点击头像触发文件选择
  const handleAvatarClick = () => {
    if (!avatarUploading) {
      avatarInputRef.current?.click()
    }
  }

  // 处理头像文件选择
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('格式错误', '仅支持 JPG、PNG、GIF、WebP 格式')
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件过大', '头像大小不能超过 5MB')
      return
    }

    try {
      setAvatarUploading(true)
      const url = await uploadImage(file)
      setFormData(prev => ({ ...prev, avatar: url }))
      toast.success('头像上传成功')
    } catch (error: any) {
      toast.error('上传失败', error.message || '请稍后重试')
    } finally {
      setAvatarUploading(false)
      // 清空 input 以便可以重复选择同一文件
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">编辑资料</h1>
        </motion.div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex flex-col items-center">
              {/* 隐藏的文件输入框 */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              <div className="relative">
                <div 
                  onClick={handleAvatarClick}
                  className={`w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:ring-4 hover:ring-orange-200 ${avatarUploading ? 'cursor-wait' : ''}`}
                >
                  {avatarUploading ? (
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  ) : formData.avatar ? (
                    <img 
                      src={getImageUrl(formData.avatar)} 
                      alt="头像" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-orange-500" />
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {avatarUploading ? '上传中...' : '点击更换头像'}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">基本信息</h3>
            <div className="space-y-4">
              <Input
                label="用户名"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                leftIcon={<User className="w-5 h-5" />}
              />
              <Input
                label="手机号"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                leftIcon={<Phone className="w-5 h-5" />}
              />
              <Input
                label="邮箱"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                leftIcon={<Mail className="w-5 h-5" />}
              />
            </div>
          </Card>
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">收货地址</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认地址
                </label>
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 focus-within:border-orange-500 transition-colors">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <textarea
                    placeholder="请输入详细收货地址"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-700 resize-none min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            isLoading={loading}
          >
            保存修改
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfileEdit
