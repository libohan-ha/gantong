import api from './api'

export interface DoctorListItem {
  doctorId: number
  name: string
  title?: string
  hospital: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type DoctorAppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'

export interface CreateDoctorAppointmentPayload {
  doctorId: number
  childName: string
  childAge: number
  childGender: string
  parentName: string
  parentPhone: string
  preferredDate?: string
  preferredTime?: string
  symptoms?: string
  previousTreatment?: string
}

export interface ParentAppointmentItem {
  id: number
  doctorUserId: number
  doctorName: string
  doctorHospital: string
  doctorTitle: string
  childName: string
  childAge: number
  childGender: string
  parentName: string
  parentPhone: string
  preferredDate: string | null
  preferredTime: string | null
  symptoms: string | null
  previousTreatment: string | null
  status: DoctorAppointmentStatus
  notes: string | null
  createdAt: string
}

export async function listDoctors(params?: {
  page?: number
  pageSize?: number
  q?: string
}): Promise<Paginated<DoctorListItem>> {
  const res = await api.get<Paginated<DoctorListItem>>('/parent/experts/doctors', { params })
  return res.data
}

export async function createDoctorAppointment(payload: CreateDoctorAppointmentPayload) {
  const res = await api.post('/parent/appointments', payload)
  return res.data
}

export async function listMyDoctorAppointments(params?: {
  page?: number
  pageSize?: number
  status?: 'all' | DoctorAppointmentStatus
}): Promise<Paginated<ParentAppointmentItem>> {
  const res = await api.get<Paginated<ParentAppointmentItem>>('/parent/appointments/mine', { params })
  return res.data
}

export async function cancelMyDoctorAppointment(appointmentId: number, reason?: string) {
  const payload = typeof reason === 'string' && reason.trim() ? { reason: reason.trim() } : {}
  const res = await api.patch(`/parent/appointments/${appointmentId}/cancel`, payload)
  return res.data
}
