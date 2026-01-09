import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  UtensilsCrossed,
  FolderPlus,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { getImageUrl } from '../../api/upload'
import {
  getMerchantMenuCategories,
  getMerchantMenuItems,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemStatus,
} from '../../api/merchant'
import { toast } from '../../store/useToastStore'
import { confirm } from '../../store/useConfirmStore'
import { MenuCategory, MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../../types'

const MerchantMenu = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  const [categoryForm, setCategoryForm] = useState({ name: '', sortOrder: '0' })
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    categoryId: '',
    isHot: false,
    isNew: false,
    isAvailable: true,
    sortOrder: '0',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory !== null) {
      fetchMenuItems(selectedCategory)
    } else {
      fetchMenuItems()
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const res = await getMerchantMenuCategories()
      if (res.data.data) {
        setCategories(res.data.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchMenuItems = async (categoryId?: number) => {
    try {
      setLoading(true)
      const res = await getMerchantMenuItems(categoryId)
      if (res.data.data) {
        setMenuItems(res.data.data)
      }
    } catch (error) {
      console.error('获取菜品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 分类相关操作
  const handleOpenCategoryModal = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({ name: category.name, sortOrder: String(category.sortOrder) })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: '', sortOrder: '0' })
    }
    setShowCategoryModal(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      toast.error('请输入分类名称')
      return
    }

    try {
      setSaving(true)
      if (editingCategory) {
        await updateMenuCategory(editingCategory.id, {
          name: categoryForm.name,
          sortOrder: parseInt(categoryForm.sortOrder) || 0,
        })
        toast.success('分类已更新')
      } else {
        await createMenuCategory({
          name: categoryForm.name,
          sortOrder: parseInt(categoryForm.sortOrder) || 0,
        })
        toast.success('分类已创建')
      }
      setShowCategoryModal(false)
      fetchCategories()
    } catch (error: any) {
      toast.error('保存失败', error.response?.data?.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (category: MenuCategory) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '删除分类',
      message: `确定要删除分类「${category.name}」吗？`,
      confirmText: '删除',
    })

    if (confirmed) {
      try {
        await deleteMenuCategory(category.id)
        toast.success('分类已删除')
        fetchCategories()
        if (selectedCategory === category.id) {
          setSelectedCategory(null)
        }
      } catch (error: any) {
        toast.error('删除失败', error.response?.data?.message)
      }
    }
  }

  // 菜品相关操作
  const handleOpenItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: String(item.price),
        originalPrice: item.originalPrice ? String(item.originalPrice) : '',
        image: item.image || '',
        categoryId: item.categoryId ? String(item.categoryId) : '',
        isHot: item.isHot,
        isNew: item.isNew,
        isAvailable: item.isAvailable,
        sortOrder: '0',
      })
    } else {
      setEditingItem(null)
      setItemForm({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        image: '',
        categoryId: selectedCategory ? String(selectedCategory) : '',
        isHot: false,
        isNew: false,
        isAvailable: true,
        sortOrder: '0',
      })
    }
    setShowItemModal(true)
  }

  const handleSaveItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      toast.error('请填写必要信息', '菜品名称和价格为必填项')
      return
    }

    try {
      setSaving(true)
      if (editingItem) {
        const data: UpdateMenuItemRequest = {
          name: itemForm.name,
          description: itemForm.description || undefined,
          price: parseFloat(itemForm.price),
          originalPrice: itemForm.originalPrice ? parseFloat(itemForm.originalPrice) : undefined,
          image: itemForm.image || undefined,
          categoryId: itemForm.categoryId ? parseInt(itemForm.categoryId) : undefined,
          isHot: itemForm.isHot,
          isNew: itemForm.isNew,
          isAvailable: itemForm.isAvailable,
          sortOrder: parseInt(itemForm.sortOrder) || 0,
        }
        await updateMenuItem(editingItem.id, data)
        toast.success('菜品已更新')
      } else {
        const data: CreateMenuItemRequest = {
          name: itemForm.name,
          description: itemForm.description || undefined,
          price: parseFloat(itemForm.price),
          originalPrice: itemForm.originalPrice ? parseFloat(itemForm.originalPrice) : undefined,
          image: itemForm.image || undefined,
          categoryId: itemForm.categoryId ? parseInt(itemForm.categoryId) : undefined,
          isHot: itemForm.isHot,
          isNew: itemForm.isNew,
          isAvailable: itemForm.isAvailable,
          sortOrder: parseInt(itemForm.sortOrder) || 0,
        }
        await createMenuItem(data)
        toast.success('菜品已创建')
      }
      setShowItemModal(false)
      fetchMenuItems(selectedCategory || undefined)
      fetchCategories()
    } catch (error: any) {
      toast.error('保存失败', error.response?.data?.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (item: MenuItem) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '删除菜品',
      message: `确定要删除菜品「${item.name}」吗？`,
      confirmText: '删除',
    })

    if (confirmed) {
      try {
        await deleteMenuItem(item.id)
        toast.success('菜品已删除')
        fetchMenuItems(selectedCategory || undefined)
        fetchCategories()
      } catch (error: any) {
        toast.error('删除失败', error.response?.data?.message)
      }
    }
  }

  const handleToggleItemStatus = async (item: MenuItem) => {
    try {
      await updateMenuItemStatus(item.id, !item.isAvailable)
      toast.success(item.isAvailable ? '菜品已下架' : '菜品已上架')
      fetchMenuItems(selectedCategory || undefined)
    } catch (error: any) {
      toast.error('操作失败', error.response?.data?.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">菜品管理</h1>
          <p className="text-gray-500 mt-1">管理您的菜品分类和菜品列表</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenCategoryModal()}
            className="flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            新建分类
          </Button>
          <Button
            onClick={() => handleOpenItemModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600"
          >
            <Plus className="w-4 h-4" />
            新建菜品
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 分类列表 */}
        <div className="w-56 flex-shrink-0">
          <Card className="p-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <span className="font-medium">全部菜品</span>
              <span className={`ml-2 text-sm ${selectedCategory === null ? 'text-blue-200' : 'text-gray-400'}`}>
                ({menuItems.length})
              </span>
            </button>
            {categories.map((category) => (
              <div key={category.id} className="group relative">
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                  <span className={`ml-2 text-sm ${selectedCategory === category.id ? 'text-blue-200' : 'text-gray-400'}`}>
                    ({category.itemCount})
                  </span>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenCategoryModal(category)
                    }}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategory(category)
                    }}
                    className="p-1 rounded hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* 菜品列表 */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : menuItems.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">暂无菜品</h3>
              <p className="text-gray-500 mb-4">点击右上角按钮添加菜品</p>
              <Button
                onClick={() => handleOpenItemModal()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加菜品
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`p-4 ${!item.isAvailable ? 'opacity-60' : ''}`}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UtensilsCrossed className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              {item.name}
                              {item.isHot && (
                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded">热销</span>
                              )}
                              {item.isNew && (
                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded">新品</span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-orange-500">¥{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">¥{item.originalPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleItemStatus(item)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                item.isAvailable ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={item.isAvailable ? '下架' : '上架'}
                            >
                              {item.isAvailable ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenItemModal(item)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 分类编辑弹窗 */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCategory ? '编辑分类' : '新建分类'}
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入分类名称"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    排序（数字越小越靠前）
                  </label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, sortOrder: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleSaveCategory}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  保存
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 菜品编辑弹窗 */}
      <AnimatePresence>
        {showItemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowItemModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingItem ? '编辑菜品' : '新建菜品'}
                </h2>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    菜品名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入菜品名称"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    菜品描述
                  </label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="请输入菜品描述"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      价格 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={itemForm.price}
                      onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      原价
                    </label>
                    <input
                      type="number"
                      value={itemForm.originalPrice}
                      onChange={(e) => setItemForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    图片 URL
                  </label>
                  <input
                    type="text"
                    value={itemForm.image}
                    onChange={(e) => setItemForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="请输入图片地址"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所属分类
                  </label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="">请选择分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.isHot}
                      onChange={(e) => setItemForm(prev => ({ ...prev, isHot: e.target.checked }))}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">热销</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.isNew}
                      onChange={(e) => setItemForm(prev => ({ ...prev, isNew: e.target.checked }))}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">新品</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.isAvailable}
                      onChange={(e) => setItemForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">上架</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setShowItemModal(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleSaveItem}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  保存
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MerchantMenu
