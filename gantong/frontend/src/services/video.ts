import api from './api'

export interface VideoUpload {
  id: number
  title: string
  description: string
  category: string
  tags: string[]
  targetAudience: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration?: number // 分钟
  fileSizeBytes: number
  fileName: string
  videoUrl?: string
  thumbnailUrl?: string
  uploadDate: string
  status: 'uploading' | 'processing' | 'review' | 'approved' | 'rejected' | 'published'
  authorSnapshotName: string
  authorSnapshotHospital: string
  authorSnapshotTitle: string
  viewCount: number
  likeCount: number
  downloadCount: number
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreateVideoRequest {
  title: string
  description: string
  category: string
  tags: string[]
  targetAudience: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  file: File
}

export interface UpdateVideoRequest {
  title?: string
  description?: string
  category?: string
  tags?: string[]
  targetAudience?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface VideoListResponse {
  data: VideoUpload[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface VideoQueryParams {
  page?: number
  pageSize?: number
  status?: string
  category?: string
  difficulty?: string
  q?: string
  orderBy?: string
}

export class VideoService {
  /**
   * 医生上传视频
   */
  static async uploadVideo(
    request: CreateVideoRequest,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<VideoUpload> {
    const formData = new FormData()
    formData.append('title', request.title)
    formData.append('description', request.description)
    formData.append('category', request.category)
    formData.append('difficulty', request.difficulty)
    formData.append('file', request.file)
    
    // 处理数组字段
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
   * 获取我的视频列表（医生）
   */
  static async getMyVideos(params?: VideoQueryParams): Promise<VideoListResponse> {
    const response = await api.get<VideoListResponse>('/videos/mine', { params })
    return response.data
  }

  /**
   * 获取视频详情（医生）
   */
  static async getVideoDetail(id: number): Promise<VideoUpload> {
    const response = await api.get<VideoUpload>(`/videos/${id}`)
    return response.data
  }

  /**
   * 更新视频信息（医生）
   */
  static async updateVideo(id: number, request: UpdateVideoRequest): Promise<VideoUpload> {
    const response = await api.patch<VideoUpload>(`/videos/${id}`, request)
    return response.data
  }

  /**
   * 删除视频（医生）
   */
  static async deleteVideo(id: number): Promise<void> {
    await api.delete(`/videos/${id}`)
  }

  /**
   * 获取专家课程列表（家长）
   */
  static async getExpertCourses(params?: VideoQueryParams): Promise<VideoListResponse> {
    const response = await api.get<VideoListResponse>('/client/expert-courses', { params })
    return response.data
  }

  /**
   * 获取专家课程详情（家长）
   */
  static async getExpertCourseDetail(id: number): Promise<VideoUpload> {
    const response = await api.get<VideoUpload>(`/client/expert-courses/${id}`)
    return response.data
  }

  /**
   * 获取视频流地址（家长）
   */
  static getVideoStreamUrl(id: number): string {
    const token = localStorage.getItem('accessToken')
    const qs = token ? `?token=${encodeURIComponent(token)}` : ''
    return `${api.defaults.baseURL}/client/expert-courses/${id}/stream${qs}`
  }
}
