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
    <div class="page-header">
      <h1>家长论坛管理</h1>
      <p class="header-desc">查看家长帖子，提供专业医疗建议和支持</p>
    </div>

    <div class="doctor-card">
      <div class="doctor-info">
        <div class="doctor-avatar">{{ (doctorProfile?.name || '医').charAt(0) }}</div>
        <div class="doctor-details">
          <h3>{{ doctorProfile?.name || '-' }}</h3>
          <p v-if="doctorProfile?.nickname">昵称：{{ doctorProfile?.nickname }}</p>
          <p>{{ doctorProfile?.hospital || '-' }}</p>
        </div>
      </div>
    </div>

    <div class="statistics-bar">
      <div class="stat-item">
        <span class="stat-icon">📝</span>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalPosts }}</span>
          <span class="stat-label">总帖子数</span>
        </div>
      </div>
      <div class="stat-item urgent">
        <span class="stat-icon">⏳</span>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.unrepliedPosts }}</span>
          <span class="stat-label">待回复</span>
        </div>
      </div>
      <div class="stat-item priority">
        <span class="stat-icon">🔥</span>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.highUrgencyPosts }}</span>
          <span class="stat-label">高优先级</span>
        </div>
      </div>
      <div class="stat-item replied">
        <span class="stat-icon">💬</span>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.myReplies }}</span>
          <span class="stat-label">我的回复</span>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="filters-row">
        <div class="search-group">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索帖子标题、内容或作者..."
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <select v-model="filterCategory" class="filter-select">
            <option v-for="category in categoryOptions" :key="category" :value="category">
              {{ category }}
            </option>
          </select>

          <select v-model="filterUrgency" class="filter-select">
            <option v-for="option in urgencyOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="filterStatus" class="filter-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="posts-list">
      <div
        v-for="post in filteredPosts"
        :key="post.id"
        class="post-card"
        :class="{ sticky: post.isSticky, 'high-priority': post.urgencyLevel === 'high', unreplied: !post.hasDoctoReply }"
      >
        <div class="post-header">
          <div class="post-meta">
            <div class="urgency-badge">
              <span class="urgency-icon">{{ getUrgencyInfo(post.urgencyLevel).icon }}</span>
              <span
                class="urgency-text"
                :style="{ color: getUrgencyInfo(post.urgencyLevel).color, backgroundColor: getUrgencyInfo(post.urgencyLevel).bgColor }"
              >
                {{ getUrgencyInfo(post.urgencyLevel).text }}优先级
              </span>
            </div>

            <div class="category-tag">{{ post.category }}</div>

            <div v-if="!post.hasDoctoReply" class="reply-status unreplied">待回复</div>
            <div v-else class="reply-status replied">已回复</div>
          </div>

          <div class="post-time">{{ formatDateTime(post.createdAt) }}</div>
        </div>

        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-preview">{{ truncateContent(post.content) }}</p>

          <div class="author-info">
            <div class="author-avatar">{{ post.author.name.charAt(0) }}</div>
            <div class="author-details">
              <div class="author-name">{{ post.author.name }}</div>
              <div class="author-meta">
                <span v-if="post.author.childAge">孩子{{ post.author.childAge }}岁</span>
                <span v-if="post.author.location">{{ post.author.location }}</span>
              </div>
            </div>
          </div>

          <div class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="post-tag">#{{ tag }}</span>
          </div>
        </div>

        <div class="post-stats">
          <span class="stat-item">浏览 {{ post.views }}</span>
          <span class="stat-item">点赞 {{ post.likes }}</span>
          <span class="stat-item">回复 {{ post.replies }}</span>
        </div>

        <div class="post-actions">
          <button class="action-btn view-btn" @click="viewPostDetail(post)">查看详情</button>
          <button class="action-btn reply-btn" @click="replyToPost(post)" :class="{ primary: !post.hasDoctoReply }">
            {{ post.hasDoctoReply ? '继续回复' : '专业回复' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredPosts.length === 0" class="no-posts">
      <p>暂时没有相关帖子</p>
    </div>

    <div v-if="showPostDetail" class="modal-overlay" @click="closeModal">
      <div class="post-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>帖子详情</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div v-if="selectedPost" class="modal-content">
          <div class="post-detail">
            <div class="post-detail-header">
              <div class="urgency-info">
                <span class="urgency-icon">{{ getUrgencyInfo(selectedPost.urgencyLevel).icon }}</span>
                <span
                  class="urgency-label"
                  :style="{ color: getUrgencyInfo(selectedPost.urgencyLevel).color, backgroundColor: getUrgencyInfo(selectedPost.urgencyLevel).bgColor }"
                >
                  {{ getUrgencyInfo(selectedPost.urgencyLevel).text }}优先级
                </span>
              </div>

              <div class="category-info">
                <span class="category-label">{{ selectedPost.category }}</span>
              </div>
            </div>

            <h1 class="post-detail-title">{{ selectedPost.title }}</h1>

            <div class="author-section">
              <div class="author-avatar large">{{ selectedPost.author.name.charAt(0) }}</div>
              <div class="author-details">
                <div class="author-name">{{ selectedPost.author.name }}</div>
                <div class="author-meta">
                  <span v-if="selectedPost.author.childAge">孩子{{ selectedPost.author.childAge }}岁</span>
                  <span v-if="selectedPost.author.location">{{ selectedPost.author.location }}</span>
                </div>
                <div class="post-time">{{ formatDateTime(selectedPost.createdAt) }}</div>
              </div>
            </div>

            <div class="post-detail-content">{{ selectedPost.content }}</div>

            <div class="post-detail-tags">
              <span v-for="tag in selectedPost.tags" :key="tag" class="post-tag">#{{ tag }}</span>
            </div>

            <div class="post-detail-stats">
              <span class="stat-item">浏览 {{ selectedPost.views }}</span>
              <span class="stat-item">点赞 {{ selectedPost.likes }}</span>
              <span class="stat-item">回复 {{ selectedPost.replies }}</span>
            </div>
          </div>

          <div class="replies-section">
            <h3>回复 ({{ getPostReplies(selectedPost.id).length }})</h3>

            <div class="replies-list">
              <div
                v-for="reply in getPostReplies(selectedPost.id)"
                :key="reply.id"
                class="reply-item"
                :class="{ official: reply.isOfficial }"
              >
                <div class="reply-header">
                  <div class="reply-author">
                    <div class="author-avatar" :class="{ doctor: reply.author.isDoctor }">
                      {{ reply.author.name.charAt(0) }}
                    </div>
                    <div class="author-details">
                      <div class="author-name">
                        {{ reply.author.name }}
                        <span v-if="reply.author.isDoctor" class="doctor-badge">医生</span>
                      </div>
                      <div class="author-info">
                        <span v-if="reply.author.title">{{ reply.author.title }}</span>
                        <span v-if="reply.author.hospital">{{ reply.author.hospital }}</span>
                      </div>
                      <div class="reply-time">{{ formatDateTime(reply.createdAt) }}</div>
                    </div>
                  </div>

                  <div v-if="reply.isOfficial" class="official-badge">官方回复</div>
                </div>

                <div class="reply-content">{{ reply.content }}</div>

                <div class="reply-actions">
                  <span class="stat-item">点赞 {{ reply.likes }}</span>
                </div>
              </div>
            </div>

            <div v-if="getPostReplies(selectedPost.id).length === 0" class="no-replies">
              <p>还没有回复</p>
            </div>

            <div class="quick-reply">
              <button class="reply-btn primary" @click="replyToPost(selectedPost)">
                {{ selectedPost.hasDoctoReply ? '继续回复' : '专业回复' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showReplyModal" class="modal-overlay" @click="closeModal">
      <div class="reply-modal" @click.stop>
        <div class="modal-header">
          <h2>专业回复</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div v-if="selectedPost" class="modal-content">
          <div class="post-summary">
            <h4>{{ selectedPost.title }}</h4>
            <p class="post-excerpt">{{ truncateContent(selectedPost.content, 200) }}</p>
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

            <div class="reply-tips">
              <h5>专业回复指导：</h5>
              <ul>
                <li>基于专业知识提供建议，避免做确诊性表述</li>
                <li>语言温和友善，给予家长情绪支持</li>
                <li>必要时建议家长就医或寻求专业评估</li>
                <li>尊重家长的选择和实际困难</li>
              </ul>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">取消</button>
              <button type="submit" class="submit-btn">发布回复</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-management-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 椤甸潰澶撮儴 */
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

/* 鍖荤敓淇℃伅鍗＄墖 */
.doctor-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.doctor-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  backdrop-filter: blur(10px);
}

.doctor-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.doctor-details p {
  margin: 0 0 0.25rem 0;
  opacity: 0.9;
}

/* 缁熻淇℃伅 */
.statistics-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-item.urgent {
  border-left: 4px solid #f44336;
}

.stat-item.priority {
  border-left: 4px solid #ff9800;
}

.stat-item.replied {
  border-left: 4px solid #4caf50;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  display: block;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 绛涢€夊尯鍩?*/
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #42b883;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

/* 甯栧瓙鍒楄〃 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.post-card.high-priority {
  border-left-color: #f44336;
  background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
}

.post-card.unreplied {
  border-left-color: #ff9800;
}

.post-card.sticky {
  border-left-color: #ffc107;
  background: linear-gradient(135deg, #fff9c4 0%, #ffffff 100%);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.urgency-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.urgency-icon {
  font-size: 1rem;
}

.urgency-text {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-tag {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.reply-status {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.reply-status.unreplied {
  background: #fff3e0;
  color: #ff9800;
}

.reply-status.replied {
  background: #e8f5e8;
  color: #4caf50;
}

.post-time {
  color: #666;
  font-size: 0.9rem;
}

.post-content {
  margin-bottom: 1rem;
}

.post-title {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  line-height: 1.4;
}

.post-preview {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  color: white;
}

.author-avatar.large {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.author-avatar.doctor {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.author-name {
  font-weight: 500;
  color: #2c3e50;
}

.author-meta {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  gap: 1rem;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.post-tag {
  background: #f0f8ff;
  color: #2196f3;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 1rem;
}

.stat-item {
  color: #666;
  font-size: 0.9rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.view-btn {
  background: #e3f2fd;
  color: #2196f3;
}

.view-btn:hover {
  background: #bbdefb;
}

.reply-btn {
  background: #f0f0f0;
  color: #666;
}

.reply-btn:hover {
  background: #e0e0e0;
}

.reply-btn.primary {
  background: #42b883;
  color: white;
}

.reply-btn.primary:hover {
  background: #369870;
}

.no-posts {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

/* 寮圭獥鏍峰紡 */
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

.post-detail-modal,
.reply-modal {
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

.modal-content {
  padding: 1.5rem;
}

/* 甯栧瓙璇︽儏鏍峰紡 */
.post-detail-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.urgency-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.urgency-label {
  padding: 0.3rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
}

.category-info .category-label {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.3rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.post-detail-title {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  line-height: 1.4;
}

.author-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.post-detail-content {
  color: #2c3e50;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  white-space: pre-wrap;
}

.post-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.post-detail-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

/* 鍥炲鍖哄煙 */
.replies-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.reply-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid transparent;
}

.reply-item.official {
  background: #e8f5e8;
  border-left-color: #42b883;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.reply-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.doctor-badge {
  background: #42b883;
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
  font-size: 0.7rem;
  margin-left: 0.5rem;
}

.author-info {
  color: #666;
  font-size: 0.8rem;
}

.reply-time {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.official-badge {
  background: #42b883;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.reply-content {
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  white-space: pre-wrap;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.no-replies {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.quick-reply {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

/* 鍥炲琛ㄥ崟 */
.post-summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.post-summary h4 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.post-excerpt {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #2c3e50;
  font-weight: 500;
}

.form-group textarea {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

.form-group textarea:focus {
  outline: none;
  border-color: #42b883;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.reply-tips {
  background: #e3f2fd;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.reply-tips h5 {
  color: #2196f3;
  margin: 0 0 0.75rem 0;
}

.reply-tips ul {
  margin: 0;
  padding-left: 1.5rem;
}

.reply-tips li {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

.form-actions .cancel-btn:hover {
  background: #e0e0e0;
}

.form-actions .submit-btn {
  background: #42b883;
  color: white;
}

.form-actions .submit-btn:hover {
  background: #369870;
}

/* 鍝嶅簲寮忚璁?*/
@media (max-width: 768px) {
  .forum-management-container {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .statistics-bar {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .doctor-info {
    flex-direction: column;
    text-align: center;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group {
    min-width: auto;
  }

  .filter-group {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .post-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .post-meta {
    flex-wrap: wrap;
  }

  .author-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .post-actions {
    flex-direction: column;
  }

  .post-detail-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .author-section {
    flex-direction: column;
    text-align: center;
  }

  .reply-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>




