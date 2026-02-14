/**
 * 视频服务模块
 *
 * 封装视频相关的 API 调用，同时服务于：
 *   - 医生端：上传视频、管理自己的视频（查看列表、详情、更新、删除）
 *   - 家长端：浏览专家课程列表、查看课程详情、获取视频流地址
 */

import api from './api'
import type { AxiosProgressEvent } from 'axios'

// ==================== 类型定义 ====================

/** 视频详细信息 */
export interface VideoUpload {
  /** 视频ID */
  id: number
  /** 视频标题 */
  title: string
  /** 视频描述 */
  description: string
  /** 分类（如：感统训练、家庭指导等） */
  category: string
  /** 标签列表 */
  tags: string[]
  /** 目标受众（如：家长、教师等） */
  targetAudience: string[]
  /** 难度等级：初级 / 中级 / 高级 */
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  /** 视频时长（分钟） */
  duration?: number
  /** 文件大小（字节） */
  fileSizeBytes: number
  /** 原始文件名 */
  fileName: string
  /** 视频URL */
  videoUrl?: string
  /** 缩略图URL */
  thumbnailUrl?: string
  /** 上传日期 */
  uploadDate: string
  /** 视频状态：上传中 / 处理中 / 待审核 / 已通过 / 已拒绝 / 已发布 */
  status: 'uploading' | 'processing' | 'review' | 'approved' | 'rejected' | 'published'
  /** 上传者姓名快照（冗余存储，防止医生改名后显示异常） */
  authorSnapshotName: string
  /** 上传者医院快照 */
  authorSnapshotHospital: string
  /** 上传者职称快照 */
  authorSnapshotTitle: string
  /** 播放次数 */
  viewCount: number
  /** 点赞次数 */
  likeCount: number
  /** 下载次数 */
  downloadCount: number
  /** 拒绝原因（仅状态为 rejected 时有值） */
  rejectionReason?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 上传视频的请求参数 */
export interface CreateVideoRequest {
  /** 视频标题 */
  title: string
  /** 视频描述 */
  description: string
  /** 分类 */
  category: string
  /** 标签列表 */
  tags: string[]
  /** 目标受众列表 */
  targetAudience: string[]
  /** 难度等级 */
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  /** 视频文件 */
  file: File
}

/** 更新视频的请求参数（所有字段可选） */
export interface UpdateVideoRequest {
  /** 视频标题 */
  title?: string
  /** 视频描述 */
  description?: string
  /** 分类 */
  category?: string
  /** 标签列表 */
  tags?: string[]
  /** 目标受众列表 */
  targetAudience?: string[]
  /** 难度等级 */
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

/** 视频列表响应 */
export interface VideoListResponse {
  /** 视频列表 */
  data: VideoUpload[]
  /** 分页信息 */
  pagination: {
    /** 当前页码 */
    page: number
    /** 每页条数 */
    pageSize: number
    /** 总记录数 */
    total: number
    /** 总页数 */
    totalPages: number
  }
}

/** 视频列表查询参数 */
export interface VideoQueryParams {
  /** 页码 */
  page?: number
  /** 每页条数 */
  pageSize?: number
  /** 按状态筛选 */
  status?: string
  /** 按分类筛选 */
  category?: string
  /** 按难度筛选 */
  difficulty?: string
  /** 搜索关键词 */
  q?: string
  /** 排序字段 */
  orderBy?: string
}

// ==================== 视频服务类 ====================

export class VideoService {
  /**
   * 医生上传视频
   * 使用 FormData 提交，支持上传进度回调
   * @param request - 视频信息和文件
   * @param onUploadProgress - 上传进度回调函数（可选）
   * @returns 创建的视频记录
   */
  static async uploadVideo(
    request: CreateVideoRequest,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<VideoUpload> {
    const formData = new FormData()
    formData.append('title', request.title)
    formData.append('description', request.description)
    formData.append('category', request.category)
    formData.append('difficulty', request.difficulty)
    formData.append('file', request.file)
    
    // 处理数组字段：tags 和 targetAudience 逐个追加
    request.tags.forEach(tag => formData.append('tags', tag))
    request.targetAudience.forEach(audience => formData.append('targetAudience', audience))

    const response = await api.post<VideoUpload>('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
    
    return response.data
  }

  /**
   * 获取当前医生的视频列表（分页 + 筛选）
   * @param params - 查询参数
   * @returns 分页的视频列表
   */
  static async getMyVideos(params?: VideoQueryParams): Promise<VideoListResponse> {
    const response = await api.get<VideoListResponse>('/videos/mine', { params })
    return response.data
  }

  /**
   * 获取视频详情（医生端）
   * @param id - 视频ID
   * @returns 视频完整信息
   */
  static async getVideoDetail(id: number): Promise<VideoUpload> {
    const response = await api.get<VideoUpload>(`/videos/${id}`)
    return response.data
  }

  /**
   * 更新视频信息（医生端）
   * @param id - 视频ID
   * @param request - 要更新的字段
   * @returns 更新后的视频记录
   */
  static async updateVideo(id: number, request: UpdateVideoRequest): Promise<VideoUpload> {
    const response = await api.patch<VideoUpload>(`/videos/${id}`, request)
    return response.data
  }

  /**
   * 删除视频（医生端）
   * @param id - 视频ID
   */
  static async deleteVideo(id: number): Promise<void> {
    await api.delete(`/videos/${id}`)
  }

  /**
   * 获取专家课程列表（家长端）
   * 家长可浏览已发布的专家课程视频
   * @param params - 查询参数
   * @returns 分页的课程列表
   */
  static async getExpertCourses(params?: VideoQueryParams): Promise<VideoListResponse> {
    const response = await api.get<VideoListResponse>('/client/expert-courses', { params })
    return response.data
  }

  /**
   * 获取专家课程详情（家长端）
   * @param id - 课程（视频）ID
   * @returns 课程完整信息
   */
  static async getExpertCourseDetail(id: number): Promise<VideoUpload> {
    const response = await api.get<VideoUpload>(`/client/expert-courses/${id}`)
    return response.data
  }

  /**
   * 获取视频流播放地址（家长端）
   * 拼接带有认证 token 的流媒体 URL，可直接用于 <video> 标签的 src
   * @param id - 课程（视频）ID
   * @returns 完整的视频流 URL（含 token 参数）
   */
  static getVideoStreamUrl(id: number): string {
    const token = localStorage.getItem('accessToken')
    const qs = token ? `?token=${encodeURIComponent(token)}` : ''
    return `${api.defaults.baseURL}/client/expert-courses/${id}/stream${qs}`
  }
}
