import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Save,
  Loader2,
  ImagePlus,
  ToggleLeft,
  ToggleRight,
  Navigation,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ImageUpload from '../../components/ImageUpload'
import MapPicker from '../../components/MapPicker'
import {
  getMyRestaurant,
  createRestaurant,
  updateRestaurant,
  updateRestaurantStatus,
} from '../../api/merchant'
import { getCategories } from '../../api/category'
import { toast } from '../../store/useToastStore'
import { Restaurant, Category, CreateRestaurantRequest, UpdateRestaurantRequest } from '../../types'

const MerchantShop = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    logo: '',
    deliveryTime: '30-45',
    deliveryFee: '0',
    minOrder: '20',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    phone: '',
    openTime: '09:00',
    closeTime: '22:00',
    categoryId: '',
    tags: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [restaurantRes, categoriesRes] = await Promise.all([
        getMyRestaurant(),
        getCategories(),
      ])

      if (categoriesRes.data.data) {
        setCategories(categoriesRes.data.data)
      }

      if (restaurantRes.data.data) {
        const r = restaurantRes.data.data
        setRestaurant(r)
        setIsNew(false)
        setFormData({
          name: r.name || '',
          description: r.description || '',
          image: r.image || '',
          logo: r.logo || '',
          deliveryTime: r.deliveryTime || '30-45',
          deliveryFee: String(r.deliveryFee || 0),
          minOrder: String(r.minOrder || 20),
          address: r.address || '',
          latitude: r.latitude || null,
          longitude: r.longitude || null,
          phone: r.phone || '',
          openTime: r.openTime || '09:00',
          closeTime: r.closeTime || '22:00',
          categoryId: r.categoryId ? String(r.categoryId) : '',
          tags: r.tags?.join(',') || '',
        })
      } else {
        setIsNew(true)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.address || !formData.phone || !formData.categoryId) {
      toast.error('请填写必要信息', '店铺名称、地址、电话和分类为必填项')
      return
    }

    try {
      setSaving(true)

      if (isNew) {
        const data: CreateRestaurantRequest = {
          name: formData.name,
          description: formData.description || undefined,
          image: formData.image || undefined,
          logo: formData.logo || undefined,
          deliveryTime: formData.deliveryTime || undefined,
          deliveryFee: formData.deliveryFee ? parseFloat(formData.deliveryFee) : undefined,
          minOrder: formData.minOrder ? parseFloat(formData.minOrder) : undefined,
          address: formData.address,
          latitude: formData.latitude || undefined,
          longitude: formData.longitude || undefined,
          phone: formData.phone,
          openTime: formData.openTime || undefined,
          closeTime: formData.closeTime || undefined,
          categoryId: parseInt(formData.categoryId),
          tags: formData.tags || undefined,
        }
        const res = await createRestaurant(data)
        if (res.data.data) {
          setRestaurant(res.data.data)
          setIsNew(false)
          toast.success('店铺创建成功')
        }
      } else {
        const data: UpdateRestaurantRequest = {
          name: formData.name,
          description: formData.description || undefined,
          image: formData.image || undefined,
          logo: formData.logo || undefined,
          deliveryTime: formData.deliveryTime || undefined,
          deliveryFee: formData.deliveryFee ? parseFloat(formData.deliveryFee) : undefined,
          minOrder: formData.minOrder ? parseFloat(formData.minOrder) : undefined,
          address: formData.address,
          latitude: formData.latitude || undefined,
          longitude: formData.longitude || undefined,
          phone: formData.phone,
          openTime: formData.openTime || undefined,
          closeTime: formData.closeTime || undefined,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
          tags: formData.tags || undefined,
        }
        const res = await updateRestaurant(data)
        if (res.data.data) {
          setRestaurant(res.data.data)
          toast.success('店铺信息已更新')
        }
      }
    } catch (error: any) {
      toast.error('保存失败', error.response?.data?.message || '请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!restaurant) return

    try {
      const res = await updateRestaurantStatus(!restaurant.isOpen)
      if (res.data.data) {
        setRestaurant(res.data.data)
        toast.success(res.data.data.isOpen ? '店铺已开业' : '店铺已休息')
      }
    } catch (error: any) {
      toast.error('操作失败', error.response?.data?.message || '请稍后重试')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? '创建店铺' : '店铺管理'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isNew ? '填写店铺信息，开始接单经营' : '管理您的店铺信息'}
          </p>
        </div>
        {!isNew && restaurant && (
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              restaurant.isOpen
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {restaurant.isOpen ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            {restaurant.isOpen ? '营业中' : '休息中'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 space-y-6">
            {/* 基本信息 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-500" />
                基本信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店铺名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="请输入店铺名称"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店铺分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="">请选择分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店铺简介
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="请输入店铺简介"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店铺标签
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="多个标签用逗号分隔，如：快餐,便当"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 图片信息 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-blue-500" />
                图片信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店铺 Logo
                  </label>
                  <ImageUpload
                    value={formData.logo}
                    onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                    placeholder="上传店铺 Logo"
                    aspectRatio="square"
                  />
                  <p className="text-xs text-gray-400 mt-2">建议尺寸 200x200，正方形</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店铺封面图
                  </label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    placeholder="上传店铺封面图"
                    aspectRatio="video"
                  />
                  <p className="text-xs text-gray-400 mt-2">建议尺寸 800x450，16:9 比例</p>
                </div>
              </div>
            </div>

            {/* 联系信息 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                联系信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店铺地址 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="请输入详细地址或在地图上选择"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Navigation className="w-5 h-5" />
                      地图选点
                    </button>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      已选择位置: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="请输入联系电话"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 营业信息 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                营业信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始营业时间
                  </label>
                  <input
                    type="time"
                    name="openTime"
                    value={formData.openTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束营业时间
                  </label>
                  <input
                    type="time"
                    name="closeTime"
                    value={formData.closeTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    配送时间（分钟）
                  </label>
                  <input
                    type="text"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    placeholder="如：30-45"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    配送费（元）
                  </label>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    起送价（元）
                  </label>
                  <input
                    type="number"
                    name="minOrder"
                    value={formData.minOrder}
                    onChange={handleChange}
                    placeholder="20"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isNew ? '创建店铺' : '保存修改'}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </form>

      {/* 地图选择器 */}
      <MapPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={(location: { lng: number; lat: number; address: string }) => {
          setFormData(prev => ({
            ...prev,
            address: location.address,
            latitude: location.lat,
            longitude: location.lng,
          }))
          setShowMapPicker(false)
        }}
        initialLocation={
          formData.latitude && formData.longitude
            ? { lng: formData.longitude, lat: formData.latitude }
            : undefined
        }
      />
    </div>
  )
}

export default MerchantShop
