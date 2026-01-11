/**
 * ============================================
 * TODO: 支付接口 - 待接入真实支付服务
 * ============================================
 * 
 * 当前状态: 模拟支付（开发测试用）
 * 
 * 待接入:
 * - [ ] 微信支付 (createWechatPayment)
 * - [ ] 支付宝支付 (createAlipayPayment)  
 * - [ ] 余额支付 (createBalancePayment)
 * - [ ] 支付状态查询 (getPaymentStatus)
 * - [ ] 用户余额查询 (getUserBalance)
 * - [ ] 余额充值 (rechargeBalance)
 * 
 * 接入步骤:
 * 1. 取消下方 request 导入的注释
 * 2. 替换各函数中的模拟代码为真实 API 调用
 * 3. 配置后端支付相关接口
 * ============================================
 */

// import request from './request'  // TODO: 真实接入时取消注释

// 支付方式类型
export type PaymentMethod = 'wechat' | 'alipay' | 'balance'

// 支付请求参数
export interface PaymentRequest {
  orderId: number
  amount: number
  paymentMethod: PaymentMethod
}

// 支付响应
export interface PaymentResponse {
  success: boolean
  transactionId?: string
  // 微信支付相关
  wechatPayUrl?: string      // 微信支付二维码链接
  wechatAppId?: string       // 微信 AppId
  wechatPrepayId?: string    // 微信预支付ID
  // 支付宝相关
  alipayForm?: string        // 支付宝表单HTML
  alipayTradeNo?: string     // 支付宝交易号
  // 余额支付
  remainingBalance?: number  // 剩余余额
  message?: string
}

// 支付状态查询响应
export interface PaymentStatusResponse {
  orderId: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: PaymentMethod
  transactionId?: string
  paidAt?: string
  amount: number
}

/**
 * 创建微信支付订单
 * @description 调用后端接口获取微信支付参数，用于唤起微信支付
 */
export const createWechatPayment = async (_data: PaymentRequest): Promise<PaymentResponse> => {
  // TODO: 接入真实的微信支付接口
  // 示例: return request.post('/api/payment/wechat/create', data)
  
  // 模拟支付成功
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `WX${Date.now()}`,
        message: '微信支付成功',
      })
    }, 1500)
  })
}

/**
 * 创建支付宝支付订单
 * @description 调用后端接口获取支付宝支付参数
 */
export const createAlipayPayment = async (_data: PaymentRequest): Promise<PaymentResponse> => {
  // TODO: 接入真实的支付宝支付接口
  // 示例: return request.post('/api/payment/alipay/create', data)
  
  // 模拟支付成功
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `ALI${Date.now()}`,
        message: '支付宝支付成功',
      })
    }, 1500)
  })
}

/**
 * 余额支付
 * @description 使用账户余额支付
 */
export const createBalancePayment = async (_data: PaymentRequest): Promise<PaymentResponse> => {
  // TODO: 接入真实的余额支付接口
  // 示例: return request.post('/api/payment/balance/pay', data)
  
  // 模拟支付成功
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `BAL${Date.now()}`,
        remainingBalance: 0,
        message: '余额支付成功',
      })
    }, 1000)
  })
}

/**
 * 统一支付接口
 * @description 根据支付方式调用对应的支付接口
 */
export const createPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  switch (data.paymentMethod) {
    case 'wechat':
      return createWechatPayment(data)
    case 'alipay':
      return createAlipayPayment(data)
    case 'balance':
      return createBalancePayment(data)
    default:
      throw new Error('不支持的支付方式')
  }
}

/**
 * 查询支付状态
 * @description 查询订单的支付状态
 */
export const getPaymentStatus = async (orderId: number): Promise<PaymentStatusResponse> => {
  // TODO: 接入真实的支付状态查询接口
  // 示例: return request.get(`/api/payment/status/${orderId}`)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        orderId,
        status: 'paid',
        paymentMethod: 'wechat',
        transactionId: `WX${Date.now()}`,
        paidAt: new Date().toISOString(),
        amount: 0,
      })
    }, 500)
  })
}

/**
 * 获取用户余额
 * @description 获取当前用户的账户余额
 */
export const getUserBalance = async (): Promise<{ balance: number }> => {
  // TODO: 接入真实的余额查询接口
  // 示例: return request.get('/api/user/balance')
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ balance: 0 })
    }, 300)
  })
}

/**
 * 余额充值
 * @description 账户余额充值
 */
export const rechargeBalance = async (_amount: number, _paymentMethod: 'wechat' | 'alipay'): Promise<PaymentResponse> => {
  // TODO: 接入真实的充值接口
  // 示例: return request.post('/api/user/recharge', { amount, paymentMethod })
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `RC${Date.now()}`,
        message: '充值成功',
      })
    }, 1500)
  })
}
