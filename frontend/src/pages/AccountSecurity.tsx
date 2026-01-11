import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Lock, 
  Smartphone, 
  UserX, 
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Shield
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useUserStore } from '../store/useUserStore'
import { confirm } from '../store/useConfirmStore'
import { toast } from '../store/useToastStore'
import { changePassword, changePhone, deleteAccount } from '../api/user'

// 模态框类型
type ModalType = 'password' | 'phone' | 'delete' | null

const AccountSecurity = () => {
  const navigate = useNavigate()
  const { user, logout, setUser } = useUserStore()
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [loading, setLoading] = useState(false)

  // 修改密码表单
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 修改手机号表单
  const [phoneForm, setPhoneForm] = useState({
    password: '',
    newPhone: ''
  })
  const [showPhonePassword, setShowPhonePassword] = useState(false)

  // 注销账号表单
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    reason: ''
  })
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  // 重置表单
  const resetForms = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPhoneForm({ password: '', newPhone: '' })
    setDeleteForm({ password: '', reason: '' })
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setShowPhonePassword(false)
    setShowDeletePassword(false)
  }

  // 关闭模态框
  const closeModal = () => {
    setActiveModal(null)
    resetForms()
  }

  // 处理修改密码
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('请填写完整信息')
      return
    }

    if (passwordForm.newPassword.length < 6 || passwordForm.newPassword.length > 20) {
      toast.error('新密码长度必须在6-20位之间')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const response = await changePassword(passwordForm)
      if (response.data.code === 200) {
        toast.success('密码修改成功', '请使用新密码重新登录')
        closeModal()
        // 修改密码后需要重新登录
        logout()
        navigate('/login')
      } else {
        toast.error(response.data.message || '修改失败')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || '修改失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理修改手机号
  const handleChangePhone = async () => {
    if (!phoneForm.password || !phoneForm.newPhone) {
      toast.error('请填写完整信息')
      return
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phoneForm.newPhone)) {
      toast.error('请输入有效的手机号')
      return
    }

    setLoading(true)
    try {
      const response = await changePhone(phoneForm)
      if (response.data.code === 200) {
        toast.success('手机号修改成功')
        setUser(response.data.data)
        closeModal()
      } else {
        toast.error(response.data.message || '修改失败')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || '修改失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理注销账号
  const handleDeleteAccount = async () => {
    if (!deleteForm.password) {
      toast.error('请输入密码')
      return
    }

    // 二次确认
    const confirmed = await confirm({
      type: 'danger',
      title: '确认注销账号',
      message: '注销后您的账号将无法恢复，所有数据将被清除。确定要继续吗？',
      confirmText: '确认注销',
      cancelText: '取消',
    })

    if (!confirmed) return

    setLoading(true)
    try {
      const response = await deleteAccount(deleteForm)
      if (response.data.code === 200) {
        toast.success('账号已注销')
        logout()
        navigate('/')
      } else {
        toast.error(response.data.message || '注销失败')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || '注销失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 隐藏手机号中间4位
  const maskedPhone = user?.phone 
    ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    : '未绑定'

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
          <h1 className="text-2xl font-bold text-gray-800">账号安全</h1>
        </motion.div>

        {/* 安全提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">账号安全</p>
                <p className="text-sm text-gray-600">保护您的账号安全，定期修改密码</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 安全设置选项 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">账号设置</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {/* 修改密码 */}
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setActiveModal('password')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-800">修改密码</p>
                    <p className="text-sm text-gray-500">定期更换密码更安全</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* 修改手机号 */}
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setActiveModal('phone')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-800">修改手机号</p>
                    <p className="text-sm text-gray-500">当前手机号：{maskedPhone}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* 危险操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="mb-6 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-medium text-red-600">危险操作</h3>
            </div>
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors"
              onClick={() => setActiveModal('delete')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-red-600">注销账号</p>
                  <p className="text-sm text-gray-500">注销后无法恢复，请谨慎操作</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </motion.div>
      </div>

      {/* 模态框 */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 修改密码模态框 */}
              {activeModal === 'password' && (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">修改密码</h3>
                    <button 
                      onClick={closeModal}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        label="当前密码"
                        placeholder="请输入当前密码"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        label="新密码"
                        placeholder="请输入新密码（6-20位）"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="确认新密码"
                        placeholder="请再次输入新密码"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={closeModal}>
                      取消
                    </Button>
                    <Button className="flex-1" onClick={handleChangePassword} disabled={loading}>
                      {loading ? '提交中...' : '确认修改'}
                    </Button>
                  </div>
                </>
              )}

              {/* 修改手机号模态框 */}
              {activeModal === 'phone' && (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">修改手机号</h3>
                    <button 
                      onClick={closeModal}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">当前手机号</p>
                      <p className="text-gray-800 font-medium">{maskedPhone}</p>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPhonePassword ? 'text' : 'password'}
                        label="账号密码"
                        placeholder="请输入账号密码验证身份"
                        value={phoneForm.password}
                        onChange={(e) => setPhoneForm({ ...phoneForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhonePassword(!showPhonePassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showPhonePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <Input
                      type="tel"
                      label="新手机号"
                      placeholder="请输入新手机号"
                      value={phoneForm.newPhone}
                      onChange={(e) => setPhoneForm({ ...phoneForm, newPhone: e.target.value })}
                      maxLength={11}
                    />
                  </div>
                  <div className="p-4 border-t border-gray-100 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={closeModal}>
                      取消
                    </Button>
                    <Button className="flex-1" onClick={handleChangePhone} disabled={loading}>
                      {loading ? '提交中...' : '确认修改'}
                    </Button>
                  </div>
                </>
              )}

              {/* 注销账号模态框 */}
              {activeModal === 'delete' && (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-red-600">注销账号</h3>
                    <button 
                      onClick={closeModal}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-red-600 font-medium mb-2">注销须知</p>
                      <ul className="text-sm text-red-500 space-y-1 list-disc list-inside">
                        <li>注销后账号无法恢复</li>
                        <li>所有订单记录将被清除</li>
                        <li>账户余额及优惠券将失效</li>
                        <li>收藏的店铺和地址将被删除</li>
                      </ul>
                    </div>
                    <div className="relative">
                      <Input
                        type={showDeletePassword ? 'text' : 'password'}
                        label="账号密码"
                        placeholder="请输入密码确认注销"
                        value={deleteForm.password}
                        onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        注销原因（可选）
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                        rows={3}
                        placeholder="告诉我们您离开的原因，帮助我们改进服务"
                        value={deleteForm.reason}
                        onChange={(e) => setDeleteForm({ ...deleteForm, reason: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={closeModal}>
                      取消
                    </Button>
                    <Button 
                      className="flex-1 bg-red-500 hover:bg-red-600" 
                      onClick={handleDeleteAccount} 
                      disabled={loading}
                    >
                      {loading ? '处理中...' : '确认注销'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AccountSecurity
