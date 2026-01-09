import { create } from 'zustand'
import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

// 订单状态更新消息类型
export interface OrderStatusMessage {
  type: string
  orderId: number
  orderNo: string
  userId: number
  restaurantId: number
  restaurantName: string
  oldStatus: string
  newStatus: string
  statusLabel: string
  payAmount: number
  updatedAt: string
  message: string
}

// WebSocket 连接状态
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface WebSocketState {
  client: Client | null
  status: ConnectionStatus
  subscriptions: Map<string, StompSubscription>
  
  // 连接 WebSocket
  connect: (userId: number) => void
  // 断开连接
  disconnect: () => void
  // 订阅用户订单更新
  subscribeToUserOrders: (userId: number, callback: (message: OrderStatusMessage) => void) => void
  // 订阅商家订单更新
  subscribeToMerchantOrders: (restaurantId: number, callback: (message: OrderStatusMessage) => void) => void
  // 取消订阅
  unsubscribe: (destination: string) => void
  // 取消所有订阅
  unsubscribeAll: () => void
}

// WebSocket 服务器地址
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  client: null,
  status: 'disconnected',
  subscriptions: new Map(),

  connect: (userId: number) => {
    const { client, status } = get()
    
    // 如果已经连接或正在连接，不重复连接
    if (client && (status === 'connected' || status === 'connecting')) {
      console.log('WebSocket 已连接或正在连接中')
      return
    }

    set({ status: 'connecting' })

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      // 减少重连延迟，提高响应速度
      reconnectDelay: 2000,
      // 缩短心跳间隔，更快检测连接状态
      heartbeatIncoming: 2000,
      heartbeatOutgoing: 2000,
      // 连接超时时间
      connectionTimeout: 5000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str)
        }
      },
      onConnect: () => {
        console.log('WebSocket 连接成功')
        set({ status: 'connected' })
      },
      onDisconnect: () => {
        console.log('WebSocket 已断开')
        set({ status: 'disconnected' })
      },
      onStompError: (frame) => {
        console.error('WebSocket 错误:', frame)
        set({ status: 'error' })
      },
      onWebSocketError: (event) => {
        console.error('WebSocket 连接错误:', event)
        set({ status: 'error' })
      },
    })

    stompClient.activate()
    set({ client: stompClient })
  },

  disconnect: () => {
    const { client, subscriptions } = get()
    
    // 取消所有订阅
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe()
    })
    
    // 断开连接
    if (client) {
      client.deactivate()
    }
    
    set({
      client: null,
      status: 'disconnected',
      subscriptions: new Map(),
    })
  },

  subscribeToUserOrders: (userId: number, callback: (message: OrderStatusMessage) => void) => {
    const { client, status, subscriptions } = get()
    
    if (!client || status !== 'connected') {
      console.warn('WebSocket 未连接，无法订阅')
      return
    }

    // 使用 topic 模式订阅用户订单更新
    const destination = `/topic/user/${userId}/orders`
    
    // 如果已经订阅，先取消
    if (subscriptions.has(destination)) {
      subscriptions.get(destination)?.unsubscribe()
    }

    const subscription = client.subscribe(destination, (message: IMessage) => {
      try {
        const data: OrderStatusMessage = JSON.parse(message.body)
        callback(data)
      } catch (error) {
        console.error('解析 WebSocket 消息失败:', error)
      }
    })

    subscriptions.set(destination, subscription)
    set({ subscriptions: new Map(subscriptions) })
    
    console.log('已订阅用户订单更新:', destination)
  },

  subscribeToMerchantOrders: (restaurantId: number, callback: (message: OrderStatusMessage) => void) => {
    const { client, status, subscriptions } = get()
    
    if (!client || status !== 'connected') {
      console.warn('WebSocket 未连接，无法订阅')
      return
    }

    const destination = `/topic/merchant/${restaurantId}/orders`
    
    // 如果已经订阅，先取消
    if (subscriptions.has(destination)) {
      subscriptions.get(destination)?.unsubscribe()
    }

    const subscription = client.subscribe(destination, (message: IMessage) => {
      try {
        const data: OrderStatusMessage = JSON.parse(message.body)
        callback(data)
      } catch (error) {
        console.error('解析 WebSocket 消息失败:', error)
      }
    })

    subscriptions.set(destination, subscription)
    set({ subscriptions: new Map(subscriptions) })
    
    console.log('已订阅商家订单更新:', destination)
  },

  unsubscribe: (destination: string) => {
    const { subscriptions } = get()
    
    if (subscriptions.has(destination)) {
      subscriptions.get(destination)?.unsubscribe()
      subscriptions.delete(destination)
      set({ subscriptions: new Map(subscriptions) })
      console.log('已取消订阅:', destination)
    }
  },

  unsubscribeAll: () => {
    const { subscriptions } = get()
    
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe()
    })
    
    set({ subscriptions: new Map() })
    console.log('已取消所有订阅')
  },
}))
