/**
 * 专家服务模块（家长端）
 *
 * 封装家长端与专家/医生相关的 API 调用，包括：
 *   - 获取医生列表（与培训模块解耦的独立接口）
 *   - 创建门诊预约
 */

import api from './api'

// ==================== 类型定义 ====================

/** 医生列表项（简要信息） */
export interface DoctorListItem {
  /** 医生ID */
  doctorId: number
  /** 医生姓名 */
  name: string
  /** 职称 */
  title?: string
  /** 所属医院 */
  hospital: string
}

/** 通用分页响应包装类型 */
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

// ==================== API 函数 ====================

/**
 * 获取医生列表（家长端，与培训解耦的独立接口）
 * @param params.page - 页码
 * @param params.pageSize - 每页条数
 * @param params.q - 搜索关键词（按姓名/医院模糊查询）
 * @returns 分页的医生列表
 */
export async function listDoctors(params?: { page?: number; pageSize?: number; q?: string }): Promise<Paginated<DoctorListItem>> {
  const res = await api.get<Paginated<DoctorListItem>>('/parent/experts/doctors', { params })
  return res.data
}

/**
 * 家长端创建门诊预约
 * @param payload.doctorId - 预约的医生ID
 * @param payload.childName - 孩子姓名
 * @param payload.childAge - 孩子年龄
 * @param payload.childGender - 孩子性别
 * @param payload.parentName - 家长姓名
 * @param payload.parentPhone - 家长联系电话
 * @param payload.preferredDate - 期望就诊日期（可选）
 * @param payload.preferredTime - 期望就诊时间段（可选）
 * @param payload.symptoms - 症状描述（可选）
 * @param payload.previousTreatment - 既往治疗情况（可选）
 * @returns 创建的预约记录
 */
export async function createDoctorAppointment(payload: {
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
}) {
  const res = await api.post('/parent/appointments', payload)
  return res.data
}
