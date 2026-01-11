import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX, Pencil, Wallet } from 'lucide-react'
import { getUsers, updateUserStatus, updateUser, rechargeBalance } from '../api/admin'
import { useToastStore } from '../store/useToastStore'
import Table from '../components/ui/Table'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'
import type { User, PageResult } from '../types'

export default function Users() {
  const { showToast } = useToastStore()
  const [users, setUsers] = useState<PageResult<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    user: User | null
    action: 'enable' | 'disable'
  }>({ isOpen: false, user: null, action: 'disable' })

  // 编辑用户弹窗状态
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    user: User | null
  }>({ isOpen: false, user: null })
  const [editForm, setEditForm] = useState({
    username: '',
    phone: '',
    email: '',
    role: ''
  })
  const [editLoading, setEditLoading] = useState(false)

  // 充值弹窗状态
  const [rechargeModal, setRechargeModal] = useState<{
    isOpen: boolean
    user: User | null
  }>({ isOpen: false, user: null })
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [rechargeLoading, setRechargeLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [page, role])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await getUsers({ page, size: 10, keyword: keyword || undefined, role: role || undefined })
      if (res.code === 200) {
        setUsers(res.data)
      }
    } catch (err) {
      showToast('加载用户列表失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    loadUsers()
  }

  const handleStatusChange = async () => {
    if (!confirmDialog.user) return
    
    const enabled = confirmDialog.action === 'enable'
    try {
      const res = await updateUserStatus(confirmDialog.user.id, enabled)
      if (res.code === 200) {
        showToast(enabled ? '用户已启用' : '用户已禁用', 'success')
        loadUsers()
      } else {
        showToast(res.message || '操作失败', 'error')
      }
    } catch (err) {
      showToast('操作失败', 'error')
    }
    setConfirmDialog({ isOpen: false, user: null, action: 'disable' })
  }

  // 打开编辑弹窗
  const openEditModal = (user: User) => {
    setEditForm({
      username: user.username || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'USER'
    })
    setEditModal({ isOpen: true, user })
  }

  // 关闭编辑弹窗
  const closeEditModal = () => {
    setEditModal({ isOpen: false, user: null })
    setEditForm({ username: '', phone: '', email: '', role: '' })
  }

  // 提交编辑
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal.user) return

    setEditLoading(true)
    try {
      const res = await updateUser(editModal.user.id, editForm)
      if (res.code === 200) {
        showToast('用户信息更新成功', 'success')
        closeEditModal()
        loadUsers()
      } else {
        showToast(res.message || '更新失败', 'error')
      }
    } catch (err) {
      showToast('更新失败', 'error')
    } finally {
      setEditLoading(false)
    }
  }

  // 打开充值弹窗
  const openRechargeModal = (user: User) => {
    setRechargeAmount('')
    setRechargeModal({ isOpen: true, user })
  }

  // 关闭充值弹窗
  const closeRechargeModal = () => {
    setRechargeModal({ isOpen: false, user: null })
    setRechargeAmount('')
  }

  // 提交充值
  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rechargeModal.user) return

    const amount = parseFloat(rechargeAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('请输入有效的充值金额', 'error')
      return
    }

    setRechargeLoading(true)
    try {
      const res = await rechargeBalance(rechargeModal.user.id, amount)
      if (res.code === 200) {
        showToast(`充值成功，当前余额：¥${res.data.balance?.toFixed(2)}`, 'success')
        closeRechargeModal()
        loadUsers()
      } else {
        showToast(res.message || '充值失败', 'error')
      }
    } catch (err) {
      showToast('充值失败', 'error')
    } finally {
      setRechargeLoading(false)
    }
  }

  const columns = [
    { key: 'id', title: 'ID', width: '80px' },
    { 
      key: 'username', 
      title: '用户名',
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {record.username?.charAt(0) || '?'}
            </span>
          </div>
          <span>{record.username}</span>
        </div>
      )
    },
    { key: 'phone', title: '手机号' },
    { key: 'email', title: '邮箱' },
    { 
      key: 'role', 
      title: '角色',
      render: (value: unknown) => {
        const roleMap: Record<string, { label: string; color: string }> = {
          USER: { label: '普通用户', color: 'bg-gray-100 text-gray-600' },
          MERCHANT: { label: '商家', color: 'bg-blue-100 text-blue-600' },
          ADMIN: { label: '管理员', color: 'bg-purple-100 text-purple-600' },
        }
        const role = roleMap[value as string] || { label: value as string, color: 'bg-gray-100 text-gray-600' }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
            {role.label}
          </span>
        )
      }
    },
    { 
      key: 'enabled', 
      title: '状态',
      render: (value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {value ? '正常' : '已禁用'}
        </span>
      )
    },
    {
      key: 'balance',
      title: '余额',
      render: (value: unknown) => (
        <span className="font-medium text-orange-600">
          ¥{(value as number)?.toFixed(2) || '0.00'}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      title: '注册时间',
      render: (value: unknown) => value ? new Date(value as string).toLocaleString('zh-CN') : '-'
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(record)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="编辑"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => openRechargeModal(record)}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg"
            title="充值"
          >
            <Wallet className="w-4 h-4" />
          </button>
          {record.role !== 'ADMIN' && (
            record.enabled ? (
              <button
                onClick={() => setConfirmDialog({ isOpen: true, user: record, action: 'disable' })}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                title="禁用"
              >
                <UserX className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setConfirmDialog({ isOpen: true, user: record, action: 'enable' })}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                title="启用"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索用户名或手机号..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(0) }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全部角色</option>
            <option value="USER">普通用户</option>
            <option value="MERCHANT">商家</option>
            <option value="ADMIN">管理员</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table columns={columns} data={users?.content || []} loading={loading} />
        {users && (
          <Pagination
            page={users.page}
            totalPages={users.totalPages}
            totalElements={users.totalElements}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* 确认弹窗 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action === 'enable' ? '启用用户' : '禁用用户'}
        message={`确定要${confirmDialog.action === 'enable' ? '启用' : '禁用'}用户 "${confirmDialog.user?.username}" 吗？`}
        confirmText={confirmDialog.action === 'enable' ? '启用' : '禁用'}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmDialog({ isOpen: false, user: null, action: 'disable' })}
        variant={confirmDialog.action === 'enable' ? 'primary' : 'danger'}
      />

      {/* 编辑用户弹窗 */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        title="编辑用户"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              手机号
            </label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色
            </label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="USER">普通用户</option>
              <option value="MERCHANT">商家</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {editLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 充值弹窗 */}
      <Modal
        isOpen={rechargeModal.isOpen}
        onClose={closeRechargeModal}
        title="用户充值"
      >
        <form onSubmit={handleRechargeSubmit} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary-600">
                  {rechargeModal.user?.username?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{rechargeModal.user?.username}</p>
                <p className="text-sm text-gray-500">{rechargeModal.user?.phone}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <span className="text-sm text-gray-500">当前余额：</span>
              <span className="text-lg font-bold text-orange-600">
                ¥{rechargeModal.user?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              充值金额
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入充值金额"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[10, 20, 50, 100, 200, 500].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setRechargeAmount(amount.toString())}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 hover:border-primary-500"
              >
                ¥{amount}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeRechargeModal}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={rechargeLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {rechargeLoading ? '充值中...' : '确认充值'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
