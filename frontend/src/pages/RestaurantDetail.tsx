import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, MapPin, Phone, Plus, Minus, ShoppingCart, Heart, Share2, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ReviewList from '../components/ReviewList'
import { getRestaurantById, getMenuCategories, getMenuItems } from '../api/restaurant'
import { getRestaurantReviewStats } from '../api/review'
import { addFavorite, removeFavorite, checkFavorite } from '../api/favorite'
import { getImageUrl } from '../api/upload'
import { useCartStore } from '../store/useCartStore'
import { useUserStore } from '../store/useUserStore'
import { useLocationStore, calculateDistance } from '../store/useLocationStore'
import { confirm } from '../store/useConfirmStore'
import { toast } from '../store/useToastStore'
import { Restaurant, MenuItem, MenuCategory } from '../types'

const RestaurantDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu')
  const [actualReviewCount, setActualReviewCount] = useState<number | null>(null)

  const { isLoggedIn } = useUserStore()
  const { 
    latitude: userLat, 
    longitude: userLng, 
    isLocated, 
    getCurrentPosition 
  } = useLocationStore()
  const { 
    addItem, 
    removeItem, 
    getItemQuantity, 
    getTotalCount, 
    getTotalPrice,
    restaurantId: cartRestaurantId 
  } = useCartStore()

  // 获取用户位置
  useEffect(() => {
    getCurrentPosition()
  }, [])

  useEffect(() => {
    if (id) {
      fetchRestaurantData(Number(id))
    }
  }, [id, userLat, userLng])

  // 检查是否已收藏
  useEffect(() => {
    if (id && isLoggedIn) {
      checkFavoriteStatus(Number(id))
    }
  }, [id, isLoggedIn])

  // 获取评价统计
  useEffect(() => {
    if (id) {
      fetchReviewStats(Number(id))
    }
  }, [id])

  const fetchReviewStats = async (restaurantId: number) => {
    try {
      const res = await getRestaurantReviewStats(restaurantId)
      setActualReviewCount(res.data.data.totalReviews)
    } catch (error) {
      console.error('获取评价统计失败:', error)
      setActualReviewCount(0)
    }
  }

  useEffect(() => {
    if (id && activeCategory !== null) {
      fetchMenuItems(Number(id), activeCategory)
    }
  }, [activeCategory])

  const fetchRestaurantData = async (restaurantId: number) => {
    try {
      setLoading(true)
      const [restaurantRes, categoriesRes] = await Promise.all([
        getRestaurantById(
          restaurantId,
          userLat ?? undefined,
          userLng ?? undefined
        ),
        getMenuCategories(restaurantId),
      ])
      
      setRestaurant(restaurantRes.data.data)
      setMenuCategories(categoriesRes.data.data)
      
      // 默认选中第一个分类
      if (categoriesRes.data.data.length > 0) {
        setActiveCategory(categoriesRes.data.data[0].id)
      }
    } catch (error) {
      console.error('获取餐厅数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenuItems = async (restaurantId: number, categoryId: number) => {
    try {
      const res = await getMenuItems(restaurantId, categoryId)
      setMenuItems(res.data.data)
    } catch (error) {
      console.error('获取菜品失败:', error)
    }
  }

  const checkFavoriteStatus = async (restaurantId: number) => {
    try {
      const res = await checkFavorite(restaurantId)
      setIsFavorite(res.data.data)
    } catch (error) {
      console.error('检查收藏状态失败:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.warning('请先登录', '登录后可收藏餐厅')
      navigate('/login')
      return
    }

    if (!id || favoriteLoading) return

    try {
      setFavoriteLoading(true)
      if (isFavorite) {
        await removeFavorite(Number(id))
        setIsFavorite(false)
        toast.success('已取消收藏')
      } else {
        await addFavorite(Number(id))
        setIsFavorite(true)
        toast.success('收藏成功')
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      toast.error('操作失败', '请稍后重试')
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleAddToCart = async (item: MenuItem) => {
    if (restaurant) {
      // 如果购物车中有其他餐厅的商品，提示用户
      if (cartRestaurantId && cartRestaurantId !== restaurant.id) {
        const confirmed = await confirm({
          type: 'warning',
          title: '切换餐厅',
          message: '购物车中有其他餐厅的商品，是否清空并添加新商品？',
          confirmText: '清空并添加',
          cancelText: '取消',
        })
        if (confirmed) {
          addItem(item, restaurant.id, restaurant.name)
        }
      } else {
        addItem(item, restaurant.id, restaurant.name)
      }
    }
  }

  const handleCheckout = () => {
    navigate('/cart')
  }

  // 实时计算距离
  const realDistance = useMemo(() => {
    if (!restaurant) return null
    
    // 如果有用户位置和餐厅位置，计算真实距离
    if (isLocated && userLat && userLng && 
        restaurant.latitude && restaurant.longitude) {
      const distance = calculateDistance(
        userLat, 
        userLng, 
        restaurant.latitude, 
        restaurant.longitude
      )
      return Math.round(distance * 10) / 10 // 保留一位小数
    }
    
    // 否则使用餐厅默认距离
    return restaurant.distance
  }, [restaurant, userLat, userLng, isLocated])

  // 根据距离计算预计送达时间
  const realDeliveryTime = useMemo(() => {
    if (!restaurant) return null
    
    // 如果有真实距离，根据距离计算预计送达时间
    if (realDistance !== null && isLocated && userLat && userLng && 
        restaurant.latitude && restaurant.longitude) {
      const BASE_PREP_TIME = 15  // 基础准备时间（分钟）
      const TIME_PER_KM = 3      // 每公里配送时间（分钟）
      
      const totalMinutes = BASE_PREP_TIME + Math.ceil(realDistance * TIME_PER_KM)
      
      // 计算预计送达时间
      const now = new Date()
      now.setMinutes(now.getMinutes() + totalMinutes)
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      
      return `${hours}:${minutes}`
    }
    
    // 否则使用餐厅默认配送时间
    return restaurant.deliveryTime
  }, [restaurant, realDistance, isLocated, userLat, userLng])

  const totalItems = getTotalCount()
  const totalPrice = getTotalPrice()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">餐厅不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={getImageUrl(restaurant.image)}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {restaurant.logo && (
                      <img 
                        src={getImageUrl(restaurant.logo)} 
                        alt={restaurant.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    )}
                    <h1 className="text-3xl font-bold text-white">
                      {restaurant.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{restaurant.rating}</span>
                      <span className="text-white/60">({actualReviewCount ?? restaurant.reviewCount}评价)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{realDeliveryTime ?? restaurant.deliveryTime}送达</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{realDistance ?? restaurant.distance}km</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    className={`p-3 rounded-full backdrop-blur transition-colors ${
                      isFavorite 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavorite ? '取消收藏' : '收藏餐厅'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Card className="p-5 mb-6">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-500" />
              <span>{restaurant.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>营业时间: {restaurant.openTime} - {restaurant.closeTime}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
            <span className="text-gray-600">
              配送费 <span className="text-orange-500 font-semibold">¥{restaurant.deliveryFee}</span>
            </span>
            <span className="text-gray-600">
              起送价 <span className="text-orange-500 font-semibold">¥{restaurant.minOrder}</span>
            </span>
            {!restaurant.isOpen && (
              <span className="text-red-500 font-medium">休息中</span>
            )}
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === 'menu'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white text-gray-600 hover:bg-orange-50'
            }`}
          >
            菜单
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === 'reviews'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white text-gray-600 hover:bg-orange-50'
            }`}
          >
            评价 ({actualReviewCount ?? restaurant.reviewCount})
          </button>
        </div>

        {/* Menu Section */}
        {activeTab === 'menu' && (
        <div className="flex gap-6">
          {/* Category Sidebar */}
          <div className="hidden md:block w-48 flex-shrink-0">
            <Card className="p-2 sticky top-24">
              {menuCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                  <span className={`ml-2 text-sm ${
                    activeCategory === category.id ? 'text-orange-200' : 'text-gray-400'
                  }`}>
                    ({category.itemCount})
                  </span>
                </motion.button>
              ))}
            </Card>
          </div>

          {/* Menu Items */}
          <div className="flex-1">
            {/* Mobile Category Tabs */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {menuCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-all ${
                    activeCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {menuItems.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  暂无菜品
                </div>
              ) : (
                menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`p-4 flex gap-4 ${!item.isAvailable ? 'opacity-60' : ''}`}>
                      <div
                        className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/menu-item/${item.id}`)}
                      >
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {item.isHot && (
                          <div className="absolute top-1 left-1 px-2 py-0.5 rounded bg-red-500 text-white text-xs">
                            热销
                          </div>
                        )}
                        {item.isNew && (
                          <div className="absolute top-1 right-1 px-2 py-0.5 rounded bg-green-500 text-white text-xs">
                            新品
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3
                          className="font-semibold text-gray-800 mb-1 cursor-pointer hover:text-orange-500 transition-colors"
                          onClick={() => navigate(`/menu-item/${item.id}`)}
                        >
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-400 mb-auto">
                          月售 {item.sales} 份
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-orange-500">
                              ¥{item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ¥{item.originalPrice}
                              </span>
                            )}
                          </div>
                          {item.isAvailable ? (
                            <div className="flex items-center gap-3">
                              <AnimatePresence>
                                {getItemQuantity(item.id) > 0 && (
                                  <>
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeItem(item.id)
                                      }}
                                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </motion.button>
                                    <motion.span
                                      key={getItemQuantity(item.id)}
                                      initial={{ scale: 1.3 }}
                                      animate={{ scale: 1 }}
                                      className="font-semibold text-gray-800 w-6 text-center"
                                    >
                                      {getItemQuantity(item.id)}
                                    </motion.span>
                                  </>
                                )}
                              </AnimatePresence>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddToCart(item)
                                }}
                                className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">已售罄</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
        )}

        {/* Reviews Section */}
        {activeTab === 'reviews' && (
          <ReviewList restaurantId={restaurant.id} />
        )}
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
            <div className="max-w-7xl mx-auto flex items-center justify-between">
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
                onClick={handleCheckout}
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

export default RestaurantDetail
