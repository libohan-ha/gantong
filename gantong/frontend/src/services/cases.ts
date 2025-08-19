import api from './api'

export interface BackendCaseFile {
  id: number
  originalName: string
  mimeType: string
  size: number
  storagePath: string
  createdAt: string
}

export interface BackendCaseRecord {
  id: number
  title: string
  description?: string
  status: 'uploaded' | 'reviewed' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  files: BackendCaseFile[]
}

export interface UploadCaseResponse extends BackendCaseRecord {}

export async function uploadCase(params: { title: string; description?: string; files: File[] }): Promise<UploadCaseResponse> {
  const form = new FormData()
  form.append('title', params.title)
  if (params.description && params.description.trim()) form.append('description', params.description.trim())
  params.files.forEach((f) => form.append('files', f))

  const res = await api.post<UploadCaseResponse>('/cases', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function getMyCases(query?: { page?: number; pageSize?: number }): Promise<{ items: BackendCaseRecord[]; total: number; page: number; pageSize: number }> {
  const res = await api.get('/cases/mine', { params: query })
  return res.data
}

export async function updateCase(id: number, data: { title?: string; description?: string | null }): Promise<BackendCaseRecord> {
  const res = await api.patch(`/cases/${id}`, data)
  return res.data
}

export async function deleteCase(id: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/cases/${id}`)
  return res.data
}

