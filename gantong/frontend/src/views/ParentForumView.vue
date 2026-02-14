<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ForumService,
  type ForumPost as ApiForumPost,
  type ForumCategory,
  type ForumReply as ApiForumReply,
} from '@/services/forum'

interface ViewPost {
  id: number
  title: string
  content: string
  category: string | null
  authorName: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

interface ViewReply {
  id: number
  postId: number
  content: string
  authorName: string
  createdAt: string
  parentReplyId?: number | null
}

const forumPosts = ref<ViewPost[]>([])
const replies = ref<ViewReply[]>([])

const categories = ref<ForumCategory[]>([])
const filterCategory = ref<'全部' | '未分类' | string>('全部')
const searchKeyword = ref('')

const selectedPost = ref<ViewPost | null>(null)
const showPostDetail = ref(false)
const showCreateForm = ref(false)

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

type ApiError = {
  response?: {
    data?: {
      message?: string | string[]
    }
  }
  message?: string
}

function getErrorMessage(error: unknown, fallback: string) {
  const message = (error as ApiError)?.response?.data?.message ?? (error as ApiError)?.message
  if (Array.isArray(message)) return message.join('\n')
  return typeof message === 'string' && message.trim() ? message : fallback
}

const newPost = ref({
  title: '',
  content: '',
  category: '',
  tags: [] as string[],
})

const newReply = ref({
  content: '',
  parentReplyId: null as number | null,
})

const statistics = computed(() => {
  const postCount = forumPosts.value.length
  const replyCount = replies.value.length
  const activeUsers = new Set(forumPosts.value.map((p) => p.authorName)).size
  const todayPosts = forumPosts.value.filter(
    (p) => new Date(p.createdAt).toDateString() === new Date().toDateString(),
  ).length
  return { postCount, replyCount, activeUsers, todayPosts }
})

const categoryOptions = computed(() => {
  const opts = ['全部', ...categories.value.map((c) => c.name)]
  if (forumPosts.value.some((post) => !post.category)) {
    opts.push('未分类')
  }
  return opts
})

const filteredPosts = computed(() =>
  forumPosts.value.filter((post) => {
    const byCategory =
      filterCategory.value === '全部' ||
      (filterCategory.value === '未分类' ? !post.category : post.category === filterCategory.value)

    if (!byCategory) return false

    const keyword = searchKeyword.value.trim()
    if (!keyword) return true

    return (
      post.title.includes(keyword) ||
      post.content.includes(keyword) ||
      post.tags.some((tag) => tag.includes(keyword))
    )
  }),
)

function mapApiPost(post: ApiForumPost): ViewPost {
  const authorName =
    post.author?.name || post.author?.email || post.author?.phone || '家长用户'
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    category: post.category?.name ?? null,
    authorName,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    tags: post.tags || [],
  }
}

async function fetchCategories() {
  categories.value = await ForumService.getCategories()
}

