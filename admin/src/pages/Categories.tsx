import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Zap, Flame, Coffee, Utensils, Pizza, Soup, IceCream, Fish, Beef, Salad, Sandwich, Cookie, Award, type LucideIcon } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/admin'
import { useToastStore } from '../store/useToastStore'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import type { Category } from '../types'

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  flame: Flame,
  coffee: Coffee,
  utensils: Utensils,
  pizza: Pizza,
  soup: Soup,
  'ice-cream': IceCream,
  fish: Fish,
  beef: Beef,
  salad: Salad,
  sandwich: Sandwich,
  cookie: Cookie,
  award: Award,
}

export default function Categories() {
  const { showToast } = useToastStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', icon: '', color: '', sortOrder: 0 })
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await getCategories()
      if (res.code === 200) {
        setCategories(res.data)
      }
    } catch (err) {
      showToast('加载分类列表失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        icon: category.icon || '',
        color: category.color || '',
        sortOrder: category.sortOrder
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', icon: '', color: '', sortOrder: 0 })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showToast('请输入分类名称', 'error')
      return
    }

    setSaving(true)
    try {
      let res
      if (editingCategory) {
        res = await updateCategory(editingCategory.id, formData)
      } else {
        res = await createCategory(formData)
      }
      
      if (res.code === 200) {
        showToast(editingCategory ? '分类更新成功' : '分类创建成功', 'success')
        setModalOpen(false)
        loadCategories()
      } else {
        showToast(res.message || '操作失败', 'error')
      }
    } catch (err) {
      showToast('操作失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.category) return
    
    try {
      const res = await deleteCategory(deleteDialog.category.id)
      if (res.code === 200) {
        showToast('分类删除成功', 'success')
        loadCategories()
      } else {
        showToast(res.message || '删除失败', 'error')
      }
    } catch (err) {
      showToast('删除失败', 'error')
    }
    setDeleteDialog({ isOpen: false, category: null })
  }

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">分类列表</h2>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-1" />
          新增分类
        </Button>
      </div>

      {/* 分类列表 */}
      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            暂无分类数据
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${category.color || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white`}>
                    {(() => {
                      const IconComponent = category.icon ? iconMap[category.icon.toLowerCase()] : null
                      return IconComponent ? <IconComponent className="w-5 h-5" /> : <Utensils className="w-5 h-5" />
                    })()}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {category.restaurantCount} 家餐厅 | 排序: {category.sortOrder}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, category })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? '编辑分类' : '新增分类'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="分类名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入分类名称"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图标
            </label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">请选择图标</option>
              <option value="zap">Zap - 闪电（快餐）</option>
              <option value="flame">Flame - 火焰（烧烤火锅）</option>
              <option value="coffee">Coffee - 咖啡（饮品）</option>
              <option value="utensils">Utensils - 餐具（正餐）</option>
              <option value="pizza">Pizza - 披萨（西餐）</option>
              <option value="soup">Soup - 汤（粥汤）</option>
              <option value="ice-cream">Ice Cream - 冰淇淋（甜品）</option>
              <option value="fish">Fish - 鱼（海鲜）</option>
              <option value="beef">Beef - 牛肉（肉类）</option>
              <option value="salad">Salad - 沙拉（轻食）</option>
              <option value="sandwich">Sandwich - 三明治（简餐）</option>
              <option value="cookie">Cookie - 饼干（烘焙）</option>
              <option value="award">Award - 奖章（精选）</option>
            </select>
          </div>
          <Input
            label="渐变色"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="如 from-orange-400 to-red-500"
          />
          <Input
            label="排序"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            placeholder="数字越小越靠前"
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editingCategory ? '保存' : '创建'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="删除分类"
        message={`确定要删除分类 "${deleteDialog.category?.name}" 吗？如果该分类下有餐厅，将无法删除。`}
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, category: null })}
      />
    </div>
  )
}
