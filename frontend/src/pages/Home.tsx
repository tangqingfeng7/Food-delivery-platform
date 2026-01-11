import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Clock, Star, ChevronRight, Flame, Zap, Award, Coffee, Pizza, Soup } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { getCategories } from '../api/category'
import { getFeaturedRestaurants } from '../api/restaurant'
import { getImageUrl } from '../api/upload'
import { useLocationStore } from '../store/useLocationStore'
import { Category, Restaurant } from '../types'

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  flame: Flame,
  award: Award,
  coffee: Coffee,
  pizza: Pizza,
  soup: Soup,
  star: Star,
}

const Home = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  // 获取用户位置
  const { 
    latitude: userLat, 
    longitude: userLng, 
    address,
    isLocating,
    getCurrentPosition 
  } = useLocationStore()

  // 获取用户位置
  useEffect(() => {
    getCurrentPosition()
  }, [])

  useEffect(() => {
    fetchData()
  }, [userLat, userLng])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, restaurantsRes] = await Promise.all([
        getCategories(),
        getFeaturedRestaurants(6, userLat ?? undefined, userLng ?? undefined),
      ])
      setCategories(categoriesRes.data.data)
      setFeaturedRestaurants(restaurantsRes.data.data)
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      navigate(`/restaurants?keyword=${encodeURIComponent(searchKeyword)}`)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const getIconComponent = (iconName: string) => {
    const Icon = iconMap[iconName.toLowerCase()] || Star
    return Icon
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                闪电配送，新鲜直达
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-display font-bold mb-6"
            >
              <span className="text-gray-800">发现</span>
              <span className="text-gradient">美食</span>
              <br />
              <span className="text-gray-800">尽在指尖</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-10"
            >
              汇聚千家餐厅，万种美味，为您提供便捷、快速、优质的外卖服务
            </motion.p>

            {/* Search Bar */}
            <motion.div
              variants={itemVariants}
              className="max-w-3xl mx-auto"
            >
              <div className="p-4 rounded-2xl glass shadow-xl shadow-orange-500/10">
                <div className="flex flex-col md:flex-row gap-3">
                  <div 
                    className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 border border-gray-100 cursor-pointer hover:border-orange-300 transition-colors min-w-0 overflow-hidden"
                    onClick={() => !isLocating && getCurrentPosition()}
                  >
                    <MapPin className={`w-5 h-5 flex-shrink-0 ${isLocating ? 'text-gray-400 animate-pulse' : 'text-orange-500'}`} />
                    <span className={`truncate ${address ? 'text-gray-700' : 'text-gray-400'}`}>
                      {isLocating ? '正在获取位置...' : (address || '点击获取当前位置')}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 border border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="搜索餐厅或美食"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 min-w-0"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleSearch}
                    className="px-8 whitespace-nowrap flex-shrink-0"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    搜索
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">
              探索美食分类
            </h2>
            <p className="text-gray-600">选择您喜爱的美食类型</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl p-6 h-32"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {categories.map((category) => {
                const Icon = getIconComponent(category.icon)
                return (
                  <motion.div
                    key={category.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to={`/restaurants?categoryId=${category.id}`}>
                      <Card className="p-6 text-center cursor-pointer group">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {category.restaurantCount}家餐厅
                        </p>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 bg-gradient-to-b from-transparent to-orange-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-800 mb-2">
                推荐餐厅
              </h2>
              <p className="text-gray-600">精选优质餐厅，品质保证</p>
            </div>
            <Link to="/restaurants">
              <Button variant="outline" rightIcon={<ChevronRight className="w-5 h-5" />}>
                查看更多
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredRestaurants.map((restaurant) => (
                <motion.div key={restaurant.id} variants={itemVariants}>
                  <Link to={`/restaurant/${restaurant.id}`}>
                    <Card className="overflow-hidden group cursor-pointer">
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          src={getImageUrl(restaurant.image)}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {restaurant.isNew && (
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium">
                            新店
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                          {restaurant.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700"
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
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-orange-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-semibold">{restaurant.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{restaurant.deliveryTime}送达</span>
                          </div>
                          <div className="text-gray-500">
                            起送¥{restaurant.minOrder}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 p-12 md:p-16 text-center text-white"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-20 -right-20 w-60 h-60 border-[30px] border-white/10 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-10 -left-10 w-40 h-40 border-[20px] border-white/10 rounded-full"
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                准备好开始点餐了吗？
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                立即下载美食速递APP，享受更多优惠和便捷服务
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50"
                >
                  下载 iOS 版本
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  下载 Android 版本
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
