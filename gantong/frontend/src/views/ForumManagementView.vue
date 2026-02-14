<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyProfile, type DoctorProfile as Profile } from '@/services/doctor'
import { HospitalForumService, type HospitalPostItem, type HospitalReplyItem } from '@/services/hospital-forum'

interface ForumPost {
  id: number
  title: string
  content: string
  category: string
  author: {
    name: string
    avatar: string
    childAge?: number
    location?: string
  }
  createdAt: string
  updatedAt?: string
  likes: number
  replies: number
  views: number
  isSticky?: boolean
  tags: string[]
  images?: string[]
  status: 'published' | 'draft' | 'hidden'
  hasDoctoReply?: boolean
  urgencyLevel: 'low' | 'medium' | 'high'
}

interface Reply {
  id: number
  postId: number
  content: string
  author: {
    name: string
    avatar: string
    childAge?: number
    title?: string
    hospital?: string
    isDoctor?: boolean
  }
  createdAt: string
  likes: number
  parentReplyId?: number
  isOfficial?: boolean
}

const forumPosts = ref<ForumPost[]>([])
const replies = ref<Reply[]>([])

const selectedPost = ref<ForumPost | null>(null)
const showPostDetail = ref(false)
const showReplyModal = ref(false)
const filterCategory = ref('全部')
const filterUrgency = ref('全部')
const filterStatus = ref('全部')
const searchKeyword = ref('')
const sortBy = ref('latest')

const doctorReply = ref({
  content: '',
  isOfficial: true,
})

const doctorProfile = ref<Profile | null>(null)
const loadingDoctor = ref(false)

const loadDoctorProfile = async () => {
  try {
    loadingDoctor.value = true
    doctorProfile.value = await getMyProfile()
  } catch {
    ElMessage.error('加载医生资料失败，请稍后重试')
  } finally {
    loadingDoctor.value = false
  }
}

const mapPriority = (p: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'): 'low' | 'medium' | 'high' => {
  if (p === 'HIGH' || p === 'URGENT') return 'high'
  if (p === 'LOW') return 'low'
  return 'medium'
}

const mapPost = (p: HospitalPostItem): ForumPost => ({
  id: p.id,
  title: p.title,
  content: p.content,
  category: p.category?.name || '未分类',
  author: { name: p.author?.email || p.author?.phone || '家长', avatar: '' },
  createdAt: p.createdAt,
  updatedAt: p.lastReplyAt || p.updatedAt,
  likes: p.stats?.likes || 0,
  replies: p.stats?.replies || 0,
  views: p.stats?.views || p.viewsCount || 0,
  tags: p.tags || [],
  status: 'published',
  hasDoctoReply: !!p.hasOfficialReply,
  urgencyLevel: mapPriority(p.priority || 'NORMAL'),
})

const loadHospitalPosts = async () => {
  try {
    const sortMap: Record<string, 'latestReply' | 'latestPost' | 'mostReplied'> = {
      latest: 'latestReply',
      created: 'latestPost',
      replies: 'mostReplied',
    }
    const params = { page: 1, pageSize: 20, sortBy: sortMap[sortBy.value] || 'latestReply' }
    const res = await HospitalForumService.listPosts(params)
    forumPosts.value = res.items.map(mapPost)
  } catch {
    forumPosts.value = []
    ElMessage.error('加载帖子列表失败，请稍后重试')
  }
}

const loadHospitalReplies = async (postId: number) => {
  try {
    const res = await HospitalForumService.listReplies(postId, { page: 1, pageSize: 100 })
    replies.value = res.items.map((r: HospitalReplyItem) => ({
      id: r.id,
      postId,
      content: r.content,
      author: { name: r.author?.email || r.author?.phone || '用户', avatar: '', isDoctor: r.isOfficial },
      createdAt: r.createdAt,
      likes: 0,
      parentReplyId: undefined,
      isOfficial: r.isOfficial,
    }))
  } catch {
    replies.value = replies.value.filter((reply) => reply.postId !== postId)
    ElMessage.error('加载帖子回复失败，请稍后重试')
  }
}

const categoryOptions = ['全部', '训练分享', '求助咨询', '机构推荐', '家庭训练', '心情分享', '费用讨论', '康复经验', '医院就诊']

const urgencyOptions = [
  { value: '全部', label: '全部优先级' },
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
]

