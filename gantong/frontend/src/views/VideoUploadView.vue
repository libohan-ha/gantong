<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { VideoService, type VideoUpload as ApiVideoUpload, type CreateVideoRequest } from '../services/video'

interface DoctorProfile {
  id?: number
  name: string
  age: number
  title: string
  department: string
  hospital: string
  phone: string
  email: string
  licenseNumber: string
  idNumber: string
  specialties: string[]
  experience: number
  verificationStatus: 'pending' | 'verified' | 'rejected'
  verificationDate?: string
  avatar?: string
}

// 使用 API 返回的 VideoUpload 类型，但保持向后兼容的显示逻辑
type VideoUpload = ApiVideoUpload & {
  // 为了兼容现有模板，添加一些计算属性
  mainInstructor?: {
    name: string
    hospital: string
    title: string
  }
  fileSize?: number // MB (从 fileSizeBytes 计算)
  uploadDate?: string // 从 createdAt 格式化
  duration?: number // 分钟 (从 durationSeconds 计算)
  likes?: number // 兼容字段，映射到 likeCount
  downloads?: number // 兼容字段，映射到 downloadCount
}

type ApiError = {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError)?.response?.data?.message
  return typeof message === 'string' && message.trim() ? message : fallback
}

const getErrorStatus = (error: unknown) => (error as ApiError)?.response?.status

// 当前医生档案
const doctorProfile = ref<DoctorProfile>({
  name: '',
  age: 0,
  title: '',
  department: '',
  hospital: '',
  phone: '',
  email: '',
  licenseNumber: '',
  idNumber: '',
  specialties: [],
  experience: 0,
  verificationStatus: 'pending'
})

// 模拟已上传的视频
const uploadedVideos = ref<VideoUpload[]>([
  {
    id: 1,
    title: '儿童感统失调的早期识别与干预',
    description: '详细讲解如何在临床实践中早期识别儿童感统失调问题，并制定有效的干预方案。',
    category: '临床诊断',
    tags: ['感统失调', '早期干预', '临床诊断'],
    duration: 45,
    fileSizeBytes: 580 * 1024 * 1024,
    fileName: '感统失调识别与干预.mp4',
    uploadDate: '2024-07-01',
    status: 'published',
    authorSnapshotName: '张慧敏',
    authorSnapshotHospital: '北京儿童医院',
    authorSnapshotTitle: '主任医师',
    targetAudience: ['儿科医生', '康复治疗师'],
    difficulty: 'intermediate',
    thumbnailUrl: '/api/placeholder/300/200',
    videoUrl: 'https://example.com/video1.mp4',
    viewCount: 1250,
    likeCount: 89,
    downloadCount: 156,
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-07-01T00:00:00Z'
  },
  {
    id: 2,
    title: '家庭感统训练指导技巧',
    description: '教授医务人员如何指导家长进行有效的家庭感统训练，提升康复效果。',
    category: '家庭康复',
    tags: ['家庭训练', '家长指导', '康复技巧'],
    duration: 60,
    fileSizeBytes: 720 * 1024 * 1024,
    fileName: '家庭训练指导.mp4',
    uploadDate: '2024-06-28',
    status: 'review',
    authorSnapshotName: '李建华',
    authorSnapshotHospital: '上海市儿童医院',
    authorSnapshotTitle: '副主任医师',
    targetAudience: ['康复医师', '护理人员'],
    difficulty: 'beginner',
    thumbnailUrl: '/api/placeholder/300/200',
    viewCount: 0,
    likeCount: 0,
    downloadCount: 0,
    createdAt: '2024-06-28T00:00:00Z',
    updatedAt: '2024-06-28T00:00:00Z'
  },
  {
    id: 3,
    title: '感统训练器械的安全使用',
    description: '介绍各种感统训练器械的正确使用方法和安全注意事项。',
    category: '器械使用',
    tags: ['训练器械', '安全操作', '使用指南'],
    duration: 35,
    fileSizeBytes: 420 * 1024 * 1024,
    fileName: '器械安全使用.mp4',
    uploadDate: '2024-06-25',
    status: 'rejected',
    authorSnapshotName: '王芳',
    authorSnapshotHospital: '广州市妇女儿童医疗中心',
    authorSnapshotTitle: '主治医师',
    targetAudience: ['康复治疗师', '护理人员'],
    difficulty: 'beginner',
    thumbnailUrl: '/api/placeholder/300/200',
    viewCount: 0,
    likeCount: 0,
    downloadCount: 0,
    rejectionReason: '视频质量不够清晰，建议重新录制',
    createdAt: '2024-06-25T00:00:00Z',
    updatedAt: '2024-06-25T00:00:00Z'
  }
])

