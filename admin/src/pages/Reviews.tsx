import { useEffect, useState } from 'react'
import { Search, Trash2, Star, Eye, MessageSquare } from 'lucide-react'
import { getReviews, deleteReview, replyReview } from '../api/admin'
import { useToastStore } from '../store/useToastStore'
import Table from '../components/ui/Table'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'
import type { Review, PageResult } from '../types'

export default function Reviews() {
  const { showToast } = useToastStore()
  const [reviews, setReviews] = useState<PageResult<Review> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; review: Review | null }>({
    isOpen: false,
    review: null
  })

  // 查看详情弹窗
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  // 回复弹窗
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean
    review: Review | null
  }>({ isOpen: false, review: null })
  const [replyContent, setReplyContent] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [page])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await getReviews({ page, size: 10, keyword: keyword || undefined })
      if (res.code === 200) {
        setReviews(res.data)
      }
    } catch (err) {
      showToast('加载评价列表失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    loadReviews()
  }

  const handleDelete = async () => {
    if (!deleteDialog.review) return
    
    try {
      const res = await deleteReview(deleteDialog.review.id)
      if (res.code === 200) {
        showToast('评价已删除', 'success')
        loadReviews()
      } else {
        showToast(res.message || '删除失败', 'error')
      }
    } catch (err) {
      showToast('删除失败', 'error')
    }
    setDeleteDialog({ isOpen: false, review: null })
  }

  // 打开回复弹窗
  const openReplyModal = (review: Review) => {
    setReplyContent(review.replyContent || '')
    setReplyModal({ isOpen: true, review })
  }

  // 关闭回复弹窗
  const closeReplyModal = () => {
    setReplyModal({ isOpen: false, review: null })
    setReplyContent('')
  }

  // 提交回复
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyModal.review) return

    setReplyLoading(true)
    try {
      const res = await replyReview(replyModal.review.id, replyContent)
      if (res.code === 200) {
        showToast('回复成功', 'success')
        closeReplyModal()
        loadReviews()
      } else {
        showToast(res.message || '回复失败', 'error')
      }
    } catch (err) {
      showToast('回复失败', 'error')
    } finally {
      setReplyLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    )
  }

  const columns = [
    { key: 'id', title: 'ID', width: '60px' },
    { 
      key: 'username', 
      title: '用户',
      render: (_: unknown, record: Review) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {record.username?.charAt(0) || '?'}
            </span>
          </div>
          <span>{record.isAnonymous ? '匿名用户' : record.username}</span>
        </div>
      )
    },
    { 
      key: 'restaurantName', 
      title: '餐厅'
    },
    { 
      key: 'overallRating', 
      title: '评分',
      render: (value: unknown) => renderStars(Number(value) || 0)
    },
    { 
      key: 'content', 
      title: '内容',
      render: (value: unknown) => (
        <div className="max-w-xs truncate" title={String(value || '')}>
          {String(value || '-')}
        </div>
      )
    },
    { 
      key: 'createdAt', 
      title: '评价时间',
      render: (value: unknown) => value ? new Date(value as string).toLocaleString('zh-CN') : '-'
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, record: Review) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedReview(record)}
            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"
            title="查看详情"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openReplyModal(record)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="回复"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, review: record })}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
                placeholder="搜索评价内容..."
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

      {/* 评价列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table columns={columns} data={reviews?.content || []} loading={loading} />
        {reviews && (
          <Pagination
            page={reviews.page}
            totalPages={reviews.totalPages}
            totalElements={reviews.totalElements}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="删除评价"
        message="确定要删除这条评价吗？此操作不可恢复。"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, review: null })}
      />

      {/* 评价详情弹窗 */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="评价详情"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">用户</span>
                <p>{selectedReview.isAnonymous ? '匿名用户' : selectedReview.username}</p>
              </div>
              <div>
                <span className="text-gray-500">餐厅</span>
                <p>{selectedReview.restaurantName}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <span className="text-gray-500 text-sm">评分</span>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-gray-600">口味</span>
                  <p className="font-medium">{selectedReview.tasteRating} 分</p>
                </div>
                <div>
                  <span className="text-gray-600">包装</span>
                  <p className="font-medium">{selectedReview.packagingRating} 分</p>
                </div>
                <div>
                  <span className="text-gray-600">配送</span>
                  <p className="font-medium">{selectedReview.deliveryRating} 分</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-gray-600 text-sm">综合评分</span>
                <p className="font-medium text-lg text-yellow-500">{selectedReview.overallRating} 分</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <span className="text-gray-500 text-sm">评价内容</span>
              <p className="mt-1">{selectedReview.content || '无评价内容'}</p>
            </div>

            {selectedReview.replyContent && (
              <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 py-4">
                <span className="text-gray-500 text-sm">商家/管理员回复</span>
                <p className="mt-1">{selectedReview.replyContent}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedReview.replyTime ? new Date(selectedReview.replyTime).toLocaleString('zh-CN') : ''}
                </p>
              </div>
            )}

            <div className="text-xs text-gray-400">
              评价时间：{new Date(selectedReview.createdAt).toLocaleString('zh-CN')}
            </div>
          </div>
        )}
      </Modal>

      {/* 回复弹窗 */}
      <Modal
        isOpen={replyModal.isOpen}
        onClose={closeReplyModal}
        title="回复评价"
      >
        <form onSubmit={handleReplySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              评价内容
            </label>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {replyModal.review?.content || '无评价内容'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              回复内容
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="请输入回复内容..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeReplyModal}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={replyLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {replyLoading ? '提交中...' : '提交回复'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
