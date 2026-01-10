import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Search, Navigation, Loader2 } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import { AMAP_KEY, AMAP_SECURITY_CODE, DEFAULT_CENTER, DEFAULT_ZOOM } from '../config/map'

interface Location {
  lng: number
  lat: number
  address: string
  name?: string
}

interface MapPickerProps {
  visible: boolean
  onClose: () => void
  onConfirm: (location: Location) => void
  initialLocation?: {
    lng: number
    lat: number
  }
}

// 声明 AMap 类型
declare global {
  interface Window {
    AMap: typeof AMap
    _AMapSecurityConfig: {
      securityJsCode: string
    }
  }
}

const MapPicker = ({ visible, onClose, onConfirm, initialLocation }: MapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<AMap.Map | null>(null)
  const markerRef = useRef<AMap.Marker | null>(null)
  const geocoderRef = useRef<AMap.Geocoder | null>(null)
  const placeSearchRef = useRef<AMap.PlaceSearch | null>(null)

  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<AMap.PlaceSearch.SearchResult['pois']>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // 加载高德地图
  const loadAMap = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.AMap) {
        resolve()
        return
      }

      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJsCode: AMAP_SECURITY_CODE
      }

      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder,AMap.PlaceSearch,AMap.Geolocation`
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('高德地图加载失败'))
      document.head.appendChild(script)
    })
  }, [])

  // 初始化地图
  const initMap = useCallback(async () => {
    if (!mapRef.current) return

    try {
      await loadAMap()

      // 创建地图实例
      const map = new window.AMap.Map(mapRef.current, {
        zoom: DEFAULT_ZOOM,
        center: initialLocation ? [initialLocation.lng, initialLocation.lat] : DEFAULT_CENTER,
        viewMode: '2D',
      })

      mapInstanceRef.current = map

      // 创建标记
      const marker = new window.AMap.Marker({
        position: map.getCenter(),
        draggable: true,
        cursor: 'move',
        animation: 'AMAP_ANIMATION_DROP'
      })

      marker.setMap(map)
      markerRef.current = marker

      // 创建地理编码器
      const geocoder = new window.AMap.Geocoder({
        city: '全国',
        radius: 1000
      })
      geocoderRef.current = geocoder

      // 创建搜索实例
      const placeSearch = new window.AMap.PlaceSearch({
        city: '全国',
        pageSize: 10
      })
      placeSearchRef.current = placeSearch

      // 监听地图点击事件
      map.on('click', (e: AMap.MapsEvent) => {
        const { lng, lat } = e.lnglat
        updateMarkerPosition(lng, lat)
      })

      // 监听标记拖拽结束事件
      marker.on('dragend', () => {
        const position = marker.getPosition() as AMap.LngLat
        if (position) {
          reverseGeocode(position.getLng(), position.getLat())
        }
      })

      // 如果有初始位置，进行反向地理编码获取地址
      if (initialLocation) {
        reverseGeocode(initialLocation.lng, initialLocation.lat)
      } else {
        // 获取当前定位
        getCurrentLocation()
      }

      setLoading(false)
    } catch (error) {
      console.error('地图初始化失败:', error)
      setLoading(false)
    }
  }, [initialLocation, loadAMap])

  // 更新标记位置
  const updateMarkerPosition = useCallback((lng: number, lat: number) => {
    if (markerRef.current && mapInstanceRef.current) {
      const position = new window.AMap.LngLat(lng, lat)
      markerRef.current.setPosition(position)
      mapInstanceRef.current.setCenter(position)
      reverseGeocode(lng, lat)
    }
  }, [])

  // 反向地理编码（经纬度 -> 地址）
  const reverseGeocode = useCallback((lng: number, lat: number) => {
    if (!geocoderRef.current) return

    geocoderRef.current.getAddress(new window.AMap.LngLat(lng, lat), (status: string, result: AMap.Geocoder.ReGeocodeResult) => {
      if (status === 'complete' && result.regeocode) {
        const address = result.regeocode.formattedAddress
        const addressComponent = result.regeocode.addressComponent
        const name = addressComponent.building || addressComponent.neighborhood || addressComponent.township || ''
        setSelectedLocation({
          lng,
          lat,
          address,
          name
        })
      }
    })
  }, [])

  // 获取当前定位
  const getCurrentLocation = useCallback(() => {
    if (!mapInstanceRef.current) return

    setLocating(true)

    const geolocation = new window.AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      buttonPosition: 'RB',
      zoomToAccuracy: true,
    })

    geolocation.getCurrentPosition((status: string, result: AMap.Geolocation.GeolocationResult | { message: string }) => {
      setLocating(false)
      if (status === 'complete' && 'position' in result) {
        const { lng, lat } = result.position
        updateMarkerPosition(lng, lat)
      } else {
        console.error('定位失败', 'message' in result ? result.message : '未知错误')
      }
    })
  }, [updateMarkerPosition])

  // 搜索地点
  const handleSearch = useCallback(() => {
    if (!placeSearchRef.current || !searchKeyword.trim()) return

    placeSearchRef.current.search(searchKeyword, (status: string, result: AMap.PlaceSearch.SearchResult | string) => {
      if (status === 'complete' && typeof result !== 'string' && result.poiList) {
        setSearchResults(result.poiList.pois || [])
        setShowResults(true)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    })
  }, [searchKeyword])

  // 选择搜索结果
  const handleSelectResult = useCallback((poi: AMap.PlaceSearch.SearchResult['pois'][0]) => {
    const location = poi.location
    if (location) {
      updateMarkerPosition(location.getLng(), location.getLat())
      setSelectedLocation({
        lng: location.getLng(),
        lat: location.getLat(),
        address: poi.address as string || poi.name,
        name: poi.name
      })
    }
    setShowResults(false)
    setSearchKeyword('')
  }, [updateMarkerPosition])

  // 确认选择
  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      onConfirm(selectedLocation)
    }
  }, [selectedLocation, onConfirm])

  // 初始化
  useEffect(() => {
    if (visible) {
      setLoading(true)
      // 延迟初始化，确保 DOM 已渲染
      const timer = setTimeout(() => {
        initMap()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [visible, initMap])

  // 清理
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">选择收货地址</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="搜索地点"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} leftIcon={<Search className="w-4 h-4" />}>
                  搜索
                </Button>
                <Button
                  variant="outline"
                  onClick={getCurrentLocation}
                  isLoading={locating}
                  leftIcon={<Navigation className="w-4 h-4" />}
                >
                  定位
                </Button>
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-4 right-4 top-full mt-2 bg-white rounded-xl shadow-lg border max-h-60 overflow-y-auto z-10"
                  >
                    {searchResults.map((poi, index) => (
                      <button
                        key={poi.id || index}
                        onClick={() => handleSelectResult(poi)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-800">{poi.name}</div>
                        <div className="text-sm text-gray-500 truncate">{poi.address as string || '暂无详细地址'}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Map Container */}
            <div className="relative" style={{ height: '400px' }}>
              {loading && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">地图加载中...</p>
                  </div>
                </div>
              )}
              <div ref={mapRef} className="w-full h-full" />
            </div>

            {/* Selected Location */}
            {selectedLocation && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {selectedLocation.name && (
                      <div className="font-medium text-gray-800">{selectedLocation.name}</div>
                    )}
                    <div className="text-sm text-gray-600 break-all">{selectedLocation.address}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                取消
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={!selectedLocation}
              >
                确认选择
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MapPicker
