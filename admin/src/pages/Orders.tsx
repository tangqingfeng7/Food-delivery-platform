import { useEffect, useState } from 'react'
import { Search, Eye, Pencil } from 'lucide-react'
import { getOrders, updateOrderStatus } from '../api/admin'
import { useToastStore } from '../store/useToastStore'
import Table from '../components/ui/Table'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import type { Order, PageResult } from '../types'

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待支付', color: 'bg-gray-100 text-gray-600' },
  PAID: { label: '已支付', color: 'bg-blue-100 text-blue-600' },
  CONFIRMED: { label: '已确认', color: 'bg-indigo-100 text-indigo-600' },
  PREPARING: { label: '制作中', color: 'bg-yellow-100 text-yellow-600' },
  DELIVERING: { label: '配送中', color: 'bg-orange-100 text-orange-600' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-600' },
  CANCELLED: { label: '已取消', color: 'bg-red-100 text-red-600' },
}

export default function Orders() {
  const { showToast } = useToastStore()
  const [orders, setOrders] = useState<PageResult<Order> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // 修改状态弹窗
  const [editStatusModal, setEditStatusModal] = useState<{
    isOpen: boolean
    order: Order | null
  }>({ isOpen: false, order: null })
  const [newStatus, setNewStatus] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [page, status])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await getOrders({ page, size: 10, status: status || undefined, keyword: keyword || undefined })
      if (res.code === 200) {
        setOrders(res.data)
      }
    } catch (err) {
      showToast('加载订单列表失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    loadOrders()
  }

  // 打开修改状态弹窗
  const openEditStatusModal = (order: Order) => {
    setNewStatus(order.status)
    setEditStatusModal({ isOpen: true, order })
  }

  // 关闭修改状态弹窗
  const closeEditStatusModal = () => {
    setEditStatusModal({ isOpen: false, order: null })
    setNewStatus('')
  }

  // 提交状态修改
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editStatusModal.order) return

    setStatusLoading(true)
    try {
      const res = await updateOrderStatus(editStatusModal.order.id, newStatus)
      if (res.code === 200) {
        showToast('订单状态更新成功', 'success')
        closeEditStatusModal()
        loadOrders()
      } else {
        showToast(res.message || '更新失败', 'error')
      }
    } catch (err) {
      showToast('更新失败', 'error')
    } finally {
      setStatusLoading(false)
    }
  }

  const columns = [
    { 
      key: 'orderNo', 
      title: '订单号',
      render: (value: unknown) => (
        <span className="font-mono text-xs">{(value as string)?.slice(0, 20)}...</span>
      )
    },
    { 
      key: 'username', 
      title: '用户',
      render: (_: unknown, record: Order) => record.username
    },
    { 
      key: 'restaurantName', 
      title: '餐厅',
      render: (_: unknown, record: Order) => record.restaurantName
    },
    { 
      key: 'payAmount', 
      title: '金额',
      render: (value: unknown) => (
        <span className="font-medium text-orange-600">¥{(value as number)?.toFixed(2)}</span>
      )
    },
    { 
      key: 'status', 
      title: '状态',
      render: (value: unknown) => {
        const s = statusMap[value as string] || { label: value as string, color: 'bg-gray-100 text-gray-600' }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
            {s.label}
          </span>
        )
      }
    },
    { 
      key: 'createdAt', 
      title: '下单时间',
      render: (value: unknown) => value ? new Date(value as string).toLocaleString('zh-CN') : '-'
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, record: Order) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedOrder(record)}
            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"
            title="查看详情"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditStatusModal(record)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="修改状态"
          >
            <Pencil className="w-4 h-4" />
          </button>
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
                placeholder="搜索订单号..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0) }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全部状态</option>
            <option value="PENDING">待支付</option>
            <option value="PAID">已支付</option>
            <option value="CONFIRMED">已确认</option>
            <option value="PREPARING">制作中</option>
            <option value="DELIVERING">配送中</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELLED">已取消</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table columns={columns} data={orders?.content || []} loading={loading} />
        {orders && (
          <Pagination
            page={orders.page}
            totalPages={orders.totalPages}
            totalElements={orders.totalElements}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* 订单详情弹窗 */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="订单详情"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">订单号</span>
                <p className="font-mono">{selectedOrder.orderNo}</p>
              </div>
              <div>
                <span className="text-gray-500">状态</span>
                <p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[selectedOrder.status]?.color}`}>
                    {statusMap[selectedOrder.status]?.label}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-gray-500">用户</span>
                <p>{selectedOrder.username}</p>
              </div>
              <div>
                <span className="text-gray-500">餐厅</span>
                <p>{selectedOrder.restaurantName}</p>
              </div>
              <div>
                <span className="text-gray-500">收货地址</span>
                <p>{selectedOrder.address || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">联系电话</span>
                <p>{selectedOrder.phone || '-'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">订单商品</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.menuItemName} x {item.quantity}</span>
                    <span className="text-gray-600">¥{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">商品金额</span>
                <span>¥{selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">配送费</span>
                <span>¥{selectedOrder.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">优惠</span>
                <span className="text-red-500">-¥{selectedOrder.discountAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-2 border-t">
                <span>实付金额</span>
                <span className="text-orange-600">¥{selectedOrder.payAmount?.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder.remark && (
              <div className="border-t pt-4">
                <span className="text-gray-500 text-sm">备注</span>
                <p className="text-sm">{selectedOrder.remark}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 修改状态弹窗 */}
      <Modal
        isOpen={editStatusModal.isOpen}
        onClose={closeEditStatusModal}
        title="修改订单状态"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              当前订单
            </label>
            <p className="text-sm text-gray-600 font-mono">
              {editStatusModal.order?.orderNo}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              订单状态
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="PENDING">待支付</option>
              <option value="PAID">已支付</option>
              <option value="CONFIRMED">已确认</option>
              <option value="PREPARING">制作中</option>
              <option value="DELIVERING">配送中</option>
              <option value="COMPLETED">已完成</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeEditStatusModal}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={statusLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {statusLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
