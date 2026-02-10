/**
 * Axios 全局实例配置
 *
 * 本文件创建并导出一个预配置的 axios 实例，作为所有 API 请求的统一入口。
 * 功能包括：
 *   - 设置 baseURL 和超时时间
 *   - 请求拦截器：自动附加 JWT Token 到请求头
 *   - 响应拦截器：统一处理 401 未授权错误（清除本地凭证并跳转登录页）
 */

import axios from 'axios'

/**
 * API 基础地址
 * 优先读取环境变量 VITE_API_BASE_URL，未配置时默认使用 localhost:3000
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:3000'

/**
 * 创建 axios 实例
 * - baseURL: 所有请求的基础路径
 * - timeout: 请求超时时间 10 秒
 * - headers: 默认使用 JSON 格式
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器
 * 每次发送请求前，从 localStorage 读取 accessToken，
 * 如果存在则自动添加到 Authorization 请求头中（Bearer 格式）
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * 响应拦截器
 * 当后端返回 401 状态码（未授权/Token 过期）时：
 *   1. 清除本地存储的 token 和用户信息
 *   2. 强制跳转到登录页
 * 其他错误继续向上层抛出
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export { API_BASE_URL }
export default api
