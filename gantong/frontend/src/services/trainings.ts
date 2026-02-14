/**
 * 培训管理服务模块
 *
 * 封装感统培训课程相关的 API 调用，供医生/管理员端使用。
 * 功能包括：创建培训、查询我的培训列表、获取培训详情、更新培训、删除培训。
 */

import api from './api'

// ==================== 类型定义 ====================

/** 培训类型：线上 / 线下 / 混合 */
export type TrainingType = 'online' | 'offline' | 'hybrid'

/** 培训课程信息 */
export interface Training {
  /** 培训ID */
  id: number
  /** 创建者（医生）的用户ID */
  doctorUserId: number
  /** 培训标题 */
  title: string
  /** 培训描述 */
  description: string | null
  /** 培训类型（线上/线下/混合） */
  type: TrainingType
  /** 培训时长（小时） */
  durationHours: number
  /** 最大参与人数 */
  maxParticipants: number
  /** 开始日期 */
  startDate: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 关联的医生信息（包含医生资料） */
  doctor?: {
    id: number
    username: string
    doctorProfile?: {
      /** 职称 */
      title: string
      /** 所属医院 */
      hospital: string
      /** 专长领域 */
      specialties: string
    }
  }
}

/** 创建培训的请求参数 */
export interface CreateTrainingDto {
  /** 培训标题 */
  title: string
  /** 培训描述（可选） */
  description?: string
  /** 培训类型 */
  type: TrainingType
  /** 培训时长（小时） */
  durationHours: number
  /** 最大参与人数 */
  maxParticipants: number
  /** 开始日期 */
  startDate: string
}

/** 更新培训的请求参数（所有字段可选） */
export interface UpdateTrainingDto {
  /** 培训标题 */
  title?: string
  /** 培训描述 */
  description?: string | null
  /** 培训类型 */
  type?: TrainingType
  /** 培训时长（小时） */
  durationHours?: number
  /** 最大参与人数 */
  maxParticipants?: number
  /** 开始日期 */
  startDate?: string
}

/** 培训列表分页响应 */
export interface TrainingsResponse {
  /** 培训列表 */
  items: Training[]
  /** 总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
}

// ==================== API 函数 ====================

/**
 * 创建培训课程
 * @param data - 培训信息
 * @returns 创建后的培训记录
 */
export async function createTraining(data: CreateTrainingDto): Promise<Training> {
  const res = await api.post<Training>('/trainings', data)
  return res.data
}

/**
 * 获取当前医生的培训列表（分页）
 * @param query.page - 页码
 * @param query.pageSize - 每页条数
 * @returns 分页的培训列表
 */
export async function getMyTrainings(query?: { page?: number; pageSize?: number }): Promise<TrainingsResponse> {
  const res = await api.get<TrainingsResponse>('/trainings/mine', { params: query })
  return res.data
}

/**
 * 获取单个培训详情
 * @param id - 培训ID
 * @returns 培训完整信息
 */
export async function getTrainingById(id: number): Promise<Training> {
  const res = await api.get<Training>(`/trainings/${id}`)
  return res.data
}

/**
 * 更新培训信息
 * @param id - 培训ID
 * @param data - 要更新的字段
 * @returns 更新后的培训记录
 */
export async function updateTraining(id: number, data: UpdateTrainingDto): Promise<Training> {
  const res = await api.patch<Training>(`/trainings/${id}`, data)
  return res.data
}

/**
 * 删除培训课程
 * @param id - 培训ID
 * @returns 操作结果
 */
export async function deleteTraining(id: number): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(`/trainings/${id}`)
  return res.data
}
