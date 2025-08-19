import api from './api'

export type TrainingType = 'online' | 'offline' | 'hybrid'

export interface Training {
  id: number
  doctorUserId: number
  title: string
  description: string | null
  type: TrainingType
  durationHours: number
  maxParticipants: number
  startDate: string
  createdAt: string
  updatedAt: string
  doctor?: {
    id: number
    username: string
    doctorProfile?: {
      title: string
      hospital: string
      specialties: string
    }
  }
}

export interface CreateTrainingDto {
  title: string
  description?: string
  type: TrainingType
  durationHours: number
  maxParticipants: number
  startDate: string
}

export interface UpdateTrainingDto {
  title?: string
  description?: string | null
  type?: TrainingType
  durationHours?: number
  maxParticipants?: number
  startDate?: string
}

export interface TrainingsResponse {
  items: Training[]
  total: number
  page: number
  pageSize: number
}

// 创建培训
export async function createTraining(data: CreateTrainingDto): Promise<Training> {
  const res = await api.post<Training>('/trainings', data)
  return res.data
}

// 获取我的培训列表
export async function getMyTrainings(query?: { page?: number; pageSize?: number }): Promise<TrainingsResponse> {
  const res = await api.get<TrainingsResponse>('/trainings/mine', { params: query })
  return res.data
}

// 获取单个培训详情
export async function getTrainingById(id: number): Promise<Training> {
  const res = await api.get<Training>(`/trainings/${id}`)
  return res.data
}

// 更新培训
export async function updateTraining(id: number, data: UpdateTrainingDto): Promise<Training> {
  const res = await api.patch<Training>(`/trainings/${id}`, data)
  return res.data
}

// 删除培训
export async function deleteTraining(id: number): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(`/trainings/${id}`)
  return res.data
}
