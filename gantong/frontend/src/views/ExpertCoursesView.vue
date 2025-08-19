<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VideoService, type VideoUpload } from '../services/video'

// 课程列表
const courses = ref<VideoUpload[]>([])
const loading = ref(true)
const error = ref('')

// 加载专家课程
const loadExpertCourses = async () => {
  try {
    loading.value = true
    const response = await VideoService.getExpertCourses({ orderBy: 'createdAt' })
    courses.value = response.data
  } catch (err: any) {
    console.error('加载专家课程失败:', err)
    error.value = err.response?.data?.message || '加载课程失败，请刷新页面重试'
  } finally {
    loading.value = false
  }
}

// 格式化时长
// 没有时长就不显示任何文字，避免给用户“处理中”的误解
const formatDuration = (durationSeconds?: number) => {
  if (!durationSeconds || durationSeconds <= 0) return ''
  const minutes = Math.max(1, Math.round(durationSeconds / 60))
  return `约${minutes}分钟`
}

// 格式化文件大小
const formatFileSize = (sizeBytes: number) => {
  const sizeMB = Math.round(sizeBytes / (1024 * 1024))
  return `${sizeMB}MB`
}

// 打开视频详情/播放
// 统一走后端流式播放接口，避免相对 URL 误指向前端域名
const openVideo = (course: VideoUpload) => {
  const streamUrl = VideoService.getVideoStreamUrl(course.id)
  window.open(streamUrl, '_blank')
}

// 生命周期
onMounted(() => {
  loadExpertCourses()
})
</script>

<template>
  <div class="expert-courses-container">
    <div class="header">
      <h1>专家课程</h1>
      <p class="subtitle">专业的感统失调科普与训练指导</p>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <p>正在加载课程...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadExpertCourses" class="retry-btn">重试</button>
    </div>

    <!-- 课程列表 -->
    <div v-else-if="courses.length > 0" class="courses-grid">
      <div
        v-for="course in courses"
        :key="course.id"
        class="course-card"
        @click="openVideo(course)"
      >
        <div class="course-thumbnail">
          <div class="play-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="white"/>
            </svg>
          </div>
          <div v-if="formatDuration(course.durationSeconds)" class="duration-badge">{{ formatDuration(course.durationSeconds) }}</div>
        </div>

        <div class="course-content">
          <h3>{{ course.title }}</h3>
          <p>{{ course.description }}</p>

          <!-- 课程信息 -->
          <div class="course-info">
            <div class="instructor-info">
              <span class="instructor-name">主讲：{{ course.authorSnapshotName }}</span>
              <span class="instructor-hospital">{{ course.authorSnapshotHospital }}</span>
              <span class="instructor-title">{{ course.authorSnapshotTitle }}</span>
            </div>

            <div class="course-stats">
              <span class="category">分类：{{ course.category }}</span>
              <span class="difficulty">难度：{{
                course.difficulty === 'beginner' ? '初级' :
                course.difficulty === 'intermediate' ? '中级' : '高级'
              }}</span>
              <span class="file-size">{{ formatFileSize(course.fileSizeBytes) }}</span>
              <span class="upload-date">上传时间：{{ course.createdAt.split('T')[0] }}</span>
            </div>

            <div class="tags" v-if="course.tags.length > 0">
              <span v-for="tag in course.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <div class="course-meta">
            <span class="free-badge">免费观看</span>
            <button class="watch-btn">立即观看</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>暂无专家课程</p>
      <p>请稍后再来查看</p>
    </div>
    
    <div class="notice">
      <h3>课程说明</h3>
      <p>• 所有专家课程完全免费观看</p>
      <p>• 由专业医生录制，内容权威可靠</p>
      <p>• 涵盖感统失调的诊断、治疗和家庭训练指导</p>
    </div>
  </div>
</template>

<style scoped>
.expert-courses-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.course-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.course-thumbnail {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.course-card:hover .play-button {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.duration-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.course-content {
  padding: 1.5rem;
}

.course-content h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.course-content p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.free-badge {
  background: #e8f5e8;
  color: #4caf50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.watch-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.watch-btn:hover {
  background: #369870;
}

.notice {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.notice h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.notice p {
  color: #666;
  margin-bottom: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .expert-courses-container {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .course-thumbnail {
    height: 160px;
  }
  
  .course-content {
    padding: 1rem;
  }
  
  .notice {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .courses-grid {
    gap: 1rem;
  }
  
  .course-thumbnail {
    height: 140px;
  }
  
  .play-button {
    width: 50px;
    height: 50px;
  }
  
  .course-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .watch-btn {
    width: 100%;
  }
}

/* 新增样式 */
.loading, .error, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #e74c3c;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #2980b9;
}

.course-info {
  margin: 1rem 0;
  font-size: 0.9rem;
  color: #666;
}

.instructor-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.instructor-name {
  font-weight: bold;
  color: #2c3e50;
}

.instructor-hospital, .instructor-title {
  color: #7f8c8d;
}

.course-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.course-stats span {
  font-size: 0.8rem;
  color: #95a5a6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>