// 页面状态
const activeTab = ref('videos')
const showUploadModal = ref(false)

// 上传表单数据
const uploadForm = ref({
  title: '',
  description: '',
  category: '',
  tags: [] as string[],
  targetAudience: [] as string[],
  difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  file: null as File | null
})

// 当前上传进度
const uploadProgress = ref(0)
const isUploading = ref(false)

// 选项数据
const categoryOptions = [
  '临床诊断',
  '治疗技术',
  '家庭康复',
  '器械使用',
  '案例分析',
  '理论基础',
  '研究前沿'
]

const audienceOptions = [
  '儿科医生',
  '康复医师',
  '康复治疗师',
  '护理人员',
  '心理治疗师',
  '特教老师',
  '医学生'
]

// 统计数据
const statistics = computed(() => {
  const total = uploadedVideos.value.length
  const published = uploadedVideos.value.filter(v => v.status === 'published').length
  const pending = uploadedVideos.value.filter(v => v.status === 'review').length
  const totalViews = uploadedVideos.value.reduce((sum, v) => sum + v.viewCount, 0)
  
  return { total, published, pending, totalViews }
})

// 获取状态显示信息
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'uploading':
      return { text: '上传中', color: '#2196f3', bgColor: '#e3f2fd' }
    case 'processing':
      return { text: '处理中', color: '#ff9800', bgColor: '#fff3e0' }
    case 'review':
      return { text: '审核中', color: '#9c27b0', bgColor: '#f3e5f5' }
    case 'approved':
      return { text: '已通过', color: '#4caf50', bgColor: '#e8f5e8' }
    case 'rejected':
      return { text: '已拒绝', color: '#f44336', bgColor: '#ffebee' }
    case 'published':
      return { text: '已发布', color: '#4caf50', bgColor: '#e8f5e8' }
    default:
      return { text: status, color: '#666', bgColor: '#f0f0f0' }
  }
}

// 初始化医生档案（简化版，不需要认证）
const initializeDoctorProfile = () => {
  doctorProfile.value = {
    name: '医生',
    age: 35,
    title: '主治医师',
    department: '儿科',
    hospital: '医院',
    phone: '',
    email: '',
    licenseNumber: '',
    idNumber: '',
    specialties: ['儿科学'],
    experience: 5,
    verificationStatus: 'verified',
    verificationDate: new Date().toISOString().split('T')[0]
  }
}

// 文件选择处理
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      alert('请选择视频文件')
      return
    }
    
    // 验证文件大小 (最大2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('文件大小不能超过2GB')
      return
    }
    
    uploadForm.value.file = file
  }
}

const handleTagInputEnter = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement | null
  if (!target) return
  const value = target.value.trim()
  if (value && !uploadForm.value.tags.includes(value)) {
    uploadForm.value.tags.push(value)
  }
  target.value = ''
}

