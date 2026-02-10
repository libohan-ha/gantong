/**
 * 成长档案服务模块（家长端）
 *
 * 封装家长端成长档案相关的 API 调用，包括：
 *   - 孩子信息的增删查
 *   - 成长档案（身体发育、行为观察、日常技能）的查询与更新
 *   - 健康记录的增删改查
 */

import api from './api'

// ==================== 类型定义 ====================

/** 孩子基本信息 */
export interface ChildItem {
  /** 孩子ID */
  id: number
  /** 姓名 */
  name: string
  /** 性别（男/女/未知） */
  gender: string
  /** 出生日期 */
  birthDate: string
  /** 头像URL */
  avatarUrl?: string | null
}

/** 孩子当前状态数据 */
export interface CurrentStatusDTO {
  /** 身体发育数据 */
  physicalDevelopment: {
    /** 身高（厘米） */
    height: number | null
    /** 体重（千克） */
    weight: number | null
    /** 最后更新时间 */
    lastUpdated: string | null
  }
  /** 行为观察记录 */
  behaviorObservation: {
    /** 优势行为 */
    strengths: string[]
    /** 存在的挑战 */
    challenges: string[]
    /** 改善情况 */
    improvements: string[]
  }
  /** 日常技能评分（0-100） */
  dailySkills: {
    /** 自理能力 */
    selfCare: number
    /** 沟通能力 */
    communication: number
    /** 社交能力 */
    social: number
    /** 运动能力 */
    motor: number
  }
}

/** 成长档案完整响应（孩子信息 + 当前状态） */
export interface ProfileResponse {
  /** 孩子基本信息 */
  child: ChildItem
  /** 当前状态数据 */
  currentStatus: CurrentStatusDTO
}

// ==================== 孩子管理 API ====================

/**
 * 获取当前家长的所有孩子列表
 * @returns 孩子列表
 */
export async function listChildren(): Promise<{ items: ChildItem[] }> {
  const res = await api.get('/parent/growth/children')
  return res.data
}

/**
 * 添加新孩子
 * @param payload.name - 孩子姓名
 * @param payload.gender - 性别（男/女/未知）
 * @param payload.birthDate - 出生日期
 * @param payload.avatarUrl - 头像URL（可选）
 * @returns 创建的孩子信息
 */
export async function createChild(payload: { name: string; gender: '男' | '女' | '未知'; birthDate: string; avatarUrl?: string }): Promise<ChildItem> {
  const res = await api.post('/parent/growth/children', payload)
  return res.data
}

/**
 * 删除孩子记录
 * @param childId - 孩子ID
 * @returns 操作结果
 */
export async function deleteChild(childId: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/parent/growth/children/${childId}`)
  return res.data
}

// ==================== 成长档案 API ====================

/**
 * 获取指定孩子的成长档案
 * @param childId - 孩子ID
 * @returns 孩子信息和当前状态数据
 */
export async function getProfile(childId: number): Promise<ProfileResponse> {
  const res = await api.get(`/parent/growth/children/${childId}/profile`)
  return res.data
}

/**
 * 创建或更新孩子的成长档案
 * 使用 PUT 方法，如果档案不存在则创建，已存在则更新
 * @param childId - 孩子ID
 * @param payload - 档案数据（所有字段可选，只更新传入的字段）
 * @param payload.heightCm - 身高（厘米）
 * @param payload.weightKg - 体重（千克）
 * @param payload.lastPhysicalUpdated - 身体数据最后更新时间
 * @param payload.behaviorStrengths - 行为优势列表
 * @param payload.behaviorChallenges - 行为挑战列表
 * @param payload.behaviorImprovements - 行为改善列表
 * @param payload.dailySelfCare - 自理能力评分
 * @param payload.dailyCommunication - 沟通能力评分
 * @param payload.dailySocial - 社交能力评分
 * @param payload.dailyMotor - 运动能力评分
 * @returns 更新后的成长档案
 */
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

// ==================== 健康记录 API ====================

/** 健康记录 */
export interface HealthRecord {
  /** 记录ID */
  id: number
  /** 关联的孩子ID */
  childId: number
  /** 记录日期 */
  date: string
  /** 记录类型（如：体检、疫苗、就诊等） */
  type: string
  /** 描述 */
  description?: string
  /** 结果/诊断 */
  result?: string
}

/**
 * 获取孩子的健康记录列表（分页）
 * @param childId - 孩子ID
 * @param query.page - 页码
 * @param query.pageSize - 每页条数
 * @returns 分页的健康记录列表
 */
export async function listHealthRecords(childId: number, query?: { page?: number; pageSize?: number }): Promise<{ items: HealthRecord[]; total: number; page: number; pageSize: number }> {
  const res = await api.get(`/parent/growth/children/${childId}/health-records`, { params: query })
  return res.data
}

/**
 * 创建健康记录
 * @param childId - 孩子ID
 * @param payload.date - 记录日期
 * @param payload.type - 记录类型
 * @param payload.description - 描述（可选）
 * @param payload.result - 结果/诊断（可选）
 * @returns 创建的健康记录
 */
export async function createHealthRecord(childId: number, payload: { date: string; type: string; description?: string; result?: string }): Promise<HealthRecord> {
  const res = await api.post(`/parent/growth/children/${childId}/health-records`, payload)
  return res.data
}

/**
 * 更新健康记录
 * @param recordId - 记录ID
 * @param payload - 要更新的字段（日期、类型、描述、结果）
 * @returns 更新后的健康记录
 */
export async function updateHealthRecord(recordId: number, payload: { date?: string; type?: string; description?: string; result?: string }): Promise<HealthRecord> {
  const res = await api.put(`/parent/growth/health-records/${recordId}`, payload)
  return res.data
}

/**
 * 删除健康记录
 * @param recordId - 记录ID
 * @returns 操作结果
 */
export async function deleteHealthRecord(recordId: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/parent/growth/health-records/${recordId}`)
  return res.data
}
