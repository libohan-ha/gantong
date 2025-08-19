import axios from 'axios'

// 创建API实例
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token过期，清除本地存储并跳转登录
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 医生资料接口定义
export interface DoctorProfile {
  userId: number
  name: string
  // 后端目前无昵称字段，这里预留可选字段，若后端增加将自动兼容
  nickname?: string
  age?: number
  title?: string
  phone?: string
  hospital: string
  verified: boolean
}

// 更新医生资料的请求体
export interface UpdateDoctorProfileRequest {
  name?: string
  age?: number
  title?: string
  phone?: string
  hospital?: string
}

/**
 * 获取我的医生资料
 */
export async function getMyProfile(): Promise<DoctorProfile> {
  const response = await api.get<DoctorProfile>('/doctors/me/profile')
  return response.data
}

/**
 * 更新我的医生资料
 */
export async function updateMyProfile(payload: UpdateDoctorProfileRequest): Promise<DoctorProfile> {
  const response = await api.patch<DoctorProfile>('/doctors/me/profile', payload)
  return response.data
}

/**
 * 上传头像
 */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('avatar', file)
  
  const response = await api.post<{ avatarUrl: string }>('/doctors/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

/**
 * 获取医生统计信息
 */
export interface DoctorStats {
  videoCount: number
  totalViews: number
  totalLikes: number
  profileCompleteness: number
}

export async function getMyStats(): Promise<DoctorStats> {
  const response = await api.get<DoctorStats>('/doctors/me/stats')
  return response.data
}

export default api