async function fetchPosts() {
  loading.value = true
  try {
    const params: { page?: number; pageSize?: number; categoryId?: number; q?: string } = {
      page: page.value,
      pageSize: pageSize.value,
    }

    if (filterCategory.value !== '全部') {
      if (filterCategory.value === '未分类') {
        params.categoryId = -1
      } else {
        const cat = categories.value.find((c) => c.name === filterCategory.value)
        if (cat) params.categoryId = cat.id
      }
    }

    if (searchKeyword.value.trim()) {
      params.q = searchKeyword.value.trim()
    }

    const res = await ForumService.listPosts(params)
    forumPosts.value = res.items.map(mapApiPost)
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function loadReplies(postId: number) {
  const res = await ForumService.listReplies(postId, { page: 1, pageSize: 100 })
  replies.value = res.items.map((reply: ApiForumReply) => ({
    id: reply.id,
    postId,
    content: reply.content,
    authorName: reply.author?.name || reply.author?.email || reply.author?.phone || '家长用户',
    createdAt: reply.createdAt,
    parentReplyId: reply.parentReplyId ?? null,
  }))
}

async function createPost() {
  if (!validatePostForm()) {
    alert('请填写完整的帖子信息')
    return
  }

  try {
    const payload: { title: string; content: string; tags?: string[]; categoryId?: number } = {
      title: newPost.value.title.trim(),
      content: newPost.value.content.trim(),
    }

    if (newPost.value.tags.length) {
      payload.tags = [...newPost.value.tags]
    }

    if (newPost.value.category.trim()) {
      const matched = categories.value.find((c) => c.name === newPost.value.category)
      if (!matched) {
        alert('所选分类不存在，请刷新后重试')
        return
      }
      payload.categoryId = matched.id
    }

    const created = await ForumService.createPost(payload)
    const mapped = mapApiPost(created)
    forumPosts.value = [mapped, ...forumPosts.value]
    total.value += 1
    resetPostForm()
    showCreateForm.value = false
    alert('发帖成功！')
  } catch (error) {
    alert(getErrorMessage(error, '发帖失败，请稍后再试'))
  }
}

async function createReply() {
  if (!newReply.value.content.trim() || !selectedPost.value) {
    alert('请输入回复内容')
    return
  }

  try {
    await ForumService.createReply(selectedPost.value.id, {
      content: newReply.value.content.trim(),
      parentReplyId: newReply.value.parentReplyId || undefined,
    })
    await loadReplies(selectedPost.value.id)
    newReply.value.content = ''
    newReply.value.parentReplyId = null
  } catch (error) {
    alert(getErrorMessage(error, '回复失败，请稍后再试'))
  }
}

function viewPostDetail(post: ViewPost) {
  selectedPost.value = post
  showPostDetail.value = true
  loadReplies(post.id)
}

function closePostDetail() {
  showPostDetail.value = false
  selectedPost.value = null
  replies.value = []
  newReply.value.content = ''
  newReply.value.parentReplyId = null
}

function validatePostForm() {
  return newPost.value.title.trim() && newPost.value.content.trim()
}

function resetPostForm() {
  newPost.value = {
    title: '',
    content: '',
    category: '',
    tags: [],
  }
}

function addTag(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement | null
  if (!input) return
  const tag = input.value.trim()
  if (!tag) return
  if (newPost.value.tags.includes(tag)) return
  if (newPost.value.tags.length >= 5) {
    alert('最多可添加 5 个标签')
    return
  }
  newPost.value.tags.push(tag)
  input.value = ''
}

function removeTag(tag: string) {
  newPost.value.tags = newPost.value.tags.filter((t) => t !== tag)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return '刚刚'
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}

watch([filterCategory, searchKeyword], () => {
  page.value = 1
  fetchPosts()
})

onMounted(async () => {
  await fetchCategories()
  await fetchPosts()
})
</script>

<template>
  <div class="forum-container">
    <!-- Hero Header -->
    <section class="hero-header">
      <div class="hero-inner">
        <span class="hero-badge">家长社区</span>
        <h1>家长论坛</h1>
        <p>分享经验，互相支持，共同为孩子的成长加油</p>
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-circle c3"></div>
      </div>
    </section>

    <!-- Stats Strip -->
    <section class="stat-strip">
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.postCount }}</span>
        <span class="chip-label">帖子总数</span>
      </div>
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.replyCount }}</span>
        <span class="chip-label">回复总数</span>
      </div>
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.activeUsers }}</span>
        <span class="chip-label">活跃用户</span>
      </div>
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.todayPosts }}</span>
        <span class="chip-label">今日新帖</span>
      </div>
    </section>

    <!-- Action + Filters -->
    <div class="toolbar-row">
      <div class="search-card">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索帖子标题、内容或标签..."
          class="search-input"
        >
        <select v-model="filterCategory" class="filter-select">
          <option
            v-for="category in categoryOptions"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>
      <button class="create-btn" @click="showCreateForm = true">✏️ 发布新帖</button>
    </div>

    <!-- Post List -->
    <section class="posts-section">
      <div class="section-title">
        <h2>帖子列表</h2>
        <span class="section-line"></span>
      </div>

      <div v-if="loading" class="empty-state">正在加载帖子，请稍候...</div>
      <div v-else-if="filteredPosts.length === 0" class="empty-state">
        暂时没有帖子，试试发布第一篇吧？
      </div>

      <div v-else class="post-list">
        <article
          v-for="post in filteredPosts"
          :key="post.id"
          class="post-card"
          @click="viewPostDetail(post)"
        >
          <header class="post-header">
            <div class="author-info">
              <div class="author-avatar">{{ post.authorName.charAt(0) }}</div>
              <div class="author-details">
                <span class="author-name">{{ post.authorName }}</span>
                <span class="author-meta">{{ formatDateTime(post.createdAt) }}</span>
              </div>
            </div>
            <span class="category-tag">{{ post.category ?? '未分类' }}</span>
          </header>

          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-preview">{{ post.content }}</p>

          <div v-if="post.tags.length" class="post-tags">
            <span class="tag" v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
          </div>

          <div class="card-footer">
            <span class="enter-link">查看详情</span>
            <span class="enter-arrow">→</span>
          </div>
          <div class="card-bottom-bar"></div>
        </article>
      </div>
    </section>

    <!-- Create Post Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="modal-panel" @click.stop>
        <header class="modal-header">
          <h2>发布新帖子</h2>
          <button class="close-btn" @click="showCreateForm = false">×</button>
        </header>

        <form class="form-body" @submit.prevent="createPost">
          <div class="form-group">
            <label>帖子标题 *</label>
            <input v-model="newPost.title" type="text" required placeholder="请输入帖子标题">
          </div>

          <div class="form-group">
            <label>分类（可选）</label>
            <select v-model="newPost.category">
              <option value="">不选择分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>内容 *</label>
            <textarea
              v-model="newPost.content"
              rows="6"
              required
              placeholder="分享您的经历、困惑或建议..."
            />
          </div>

          <div class="form-group">
            <label>标签（可选，最多 5 个）</label>
            <div class="tags-input-wrap">
              <div class="selected-tags">
                <span class="tag-item" v-for="tag in newPost.tags" :key="tag">
                  #{{ tag }}
                  <button type="button" @click="removeTag(tag)">×</button>
                </span>
              </div>
              <input
                type="text"
                placeholder="输入标签后按回车"
                @keyup.enter.prevent="addTag($event)"
              >
            </div>
          </div>

          <footer class="form-actions">
            <button type="button" class="cancel-btn" @click="showCreateForm = false">取消</button>
            <button type="submit" class="submit-btn">发布帖子</button>
          </footer>
        </form>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <div
      v-if="showPostDetail && selectedPost"
      class="modal-overlay"
      @click="closePostDetail"
    >
      <div class="modal-panel large" @click.stop>
        <header class="modal-header">
          <h2>帖子详情</h2>
          <button class="close-btn" @click="closePostDetail">×</button>
        </header>

        <article class="post-detail" v-if="selectedPost">
          <header class="post-detail-header">
            <div class="author-info">
              <div class="author-avatar lg">{{ selectedPost.authorName.charAt(0) }}</div>
              <div class="author-details">
                <span class="author-name">{{ selectedPost.authorName }}</span>
                <span class="author-meta">{{ formatDateTime(selectedPost.createdAt) }}</span>
              </div>
            </div>
            <span class="category-tag">{{ selectedPost.category ?? '未分类' }}</span>
          </header>

          <h1 class="post-detail-title">{{ selectedPost.title }}</h1>
          <div class="post-detail-content">{{ selectedPost.content }}</div>

          <div v-if="selectedPost.tags.length" class="post-detail-tags">
            <span class="tag" v-for="tag in selectedPost.tags" :key="tag">#{{ tag }}</span>
          </div>
        </article>

        <section class="replies-section">
          <div class="section-title">
            <h2>回复（{{ replies.length }}）</h2>
            <span class="section-line"></span>
          </div>

          <div v-if="replies.length === 0" class="empty-state small">
            还没有回复，来发表第一个回复吧
          </div>

          <div v-else class="replies-list">
            <article class="reply-card" v-for="reply in replies" :key="reply.id">
              <div class="author-info">
                <div class="author-avatar sm">{{ reply.authorName.charAt(0) }}</div>
                <div class="author-details">
                  <span class="author-name">{{ reply.authorName }}</span>
                  <span class="author-meta">{{ formatDateTime(reply.createdAt) }}</span>
                </div>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </article>
          </div>

          <form class="reply-form" @submit.prevent="createReply">
            <div class="form-group">
              <label>发布回复</label>
              <textarea
                v-model="newReply.content"
                rows="4"
                placeholder="写下您的看法或经验..."
              />
            </div>
            <footer class="form-actions">
              <button type="submit" class="submit-btn">发布回复</button>
            </footer>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.forum-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