const statusOptions = [
  { value: '全部', label: '全部状态' },
  { value: 'replied', label: '已回复' },
  { value: 'unreplied', label: '待回复' },
]

const sortOptions = [
  { value: 'latest', label: '最新回复' },
  { value: 'created', label: '发布时间' },
  { value: 'urgency', label: '优先级' },
  { value: 'replies', label: '回复最多' },
]

const filteredPosts = computed(() => {
  const posts = forumPosts.value.filter((post) => {
    const categoryMatch = filterCategory.value === '全部' || post.category === filterCategory.value
    const urgencyMatch = filterUrgency.value === '全部' || post.urgencyLevel === filterUrgency.value
    const statusMatch =
      filterStatus.value === '全部' ||
      (filterStatus.value === 'replied' && post.hasDoctoReply) ||
      (filterStatus.value === 'unreplied' && !post.hasDoctoReply)
    const keywordMatch =
      searchKeyword.value === '' ||
      post.title.includes(searchKeyword.value) ||
      post.content.includes(searchKeyword.value) ||
      post.author.name.includes(searchKeyword.value)

    return categoryMatch && urgencyMatch && statusMatch && keywordMatch && post.status === 'published'
  })

  switch (sortBy.value) {
    case 'created':
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'urgency': {
      const urgencyOrder = { high: 3, medium: 2, low: 1 }
      posts.sort((a, b) => urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel])
      break
    }
    case 'replies':
      posts.sort((a, b) => b.replies - a.replies)
      break
    default:
      posts.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
  }

  return posts
})

const getPostReplies = (postId: number) => replies.value.filter((reply) => reply.postId === postId)

const statistics = computed(() => {
  const totalPosts = forumPosts.value.length
  const unrepliedPosts = forumPosts.value.filter((p) => !p.hasDoctoReply).length
  const highUrgencyPosts = forumPosts.value.filter((p) => p.urgencyLevel === 'high').length
  const myReplies = replies.value.filter((r) => r.author.isDoctor).length

  return { totalPosts, unrepliedPosts, highUrgencyPosts, myReplies }
})

onMounted(async () => {
  await Promise.all([loadDoctorProfile(), loadHospitalPosts()])
})

const getUrgencyInfo = (urgency: string) => {
  switch (urgency) {
    case 'high':
      return { text: '高', color: '#f44336', bgColor: '#ffebee', icon: '🚨' }
    case 'medium':
      return { text: '中', color: '#ff9800', bgColor: '#fff3e0', icon: '⚠️' }
    case 'low':
      return { text: '低', color: '#4caf50', bgColor: '#e8f5e8', icon: '🔵' }
    default:
      return { text: urgency, color: '#666', bgColor: '#f0f0f0', icon: '📝' }
  }
}

const viewPostDetail = async (post: ForumPost) => {
  selectedPost.value = post
  showPostDetail.value = true
  await loadHospitalReplies(post.id)
}

const replyToPost = (post: ForumPost) => {
  selectedPost.value = post
  showReplyModal.value = true
}

const closeModal = () => {
  showPostDetail.value = false
  showReplyModal.value = false
  selectedPost.value = null
  doctorReply.value.content = ''
}

const submitDoctorReply = async () => {
  if (!doctorReply.value.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  if (!selectedPost.value) return

  try {
    await HospitalForumService.createReply(selectedPost.value.id, {
      content: doctorReply.value.content,
      isOfficial: doctorReply.value.isOfficial,
    })
    await loadHospitalReplies(selectedPost.value.id)

    selectedPost.value.hasDoctoReply = true
    selectedPost.value.replies = replies.value.filter((r) => r.postId === selectedPost.value!.id).length

    doctorReply.value.content = ''
    closeModal()
    ElMessage.success('回复发布成功')
  } catch {
    ElMessage.error('回复发布失败，请稍后重试')
  }
}

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    return '刚刚'
  }
  if (diffHours < 24) {
    return `${diffHours}小时前`
  }
  if (diffDays < 7) {
    return `${diffDays}天前`
  }
  return date.toLocaleDateString('zh-CN')
}

const truncateContent = (content: string, maxLength = 120) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}
</script>

