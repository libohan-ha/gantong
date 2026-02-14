/**
 * 家长论坛服务模块
 *
 * 封装家长端论坛相关的 API 调用，包括：
 *   - 获取论坛分类列表
 *   - 帖子的增删改查（列表、详情、发帖）
 *   - 帖子点赞/取消点赞
 *   - 回复的查询和创建（支持楼中楼）
 */

import api from './api'

// ==================== 类型定义 ====================

/** 论坛分类 */
export interface ForumCategory {
  /** 分类ID */
  id: number
  /** 分类名称 */
  name: string
}

/** 帖子作者信息 */
export interface ForumAuthor {
  /** 用户ID */
  id?: number
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 姓名/昵称 */
  name?: string
  /** 头像URL */
  avatar?: string
  /** 孩子年龄（家长特有） */
  childAge?: number
  /** 所在地区 */
  location?: string
}

/** 论坛帖子 */
export interface ForumPost {
  /** 帖子ID */
  id: number
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** 所属分类（可能为空） */
  category: ForumCategory | null
  /** 作者信息 */
  author: ForumAuthor
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 标签列表 */
  tags: string[]
}

/** 论坛回复 */
export interface ForumReply {
  /** 回复ID */
  id: number
  /** 回复内容 */
  content: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string
  /** 是否为官方回复（医生/管理员的回复） */
  isOfficial?: boolean
  /** 父回复ID（楼中楼回复时使用，null 表示直接回复帖子） */
  parentReplyId?: number | null
  /** 回复作者 */
  author?: ForumAuthor
}

/** 通用分页响应包装类型 */
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

// ==================== 论坛服务类 ====================

export class ForumService {
  /**
   * 获取论坛分类列表
   * @returns 所有论坛分类
   */
  static async getCategories(): Promise<ForumCategory[]> {
    const { data } = await api.get('/parent/forum/categories')
    return data
  }

  /**
   * 获取帖子列表（分页 + 筛选）
   * @param params.page - 页码
   * @param params.pageSize - 每页条数
   * @param params.categoryId - 按分类筛选
   * @param params.q - 搜索关键词
   * @returns 分页的帖子列表
   */
  static async listPosts(params: { page?: number; pageSize?: number; categoryId?: number; q?: string }): Promise<Paginated<ForumPost>> {
    const { data } = await api.get('/parent/forum/posts', { params })
    return data
  }

  /**
   * 获取帖子详情
   * @param id - 帖子ID
   * @returns 帖子完整信息
   */
  static async getPost(id: number): Promise<ForumPost> {
    const { data } = await api.get(`/parent/forum/posts/${id}`)
    return data
  }

  /**
   * 发布新帖子
   * @param payload.title - 标题
   * @param payload.content - 内容
   * @param payload.tags - 标签列表（可选）
   * @param payload.categoryId - 分类ID（可选）
   * @returns 创建的帖子
   */
  static async createPost(payload: { title: string; content: string; tags?: string[]; categoryId?: number }): Promise<ForumPost> {
    const { data } = await api.post('/parent/forum/posts', payload)
    return data
  }

  /**
   * 切换帖子点赞状态（点赞/取消点赞）
   * @param postId - 帖子ID
   * @returns 当前点赞状态（liked: true 已点赞, false 已取消）
   */
  static async toggleLike(postId: number): Promise<{ liked: boolean }> {
    const { data } = await api.post(`/parent/forum/posts/${postId}/like`)
    return data
  }

  /**
   * 获取帖子的回复列表（分页）
   * @param postId - 帖子ID
   * @param params.page - 页码
   * @param params.pageSize - 每页条数
   * @returns 分页的回复列表
   */
  static async listReplies(postId: number, params: { page?: number; pageSize?: number } = {}): Promise<Paginated<ForumReply>> {
    const { data } = await api.get(`/parent/forum/posts/${postId}/replies`, { params })
    return data
  }

  /**
   * 发表回复
   * @param postId - 帖子ID
   * @param payload.content - 回复内容
   * @param payload.parentReplyId - 父回复ID（楼中楼回复时传入，直接回复帖子时为 null）
   * @returns 创建的回复
   */
  static async createReply(postId: number, payload: { content: string; parentReplyId?: number | null }): Promise<ForumReply> {
    const { data } = await api.post(`/parent/forum/posts/${postId}/replies`, payload)
    return data
  }
}