/* ── Hero Header ── */
.hero-header {
  margin-bottom: 1.75rem;
}

.hero-inner {
  position: relative;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  padding: 2.5rem 2.5rem 2.2rem;
  color: #fff;
  overflow: hidden;
}

.hero-badge {
  display: inline-block;
  background: rgba(245, 158, 66, 0.18);
  color: #fbbf24;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  margin-bottom: 0.85rem;
  letter-spacing: 0.5px;
}

.hero-inner h1 {
  font-size: 1.75rem;
  font-weight: 750;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.hero-inner p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.92rem;
  line-height: 1.5;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}

.c1 { width: 180px; height: 180px; background: #f59e42; top: -60px; right: -30px; }
.c2 { width: 120px; height: 120px; background: #fbbf24; bottom: -40px; right: 100px; }
.c3 { width: 80px; height: 80px; background: #fb923c; top: 10px; right: 180px; }

/* ── Stat Strip ── */
.stat-strip {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-chip {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 1.15rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 13px;
}

.chip-num {
  font-size: 1.35rem;
  font-weight: 750;
  color: #1e293b;
  line-height: 1;
}

.chip-label {
  font-size: 0.82rem;
  color: #64748b;
}

/* ── Toolbar ── */
.toolbar-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.75rem;
}

.search-card {
  flex: 1;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 0.65rem 1rem;
}

.search-input {
  flex: 1;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.92rem;
  background: #f8fafc;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #f59e42;
  background: #fff;
}

.filter-select {
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 0.92rem;
  cursor: pointer;
  min-width: 110px;
}

.filter-select:focus {
  outline: none;
  border-color: #f59e42;
}

.create-btn {
  background: linear-gradient(135deg, #f59e42 0%, #f97316 100%);
  color: #fff;
  border: none;
  padding: 0.7rem 1.35rem;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.create-btn:hover {
  box-shadow: 0 4px 14px rgba(245, 158, 66, 0.35);
  transform: translateY(-1px);
}

/* ── Section Title ── */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
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

/* ── Empty / Loading ── */
.empty-state {
  background: #f8fafc;
  border: 1.5px dashed #d7dee7;
  border-radius: 16px;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.95rem;
}

.empty-state.small {
  padding: 1.5rem;
}

/* ── Post List ── */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.4rem 1.4rem 1.15rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.post-card:hover {
  border-color: transparent;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.85rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.author-avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #f59e42 0%, #f97316 100%);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.author-avatar.lg {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  font-size: 1.15rem;
}

.author-avatar.sm {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  font-size: 0.82rem;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.author-name {
  font-weight: 650;
  color: #1e293b;
  font-size: 0.9rem;
}

.author-meta {
  color: #94a3b8;
  font-size: 0.78rem;
}

.category-tag {
  background: rgba(245, 158, 66, 0.1);
  color: #d97706;
  padding: 0.22rem 0.7rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  flex-shrink: 0;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.post-preview {
  color: #64748b;
  line-height: 1.65;
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.tag {
  background: #fff7ed;
  color: #c2410c;
  padding: 0.2rem 0.55rem;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.post-card:hover .card-footer {
  opacity: 1;
  transform: translateX(0);
}

.enter-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: #f59e42;
}

.enter-arrow {
  color: #f59e42;
  font-size: 0.82rem;
}

.card-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f59e42;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-card:hover .card-bottom-bar {
  opacity: 1;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-panel {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
}

.modal-panel.large {
  max-width: 780px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 1.3rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* ── Form ── */
.form-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.88rem;
}

.form-body input,
.form-body select,
.form-body textarea,
.reply-form input,
.reply-form textarea {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.form-body input:focus,
.form-body select:focus,
.form-body textarea:focus,
.reply-form textarea:focus {
  outline: none;
  border-color: #f59e42;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(245, 158, 66, 0.1);
}

.form-body textarea,
.reply-form textarea {
  resize: vertical;
  min-height: 100px;
}

.tags-input-wrap {
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  background: #f8fafc;
  transition: border-color 0.2s;
}

.tags-input-wrap:focus-within {
  border-color: #f59e42;
  background: #fff;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}

.tag-item {
  background: #fff7ed;
  color: #c2410c;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tag-item button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  font-size: 0.95rem;
  line-height: 1;
}

.tag-item button:hover {
  color: #dc2626;
}

.tags-input-wrap input {
  border: none;
  padding: 0.3rem 0;
  background: transparent;
  font-size: 0.9rem;
}

.tags-input-wrap input:focus {
  border: none;
  box-shadow: none;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.submit-btn {
  background: linear-gradient(135deg, #f59e42 0%, #f97316 100%);
  color: #fff;
}

.submit-btn:hover {
  box-shadow: 0 4px 14px rgba(245, 158, 66, 0.35);
}

/* ── Post Detail ── */
.post-detail {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.post-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.post-detail-title {
  font-size: 1.4rem;
  font-weight: 750;
  color: #1e293b;
  margin: 0 0 1rem;
  line-height: 1.4;
}

.post-detail-content {
  color: #475569;
  line-height: 1.75;
  white-space: pre-wrap;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
}

.post-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

/* ── Replies ── */
.replies-section {
  padding: 1.5rem;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.75rem;
}

.reply-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  border: 1px solid #eef0f4;
}

.reply-content {
  color: #475569;
  line-height: 1.65;
  margin-top: 0.65rem;
  font-size: 0.92rem;
}

.reply-form {
  padding-top: 0.5rem;
}

.reply-form .form-group {
  margin-bottom: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .forum-container {
    padding: 1rem 1rem 2rem;
  }

  .hero-inner {
    padding: 1.75rem 1.5rem;
  }

  .hero-inner h1 {
    font-size: 1.35rem;
  }

  .stat-strip {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65rem;
  }

  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-card {
    flex-direction: column;
  }

  .modal-panel {
    margin: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .post-detail-header {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
