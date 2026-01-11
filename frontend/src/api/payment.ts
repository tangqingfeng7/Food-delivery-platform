import request from './request'

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
 * TODO: 接入真实的微信支付接口
 * 示例: const wechatRes = await request.post('/payment/wechat/create', data)
 */
export const createWechatPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  try {
    // TODO: 这里应该先调用微信支付接口获取支付参数，用户支付成功后再更新订单状态
    // 目前模拟支付成功，直接更新订单状态
    await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟支付延迟
    
    // 调用后端更新订单状态为已支付
    const res = await request.put(`/orders/${data.orderId}/pay?paymentMethod=${data.paymentMethod}`)
    if (res.data.code === 200) {
      return {
        success: true,
        transactionId: `WX${Date.now()}`,
        message: '微信支付成功',
      }
    } else {
      return {
        success: false,
        message: res.data.message || '支付失败',
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '支付失败'
    return {
      success: false,
      message: errorMessage,
    }
  }
}

/**
 * 创建支付宝支付订单
 * @description 调用后端接口获取支付宝支付参数
 * TODO: 接入真实的支付宝支付接口
 * 示例: const alipayRes = await request.post('/payment/alipay/create', data)
 */
export const createAlipayPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  try {
    // TODO: 这里应该先调用支付宝接口获取支付参数，用户支付成功后再更新订单状态
    // 目前模拟支付成功，直接更新订单状态
    await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟支付延迟
    
    // 调用后端更新订单状态为已支付
    const res = await request.put(`/orders/${data.orderId}/pay?paymentMethod=${data.paymentMethod}`)
    if (res.data.code === 200) {
      return {
        success: true,
        transactionId: `ALI${Date.now()}`,
        message: '支付宝支付成功',
      }
    } else {
      return {
        success: false,
        message: res.data.message || '支付失败',
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '支付失败'
    return {
      success: false,
      message: errorMessage,
    }
  }
}

/**
 * 余额支付（真实接口）
 * @description 调用后端余额支付接口，扣除用户余额
 */
export const createRealBalancePayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const res = await request.put(`/orders/${data.orderId}/pay?paymentMethod=${data.paymentMethod}`)
    if (res.data.code === 200) {
      return {
        success: true,
        transactionId: `BAL${Date.now()}`,
        remainingBalance: res.data.data?.user?.balance,
        message: res.data.message || '余额支付成功',
      }
    } else {
      return {
        success: false,
        message: res.data.message || '支付失败',
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '支付失败'
    return {
      success: false,
      message: errorMessage,
    }
  }
}

/**
 * 余额支付
 * @description 使用账户余额支付，调用后端真实接口
 */
export const createBalancePayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  return createRealBalancePayment(data)
}

/**
 * 统一支付接口
 * @description 根据支付方式调用对应的支付接口
 * - 微信/支付宝: 预留模拟接口，待接入真实支付
 * - 余额支付: 调用真实后端 API
 */
export const createPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  switch (data.paymentMethod) {
    case 'wechat':
      // 微信支付 - 模拟（预留真实接口）
      return createWechatPayment(data)
    case 'alipay':
      // 支付宝支付 - 模拟（预留真实接口）
      return createAlipayPayment(data)
    case 'balance':
      // 余额支付 - 调用真实后端 API
      return createRealBalancePayment(data)
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
 * @description 获取当前用户的账户余额（通过 /api/users/me 接口）
 */
export const getUserBalance = async (): Promise<{ balance: number }> => {
  const res = await request.get('/api/users/me')
  return { balance: res.data.data?.balance || 0 }
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
