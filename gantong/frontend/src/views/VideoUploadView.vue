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
  <div class="video-upload-layout">
    <!-- 顶部欢迎区 -->
    <section class="welcome-banner">
      <div class="welcome-text">
        <span class="welcome-tag">视频管理</span>
        <h1>授课视频上传</h1>
        <p>分享您的专业知识，为基层医院提供优质教学资源</p>
      </div>
      <button class="banner-upload-btn" @click="showUploadModal = true">
        ⬆️ 立即上传
      </button>
      <div class="welcome-deco">
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-circle c3"></div>
      </div>
    </section>

    <!-- 统计条 -->
    <section class="stat-strip">
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.total }}</span>
        <span class="chip-label">总视频数</span>
      </div>
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.published }}</span>
        <span class="chip-label">已发布</span>
      </div>
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.pending }}</span>
        <span class="chip-label">待审核</span>
      </div>
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.totalViews }}</span>
        <span class="chip-label">总播放量</span>
      </div>
    </section>

    <!-- 内容区 -->
    <section class="cards-section">
      <div class="section-header">
        <div class="section-title">
          <h2>我的视频</h2>
          <span class="section-line"></span>
        </div>
        <div class="tab-switch">
          <button
            class="tab-pill"
            :class="{ active: activeTab === 'videos' }"
            @click="activeTab = 'videos'"
          >
            视频列表
          </button>
          <button
            class="tab-pill"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            医生档案
          </button>
        </div>
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

            <div class="video-body">
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

            <!-- 底部彩条 -->
            <div class="card-bottom-bar"></div>
          </div>
        </div>

        <div v-if="uploadedVideos.length === 0" class="no-videos">
          <p>还没有上传任何视频</p>
          <button class="banner-upload-btn" @click="showUploadModal = true">
            上传第一个视频
          </button>
        </div>
      </div>
    </section>

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
/* ============================================================
   Video Upload — Unified Design System (Amber / Slate)
   ============================================================ */

/* ── Page layout ── */
.video-upload-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Welcome Banner (Hero) ── */
.welcome-banner {
  position: relative;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  padding: 2.5rem 2.75rem 2.25rem;
  color: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.welcome-text {
  position: relative;
  z-index: 1;
}

.welcome-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  background: rgba(245, 158, 66, 0.2);
  color: #f59e42;
  border-radius: 999px;
  margin-bottom: 0.7rem;
  letter-spacing: 0.5px;
}

.welcome-banner h1 {
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.welcome-banner p {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.6);
}

.banner-upload-btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f59e42 0%, #e8890a 100%);
  color: #fff;
  border: none;
  padding: 11px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
  transition: transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 4px 14px rgba(245, 158, 66, 0.25);
}

.banner-upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 66, 0.35);
}

/* Decorative circles */
.welcome-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}

.c1 {
  width: 200px;
  height: 200px;
  background: #f59e42;
  top: -60px;
  right: -30px;
}

.c2 {
  width: 120px;
  height: 120px;
  background: #fbbf24;
  bottom: -40px;
  right: 100px;
}

.c3 {
  width: 80px;
  height: 80px;
  background: #e8890a;
  top: 10px;
  right: 200px;
}

/* ── Stat Strip ── */
.stat-strip {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 13px;
  padding: 8px 18px;
  flex: 1;
  min-width: 120px;
}

.chip-num {
  font-size: 20px;
  font-weight: 750;
  color: #1e293b;
}

.chip-label {
  font-size: 13px;
  color: #64748b;
}

/* ── Cards Section ── */
.cards-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.section-title h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
}

.section-line {
  flex: 1;
  height: 1px;
  background: #e8eaef;
}

/* ── Tab Switch ── */
.tab-switch {
  display: flex;
  gap: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
}

