import { useState } from 'react'
import { Send, Bell, Megaphone } from 'lucide-react'
import { broadcastNotification } from '../api/admin'
import { useToastStore } from '../store/useToastStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Notifications() {
  const { showToast } = useToastStore()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'SYSTEM'
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('请填写通知标题和内容', 'error')
      return
    }

    setSending(true)
    try {
      const res = await broadcastNotification(formData)
      if (res.code === 200) {
        showToast('通知发送成功', 'success')
        setFormData({ title: '', content: '', type: 'SYSTEM' })
      } else {
        showToast(res.message || '发送失败', 'error')
      }
    } catch (err) {
      showToast('发送失败', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面说明 */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">系统广播通知</h2>
            <p className="text-primary-100 mt-1">
              发送通知给平台所有用户（管理员除外）
            </p>
          </div>
        </div>
      </div>

      {/* 发送表单 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="通知标题"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="请输入通知标题"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              通知内容
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="请输入通知内容..."
              rows={5}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通知类型
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="SYSTEM"
                  checked={formData.type === 'SYSTEM'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-4 h-4 text-primary-600"
                />
                <Bell className="w-4 h-4 text-blue-500" />
                <span>系统通知</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="PROMO"
                  checked={formData.type === 'PROMO'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-4 h-4 text-primary-600"
                />
                <Megaphone className="w-4 h-4 text-orange-500" />
                <span>优惠活动</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" loading={sending}>
              <Send className="w-4 h-4 mr-2" />
              发送通知
            </Button>
          </div>
        </form>
      </div>

      {/* 使用说明 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">使用说明</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
            <span>系统通知：用于发送平台公告、系统维护通知等重要信息</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
            <span>优惠活动：用于发送促销活动、优惠券等营销信息</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
            <span>通知将发送给所有普通用户和商家用户</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
