import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, MenuItem } from '../types'

interface CartState {
  items: CartItem[]
  restaurantId: number | null
  restaurantName: string | null
  
  // 添加到购物车
  addItem: (item: MenuItem, restaurantId: number, restaurantName: string) => void
  // 减少数量
  removeItem: (menuItemId: number) => void
  // 删除项目
  deleteItem: (menuItemId: number) => void
  // 清空购物车
  clearCart: () => void
  // 获取某个商品的数量
  getItemQuantity: (menuItemId: number) => number
  // 获取总数量
  getTotalCount: () => number
  // 获取总价格
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (menuItem: MenuItem, restaurantId: number, restaurantName: string) => {
        const { items, restaurantId: currentRestaurantId } = get()
        
        // 如果是不同餐厅的商品，需要清空购物车
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          set({
            items: [{
              id: Date.now(),
              menuItem,
              quantity: 1,
              restaurantId,
              restaurantName,
            }],
            restaurantId,
            restaurantName,
          })
          return
        }

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
            restaurantId,
            restaurantName,
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
          const newItems = items.filter(item => item.menuItem.id !== menuItemId)
          set({
            items: newItems,
            restaurantId: newItems.length > 0 ? get().restaurantId : null,
            restaurantName: newItems.length > 0 ? get().restaurantName : null,
          })
        }
      },

      deleteItem: (menuItemId: number) => {
        const { items } = get()
        const newItems = items.filter(item => item.menuItem.id !== menuItemId)
        set({
          items: newItems,
          restaurantId: newItems.length > 0 ? get().restaurantId : null,
          restaurantName: newItems.length > 0 ? get().restaurantName : null,
        })
      },

      clearCart: () => {
        set({
          items: [],
          restaurantId: null,
          restaurantName: null,
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
    }),
    {
      name: 'cart-storage',
    }
  )
)