.tab-pill {
  padding: 7px 18px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-pill.active {
  background: #fff;
  color: #1e293b;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-pill:hover:not(.active) {
  color: #1e293b;
}

/* ── Tab Content ── */
.tab-content {
  min-height: 300px;
}

/* ── Profile Card ── */
.profile-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  color: white;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #f59e42 0%, #e8890a 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-info h2 {
  margin: 0 0 0.35rem 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.profile-info p {
  margin: 0 0 0.2rem 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.verification-badge {
  display: inline-block;
  padding: 0.3rem 0.85rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.6rem;
  letter-spacing: 0.3px;
}

.verification-badge.verified {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.profile-details {
  padding: 1.5rem 2rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  color: #94a3b8;
  font-size: 12.5px;
}

.detail-item .value {
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}

.specialties-section h4 {
  color: #1e293b;
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  font-weight: 650;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.specialty-tag {
  background: rgba(245, 158, 66, 0.08);
  color: #e8890a;
  padding: 0.3rem 0.85rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* ── Video Cards Grid ── */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.15rem;
}

.video-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-card:hover {
  border-color: transparent;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px);
}

.video-card:hover .card-bottom-bar {
  opacity: 1;
}

.card-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f59e42, #e8890a);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Thumbnail */
.video-thumbnail {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #f59e42 0%, #e8890a 50%, #d97706 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thumbnail-placeholder {
  font-size: 3rem;
  color: white;
  opacity: 0.5;
}

.video-duration {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Video body */
.video-body {
  padding: 1.25rem 1.35rem 1.15rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.video-body h3 {
  font-size: 1.02rem;
  font-weight: 650;
  color: #1e293b;
  margin: 0 0 0.4rem;
  line-height: 1.4;
}

.video-description {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Video meta */
.video-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.instructor-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
}

.instructor-label {
  font-size: 0.72rem;
  color: #94a3b8;
}

.instructor-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #0284c7;
  padding: 0.15rem 0.5rem;
  background: rgba(245, 158, 66, 0.1);
  border-radius: 6px;
}

.instructor-details {
  display: block;
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 2px;
}

.video-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.detail-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.15rem 0.45rem;
  background: #f8fafc;
  border: 1px solid #f0f0f5;
  border-radius: 5px;
}

.detail-label {
  font-size: 0.68rem;
  color: #94a3b8;
}

.detail-value {
  font-size: 0.68rem;
  color: #1e293b;
  font-weight: 600;
}

/* Tags */
.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.65rem;
}

.video-tag {
  font-size: 0.68rem;
  padding: 0.15rem 0.5rem;
  background: rgba(245, 158, 66, 0.08);
  color: #e8890a;
  border-radius: 999px;
  font-weight: 500;
}

/* Stats */
.video-stats {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
}

.stat-item {
  font-size: 0.78rem;
  color: #64748b;
}

/* Rejection */
.rejection-reason {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.12);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 0.65rem;
}

.rejection-reason h5 {
  color: #ef4444;
  margin: 0 0 0.35rem 0;
  font-size: 0.8rem;
  font-weight: 600;
}

.rejection-reason p {
  color: #dc2626;
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
}

/* Actions */
.video-actions {
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: 9px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.18s;
}

.reupload-btn {
  background: transparent;
  border: 1.5px solid #e2e8f0;
  color: #475569;
}

.reupload-btn:hover {
  border-color: #f59e42;
  color: #f59e42;
  background: rgba(245, 158, 66, 0.04);
}

.delete-btn {
  background: transparent;
  border: 1.5px solid #fecaca;
  color: #ef4444;
}

.delete-btn:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

/* Empty state */
.no-videos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3.5rem 2rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  color: #64748b;
}

.no-videos p {
  margin: 0;
  font-weight: 500;
  color: #1e293b;
  font-size: 0.95rem;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.upload-modal {
  background: #fff;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
  transition: background 0.15s, color 0.15s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* ── Form ── */
.upload-form {
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  color: #1e293b;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 700;
  padding-bottom: 10px;
  border-bottom: 2px solid #f59e42;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #1e293b;
  font-weight: 600;
  font-size: 13.5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #f59e42;
  box-shadow: 0 0 0 3px rgba(245, 158, 66, 0.1);
  background: #fff;
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
  font-size: 13.5px;
  color: #475569;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  accent-color: #f59e42;
}

.tags-input {
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.5rem;
  min-height: 72px;
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.tags-input:focus-within {
  border-color: #f59e42;
  box-shadow: 0 0 0 3px rgba(245, 158, 66, 0.1);
  background: #fff;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.4rem;
}

.tag-item {
  background: rgba(245, 158, 66, 0.08);
  color: #e8890a;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
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
  font-size: 0.85rem;
  line-height: 1;
}

.tags-input input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.25rem;
  background: transparent;
  font-size: 14px;
  color: #1e293b;
}

.file-info {
  background: #f8fafc;
  border: 1px solid #eef0f4;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 0.5rem;
}

.file-info p {
  margin: 0 0 0.25rem 0;
  color: #64748b;
  font-size: 0.82rem;
}

.selected-file {
  background: rgba(245, 158, 66, 0.06);
  border: 1px solid rgba(245, 158, 66, 0.15);
  padding: 1rem;
  border-radius: 10px;
  margin-top: 0.5rem;
}

.selected-file h5 {
  color: #e8890a;
  margin: 0 0 0.4rem 0;
  font-size: 0.85rem;
  font-weight: 600;
}

.selected-file p {
  margin: 0 0 0.2rem 0;
  color: #1e293b;
  font-size: 0.85rem;
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 5px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e42, #e8890a);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.upload-progress p {
  color: #64748b;
  font-size: 0.82rem;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-actions .cancel-btn,
.form-actions .submit-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.18s;
}

.form-actions .cancel-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
}

.form-actions .cancel-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.form-actions .submit-btn {
  background: linear-gradient(135deg, #f59e42 0%, #e8890a 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(245, 158, 66, 0.25);
}

.form-actions .submit-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(245, 158, 66, 0.35);
  transform: translateY(-1px);
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .video-upload-layout {
    padding: 1rem;
  }

  .welcome-banner {
    flex-direction: column;
    padding: 1.75rem 1.5rem 1.5rem;
    text-align: center;
  }

  .welcome-banner h1 {
    font-size: 1.3rem;
  }

  .stat-strip {
    gap: 8px;
  }

  .stat-chip {
    padding: 6px 12px;
    min-width: 0;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
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
    flex-direction: column;
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

  .video-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .video-body {
    padding: 1rem;
  }

  .video-thumbnail {
    height: 140px;
  }

  .profile-details {
    padding: 1.25rem;
  }
}
</style>
