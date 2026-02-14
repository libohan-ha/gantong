<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VideoService, type VideoUpload } from '../services/video'

// 课程列表
const courses = ref<VideoUpload[]>([])
const loading = ref(true)
const error = ref('')

type ApiError = {
  response?: {
    data?: {
      message?: string
    }
  }
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const message = (err as ApiError)?.response?.data?.message
  return typeof message === 'string' && message.trim() ? message : fallback
}

// 加载专家课程
const loadExpertCourses = async () => {
  try {
    loading.value = true
    const response = await VideoService.getExpertCourses({ orderBy: 'createdAt' })
    courses.value = response.data
  } catch (err) {
    console.error('加载专家课程失败:', err)
    error.value = getErrorMessage(err, '加载课程失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

// 格式化时长
// 没有时长就不显示任何文字，避免给用户“处理中”的误解
// 后端模型里 duration（分钟）可选，旧字段 durationSeconds 已移除
const formatDuration = (durationMinutes?: number) => {
  if (!durationMinutes || durationMinutes <= 0) return ''
  const minutes = Math.max(1, Math.round(durationMinutes))
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
  <div class="expert-courses-page">
    <!-- Hero header -->
    <section class="hero-banner">
      <div class="hero-text">
        <span class="hero-badge">专家课程</span>
        <h1>专家课程</h1>
        <p>专业的感统失调科普与训练指导</p>
      </div>
      <div class="hero-deco">
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-circle c3"></div>
      </div>
    </section>

    <!-- 加载状态 -->
    <div v-if="loading" class="state-card loading-state">
      <div class="spinner"></div>
      <span>正在加载课程...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="state-card error-state">
      <svg class="state-icon" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#f87171" stroke-width="2.5"/><path d="M16 16l16 16M32 16L16 32" stroke="#f87171" stroke-width="2.5" stroke-linecap="round"/></svg>
      <p>{{ error }}</p>
      <button @click="loadExpertCourses" class="retry-btn">重试</button>
    </div>

    <!-- 课程列表 -->
    <template v-else-if="courses.length > 0">
      <div class="section-title">
        <h2>全部课程</h2>
        <span class="section-line"></span>
      </div>

      <div class="courses-grid">
        <div
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          @click="openVideo(course)"
        >
          <!-- Thumbnail -->
          <div class="course-thumbnail">
            <div class="play-button">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="white"/>
              </svg>
            </div>
            <div v-if="formatDuration(course.duration)" class="duration-badge">{{ formatDuration(course.duration) }}</div>
          </div>

          <!-- Content -->
          <div class="course-body">
            <h3>{{ course.title }}</h3>
            <p class="course-desc">{{ course.description }}</p>

            <!-- 课程信息 -->
            <div class="course-info">
              <div class="instructor-row">
                <span class="info-chip accent">主讲：{{ course.authorSnapshotName }}</span>
                <span class="info-chip">{{ course.authorSnapshotHospital }}</span>
                <span class="info-chip">{{ course.authorSnapshotTitle }}</span>
              </div>

              <div class="stats-row">
                <span class="stat-chip-sm">{{ course.category }}</span>
                <span class="stat-chip-sm">{{
                  course.difficulty === 'beginner' ? '初级' :
                  course.difficulty === 'intermediate' ? '中级' : '高级'
                }}</span>
                <span class="stat-chip-sm">{{ formatFileSize(course.fileSizeBytes) }}</span>
                <span class="stat-chip-sm">{{ course.createdAt.split('T')[0] }}</span>
              </div>

              <div class="tags" v-if="course.tags.length > 0">
                <span v-for="tag in course.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>

            <div class="card-footer">
              <span class="free-badge">免费观看</span>
              <span class="enter-link">立即观看</span>
              <span class="enter-arrow">→</span>
            </div>
          </div>

          <!-- Bottom color bar -->
          <div class="card-bottom-bar"></div>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <div v-else class="state-card empty-state">
      <svg class="state-icon" viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="28" rx="4" stroke="#94a3b8" stroke-width="2.5"/><path d="M6 18h36" stroke="#94a3b8" stroke-width="2.5"/><circle cx="24" cy="31" r="3" stroke="#94a3b8" stroke-width="2"/></svg>
      <p>暂无专家课程</p>
      <span class="state-sub">请稍后再来查看</span>
    </div>

    <!-- Notice -->
    <div class="notice-card">
      <h3>课程说明</h3>
      <p>• 所有专家课程完全免费观看</p>
      <p>• 由专业医生录制，内容权威可靠</p>
      <p>• 涵盖感统失调的诊断、治疗和家庭训练指导</p>
    </div>
  </div>
</template>

<style scoped>
/* ── Page layout ── */
.expert-courses-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Hero banner ── */
.hero-banner {
  position: relative;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  padding: 2.5rem 2.75rem 2.25rem;
  color: #fff;
  overflow: hidden;
}

.hero-text {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  background: rgba(56, 189, 248, 0.2);
  color: #7dd3fc;
  border-radius: 999px;
  margin-bottom: 0.7rem;
  letter-spacing: 0.5px;
}

.hero-banner h1 {
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.hero-banner p {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Decorative circles */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}

.c1 {
  width: 200px;
  height: 200px;
  background: #38bdf8;
  top: -60px;
  right: -30px;
}

.c2 {
  width: 120px;
  height: 120px;
  background: #7dd3fc;
  bottom: -40px;
  right: 100px;
}

.c3 {
  width: 80px;
  height: 80px;
  background: #0ea5e9;
  top: 10px;
  right: 200px;
}

/* ── Section title ── */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

/* ── State cards (loading / error / empty) ── */
.state-card {
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
  font-size: 0.95rem;
}

.state-card p {
  margin: 0;
  font-weight: 500;
  color: #1e293b;
}

.state-sub {
  font-size: 0.82rem;
  color: #94a3b8;
}

.state-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 0.25rem;
}

/* Spinner */
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8eaef;
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error-state p {
  color: #ef4444;
}

.retry-btn {
  margin-top: 0.25rem;
  padding: 0.5rem 1.4rem;
  background: #38bdf8;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-btn:hover {
  background: #0ea5e9;
}

/* ── Courses grid ── */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.15rem;
}

/* ── Course card ── */
.course-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.course-card:hover {
  border-color: transparent;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px);
}

/* Thumbnail */
.course-thumbnail {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.play-button {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Card body */
.course-body {
  padding: 1.25rem 1.35rem 1.15rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.course-body h3 {
  font-size: 1.02rem;
  font-weight: 650;
  color: #1e293b;
  margin: 0 0 0.4rem;
  line-height: 1.4;
}

.course-desc {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Course info */
.course-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.instructor-row,
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.info-chip {
  font-size: 0.72rem;
  padding: 0.2rem 0.55rem;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 6px;
  font-weight: 500;
}

.info-chip.accent {
  background: rgba(56, 189, 248, 0.1);
  color: #0284c7;
  font-weight: 600;
}

.stat-chip-sm {
  font-size: 0.68rem;
  padding: 0.15rem 0.45rem;
  background: #f8fafc;
  border: 1px solid #f0f0f5;
  color: #94a3b8;
  border-radius: 5px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag {
  font-size: 0.68rem;
  padding: 0.15rem 0.5rem;
  background: rgba(56, 189, 248, 0.08);
  color: #0ea5e9;
  border-radius: 999px;
  font-weight: 500;
}

/* Card footer */
.card-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
}

.free-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  background: #ecfdf5;
  color: #10b981;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.enter-link {
  margin-left: auto;
  font-size: 0.82rem;
  font-weight: 600;
  color: #38bdf8;
}

.enter-arrow {
  font-size: 0.85rem;
  color: #38bdf8;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.course-card:hover .enter-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Bottom color bar */
.card-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #38bdf8;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover .card-bottom-bar {
  opacity: 1;
}

/* ── Notice card ── */
.notice-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-left: 4px solid #38bdf8;
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
}

.notice-card h3 {
  font-size: 0.95rem;
  font-weight: 650;
  color: #1e293b;
  margin: 0 0 0.65rem;
}

.notice-card p {
  font-size: 0.83rem;
  color: #64748b;
  margin: 0 0 0.35rem;
  line-height: 1.7;
}

.notice-card p:last-child {
  margin-bottom: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .expert-courses-page {
    padding: 1rem;
  }

  .hero-banner {
    padding: 1.75rem 1.5rem 1.5rem;
  }

  .hero-banner h1 {
    font-size: 1.3rem;
  }

  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .course-thumbnail {
    height: 140px;
  }
}

@media (max-width: 480px) {
  .course-body {
    padding: 1rem;
  }

  .play-button {
    width: 44px;
    height: 44px;
  }

  .card-footer {
    flex-wrap: wrap;
  }

  .notice-card {
    padding: 1.25rem;
  }
}
</style>
