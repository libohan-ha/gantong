import api from './api'

export interface DoctorWithTrainingSummary {
  doctorId: number
  name: string
  title?: string
  hospital: string
  nextStartAt?: string
  trainingsCount: number
}

export interface PublicTrainingItem {
  id: number
  title: string
  type: 'online' | 'offline' | 'hybrid'
  durationHours: number
  maxParticipants: number
  startDate: string
  doctor: {
    id: number
    doctorProfile?: {
      name: string
      title?: string
      hospital: string
    }
  }
}

export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

export async function listDoctorsWithUpcomingTrainings(params?: { page?: number; pageSize?: number; q?: string }): Promise<Paginated<DoctorWithTrainingSummary>> {
  const res = await api.get<Paginated<DoctorWithTrainingSummary>>('/parent/experts/doctors', { params })
  return res.data
}

export async function listPublicTrainings(params?: { page?: number; pageSize?: number; q?: string; type?: 'online' | 'offline' | 'hybrid' }): Promise<Paginated<PublicTrainingItem>> {
  const res = await api.get<Paginated<PublicTrainingItem>>('/parent/experts/trainings', { params })
  return res.data
}

export async function getPublicTrainingById(id: number): Promise<PublicTrainingItem> {
  const res = await api.get<PublicTrainingItem>(`/parent/experts/trainings/${id}`)
  return res.data
}