// 提交视频上传
const submitUpload = async () => {
  if (!validateUploadForm()) {
    alert('请完整填写所有必填信息并选择视频文件')
    return
  }

  if (!uploadForm.value.file) {
    alert('请选择视频文件')
    return
  }

  try {
    isUploading.value = true
    uploadProgress.value = 0

    const request: CreateVideoRequest = {
      title: uploadForm.value.title,
      description: uploadForm.value.description,
      category: uploadForm.value.category,
      tags: uploadForm.value.tags,
      targetAudience: uploadForm.value.targetAudience,
      difficulty: uploadForm.value.difficulty,
      file: uploadForm.value.file
    }

    const newVideo = await VideoService.uploadVideo(request, (progressEvent) => {
      if (progressEvent.total) {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    // 转换为兼容格式
    const compatibleVideo: VideoUpload = {
      ...newVideo,
      mainInstructor: {
        name: newVideo.authorSnapshotName,
        hospital: newVideo.authorSnapshotHospital,
        title: newVideo.authorSnapshotTitle
      },
      fileSize: Math.round(newVideo.fileSizeBytes / (1024 * 1024)),
      uploadDate: newVideo.createdAt.split('T')[0],
      duration: newVideo.duration ?? 0,
      likes: newVideo.likeCount,
      downloads: newVideo.downloadCount
    }

    uploadedVideos.value.unshift(compatibleVideo)

    // 重置表单
    resetUploadForm()
    isUploading.value = false
    showUploadModal.value = false
    activeTab.value = 'videos'

    alert('视频上传成功！')
  } catch (error) {
    console.error('上传失败:', error)
    alert(getErrorMessage(error, '上传失败，请重试'))
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// 验证上传表单
const validateUploadForm = () => {
  const form = uploadForm.value
  return form.title && form.description && form.category &&
         form.file && form.targetAudience.length > 0 && form.tags.length > 0
}

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.value = {
    title: '',
    description: '',
    category: '',
    tags: [],
    targetAudience: [],
    difficulty: 'beginner',
    file: null
  }
  uploadProgress.value = 0
}

// 删除视频
const deleteVideo = async (videoId: number) => {
  if (confirm('确定要删除这个视频吗？')) {
    try {
      await VideoService.deleteVideo(videoId)
      const index = uploadedVideos.value.findIndex(v => v.id === videoId)
      if (index > -1) {
        uploadedVideos.value.splice(index, 1)
      }
      alert('视频已删除')
    } catch (error) {
      console.error('删除失败:', error)
      alert(getErrorMessage(error, '删除失败，请重试'))
    }
  }
}

// 重新上传
const reuploadVideo = (videoId: number) => {
  const video = uploadedVideos.value.find(v => v.id === videoId)
  if (video) {
    // 填充表单数据
    uploadForm.value = {
      title: video.title,
      description: video.description,
      category: video.category,
      tags: [...video.tags],
      targetAudience: [...video.targetAudience],
      difficulty: video.difficulty,
      file: null
    }
    showUploadModal.value = true
  }
}

// 加载我的视频列表
const loadMyVideos = async () => {
  try {
    const response = await VideoService.getMyVideos()
    uploadedVideos.value = response.data.map(video => ({
      ...video,
      mainInstructor: {
        name: video.authorSnapshotName,
        hospital: video.authorSnapshotHospital,
        title: video.authorSnapshotTitle
      },
      fileSize: Math.round(video.fileSizeBytes / (1024 * 1024)),
      uploadDate: video.createdAt.split('T')[0],
      duration: video.duration ?? 0,
      likes: video.likeCount,
      downloads: video.downloadCount
    }))
  } catch (error) {
    console.error('加载视频列表失败:', error)
    // 如果是认证错误，不显示错误提示（可能是未登录）
    const status = getErrorStatus(error)
    if (status !== 401 && status !== 403) {
      alert('加载视频列表失败，请刷新页面重试')
    }
  }
}

// 格式化文件大小
const formatFileSize = (sizeInMB: number) => {
  if (sizeInMB >= 1024) {
    return (sizeInMB / 1024).toFixed(1) + ' GB'
  }
  return sizeInMB + ' MB'
}

// 格式化时长
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }
  return `${mins}分钟`
}

// 生命周期
onMounted(() => {
  // 初始化医生档案
  initializeDoctorProfile()
  // 加载我的视频列表
  loadMyVideos()
})
</script>

<template>
  <div class="video-upload-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>授课视频上传</h1>
      <p class="header-desc">分享您的专业知识，为基层医院提供优质教学资源</p>
    </div>

    <!-- 欢迎提示 -->
    <div class="welcome-notice">
      <div class="notice-content">
        <div class="notice-icon">🎥</div>
        <div class="notice-text">
          <h3>欢迎上传授课视频</h3>
          <p>分享您的专业知识和临床经验，为基层医院提供优质的教学资源。</p>
        </div>
        <button class="upload-btn-primary" @click="showUploadModal = true">
          立即上传
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-grid">
      <div class="stat-card">
        <div class="stat-icon total">📹</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.total }}</div>
          <div class="stat-label">总视频数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon published">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.published }}</div>
          <div class="stat-label">已发布</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">⏰</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.pending }}</div>
          <div class="stat-label">待审核</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon views">👁️</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.totalViews }}</div>
          <div class="stat-label">总播放量</div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="upload-btn" @click="showUploadModal = true">
        ⬆️ 上传新视频
      </button>
    </div>

    <!-- 标签导航 -->
    <div class="tab-navigation">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'videos' }"
        @click="activeTab = 'videos'"
      >
        我的视频
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'profile' }"
        @click="activeTab = 'profile'"
      >
        医生档案
      </button>
    </div>

    <!-- 医生档案标签 -->
    <div v-if="activeTab === 'profile'" class="tab-content">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">{{ doctorProfile.name.charAt(0) }}</div>
          <div class="profile-info">
            <h2>{{ doctorProfile.name }}</h2>
            <p>{{ doctorProfile.title }} | {{ doctorProfile.department }}</p>
            <p>{{ doctorProfile.hospital }}</p>
            <div class="verification-badge verified">
              ✅ 已认证
            </div>
          </div>
        </div>
        
        <div class="profile-details">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">年龄</span>
              <span class="value">{{ doctorProfile.age }}岁</span>
            </div>
            <div class="detail-item">
              <span class="label">从业经验</span>
              <span class="value">{{ doctorProfile.experience }}年</span>
            </div>
            <div class="detail-item">
              <span class="label">联系电话</span>
              <span class="value">{{ doctorProfile.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="label">邮箱</span>
              <span class="value">{{ doctorProfile.email }}</span>
            </div>
          </div>
          
          <div class="specialties-section">
            <h4>专业领域</h4>
            <div class="specialty-tags">
              <span 
                v-for="specialty in doctorProfile.specialties" 
                :key="specialty"
                class="specialty-tag"
              >
                {{ specialty }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频列表标签 -->
    <div v-if="activeTab === 'videos'" class="tab-content">
      <div class="videos-grid">
        <div 
          v-for="video in uploadedVideos" 
          :key="video.id"
          class="video-card"
        >
          <div class="video-thumbnail">
            <div class="thumbnail-placeholder">📹</div>
            <div class="video-duration">{{ formatDuration(video.duration || 0) }}</div>
            <span
              class="status-badge"
              :style="{ 
                color: getStatusInfo(video.status).color,
                backgroundColor: getStatusInfo(video.status).bgColor
              }"
            >
              {{ getStatusInfo(video.status).text }}
            </span>
          </div>
          
          <div class="video-content">
            <h3>{{ video.title }}</h3>
            <p class="video-description">{{ video.description }}</p>
            
            <div class="video-meta">
              <div class="instructor-info">
                <span class="instructor-label">主讲医师：</span>
                <span class="instructor-name">{{ video.mainInstructor?.name }}</span>
                <span class="instructor-details">
                  {{ video.mainInstructor?.title }} | {{ video.mainInstructor?.hospital }}
                </span>
              </div>
              
              <div class="video-details">
                <div class="detail-row">
                  <span class="detail-label">分类：</span>
                  <span class="detail-value">{{ video.category }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">难度：</span>
                  <span class="detail-value">{{ video.difficulty === 'beginner' ? '初级' : video.difficulty === 'intermediate' ? '中级' : '高级' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">文件大小：</span>
                  <span class="detail-value">{{ formatFileSize(video.fileSize || 0) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">上传时间：</span>
                  <span class="detail-value">{{ video.uploadDate }}</span>
                </div>
              </div>
            </div>
            
            <div class="video-tags">
              <span 
                v-for="tag in video.tags" 
                :key="tag"
                class="video-tag"
              >
                {{ tag }}
              </span>
            </div>
            
            <div v-if="video.status === 'published'" class="video-stats">
              <span class="stat-item">👁️ {{ video.viewCount }}</span>
              <span class="stat-item">👍 {{ video.likes }}</span>
              <span class="stat-item">⬇️ {{ video.downloads }}</span>
            </div>
            
            <div v-if="video.rejectionReason" class="rejection-reason">
              <h5>拒绝原因：</h5>
              <p>{{ video.rejectionReason }}</p>
            </div>
          </div>
          
          <div class="video-actions">
            <button 
              v-if="video.status === 'rejected'"
              class="action-btn reupload-btn"
              @click="reuploadVideo(video.id)"
            >
              重新上传
            </button>
            <button 
              class="action-btn delete-btn"
              @click="deleteVideo(video.id)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="uploadedVideos.length === 0" class="no-videos">
        <p>还没有上传任何视频</p>
        <button class="upload-btn" @click="showUploadModal = true">
          上传第一个视频
        </button>
      </div>
    </div>



    <!-- 视频上传弹窗 -->
    <div v-if="showUploadModal" class="modal-overlay" @click="showUploadModal = false">
      <div class="upload-modal" @click.stop>
        <div class="modal-header">
          <h2>上传授课视频</h2>
          <button class="close-btn" @click="showUploadModal = false">×</button>
        </div>
        
        <form @submit.prevent="submitUpload" class="upload-form">
          <div class="form-section">
            <h3>视频基本信息</h3>
            
            <div class="form-group">
              <label>视频标题 *</label>
              <input v-model="uploadForm.title" type="text" required>
            </div>
            
            <div class="form-group">
              <label>视频描述 *</label>
              <textarea v-model="uploadForm.description" rows="3" required></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>视频分类 *</label>
                <select v-model="uploadForm.category" required>
                  <option value="">请选择</option>
                  <option v-for="category in categoryOptions" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>难度等级 *</label>
                <select v-model="uploadForm.difficulty" required>
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>标签 *</label>
              <div class="tags-input">
                <div class="selected-tags">
                  <span 
                    v-for="tag in uploadForm.tags" 
                    :key="tag"
                    class="tag-item"
                  >
                    {{ tag }}
                    <button type="button" @click="uploadForm.tags = uploadForm.tags.filter(t => t !== tag)">
                      ×
                    </button>
                  </span>
                </div>
                <input 
                  type="text" 
                  placeholder="输入标签后按回车"
                  @keydown.enter.prevent="handleTagInputEnter"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label>目标学员 *</label>
              <div class="checkbox-group">
                <label 
                  v-for="audience in audienceOptions" 
                  :key="audience"
                  class="checkbox-item"
                >
                  <input 
                    type="checkbox" 
                    :value="audience"
                    v-model="uploadForm.targetAudience"
                  >
                  <span>{{ audience }}</span>
                </label>
              </div>
            </div>
          </div>
          

          
          <div class="form-section">
            <h3>视频文件</h3>
            
            <div class="form-group">
              <label>选择视频文件 *</label>
              <input 
                type="file" 
                accept="video/*"
                @change="handleFileSelect"
                required
              >
              <div class="file-info">
                <p>支持格式：MP4, MOV, AVI, WMV</p>
                <p>文件大小：最大2GB</p>
                <p>建议分辨率：1920x1080 或更高</p>
              </div>
            </div>
            
            <div v-if="uploadForm.file" class="selected-file">
              <h5>已选择文件：</h5>
              <p>{{ uploadForm.file.name }}</p>
              <p>大小：{{ formatFileSize(Math.round(uploadForm.file.size / (1024 * 1024))) }}</p>
            </div>
            
            <div v-if="isUploading" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <p>上传进度：{{ uploadProgress }}%</p>
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              class="cancel-btn" 
              @click="showUploadModal = false"
              :disabled="isUploading"
            >
              取消
            </button>
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="isUploading"
            >
              {{ isUploading ? '上传中...' : '开始上传' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-upload-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.header-desc {
  color: #666;
  font-size: 1.1rem;
}

/* 欢迎提示 */
.welcome-notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.notice-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notice-text {
  flex: 1;
}

.notice-text h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.notice-text p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
}

.upload-btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;
}

.upload-btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* 统计卡片 */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.total {
  background: #e3f2fd;
}

.stat-icon.published {
  background: #e8f5e8;
}

.stat-icon.pending {
  background: #fff3e0;
}

.stat-icon.views {
  background: #f3e5f5;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.upload-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.upload-btn:hover {
  background: #369870;
}

/* 标签导航 */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #f0f0f0;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #42b883;
  color: white;
}

.tab-btn:hover:not(.active) {
  background: #e0e0e0;
}

/* 标签内容 */
.tab-content {
  min-height: 400px;
}

/* 医生档案 */
.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  backdrop-filter: blur(10px);
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.profile-info p {
  margin: 0 0 0.25rem 0;
  opacity: 0.9;
}

.verification-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 1rem;
}

.verification-badge.verified {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.profile-details {
  padding: 2rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  color: #666;
  font-size: 0.9rem;
}

.detail-item .value {
  color: #2c3e50;
  font-weight: 500;
}

.specialties-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.specialty-tag {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* 视频卡片 */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.video-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.video-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.video-thumbnail {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-placeholder {
  font-size: 4rem;
  color: white;
  opacity: 0.7;
}

.video-duration {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid currentColor;
}

.video-content {
  padding: 1.5rem;
}

.video-content h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  line-height: 1.4;
}

.video-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  margin-bottom: 1rem;
}

.instructor-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.instructor-label {
  color: #666;
  font-size: 0.9rem;
}

.instructor-name {
  color: #2c3e50;
  font-weight: 500;
  margin-left: 0.5rem;
}

.instructor-details {
  display: block;
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.video-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  color: #2c3e50;
  font-size: 0.9rem;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.video-tag {
  background: #e3f2fd;
  color: #2196f3;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.video-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  color: #666;
  font-size: 0.9rem;
}

.rejection-reason {
  background: #ffebee;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.rejection-reason h5 {
  color: #f44336;
  margin: 0 0 0.5rem 0;
}

.rejection-reason p {
  color: #c62828;
  margin: 0;
  font-size: 0.9rem;
}

.video-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.reupload-btn {
  background: #2196f3;
  color: white;
}

.reupload-btn:hover {
  background: #1976d2;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.delete-btn:hover {
  background: #d32f2f;
}

.no-videos {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.no-videos p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.upload-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

/* 表单样式 */
.upload-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 2px solid #42b883;
  padding-bottom: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b883;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
}

.tags-input {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.5rem;
  min-height: 80px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.tag-item {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-item button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
}

.tags-input input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.25rem;
}

.file-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.file-info p {
  margin: 0 0 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.selected-file {
  background: #e8f5e8;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.selected-file h5 {
  color: #42b883;
  margin: 0 0 0.5rem 0;
}

.selected-file p {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #369870);
  transition: width 0.3s ease;
}

.upload-progress p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-actions .cancel-btn,
.form-actions .submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.form-actions .cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.form-actions .cancel-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.form-actions .submit-btn {
  background: #42b883;
  color: white;
}

.form-actions .submit-btn:hover:not(:disabled) {
  background: #369870;
}

.form-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-upload-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .statistics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .notice-content {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .video-details {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
