import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Check, Loader2, Map } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import MapPicker from '../components/MapPicker'
import { useUserStore } from '../store/useUserStore'
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api/address'
import { Address } from '../types'
import { confirm } from '../store/useConfirmStore'
import { toast } from '../store/useToastStore'

const Addresses = () => {
  const navigate = useNavigate()
  const { isLoggedIn, updateUser } = useUserStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    isDefault: false,
  })
  const [showMapPicker, setShowMapPicker] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    
    fetchAddresses()
  }, [isLoggedIn, navigate])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const res = await getAddresses()
      setAddresses(res.data.data)
    } catch (error) {
      console.error('获取地址列表失败:', error)
      toast.error('获取地址列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.warning('请输入联系人姓名')
      return
    }
    if (!formData.phone.trim()) {
      toast.warning('请输入联系电话')
      return
    }
    if (!formData.address.trim()) {
      toast.warning('请输入详细地址')
      return
    }

    try {
      setSubmitting(true)
      
      if (editingId !== null) {
        // 编辑地址
        await updateAddress(editingId, formData)
        toast.success('地址已更新')
      } else {
        // 添加新地址
        await addAddress(formData)
        toast.success('地址添加成功')
      }

      // 刷新列表
      await fetchAddresses()
      resetForm()
    } catch (error) {
      console.error('保存地址失败:', error)
      toast.error('保存地址失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  // 处理地图选择确认
  const handleMapConfirm = (location: { lng: number; lat: number; address: string; name?: string }) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
    }))
    setShowMapPicker(false)
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '删除地址',
      message: '确定要删除这个地址吗？',
      confirmText: '删除',
      cancelText: '取消',
    })

    if (!confirmed) return

    try {
      await deleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success('地址已删除')
    } catch (error) {
      console.error('删除地址失败:', error)
      toast.error('删除地址失败')
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id)
      const address = addresses.find(a => a.id === id)
      if (address) {
        updateUser({ address: address.address, phone: address.phone })
      }
      await fetchAddresses()
      toast.success('已设为默认地址')
    } catch (error) {
      console.error('设置默认地址失败:', error)
      toast.error('设置默认地址失败')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '', latitude: null, longitude: null, isDefault: false })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">收货地址</h1>
          </div>
          {!showForm && (
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowForm(true)}
            >
              新增
            </Button>
          )}
        </motion.div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {editingId ? '编辑地址' : '新增地址'}
                </h3>
                <div className="space-y-4">
                  <Input
                    label="联系人"
                    placeholder="请输入联系人姓名"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    label="联系电话"
                    placeholder="请输入联系电话"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      详细地址
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="请输入详细地址或点击地图选择"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-3 pr-24 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors resize-none min-h-[80px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="absolute right-3 top-3 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-orange-600 transition-colors"
                      >
                        <Map className="w-4 h-4" />
                        地图选择
                      </button>
                    </div>
                    {formData.latitude && formData.longitude && (
                      <p className="text-xs text-gray-400 mt-1">
                        已定位: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">设为默认地址</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={resetForm}>
                      取消
                    </Button>
                    <Button className="flex-1" onClick={handleSubmit} isLoading={submitting}>
                      保存
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address List */}
        {addresses.length === 0 && !showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">暂无地址</h2>
            <p className="text-gray-500 mb-8">添加收货地址，让美食更快送达</p>
            <Button onClick={() => setShowForm(true)} leftIcon={<Plus className="w-5 h-5" />}>
              添加地址
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{address.name}</span>
                        <span className="text-gray-500">{address.phone}</span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-600 text-xs">
                            默认
                          </span>
                        )}
                        {address.latitude && address.longitude && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-xs flex items-center gap-1">
                            <Map className="w-3 h-3" />
                            已定位
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{address.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="设为默认"
                        >
                          <Check className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* 地图选择器 */}
      <MapPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={handleMapConfirm}
        initialLocation={formData.latitude && formData.longitude ? {
          lat: formData.latitude,
          lng: formData.longitude,
        } : undefined}
      />
    </div>
  )
}

export default Addresses
