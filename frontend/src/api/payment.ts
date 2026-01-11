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
  wechatCodeUrl?: string     // 微信支付二维码链接（Native支付）
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
 * 创建微信支付订单（Native支付，扫码支付）
 * @description 调用后端接口获取微信支付二维码URL
 */
export const createWechatPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  try {
    // 调用后端获取微信支付二维码URL
    const res = await request.post(`/payment/wechat/create/${data.orderId}`)
    
    if (res.data.code === 200 && res.data.data?.codeUrl) {
      return {
        success: true,
        wechatCodeUrl: res.data.data.codeUrl,
        message: '请扫描二维码完成支付',
      }
    } else {
      return {
        success: false,
        message: res.data.message || '创建支付失败',
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
 * @description 调用后端接口获取支付宝支付表单，自动跳转到支付宝收银台
 */
export const createAlipayPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  try {
    // 调用后端获取支付宝支付表单
    const res = await request.post(`/payment/alipay/create/${data.orderId}`)
    
    if (res.data.code === 200 && res.data.data?.payForm) {
      return {
        success: true,
        alipayForm: res.data.data.payForm,
        message: '正在跳转到支付宝...',
      }
    } else {
      return {
        success: false,
        message: res.data.message || '创建支付失败',
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
 * 查询支付宝支付结果
 * @description 查询订单支付状态，用于支付完成后的轮询查询
 */
export const queryAlipayPaymentStatus = async (orderNo: string): Promise<{
  orderNo: string
  status: string
  paid: boolean
}> => {
  const res = await request.get('/payment/alipay/query', { params: { orderNo } })
  if (res.data.code === 200) {
    return res.data.data
  }
  throw new Error(res.data.message || '查询支付状态失败')
}

/**
 * 查询微信支付结果
 * @description 查询微信订单支付状态，用于轮询查询支付结果
 */
export const queryWechatPaymentStatus = async (orderNo: string): Promise<{
  orderNo: string
  status: string
  paid: boolean
}> => {
  const res = await request.get('/payment/wechat/query', { params: { orderNo } })
  if (res.data.code === 200) {
    return res.data.data
  }
  throw new Error(res.data.message || '查询支付状态失败')
}

/**
 * 执行支付宝支付跳转
 * @description 将支付表单插入页面并自动提交，跳转到支付宝收银台
 */
export const submitAlipayForm = (formHtml: string): void => {
  // 创建一个临时的 div 来放置表单
  const div = document.createElement('div')
  div.innerHTML = formHtml
  div.style.display = 'none'
  document.body.appendChild(div)
  
  // 自动提交表单
  const form = div.querySelector('form')
  if (form) {
    form.submit()
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
 */
export const createPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  switch (data.paymentMethod) {
    case 'wechat':
      return createWechatPayment(data)
    case 'alipay':
      return createAlipayPayment(data)
    case 'balance':
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
  const res = await request.get(`/orders/${orderId}`)
  if (res.data.code === 200) {
    const order = res.data.data
    const statusMap: Record<string, 'pending' | 'paid' | 'failed' | 'refunded'> = {
      'PENDING': 'pending',
      'PAID': 'paid',
      'CONFIRMED': 'paid',
      'PREPARING': 'paid',
      'DELIVERING': 'paid',
      'COMPLETED': 'paid',
      'CANCELLED': 'failed',
      'REFUNDED': 'refunded',
    }
    return {
      orderId,
      status: statusMap[order.status] || 'pending',
      paymentMethod: order.paymentMethod || 'balance',
      transactionId: order.orderNo,
      paidAt: order.paidAt,
      amount: order.payAmount,
    }
  }
  throw new Error(res.data.message || '查询订单状态失败')
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
