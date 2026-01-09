import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Star, Clock, MapPin, Loader2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useUserStore } from '../store/useUserStore'
import { getFavorites, removeFavorite } from '../api/favorite'
import { getImageUrl } from '../api/upload'
import { Favorite } from '../types'
import { toast } from '../store/useToastStore'
import { confirm } from '../store/useConfirmStore'

const Favorites = () => {
  const navigate = useNavigate()
  const { isLoggedIn } = useUserStore()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    
    fetchFavorites()
  }, [isLoggedIn, navigate])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const res = await getFavorites()
      setFavorites(res.data.data)
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      toast.error('获取收藏列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (restaurantId: number) => {
    const confirmed = await confirm({
      type: 'warning',
      title: '取消收藏',
      message: '确定要取消收藏该餐厅吗？',
      confirmText: '取消收藏',
      cancelText: '保留',
    })

    if (!confirmed) return

    try {
      await removeFavorite(restaurantId)
      setFavorites(prev => prev.filter(f => f.restaurantId !== restaurantId))
      toast.success('已取消收藏')
    } catch (error) {
      console.error('取消收藏失败:', error)
      toast.error('取消收藏失败')
    }
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
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">收藏餐厅</h1>
        </motion.div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <Heart className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">暂无收藏</h2>
            <p className="text-gray-500 mb-8">去发现更多美食吧</p>
            <Button onClick={() => navigate('/restaurants')}>
              去逛逛
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={getImageUrl(favorite.restaurant.image)}
                      alt={favorite.restaurant.name}
                      className="w-24 h-24 rounded-xl object-cover cursor-pointer"
                      onClick={() => navigate(`/restaurant/${favorite.restaurantId}`)}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div 
                          className="cursor-pointer"
                          onClick={() => navigate(`/restaurant/${favorite.restaurantId}`)}
                        >
                          <h3 className="font-semibold text-gray-800">{favorite.restaurant.name}</h3>
                          <p className="text-sm text-gray-500">{favorite.restaurant.categoryName}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(favorite.restaurantId)}
                          className="p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{favorite.restaurant.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{favorite.restaurant.deliveryTime}分钟</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{favorite.restaurant.distance}km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Favorites
