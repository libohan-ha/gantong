/**
 * 病例管理服务模块
 *
 * 封装病例（Case）相关的 API 调用，供医生/管理员端使用。
 * 功能包括：上传病例、查询我的病例列表、更新病例信息、删除病例。
 */

import api from './api'

// ==================== 类型定义 ====================

/** 病例附件文件信息 */
export interface BackendCaseFile {
  /** 文件ID */
  id: number
  /** 原始文件名 */
  originalName: string
  /** MIME 类型（如 video/mp4, image/png） */
  mimeType: string
  /** 文件大小（字节） */
  size: number
  /** 服务端存储路径 */
  storagePath: string
  /** 创建时间 */
  createdAt: string
}

/** 病例记录 */
export interface BackendCaseRecord {
  /** 病例ID */
  id: number
  /** 病例标题 */
  title: string
  /** 病例描述 */
  description?: string
  /** 病例状态：已上传 / 已审核 / 已通过 / 已拒绝 */
  status: 'uploaded' | 'reviewed' | 'approved' | 'rejected'
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 关联的附件文件列表 */
  files: BackendCaseFile[]
}

/** 上传病例的响应类型（等同于 BackendCaseRecord） */
export type UploadCaseResponse = BackendCaseRecord

// ==================== API 函数 ====================

/**
 * 上传病例
 * 使用 FormData 提交，支持多文件上传
 * @param params.title - 病例标题
 * @param params.description - 病例描述（可选）
 * @param params.files - 要上传的文件列表
 * @returns 创建后的病例记录
 */
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

/**
 * 获取当前用户的病例列表（分页）
 * @param query.page - 页码
 * @param query.pageSize - 每页条数
 * @returns 分页的病例列表
 */
export async function getMyCases(query?: { page?: number; pageSize?: number }): Promise<{ items: BackendCaseRecord[]; total: number; page: number; pageSize: number }> {
  const res = await api.get('/cases/mine', { params: query })
  return res.data
}

/**
 * 更新病例信息
 * @param id - 病例ID
 * @param data - 要更新的字段（标题、描述）
 * @returns 更新后的病例记录
 */
export async function updateCase(id: number, data: { title?: string; description?: string | null }): Promise<BackendCaseRecord> {
  const res = await api.patch(`/cases/${id}`, data)
  return res.data
}

/**
 * 删除病例
 * @param id - 病例ID
 * @returns 操作结果
 */
export async function deleteCase(id: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/cases/${id}`)
  return res.data
}
