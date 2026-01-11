import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  MessageCircle,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Clock,
  ThumbsUp,
  User,
  X,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { getMyRestaurant } from '../../api/merchant'
import { getRestaurantReviews, replyReview } from '../../api/review'
import { getImageUrl } from '../../api/upload'
import { Review, PageResponse } from '../../types'
import { toast } from '../../store/useToastStore'

const MerchantReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [replyingId, setReplyingId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchRestaurant()
  }, [])

  useEffect(() => {
    if (restaurantId) {
      fetchReviews()
    }
  }, [restaurantId, page])

  const fetchRestaurant = async () => {
    try {
      const res = await getMyRestaurant()
      if (res.data.data) {
        setRestaurantId(res.data.data.id)
      }
    } catch (error) {
      console.error('获取店铺信息失败:', error)
      toast.error('获取店铺信息失败')
    }
  }

  const fetchReviews = async () => {
    if (!restaurantId) return
    try {
      setLoading(true)
      const res = await getRestaurantReviews(restaurantId, page, 10)
      if (res.data.data) {
        const pageData = res.data.data as PageResponse<Review>
        setReviews(pageData.content)
        setTotalPages(pageData.totalPages)
        setTotalElements(pageData.totalElements)
      }
    } catch (error) {
      console.error('获取评价列表失败:', error)
      toast.error('获取评价列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (reviewId: number) => {
    if (!replyContent.trim()) {
      toast.warning('请输入回复内容')
      return
    }

    try {
      setSubmitting(true)
      await replyReview(reviewId, replyContent.trim())
      toast.success('回复成功')
      setReplyingId(null)
      setReplyContent('')
      fetchReviews()
    } catch (error) {
      console.error('回复失败:', error)
      toast.error('回复失败')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`w-4 h-4 ${
              value <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading && !reviews.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (!restaurantId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">请先创建店铺</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">评价管理</h1>
          <p className="text-gray-500 mt-1">共 {totalElements} 条评价</p>
        </div>
      </div>

      {/* 评价列表 */}
      {reviews.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无评价</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5">
                {/* 用户信息和评分 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.userAvatar && !review.isAnonymous ? (
                      <img
                        src={getImageUrl(review.userAvatar)}
                        alt={review.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {review.isAnonymous ? '匿名用户' : review.username}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(review.overallRating)}
                      <span className="ml-1 font-medium text-orange-500">
                        {review.overallRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>口味 {review.tasteRating}</span>
                      <span>包装 {review.packagingRating}</span>
                      <span>配送 {review.deliveryRating}</span>
                    </div>
                  </div>
                </div>

                {/* 评价内容 */}
                {review.content && (
                  <p className="text-gray-700 mb-4">{review.content}</p>
                )}

                {/* 评价图片 */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.images.map((img, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative group cursor-pointer"
                        onClick={() => setPreviewImage(img)}
                      >
                        <img
                          src={img}
                          alt={`评价图片 ${imgIndex + 1}`}
                          className="w-20 h-20 rounded-lg object-cover hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 订单菜品 */}
                {review.orderItems && review.orderItems.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-500 mb-2">订单菜品：</p>
                    <div className="flex flex-wrap gap-2">
                      {review.orderItems.map((item) => (
                        <span
                          key={item.id}
                          className="px-2 py-1 bg-white rounded text-sm text-gray-600"
                        >
                          {item.menuItemName} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 点赞数 */}
                {review.likeCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.likeCount} 人觉得有帮助</span>
                  </div>
                )}

                {/* 商家回复 */}
                {review.replyContent ? (
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded">
                        商家回复
                      </span>
                      {review.replyTime && (
                        <span className="text-xs text-gray-500">
                          {formatDate(review.replyTime)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{review.replyContent}</p>
                  </div>
                ) : (
                  <div>
                    {replyingId === review.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="请输入回复内容..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            {replyContent.length}/500
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingId(null)
                                setReplyContent('')
                              }}
                            >
                              取消
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReply(review.id)}
                              disabled={submitting || !replyContent.trim()}
                            >
                              {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              <span className="ml-1">发送回复</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingId(review.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        回复评价
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </Button>
          <span className="text-sm text-gray-600">
            第 {page + 1} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 图片预览弹窗 */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={previewImage}
                alt="预览图片"
                className="max-w-full max-h-[90vh] rounded-lg object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MerchantReviews
