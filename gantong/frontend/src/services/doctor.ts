/**
 * 医生个人资料服务模块
 *
 * 封装医生端个人资料相关的 API 调用，包括：
 *   - 获取/更新医生个人资料
 *   - 上传医生头像
 *   - 获取医生统计数据（视频数、浏览量、点赞数、资料完整度）
 */

import api from './api'

// ==================== 类型定义 ====================

/** 医生个人资料 */
export interface DoctorProfile {
  /** 关联的用户ID */
  userId: number
  /** 医生姓名 */
  name: string
  /** 昵称 */
  nickname?: string
  /** 年龄 */
  age?: number
  /** 职称（如：主任医师、副主任医师） */
  title?: string
  /** 联系电话 */
  phone?: string
  /** 所属医院 */
  hospital: string
  /** 头像URL */
  avatarUrl?: string
  /** 是否已通过认证 */
  verified: boolean
}

/** 更新医生个人资料的请求参数（所有字段均可选） */
export interface UpdateDoctorProfileRequest {
  /** 医生姓名 */
  name?: string
  /** 年龄 */
  age?: number
  /** 职称 */
  title?: string
  /** 联系电话 */
  phone?: string
  /** 所属医院 */
  hospital?: string
}

// ==================== API 函数 ====================

/**
 * 获取当前登录医生的个人资料
 * @returns 医生个人资料信息
 */
export async function getMyProfile(): Promise<DoctorProfile> {
  const response = await api.get<DoctorProfile>('/doctors/me/profile')
  return response.data
}

/**
 * 更新当前登录医生的个人资料
 * @param payload - 要更新的字段
 * @returns 更新后的医生个人资料
 */
export async function updateMyProfile(payload: UpdateDoctorProfileRequest): Promise<DoctorProfile> {
  const response = await api.patch<DoctorProfile>('/doctors/me/profile', payload)
  return response.data
}

/**
 * 上传医生头像
 * 使用 FormData 提交图片文件
 * @param file - 头像图片文件
 * @returns 包含头像URL的响应
 */
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await api.post<{ avatarUrl: string }>('/doctors/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/** 医生统计数据 */
export interface DoctorStats {
  /** 上传的视频数量 */
  videoCount: number
  /** 视频总浏览量 */
  totalViews: number
  /** 视频总点赞数 */
  totalLikes: number
  /** 个人资料完整度（百分比，0-100） */
  profileCompleteness: number
}

/**
 * 获取当前登录医生的统计数据
 * @returns 医生的各项统计指标
 */
export async function getMyStats(): Promise<DoctorStats> {
  const response = await api.get<DoctorStats>('/doctors/me/stats')
  return response.data
}
