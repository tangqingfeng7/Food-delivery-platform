import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Star, Clock, MapPin, ChevronDown, Loader2 } from 'lucide-react'
import Card from '../components/ui/Card'
import { getRestaurants } from '../api/restaurant'
import { getCategories } from '../api/category'
import { getImageUrl } from '../api/upload'
import { useLocationStore } from '../store/useLocationStore'
import { Restaurant, Category } from '../types'

const RestaurantList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null
  )
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [sortBy, setSortBy] = useState('rating')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // 获取用户位置
  const { 
    latitude: userLat, 
    longitude: userLng, 
    isLocated,
    getCurrentPosition 
  } = useLocationStore()

  // 获取用户位置
  useEffect(() => {
    getCurrentPosition()
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchRestaurants()
  }, [selectedCategory, sortBy, page, userLat, userLng])

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      setCategories(res.data.data)
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const res = await getRestaurants({
        categoryId: selectedCategory || undefined,
        keyword: keyword || undefined,
        sortBy,
        page,
        size: 12,
        userLat: userLat ?? undefined,
        userLng: userLng ?? undefined,
      })
      setRestaurants(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
    } catch (error) {
      console.error('获取餐厅列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(0)
    fetchRestaurants()
  }

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setPage(0)
    if (categoryId) {
      setSearchParams({ categoryId: String(categoryId) })
    } else {
      setSearchParams({})
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-800 mb-2">
            附近餐厅
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>北京市朝阳区科技园区</span>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white shadow-lg shadow-gray-200/50">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索餐厅或美食..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent outline-none text-gray-700"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
                showFilters
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 shadow-lg shadow-gray-200/50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>筛选</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </motion.button>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">排序方式</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'rating', label: '评分最高' },
                          { key: 'distance', label: '距离最近' },
                          { key: 'deliveryTime', label: '配送最快' },
                          { key: 'minOrder', label: '起送最低' },
                        ].map((sort) => (
                          <button
                            key={sort.key}
                            onClick={() => setSortBy(sort.key)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${
                              sortBy === sort.key
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {sort.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">配送费用</h3>
                      <div className="flex flex-wrap gap-2">
                        {['全部', '免配送费', '5元以下'].map((fee) => (
                          <button
                            key={fee}
                            className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                          >
                            {fee}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(null)}
              className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-600 hover:bg-orange-50 shadow-md'
              }`}
            >
              全部
            </motion.button>
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white text-gray-600 hover:bg-orange-50 shadow-md'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">暂无餐厅数据</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {restaurants.map((restaurant) => (
              <motion.div key={restaurant.id} variants={itemVariants}>
                <Link to={`/restaurant/${restaurant.id}`}>
                  <Card className="overflow-hidden group cursor-pointer h-full">
                    <div className="relative h-48 overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        src={getImageUrl(restaurant.image)}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {restaurant.isNew && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium">
                          新店
                        </div>
                      )}
                      
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        {restaurant.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-1 text-orange-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-semibold">{restaurant.rating}</span>
                          <span className="text-gray-400">({restaurant.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{restaurant.distance}km</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{restaurant.deliveryTime}送达</span>
                        </div>
                        <span>配送费¥{restaurant.deliveryFee}</span>
                        <span>起送¥{restaurant.minOrder}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-10 h-10 rounded-lg transition-all ${
                  page === i
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-orange-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantList
