import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

// 请求拦截器 - 添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * 上传图片
 * @param file 文件对象
 * @returns 上传后的图片 URL
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<{
    code: number
    message: string
    data: { url: string }
  }>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  if (response.data.code === 200) {
    return response.data.data.url
  }

  throw new Error(response.data.message || '上传失败')
}

/**
 * 删除图片
 * @param url 图片 URL
 */
export const deleteImage = async (url: string): Promise<void> => {
  await api.delete('/upload/image', {
    params: { url },
  })
}

/**
 * 获取完整的图片 URL
 * @param path 图片路径
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 拼接后端地址
  return `http://localhost:8080${path}`
}
