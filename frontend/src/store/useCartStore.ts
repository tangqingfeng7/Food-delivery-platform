import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, MenuItem } from '../types'

// 按店铺分组的购物车数据
export interface RestaurantCart {
  restaurantId: number
  restaurantName: string
  items: CartItem[]
  totalPrice: number
  totalCount: number
}

interface CartState {
  items: CartItem[]
  
  // 添加到购物车
  addItem: (item: MenuItem, restaurantId: number, restaurantName: string) => void
  // 减少数量
  removeItem: (menuItemId: number) => void
  // 删除项目
  deleteItem: (menuItemId: number) => void
  // 清空购物车
  clearCart: () => void
  // 清空指定店铺的购物车
  clearRestaurantCart: (restaurantId: number) => void
  // 获取某个商品的数量
  getItemQuantity: (menuItemId: number) => number
  // 获取总数量
  getTotalCount: () => number
  // 获取总价格
  getTotalPrice: () => number
  // 按店铺分组获取购物车
  getCartByRestaurant: () => RestaurantCart[]
  // 获取指定店铺的商品
  getRestaurantItems: (restaurantId: number) => CartItem[]
  // 获取指定店铺的总价
  getRestaurantTotalPrice: (restaurantId: number) => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem: MenuItem, restaurantId: number, restaurantName: string) => {
        const { items } = get()
        
        const existingItem = items.find(item => item.menuItem.id === menuItem.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.menuItem.id === menuItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({
            items: [...items, {
              id: Date.now(),
              menuItem,
              quantity: 1,
              restaurantId,
              restaurantName,
            }],
          })
        }
      },

      removeItem: (menuItemId: number) => {
        const { items } = get()
        const existingItem = items.find(item => item.menuItem.id === menuItemId)
        
        if (existingItem && existingItem.quantity > 1) {
          set({
            items: items.map(item =>
              item.menuItem.id === menuItemId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          })
        } else {
          set({
            items: items.filter(item => item.menuItem.id !== menuItemId),
          })
        }
      },

      deleteItem: (menuItemId: number) => {
        const { items } = get()
        set({
          items: items.filter(item => item.menuItem.id !== menuItemId),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      clearRestaurantCart: (restaurantId: number) => {
        const { items } = get()
        set({
          items: items.filter(item => item.restaurantId !== restaurantId),
        })
      },

      getItemQuantity: (menuItemId: number) => {
        const item = get().items.find(item => item.menuItem.id === menuItemId)
        return item?.quantity || 0
      },

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        )
      },

      getCartByRestaurant: () => {
        const { items } = get()
        const restaurantMap = new Map<number, RestaurantCart>()
        
        items.forEach(item => {
          const existing = restaurantMap.get(item.restaurantId)
          if (existing) {
            existing.items.push(item)
            existing.totalPrice += item.menuItem.price * item.quantity
            existing.totalCount += item.quantity
          } else {
            restaurantMap.set(item.restaurantId, {
              restaurantId: item.restaurantId,
              restaurantName: item.restaurantName,
              items: [item],
              totalPrice: item.menuItem.price * item.quantity,
              totalCount: item.quantity,
            })
          }
        })
        
        return Array.from(restaurantMap.values())
      },

      getRestaurantItems: (restaurantId: number) => {
        return get().items.filter(item => item.restaurantId === restaurantId)
      },

      getRestaurantTotalPrice: (restaurantId: number) => {
        return get().items
          .filter(item => item.restaurantId === restaurantId)
          .reduce((total, item) => total + item.menuItem.price * item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
