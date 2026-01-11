import { useEffect, useState } from 'react'
import { Search, Store, Pencil, Percent } from 'lucide-react'
import { getRestaurants, updateRestaurantStatus, updateRestaurant, getCategories, updateRestaurantPlatformRate } from '../api/admin'
import { useToastStore } from '../store/useToastStore'
import Table from '../components/ui/Table'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'
import type { Restaurant, PageResult, Category } from '../types'

export default function Restaurants() {
  const { showToast } = useToastStore()
  const [restaurants, setRestaurants] = useState<PageResult<Restaurant> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    restaurant: Restaurant | null
    action: 'open' | 'close'
  }>({ isOpen: false, restaurant: null, action: 'close' })

  // 编辑餐厅弹窗状态
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    restaurant: Restaurant | null
  }>({ isOpen: false, restaurant: null })
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    deliveryFee: 0,
    minOrder: 0,
    deliveryTime: '',
    categoryId: 0,
    isFeatured: false,
    tags: ''
  })
  const [editLoading, setEditLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // 抽成比例设置弹窗
  const [rateModal, setRateModal] = useState<{
    isOpen: boolean
    restaurant: Restaurant | null
  }>({ isOpen: false, restaurant: null })
  const [newRate, setNewRate] = useState('')
  const [rateLoading, setRateLoading] = useState(false)

  useEffect(() => {
    loadRestaurants()
    loadCategories()
  }, [page])

  const loadCategories = async () => {
    try {
      const res = await getCategories()
      if (res.code === 200) {
        setCategories(res.data)
      }
    } catch (err) {
      // 忽略错误
    }
  }

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const res = await getRestaurants({ page, size: 10, keyword: keyword || undefined })
      if (res.code === 200) {
        setRestaurants(res.data)
      }
    } catch (err) {
      showToast('加载餐厅列表失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    loadRestaurants()
  }

  const handleStatusChange = async () => {
    if (!confirmDialog.restaurant) return
    
    const isOpen = confirmDialog.action === 'open'
    try {
      const res = await updateRestaurantStatus(confirmDialog.restaurant.id, isOpen)
      if (res.code === 200) {
        showToast(isOpen ? '餐厅已上架' : '餐厅已下架', 'success')
        loadRestaurants()
      } else {
        showToast(res.message || '操作失败', 'error')
      }
    } catch (err) {
      showToast('操作失败', 'error')
    }
    setConfirmDialog({ isOpen: false, restaurant: null, action: 'close' })
  }

  // 打开编辑弹窗
  const openEditModal = (restaurant: Restaurant) => {
    setEditForm({
      name: restaurant.name || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      deliveryFee: restaurant.deliveryFee || 0,
      minOrder: restaurant.minOrder || 0,
      deliveryTime: restaurant.deliveryTime || '',
      categoryId: restaurant.categoryId || 0,
      isFeatured: restaurant.isFeatured || false,
      tags: restaurant.tags || ''
    })
    setEditModal({ isOpen: true, restaurant })
  }

  // 关闭编辑弹窗
  const closeEditModal = () => {
    setEditModal({ isOpen: false, restaurant: null })
  }

  // 提交编辑
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal.restaurant) return

    setEditLoading(true)
    try {
      const res = await updateRestaurant(editModal.restaurant.id, {
        ...editForm,
        categoryId: editForm.categoryId || undefined
      })
      if (res.code === 200) {
        showToast('餐厅信息更新成功', 'success')
        closeEditModal()
        loadRestaurants()
      } else {
        showToast(res.message || '更新失败', 'error')
      }
    } catch (err) {
      showToast('更新失败', 'error')
    } finally {
      setEditLoading(false)
    }
  }

  // 打开抽成设置弹窗
  const openRateModal = (restaurant: Restaurant) => {
    setNewRate(restaurant.platformRatePercent?.toString() || '8')
    setRateModal({ isOpen: true, restaurant })
  }

  // 提交抽成比例修改
  const handleUpdateRate = async () => {
    if (!rateModal.restaurant) return

    const rate = parseFloat(newRate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      showToast('请输入有效的抽成比例（0-100）', 'error')
      return
    }

    setRateLoading(true)
    try {
      const res = await updateRestaurantPlatformRate(rateModal.restaurant.id, rate)
      if (res.code === 200) {
        showToast('抽成比例更新成功', 'success')
        setRateModal({ isOpen: false, restaurant: null })
        loadRestaurants()
      } else {
        showToast(res.message || '更新失败', 'error')
      }
    } catch (err) {
      showToast('更新失败', 'error')
    } finally {
      setRateLoading(false)
    }
  }

  const columns = [
    { key: 'id', title: 'ID', width: '60px' },
    { 
      key: 'name', 
      title: '餐厅名称',
      render: (_: unknown, record: Restaurant) => (
        <div className="flex items-center gap-3">
          {record.logo ? (
            <img 
              src={record.logo} 
              alt="" 
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const placeholder = target.nextElementSibling as HTMLElement
                if (placeholder) placeholder.style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
            style={{ display: record.logo ? 'none' : 'flex' }}
          >
            <Store className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium">{record.name}</p>
            <p className="text-xs text-gray-500">{record.categoryName || '-'}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'rating', 
      title: '评分',
      render: (value: unknown) => (
        <span className="text-yellow-500 font-medium">{String(value) || '-'}</span>
      )
    },
    { key: 'address', title: '地址' },
    { key: 'phone', title: '电话' },
    { 
      key: 'isOpen', 
      title: '状态',
      render: (value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {value ? '营业中' : '已下架'}
        </span>
      )
    },
    { 
      key: 'isFeatured', 
      title: '推荐',
      render: (value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {value ? '是' : '否'}
        </span>
      )
    },
    {
      key: 'platformRatePercent',
      title: '抽成比例',
      render: (value: unknown, record: Restaurant) => (
        <button
          onClick={() => openRateModal(record)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg"
          title="点击修改抽成比例"
        >
          <Percent className="w-3 h-3" />
          <span>{typeof value === 'number' ? value : 8}%</span>
        </button>
      )
    },
    {
      key: 'balance',
      title: '余额',
      render: (value: unknown) => (
        <span className="font-medium text-green-600">
          ¥{typeof value === 'number' ? value.toFixed(2) : '0.00'}
        </span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, record: Restaurant) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(record)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="编辑"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {record.isOpen ? (
            <button
              onClick={() => setConfirmDialog({ isOpen: true, restaurant: record, action: 'close' })}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
            >
              下架
            </button>
          ) : (
            <button
              onClick={() => setConfirmDialog({ isOpen: true, restaurant: record, action: 'open' })}
              className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg border border-green-200"
            >
              上架
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索餐厅名称..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 餐厅列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table columns={columns} data={restaurants?.content || []} loading={loading} />
        {restaurants && (
          <Pagination
            page={restaurants.page}
            totalPages={restaurants.totalPages}
            totalElements={restaurants.totalElements}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* 确认弹窗 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action === 'open' ? '上架餐厅' : '下架餐厅'}
        message={`确定要${confirmDialog.action === 'open' ? '上架' : '下架'}餐厅 "${confirmDialog.restaurant?.name}" 吗？`}
        confirmText={confirmDialog.action === 'open' ? '上架' : '下架'}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmDialog({ isOpen: false, restaurant: null, action: 'close' })}
        variant={confirmDialog.action === 'open' ? 'primary' : 'danger'}
      />

      {/* 抽成比例设置弹窗 */}
      <Modal
        isOpen={rateModal.isOpen}
        onClose={() => setRateModal({ isOpen: false, restaurant: null })}
        title={`设置抽成比例 - ${rateModal.restaurant?.name || ''}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              抽成比例 (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                placeholder="请输入抽成比例"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              设置该店铺的平台抽成比例，留空或设为 0 将使用平台默认比例
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setRateModal({ isOpen: false, restaurant: null })}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={handleUpdateRate}
              disabled={rateLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {rateLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 编辑餐厅弹窗 */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        title="编辑餐厅"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              餐厅名称
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类
            </label>
            <select
              value={editForm.categoryId}
              onChange={(e) => setEditForm({ ...editForm, categoryId: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>请选择分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              地址
            </label>
            <input
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              联系电话
            </label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配送费
              </label>
              <input
                type="number"
                step="0.01"
                value={editForm.deliveryFee}
                onChange={(e) => setEditForm({ ...editForm, deliveryFee: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                起送价
              </label>
              <input
                type="number"
                step="0.01"
                value={editForm.minOrder}
                onChange={(e) => setEditForm({ ...editForm, minOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              配送时间
            </label>
            <input
              type="text"
              value={editForm.deliveryTime}
              onChange={(e) => setEditForm({ ...editForm, deliveryTime: e.target.value })}
              placeholder="如: 30-45"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签
            </label>
            <input
              type="text"
              value={editForm.tags}
              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
              placeholder="用逗号分隔，如: 快餐,便当"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isFeatured}
                onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">推荐餐厅</span>
            </label>
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
    </div>
  )
}
