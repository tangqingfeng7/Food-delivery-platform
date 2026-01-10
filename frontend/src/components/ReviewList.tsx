import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, MessageCircle, ChevronDown, Loader2, User } from 'lucide-react'
import RatingStars from './RatingStars'
import { getRestaurantReviews, getRestaurantReviewStats, likeReview, unlikeReview } from '../api/review'
import { getImageUrl } from '../api/upload'
import { useUserStore } from '../store/useUserStore'
import { toast } from '../store/useToastStore'
import type { Review, ReviewStats, PageResponse } from '../types'

interface ReviewListProps {
  restaurantId: number
}

const ReviewList = ({ restaurantId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [expandedImages, setExpandedImages] = useState<number | null>(null)
  
  const { isLoggedIn } = useUserStore()

  useEffect(() => {
    fetchStats()
    fetchReviews(0)
  }, [restaurantId])

  const fetchStats = async () => {
    try {
      const res = await getRestaurantReviewStats(restaurantId)
      setStats(res.data.data)
    } catch (error) {
      console.error('获取评价统计失败:', error)
    }
  }

  const fetchReviews = async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const res = await getRestaurantReviews(restaurantId, pageNum, 10)
      const pageData: PageResponse<Review> = res.data.data

      if (pageNum === 0) {
        setReviews(pageData.content)
      } else {
        setReviews(prev => [...prev, ...pageData.content])
      }

      setPage(pageNum)
      setHasMore(pageNum < pageData.totalPages - 1)
    } catch (error) {
      console.error('获取评价列表失败:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(page + 1)
    }
  }

  const handleLike = async (reviewId: number, isLiked: boolean) => {
    if (!isLoggedIn) {
      toast.warning('请先登录', '登录后可点赞评价')
      return
    }

    try {
      if (isLiked) {
        await unlikeReview(reviewId)
      } else {
        await likeReview(reviewId)
      }

      // 更新本地状态
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? {
                ...review,
                isLiked: !isLiked,
                likeCount: isLiked ? review.likeCount - 1 : review.likeCount + 1
              }
            : review
        )
      )
    } catch (error: any) {
      console.error('点赞操作失败:', error)
      toast.error('操作失败', error.response?.data?.message || '请稍后重试')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    if (days < 30) return `${Math.floor(days / 7)}周前`
    if (days < 365) return `${Math.floor(days / 30)}个月前`
    return `${Math.floor(days / 365)}年前`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 评价统计 */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6">
          <div className="flex items-center gap-6">
            {/* 综合评分 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">
                {stats.averageRating.toFixed(1)}
              </div>
              <RatingStars rating={stats.averageRating} size="sm" />
              <div className="text-sm text-gray-500 mt-1">
                {stats.totalReviews}条评价
              </div>
            </div>

            {/* 分项评分 */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 w-12">口味</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${(stats.avgTasteRating / 5) * 100}%` }}
                  />
                </div>
                <span className="text-gray-700 font-medium w-8">
                  {stats.avgTasteRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 w-12">包装</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${(stats.avgPackagingRating / 5) * 100}%` }}
                  />
                </div>
                <span className="text-gray-700 font-medium w-8">
                  {stats.avgPackagingRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 w-12">配送</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${(stats.avgDeliveryRating / 5) * 100}%` }}
                  />
                </div>
                <span className="text-gray-700 font-medium w-8">
                  {stats.avgDeliveryRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 评价列表 */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无评价
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-5 border border-gray-100"
            >
              {/* 用户信息 */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {review.userAvatar ? (
                    <img
                      src={getImageUrl(review.userAvatar)}
                      alt={review.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">
                      {review.username}
                    </span>
                    <span className="text-sm text-gray-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <RatingStars rating={review.overallRating} size="sm" />
                </div>
              </div>

              {/* 订单商品 */}
              {review.orderItems && review.orderItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {review.orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5"
                    >
                      {item.menuItemImage && (
                        <img
                          src={getImageUrl(item.menuItemImage)}
                          alt={item.menuItemName}
                          className="w-6 h-6 rounded object-cover"
                        />
                      )}
                      <span className="text-sm text-gray-600">
                        {item.menuItemName}
                        {item.quantity > 1 && ` x${item.quantity}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 分项评分 */}
              <div className="flex gap-4 mb-3 text-xs text-gray-500">
                <span>口味 {review.tasteRating}分</span>
                <span>包装 {review.packagingRating}分</span>
                <span>配送 {review.deliveryRating}分</span>
              </div>

              {/* 评价内容 */}
              {review.content && (
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {review.content}
                </p>
              )}

              {/* 评价图片 */}
              {review.images && review.images.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {(expandedImages === review.id
                      ? review.images
                      : review.images.slice(0, 3)
                    ).map((image, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-20 h-20 rounded-lg overflow-hidden"
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`评价图片${idx + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(getImageUrl(image), '_blank')}
                        />
                      </motion.div>
                    ))}
                    {review.images.length > 3 && expandedImages !== review.id && (
                      <button
                        onClick={() => setExpandedImages(review.id)}
                        className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm hover:bg-gray-200 transition-colors"
                      >
                        +{review.images.length - 3}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 商家回复 */}
              {review.replyContent && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">商家回复</span>
                  </div>
                  <p className="text-sm text-gray-600">{review.replyContent}</p>
                </div>
              )}

              {/* 点赞 */}
              <div className="flex items-center justify-end">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(review.id, review.isLiked)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    review.isLiked
                      ? 'bg-orange-100 text-orange-500'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${review.isLiked ? 'fill-current' : ''}`} />
                  <span>{review.likeCount > 0 ? review.likeCount : '赞'}</span>
                </motion.button>
              </div>
            </motion.div>
          ))}

          {/* 加载更多 */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-3 text-center text-gray-500 hover:text-orange-500 transition-colors"
            >
              {loadingMore ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-1">
                  加载更多
                  <ChevronDown className="w-4 h-4" />
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewList
