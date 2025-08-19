import api from './api'

export interface ChildItem {
  id: number
  name: string
  gender: string
  birthDate: string
  avatarUrl?: string | null
}

export interface CurrentStatusDTO {
  physicalDevelopment: { height: number | null; weight: number | null; lastUpdated: string | null }
  behaviorObservation: { strengths: string[]; challenges: string[]; improvements: string[] }
  dailySkills: { selfCare: number; communication: number; social: number; motor: number }
}

export interface ProfileResponse {
  child: ChildItem
  currentStatus: CurrentStatusDTO
}

export async function listChildren(): Promise<{ items: ChildItem[] }> {
  const res = await api.get('/parent/growth/children')
  return res.data
}

export async function createChild(payload: { name: string; gender: '男' | '女' | '未知'; birthDate: string; avatarUrl?: string }): Promise<ChildItem> {
  const res = await api.post('/parent/growth/children', payload)
  return res.data
}

export async function deleteChild(childId: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/parent/growth/children/${childId}`)
  return res.data
}

export async function getProfile(childId: number): Promise<ProfileResponse> {
  const res = await api.get(`/parent/growth/children/${childId}/profile`)
  return res.data
}

export async function upsertProfile(childId: number, payload: Partial<{
  heightCm: number
  weightKg: number
  lastPhysicalUpdated: string
  behaviorStrengths: string[]
  behaviorChallenges: string[]
  behaviorImprovements: string[]
  dailySelfCare: number
  dailyCommunication: number
  dailySocial: number
  dailyMotor: number
}>): Promise<ProfileResponse> {
  const res = await api.put(`/parent/growth/children/${childId}/profile`, payload)
  return res.data
}

export interface HealthRecord {
  id: number
  childId: number
  date: string
  type: string
  description?: string
  result?: string
}

export async function listHealthRecords(childId: number, query?: { page?: number; pageSize?: number }): Promise<{ items: HealthRecord[]; total: number; page: number; pageSize: number }> {
  const res = await api.get(`/parent/growth/children/${childId}/health-records`, { params: query })
  return res.data
}

export async function createHealthRecord(childId: number, payload: { date: string; type: string; description?: string; result?: string }): Promise<HealthRecord> {
  const res = await api.post(`/parent/growth/children/${childId}/health-records`, payload)
  return res.data
}

export async function updateHealthRecord(recordId: number, payload: { date?: string; type?: string; description?: string; result?: string }): Promise<HealthRecord> {
  const res = await api.put(`/parent/growth/health-records/${recordId}`, payload)
  return res.data
}

export async function deleteHealthRecord(recordId: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/parent/growth/health-records/${recordId}`)
  return res.data
}