<template>
  <div class="forum-management-container">
    <!-- Hero -->
    <section class="page-hero">
      <div class="hero-deco">
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-circle c3"></div>
      </div>
      <div class="hero-inner">
        <span class="hero-badge">论坛管理</span>
        <h1>家长论坛管理</h1>
        <p>查看家长帖子，提供专业医疗建议和支持</p>
      </div>
    </section>

    <!-- Doctor info + stats row -->
    <section class="info-strip">
      <div class="doctor-chip">
        <div class="doctor-avatar">{{ (doctorProfile?.name || '医').charAt(0) }}</div>
        <div class="doctor-text">
          <span class="doctor-name">{{ doctorProfile?.name || '-' }}</span>
          <span class="doctor-hospital">{{ doctorProfile?.hospital || '-' }}</span>
        </div>
      </div>

      <div class="stat-chips">
        <div class="stat-chip">
          <span class="chip-emoji">📝</span>
          <span class="chip-num">{{ statistics.totalPosts }}</span>
          <span class="chip-label">总帖子</span>
        </div>
        <div class="stat-chip warn">
          <span class="chip-emoji">⏳</span>
          <span class="chip-num">{{ statistics.unrepliedPosts }}</span>
          <span class="chip-label">待回复</span>
        </div>
        <div class="stat-chip hot">
          <span class="chip-emoji">🔥</span>
          <span class="chip-num">{{ statistics.highUrgencyPosts }}</span>
          <span class="chip-label">高优先</span>
        </div>
        <div class="stat-chip ok">
          <span class="chip-emoji">💬</span>
          <span class="chip-num">{{ statistics.myReplies }}</span>
          <span class="chip-label">我的回复</span>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="filters-card">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索帖子标题、内容或作者..."
        class="search-input"
      />
      <div class="filter-row">
        <select v-model="filterCategory" class="filter-select">
          <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
        </select>
        <select v-model="filterUrgency" class="filter-select">
          <option v-for="option in urgencyOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
    </section>

    <!-- Posts -->
    <section class="posts-section">
      <div class="section-label">
        <h2>帖子列表</h2>
        <span class="section-line"></span>
        <span class="post-count">{{ filteredPosts.length }} 条</span>
      </div>

      <div class="posts-list">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="post-card"
          :class="{ 'high-priority': post.urgencyLevel === 'high', unreplied: !post.hasDoctoReply }"
        >
          <div class="post-left">
            <div class="post-author-avatar">{{ post.author.name.charAt(0) }}</div>
          </div>

          <div class="post-body">
            <div class="post-head">
              <div class="post-badges">
                <span
                  class="urgency-pill"
                  :style="{ color: getUrgencyInfo(post.urgencyLevel).color, background: getUrgencyInfo(post.urgencyLevel).bgColor }"
                >
                  {{ getUrgencyInfo(post.urgencyLevel).icon }} {{ getUrgencyInfo(post.urgencyLevel).text }}
                </span>
                <span class="category-pill">{{ post.category }}</span>
                <span v-if="!post.hasDoctoReply" class="status-pill pending">待回复</span>
                <span v-else class="status-pill done">已回复</span>
              </div>
              <span class="post-time">{{ formatDateTime(post.createdAt) }}</span>
            </div>

            <h3 class="post-title" @click="viewPostDetail(post)">{{ post.title }}</h3>
            <p class="post-preview">{{ truncateContent(post.content) }}</p>

            <div class="post-author-line">
              <span class="author-name-text">{{ post.author.name }}</span>
              <span v-if="post.author.childAge" class="author-extra">孩子{{ post.author.childAge }}岁</span>
              <span v-if="post.author.location" class="author-extra">{{ post.author.location }}</span>
            </div>

            <div v-if="post.tags.length" class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="post-tag">#{{ tag }}</span>
            </div>

            <div class="post-bottom">
              <div class="post-stats">
                <span>👁 {{ post.views }}</span>
                <span>👍 {{ post.likes }}</span>
                <span>💬 {{ post.replies }}</span>
              </div>
              <div class="post-actions">
                <button class="act-btn" @click="viewPostDetail(post)">查看详情</button>
                <button class="act-btn primary" @click="replyToPost(post)">
                  {{ post.hasDoctoReply ? '继续回复' : '专业回复' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredPosts.length === 0" class="no-posts">
        <p>暂时没有相关帖子</p>
      </div>
    </section>

    <!-- Post Detail Modal -->
    <div v-if="showPostDetail" class="modal-overlay" @click="closeModal">
      <div class="modal-panel large" @click.stop>
        <div class="modal-header">
          <h2>帖子详情</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div v-if="selectedPost" class="modal-body">
          <div class="detail-top-badges">
            <span
              class="urgency-pill"
              :style="{ color: getUrgencyInfo(selectedPost.urgencyLevel).color, background: getUrgencyInfo(selectedPost.urgencyLevel).bgColor }"
            >
              {{ getUrgencyInfo(selectedPost.urgencyLevel).icon }} {{ getUrgencyInfo(selectedPost.urgencyLevel).text }}优先级
            </span>
            <span class="category-pill">{{ selectedPost.category }}</span>
          </div>

          <h1 class="detail-title">{{ selectedPost.title }}</h1>

          <div class="detail-author">
            <div class="post-author-avatar">{{ selectedPost.author.name.charAt(0) }}</div>
            <div class="detail-author-info">
              <span class="author-name-text">{{ selectedPost.author.name }}</span>
              <span class="detail-meta">
                <span v-if="selectedPost.author.childAge">孩子{{ selectedPost.author.childAge }}岁</span>
                <span v-if="selectedPost.author.location">{{ selectedPost.author.location }}</span>
                <span>{{ formatDateTime(selectedPost.createdAt) }}</span>
              </span>
            </div>
          </div>

          <div class="detail-content">{{ selectedPost.content }}</div>

          <div v-if="selectedPost.tags.length" class="post-tags">
            <span v-for="tag in selectedPost.tags" :key="tag" class="post-tag">#{{ tag }}</span>
          </div>

          <div class="detail-stats">
            <span>👁 {{ selectedPost.views }}</span>
            <span>👍 {{ selectedPost.likes }}</span>
            <span>💬 {{ selectedPost.replies }}</span>
          </div>

          <div class="replies-section">
            <div class="replies-header">
              <h3>回复 ({{ getPostReplies(selectedPost.id).length }})</h3>
            </div>

            <div class="replies-list">
              <div
                v-for="reply in getPostReplies(selectedPost.id)"
                :key="reply.id"
                class="reply-card"
                :class="{ official: reply.isOfficial }"
              >
                <div class="reply-top">
                  <div class="reply-author-row">
                    <div class="reply-avatar" :class="{ doctor: reply.author.isDoctor }">
                      {{ reply.author.name.charAt(0) }}
                    </div>
                    <div class="reply-author-info">
                      <span class="reply-name">
                        {{ reply.author.name }}
                        <span v-if="reply.author.isDoctor" class="doctor-tag">医生</span>
                      </span>
                      <span class="reply-meta">
                        <span v-if="reply.author.title">{{ reply.author.title }}</span>
                        <span v-if="reply.author.hospital">{{ reply.author.hospital }}</span>
                        <span>{{ formatDateTime(reply.createdAt) }}</span>
                      </span>
                    </div>
                  </div>
                  <span v-if="reply.isOfficial" class="official-tag">官方回复</span>
                </div>
                <div class="reply-body">{{ reply.content }}</div>
              </div>
            </div>

            <div v-if="getPostReplies(selectedPost.id).length === 0" class="no-replies">
              <p>还没有回复</p>
            </div>

            <div class="reply-cta">
              <button class="act-btn primary" @click="replyToPost(selectedPost)">
                {{ selectedPost.hasDoctoReply ? '继续回复' : '专业回复' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reply Modal -->
    <div v-if="showReplyModal" class="modal-overlay" @click="closeModal">
      <div class="modal-panel" @click.stop>
        <div class="modal-header">
          <h2>专业回复</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div v-if="selectedPost" class="modal-body">
          <div class="post-summary-card">
            <h4>{{ selectedPost.title }}</h4>
            <p>{{ truncateContent(selectedPost.content, 200) }}</p>
          </div>

          <form @submit.prevent="submitDoctorReply" class="reply-form">
            <div class="form-group">
              <label>回复内容 *</label>
              <textarea
                v-model="doctorReply.content"
                rows="8"
                placeholder="请提供专业的医疗建议和支持..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="doctorReply.isOfficial" />
                <span>标记为官方回复</span>
              </label>
            </div>

            <div class="tips-card">
              <h5>💡 专业回复指导</h5>
              <ul>
                <li>基于专业知识提供建议，避免做确诊性表述</li>
                <li>语言温和友善，给予家长情绪支持</li>
                <li>必要时建议家长就医或寻求专业评估</li>
                <li>尊重家长的选择和实际困难</li>
              </ul>
            </div>

            <div class="form-actions">
              <button type="button" class="act-btn" @click="closeModal">取消</button>
              <button type="submit" class="act-btn primary">发布回复</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-management-container {
  max-width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Hero ── */
.page-hero {
  position: relative;
  text-align: center;
  padding: 2.5rem 2rem 2rem;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  color: #fff;
  overflow: hidden;
}

.hero-inner { position: relative; z-index: 1; }

.hero-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  background: rgba(245, 158, 66, 0.22);
  color: #fbbf68;
  border-radius: 999px;
  margin-bottom: 0.7rem;
  letter-spacing: 0.5px;
}

.page-hero h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.3rem; }
.page-hero p { margin: 0; font-size: 0.88rem; color: #94a3b8; }

.deco-circle { position: absolute; border-radius: 50%; opacity: 0.07; }
.c1 { width: 200px; height: 200px; background: #f59e42; top: -60px; right: -30px; }
.c2 { width: 120px; height: 120px; background: #5b8def; bottom: -40px; left: 5%; }
.c3 { width: 80px; height: 80px; background: #a78bfa; top: 20%; left: -15px; }

/* ── Info strip ── */
.info-strip {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.doctor-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 0.75rem 1.15rem;
}

.doctor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: linear-gradient(135deg, #5b8def, #a78bfa);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.doctor-text { display: flex; flex-direction: column; }
.doctor-name { font-size: 0.92rem; font-weight: 650; color: #1e293b; }
.doctor-hospital { font-size: 0.78rem; color: #94a3b8; }

.stat-chips { display: flex; gap: 0.65rem; flex: 1; flex-wrap: wrap; }

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  flex: 1;
  min-width: 110px;
}

.chip-emoji { font-size: 1.1rem; }
.chip-num { font-size: 1.15rem; font-weight: 750; color: #1e293b; line-height: 1; }
.chip-label { font-size: 0.78rem; color: #94a3b8; }

/* ── Filters ── */
.filters-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1.5px solid #e8eaef;
  border-radius: 10px;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus { border-color: #f59e42; }

.filter-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 120px;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e8eaef;
  border-radius: 10px;
  font-size: 0.84rem;
  color: #334155;
  background: #fff;
  outline: none;
  cursor: pointer;
}

.filter-select:focus { border-color: #f59e42; }

/* ── Section label ── */
.section-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-label h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
}

.section-line { flex: 1; height: 1px; background: #e8eaef; }
.post-count { font-size: 0.82rem; color: #94a3b8; white-space: nowrap; }

/* ── Post cards ── */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.post-card {
  display: flex;
  gap: 1rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.28s ease;
}

.post-card:hover {
  border-color: transparent;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.post-card.unreplied { border-left: 3px solid #f59e42; }
.post-card.high-priority { border-left: 3px solid #ef4444; }

.post-left { flex-shrink: 0; }

.post-author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e42, #f97316);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.post-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.5rem; }

.post-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; }

.post-badges { display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center; }

.urgency-pill,
.category-pill,
.status-pill {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
}

.category-pill { background: #f1f3f7; color: #475569; }

.status-pill.pending { background: #fff8ee; color: #d97706; }
.status-pill.done { background: #edfaf5; color: #059669; }

.post-time { font-size: 0.78rem; color: #94a3b8; white-space: nowrap; }

.post-title {
  font-size: 1rem;
  font-weight: 650;
  color: #1e293b;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s;
}

.post-title:hover { color: #f59e42; }

.post-preview { font-size: 0.84rem; color: #64748b; line-height: 1.6; margin: 0; }

.post-author-line { display: flex; gap: 0.6rem; align-items: center; font-size: 0.8rem; }
.author-name-text { font-weight: 600; color: #334155; }
.author-extra { color: #94a3b8; }

.post-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.post-tag { font-size: 0.75rem; color: #5b8def; }

.post-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; }

.post-stats { display: flex; gap: 0.85rem; font-size: 0.78rem; color: #94a3b8; }

.post-actions { display: flex; gap: 0.5rem; }

.act-btn {
  padding: 0.4rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.act-btn:hover { border-color: #cbd5e1; background: #f8fafc; }

.act-btn.primary {
  background: #f59e42;
  color: #fff;
  border-color: #f59e42;
}

.act-btn.primary:hover { background: #e58e35; border-color: #e58e35; }

.no-posts { text-align: center; padding: 3rem; color: #94a3b8; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-panel {
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-panel.large { max-width: 800px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f3f7;
}

.modal-header h2 { margin: 0; font-size: 1.15rem; font-weight: 700; color: #1e293b; }

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f3f7;
  border-radius: 8px;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover { background: #e2e8f0; }

.modal-body { padding: 1.5rem; }

/* Detail modal */
.detail-top-badges { display: flex; gap: 0.4rem; margin-bottom: 1rem; }

.detail-title { font-size: 1.35rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; line-height: 1.4; }

.detail-author { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem; }

.detail-author-info { display: flex; flex-direction: column; }

.detail-meta { font-size: 0.78rem; color: #94a3b8; display: flex; gap: 0.5rem; }

.detail-content { color: #334155; line-height: 1.75; white-space: pre-wrap; margin-bottom: 1rem; }

.detail-stats { display: flex; gap: 1rem; font-size: 0.82rem; color: #94a3b8; padding-bottom: 1.25rem; border-bottom: 1px solid #f1f3f7; margin-bottom: 1.25rem; }

/* Replies */
.replies-section { display: flex; flex-direction: column; gap: 1rem; }

.replies-header h3 { margin: 0; font-size: 1rem; font-weight: 650; color: #1e293b; }

.replies-list { display: flex; flex-direction: column; gap: 0.75rem; }

.reply-card {
  background: #f8fafc;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 1rem 1.15rem;
}

.reply-card.official { border-left: 3px solid #4ec3a0; background: #f7fdfb; }

.reply-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.65rem; }

.reply-author-row { display: flex; align-items: center; gap: 0.65rem; }

.reply-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.reply-avatar.doctor { background: linear-gradient(135deg, #5b8def, #a78bfa); color: #fff; }

.reply-author-info { display: flex; flex-direction: column; }
.reply-name { font-size: 0.88rem; font-weight: 600; color: #1e293b; }

.doctor-tag {
  font-size: 0.65rem;
  font-weight: 600;
  background: #5b8def;
  color: #fff;
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  margin-left: 0.35rem;
}

.reply-meta { font-size: 0.75rem; color: #94a3b8; display: flex; gap: 0.4rem; }

.official-tag {
  font-size: 0.7rem;
  font-weight: 600;
  background: #edfaf5;
  color: #059669;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.reply-body { font-size: 0.88rem; color: #334155; line-height: 1.65; white-space: pre-wrap; }

.no-replies { text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.88rem; }

.reply-cta { text-align: center; padding-top: 0.75rem; border-top: 1px solid #f1f3f7; }

/* Reply form modal */
.post-summary-card {
  background: #f8fafc;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.post-summary-card h4 { font-size: 0.95rem; font-weight: 650; color: #1e293b; margin: 0 0 0.35rem; }
.post-summary-card p { font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5; }

.reply-form { display: flex; flex-direction: column; gap: 1.15rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.88rem; font-weight: 600; color: #1e293b; }

.form-group textarea {
  padding: 0.85rem;
  border: 1.5px solid #e8eaef;
  border-radius: 10px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.88rem;
  line-height: 1.6;
  outline: none;
  transition: border-color 0.2s;
}

.form-group textarea:focus { border-color: #f59e42; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.88rem;
  color: #334155;
}

.checkbox-label input[type="checkbox"] { width: auto; }

.tips-card {
  background: #fffbf5;
  border: 1px solid #fde8cd;
  border-radius: 12px;
  padding: 1rem 1.15rem;
}

.tips-card h5 { color: #d97706; margin: 0 0 0.65rem; font-size: 0.88rem; }

.tips-card ul { margin: 0; padding-left: 1.25rem; }

.tips-card li { color: #64748b; margin-bottom: 0.35rem; line-height: 1.5; font-size: 0.84rem; }

.form-actions { display: flex; gap: 0.65rem; justify-content: flex-end; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .info-strip { flex-direction: column; }

  .stat-chips { width: 100%; }

  .filter-row { flex-direction: column; }

  .post-card { flex-direction: column; }

  .post-head { flex-direction: column; align-items: flex-start; }

  .post-bottom { flex-direction: column; align-items: flex-start; gap: 0.5rem; }

  .modal-panel { border-radius: 14px; }

  .detail-author { flex-direction: column; align-items: flex-start; }

  .reply-top { flex-direction: column; gap: 0.4rem; }

  .form-actions { flex-direction: column; }
}
</style>
