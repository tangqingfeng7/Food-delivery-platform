import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Flame,
  Sparkles,
  ThumbsUp,
  MessageCircle,
  ChevronDown,
  Loader2,
  User,
  Store
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import RatingStars from '../components/RatingStars'
import { getMenuItemById, getRestaurantById } from '../api/restaurant'
import { getMenuItemReviews, getMenuItemReviewStats, likeReview, unlikeReview } from '../api/review'
import { getImageUrl } from '../api/upload'
import { useCartStore } from '../store/useCartStore'
import { useUserStore } from '../store/useUserStore'
import { toast } from '../store/useToastStore'
import type { MenuItem, Restaurant, Review, PageResponse } from '../types'

const MenuItemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<{ totalReviews: number; averageRating: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [expandedImages, setExpandedImages] = useState<number | null>(null)

  const { isLoggedIn } = useUserStore()
  const {
    addItem,
    removeItem,
    getItemQuantity,
    getTotalCount,
    getTotalPrice
  } = useCartStore()

  useEffect(() => {
    if (id) {
      fetchMenuItemData(Number(id))
    }
  }, [id])

  const fetchMenuItemData = async (menuItemId: number) => {
    try {
      setLoading(true)
      // 获取菜品详情
      const itemRes = await getMenuItemById(menuItemId)
      const item = itemRes.data.data
      setMenuItem(item)

      // 获取餐厅信息
      const restaurantRes = await getRestaurantById(item.restaurantId)
      setRestaurant(restaurantRes.data.data)

      // 获取评价统计
      const statsRes = await getMenuItemReviewStats(menuItemId)
      setReviewStats(statsRes.data.data)

      // 获取评价列表
      await fetchReviews(menuItemId, 0)
    } catch (error) {
      console.error('获取菜品数据失败:', error)
      toast.error('加载失败', '无法获取菜品信息')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async (menuItemId: number, pageNum: number) => {
    try {
      if (pageNum > 0) {
        setLoadingMore(true)
      }

      const res = await getMenuItemReviews(menuItemId, pageNum, 10)
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
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && id) {
      fetchReviews(Number(id), page + 1)
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

  const handleAddToCart = () => {
    if (!menuItem || !restaurant) return
    addItem(menuItem, restaurant.id, restaurant.name)
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

  const totalItems = getTotalCount()
  const totalPrice = getTotalPrice()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (!menuItem || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">菜品不存在</p>
      </div>
    )
  }

  const quantity = getItemQuantity(menuItem.id)

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      {/* Header */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={getImageUrl(menuItem.image)}
          alt={menuItem.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur text-white hover:bg-black/50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        {/* Tags */}
        <div className="absolute top-4 right-4 flex gap-2">
          {menuItem.isHot && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium">
              <Flame className="w-4 h-4" />
              <span>热销</span>
            </div>
          )}
          {menuItem.isNew && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500 text-white text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>新品</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        {/* Menu Item Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {menuItem.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-700">
                      {reviewStats?.averageRating?.toFixed(1) || '暂无'}
                    </span>
                    <span>({reviewStats?.totalReviews || 0}条评价)</span>
                  </div>
                  <span>月售 {menuItem.sales} 份</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-500">
                  ¥{menuItem.price}
                </div>
                {menuItem.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    ¥{menuItem.originalPrice}
                  </div>
                )}
              </div>
            </div>

            {menuItem.description && (
              <p className="text-gray-600 mb-4 leading-relaxed">
                {menuItem.description}
              </p>
            )}

            {/* Add to Cart */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {quantity > 0 && (
                    <>
                      <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(menuItem.id)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </motion.button>
                      <motion.span
                        key={quantity}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="font-semibold text-gray-800 w-8 text-center text-lg"
                      >
                        {quantity}
                      </motion.span>
                    </>
                  )}
                </AnimatePresence>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  disabled={!menuItem.isAvailable}
                  className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
              {!menuItem.isAvailable && (
                <span className="text-red-500 font-medium">已售罄</span>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Restaurant Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="p-4 mb-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                {restaurant.logo ? (
                  <img
                    src={getImageUrl(restaurant.logo)}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{restaurant.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{restaurant.rating}</span>
                  </div>
                  <span>|</span>
                  <span>{restaurant.deliveryTime}送达</span>
                </div>
              </div>
              <span className="text-orange-500 text-sm font-medium">进店看看</span>
            </div>
          </Card>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              用户评价 ({reviewStats?.totalReviews || 0})
            </h2>
          </div>

          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              暂无评价，快来尝尝这道菜吧~
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
                    {/* User Info */}
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

                    {/* Order Items */}
                    {review.orderItems && review.orderItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.orderItems.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                              item.menuItemId === menuItem.id
                                ? 'bg-orange-50 border border-orange-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            {item.menuItemImage && (
                              <img
                                src={getImageUrl(item.menuItemImage)}
                                alt={item.menuItemName}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <span className={`text-sm ${
                              item.menuItemId === menuItem.id
                                ? 'text-orange-600 font-medium'
                                : 'text-gray-600'
                            }`}>
                              {item.menuItemName}
                              {item.quantity > 1 && ` x${item.quantity}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rating Details */}
                    <div className="flex gap-4 mb-3 text-xs text-gray-500">
                      <span>口味 {review.tasteRating}分</span>
                      <span>包装 {review.packagingRating}分</span>
                      <span>配送 {review.deliveryRating}分</span>
                    </div>

                    {/* Content */}
                    {review.content && (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {review.content}
                      </p>
                    )}

                    {/* Images */}
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

                    {/* Merchant Reply */}
                    {review.replyContent && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-500">商家回复</span>
                        </div>
                        <p className="text-sm text-gray-600">{review.replyContent}</p>
                      </div>
                    )}

                    {/* Like Button */}
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
                  </Card>
                </motion.div>
              ))}

              {/* Load More */}
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
        </motion.div>
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-50"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/cart')}
                className="flex items-center gap-4"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    key={totalItems}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-800">
                    ¥{totalPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {restaurant && totalPrice >= restaurant.minOrder
                      ? '已满足起送'
                      : `还差¥${(restaurant!.minOrder - totalPrice).toFixed(2)}起送`}
                  </p>
                </div>
              </motion.button>
              <Button
                size="lg"
                disabled={!restaurant || totalPrice < restaurant.minOrder}
                onClick={() => navigate('/cart')}
                className="min-w-[140px]"
              >
                去结算
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MenuItemDetail
