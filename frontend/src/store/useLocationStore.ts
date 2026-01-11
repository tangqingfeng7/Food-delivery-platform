import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AMAP_KEY, AMAP_SECURITY_CODE } from '../config/map'

// 声明 AMap 全局类型
declare global {
  interface Window {
    AMap: typeof AMap
    _AMapSecurityConfig: {
      securityJsCode: string
    }
  }
}

interface LocationState {
  // 用户当前位置
  latitude: number | null
  longitude: number | null
  // 地址名称
  address: string | null
  // 位置是否已获取
  isLocated: boolean
  // 是否正在获取位置
  isLocating: boolean
  // 位置获取错误信息
  error: string | null
  // 最后更新时间
  lastUpdated: number | null
  
  // 设置位置
  setLocation: (latitude: number, longitude: number, address?: string) => void
  // 设置地址
  setAddress: (address: string) => void
  // 设置加载状态
  setLocating: (isLocating: boolean) => void
  // 设置错误
  setError: (error: string | null) => void
  // 获取当前位置
  getCurrentPosition: () => Promise<{ latitude: number; longitude: number } | null>
  // 清除位置
  clearLocation: () => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      latitude: null,
      longitude: null,
      address: null,
      isLocated: false,
      isLocating: false,
      error: null,
      lastUpdated: null,

      setLocation: (latitude: number, longitude: number, address?: string) => {
        set({
          latitude,
          longitude,
          address: address || null,
          isLocated: true,
          isLocating: false,
          error: null,
          lastUpdated: Date.now(),
        })
      },

      setAddress: (address: string) => {
        set({ address })
      },

      setLocating: (isLocating: boolean) => {
        set({ isLocating })
      },

      setError: (error: string | null) => {
        set({ error, isLocating: false })
      },

      getCurrentPosition: async () => {
        const state = get()
        
        // 如果已有位置且在5分钟内，直接返回
        if (state.isLocated && state.lastUpdated && 
            Date.now() - state.lastUpdated < 5 * 60 * 1000) {
          return {
            latitude: state.latitude!,
            longitude: state.longitude!,
          }
        }

        // 正在获取中，等待
        if (state.isLocating) {
          return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              const currentState = get()
              if (!currentState.isLocating) {
                clearInterval(checkInterval)
                if (currentState.isLocated) {
                  resolve({
                    latitude: currentState.latitude!,
                    longitude: currentState.longitude!,
                  })
                } else {
                  resolve(null)
                }
              }
            }, 100)
          })
        }

        set({ isLocating: true, error: null })

        // 加载高德地图 SDK
        const loadAMapScript = (): Promise<void> => {
          return new Promise((resolve, reject) => {
            if (window.AMap) {
              resolve()
              return
            }
            
            // 设置安全密钥
            if (AMAP_SECURITY_CODE) {
              window._AMapSecurityConfig = {
                securityJsCode: AMAP_SECURITY_CODE
              }
            }
            
            const script = document.createElement('script')
            script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder`
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('加载地图失败'))
            document.head.appendChild(script)
          })
        }

        // 逆地理编码获取地址
        const getAddressFromCoords = async (lat: number, lng: number): Promise<string | null> => {
          try {
            await loadAMapScript()
            return new Promise((resolve) => {
              const geocoder = new window.AMap.Geocoder()
              geocoder.getAddress(
                new window.AMap.LngLat(lng, lat),
                (status: string, result: AMap.Geocoder.ReGeocodeResult) => {
                  if (status === 'complete' && result.regeocode) {
                    resolve(result.regeocode.formattedAddress)
                  } else {
                    resolve(null)
                  }
                }
              )
            })
          } catch {
            return null
          }
        }

        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            set({ 
              error: '您的浏览器不支持地理位置功能', 
              isLocating: false 
            })
            resolve(null)
            return
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              
              // 获取地址
              const address = await getAddressFromCoords(latitude, longitude)
              
              set({
                latitude,
                longitude,
                address,
                isLocated: true,
                isLocating: false,
                error: null,
                lastUpdated: Date.now(),
              })
              resolve({ latitude, longitude })
            },
            (error) => {
              let errorMessage = '获取位置失败'
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = '您拒绝了位置权限，无法获取位置'
                  break
                case error.POSITION_UNAVAILABLE:
                  errorMessage = '位置信息不可用'
                  break
                case error.TIMEOUT:
                  errorMessage = '获取位置超时'
                  break
              }
              set({ error: errorMessage, isLocating: false })
              resolve(null)
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          )
        })
      },

      clearLocation: () => {
        set({
          latitude: null,
          longitude: null,
          address: null,
          isLocated: false,
          isLocating: false,
          error: null,
          lastUpdated: null,
        })
      },
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        address: state.address,
        isLocated: state.isLocated,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
)

// 计算两点间的距离（公里）- 使用 Haversine 公式
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // 地球半径（公里）
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180)
}
