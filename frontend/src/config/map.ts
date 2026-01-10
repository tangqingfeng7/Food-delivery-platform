/**
 * 高德地图配置
 * 
 * 使用前需要：
 * 1. 访问 https://lbs.amap.com/ 注册高德开发者账号
 * 2. 创建应用并获取 Web 端 JS API 的 Key
 * 3. 在应用管理中配置安全密钥
 * 4. 将获取到的 Key 和安全密钥填入下方配置
 */

// 高德地图 API Key（从环境变量读取）
export const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || ''

// 高德地图安全密钥（从环境变量读取）
export const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE || ''

// 默认地图中心点（北京天安门）
export const DEFAULT_CENTER: [number, number] = [116.397428, 39.90923]

// 默认缩放级别
export const DEFAULT_ZOOM = 16
