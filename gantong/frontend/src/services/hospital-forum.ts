/**
 * 医院端论坛服务模块
 *
 * 封装医院端（医生/管理员）论坛管理相关的 API 调用，包括：
 *   - 帖子列表查询（支持多维度筛选和排序）
 *   - 帖子详情查看
 *   - 回复管理（查看、创建官方回复、删除）
 *   - 帖子状态和优先级管理
 *   - 帖子删除
 *   - 论坛统计数据
 *
 * 与家长端 forum.ts 的区别：
 *   - 医院端拥有管理权限（修改状态、优先级、删除帖子/回复）
 *   - 医院端可发布官方回复（isOfficial: true）
 *   - 医院端帖子包含更多管理字段（priority、status、viewsCount 等）
 */

import api from './api'

// ==================== 类型定义 ====================

/** 医院端帖子列表项（包含管理相关字段） */
export interface HospitalPostItem {
  /** 帖子ID */
  id: number
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** 所属分类 */
  category: { id: number; name: string }
  /** 作者信息 */
  author: { id?: number; email?: string; phone?: string }
  /** 标签列表 */
  tags: string[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 优先级：低 / 普通 / 高 / 紧急 */
  priority: 'LOW'|'NORMAL'|'HIGH'|'URGENT'
  /** 处理状态：待处理 / 处理中 / 已解决 / 已关闭 / 已归档 */
  status: 'OPEN'|'IN_PROGRESS'|'RESOLVED'|'CLOSED'|'ARCHIVED'
  /** 浏览次数 */
  viewsCount?: number
  /** 最后回复时间 */
  lastReplyAt?: string | null
  /** 是否已有官方回复 */
  hasOfficialReply?: boolean
  /** 统计数据（回复数、点赞数、浏览数） */
  stats?: { replies: number; likes: number; views?: number }
}

/** 医院端回复列表项 */
export interface HospitalReplyItem {
  /** 回复ID */
  id: number
  /** 回复内容 */
  content: string
  /** 创建时间 */
  createdAt: string
  /** 是否为官方回复 */
  isOfficial: boolean
  /** 回复作者 */
  author: { id?: number; email?: string; phone?: string }
  /** 父回复（楼中楼结构） */
  parent?: { id: number } | null
}

/** 通用分页响应包装类型 */
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

/** 帖子列表查询参数 */
export interface HospitalPostListParams {
  /** 页码 */
  page?: number
  /** 每页条数 */
  pageSize?: number
  /** 排序方式：最新回复 / 最新发帖 / 最多回复 */
  sortBy?: 'latestReply' | 'latestPost' | 'mostReplied'
  /** 按分类ID筛选 */
  categoryId?: number
  /** 按状态筛选 */
  status?: HospitalPostItem['status']
  /** 按优先级筛选 */
  priority?: HospitalPostItem['priority']
  /** 搜索关键词 */
  q?: string
}

// ==================== 医院论坛服务类 ====================

export class HospitalForumService {
  /**
   * 获取帖子列表（分页 + 多维度筛选）
   * @param params - 查询参数（分页、排序、筛选）
   * @returns 分页的帖子列表
   */
  static async listPosts(params: HospitalPostListParams): Promise<Paginated<HospitalPostItem>> {
    const { data } = await api.get('/hospital/forum/posts', { params })
    return data
  }

  /**
   * 获取帖子详情
   * @param id - 帖子ID
   * @returns 帖子完整信息
   */
  static async getPost(id: number): Promise<HospitalPostItem> {
    const { data } = await api.get(`/hospital/forum/posts/${id}`)
    return data
  }

  /**
   * 获取帖子的回复列表（分页）
   * @param postId - 帖子ID
   * @param params.page - 页码
   * @param params.pageSize - 每页条数
   * @returns 分页的回复列表
   */
  static async listReplies(postId: number, params: { page?: number; pageSize?: number } = {}): Promise<Paginated<HospitalReplyItem>> {
    const { data } = await api.get(`/hospital/forum/posts/${postId}/replies`, { params })
    return data
  }

  /**
   * 创建回复（支持官方回复和楼中楼）
   * @param postId - 帖子ID
   * @param payload.content - 回复内容
   * @param payload.parentReplyId - 父回复ID（楼中楼，可选）
   * @param payload.isOfficial - 是否标记为官方回复（可选）
   * @returns 创建的回复
   */
  static async createReply(postId: number, payload: { content: string; parentReplyId?: number; isOfficial?: boolean }) {
    const { data } = await api.post(`/hospital/forum/posts/${postId}/replies`, payload)
    return data
  }

  /**
   * 修改帖子状态
   * @param postId - 帖子ID
   * @param status - 新状态（OPEN / IN_PROGRESS / RESOLVED / CLOSED / ARCHIVED）
   * @returns 更新后的帖子
   */
  static async setStatus(postId: number, status: HospitalPostItem['status']) {
    const { data } = await api.patch(`/hospital/forum/posts/${postId}/status`, { status })
    return data
  }

  /**
   * 修改帖子优先级
   * @param postId - 帖子ID
   * @param priority - 新优先级（LOW / NORMAL / HIGH / URGENT）
   * @returns 更新后的帖子
   */
  static async setPriority(postId: number, priority: HospitalPostItem['priority']) {
    const { data } = await api.patch(`/hospital/forum/posts/${postId}/priority`, { priority })
    return data
  }

  /**
   * 删除帖子
   * @param postId - 帖子ID
   * @returns 操作结果
   */
  static async deletePost(postId: number) {
    const { data } = await api.delete(`/hospital/forum/posts/${postId}`)
    return data
  }

  /**
   * 删除回复
   * @param replyId - 回复ID
   * @returns 操作结果
   */
  static async deleteReply(replyId: number) {
    const { data } = await api.delete(`/hospital/forum/replies/${replyId}`)
    return data
  }

  /**
   * 获取论坛统计数据
   * @returns 论坛整体统计（帖子数、回复数等）
   */
  static async stats() {
    const { data } = await api.get('/hospital/forum/stats')
    return data
  }
}
