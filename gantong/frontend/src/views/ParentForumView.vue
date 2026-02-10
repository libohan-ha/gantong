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
    <header class="page-header">
      <h1>家长论坛</h1>
      <p class="header-desc">分享经验，互相支持，共同为孩子的成长加油</p>
    </header>

    <section class="statistics-bar">
      <article class="stat-card">
        <span class="stat-label">帖子总数</span>
        <span class="stat-value">{{ statistics.postCount }}</span>
      </article>
      <article class="stat-card">
        <span class="stat-label">回复总数</span>
        <span class="stat-value">{{ statistics.replyCount }}</span>
      </article>
      <article class="stat-card">
        <span class="stat-label">活跃用户</span>
        <span class="stat-value">{{ statistics.activeUsers }}</span>
      </article>
      <article class="stat-card">
        <span class="stat-label">今日新帖</span>
        <span class="stat-value">{{ statistics.todayPosts }}</span>
      </article>
    </section>

    <div class="action-bar">
      <button class="primary-btn" @click="showCreateForm = true">✏️ 发布新帖</button>
    </div>

    <section class="filters-bar">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索帖子标题、内容或标签..."
      >
      <select v-model="filterCategory">
        <option
          v-for="category in categoryOptions"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </section>

    <section class="posts-section">
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
                <div class="author-name">{{ post.authorName }}</div>
                <div class="author-meta">{{ formatDateTime(post.createdAt) }}</div>
              </div>
            </div>
            <span class="category-tag">{{ post.category ?? '未分类' }}</span>
          </header>
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-preview">{{ post.content }}</p>
          <div v-if="post.tags.length" class="post-tags">
            <span class="tag" v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
          </div>
        </article>
      </div>
    </section>

    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="modal" @click.stop>
        <header class="modal-header">
          <h2>发布新帖子</h2>
          <button class="close-btn" @click="showCreateForm = false">×</button>
        </header>

        <form class="form" @submit.prevent="createPost">
          <label>
            帖子标题 *
            <input v-model="newPost.title" type="text" required placeholder="请输入帖子标题">
          </label>

          <label>
            分类（可选）
            <select v-model="newPost.category">
              <option value="">不选择分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </label>

          <label>
            内容 *
            <textarea
              v-model="newPost.content"
              rows="6"
              required
              placeholder="分享您的经历、困惑或建议..."
            />
          </label>

          <label>
            标签（可选，最多 5 个）
            <div class="tags-input">
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
          </label>

          <footer class="form-actions">
            <button type="button" class="secondary-btn" @click="showCreateForm = false">取消</button>
            <button type="submit" class="primary-btn">发布帖子</button>
          </footer>
        </form>
      </div>
    </div>

    <div
      v-if="showPostDetail && selectedPost"
      class="modal-overlay"
      @click="closePostDetail"
    >
      <div class="modal large" @click.stop>
        <header class="modal-header">
          <h2>帖子详情</h2>
          <button class="close-btn" @click="closePostDetail">×</button>
        </header>

        <article class="post-detail" v-if="selectedPost">
          <header class="post-detail-header">
            <div class="author-info">
              <div class="author-avatar large">{{ selectedPost.authorName.charAt(0) }}</div>
              <div class="author-details">
                <div class="author-name">{{ selectedPost.authorName }}</div>
                <div class="author-meta">{{ formatDateTime(selectedPost.createdAt) }}</div>
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
          <header class="section-header">
            <h3>回复（{{ replies.length }}）</h3>
          </header>

          <div v-if="replies.length === 0" class="empty-state">
            还没有回复，来发表第一个回复吧
          </div>

          <div v-else class="replies-list">
            <article class="reply-card" v-for="reply in replies" :key="reply.id">
              <div class="author-info">
                <div class="author-avatar small">{{ reply.authorName.charAt(0) }}</div>
                <div class="author-details">
                  <div class="author-name">{{ reply.authorName }}</div>
                  <div class="author-meta">{{ formatDateTime(reply.createdAt) }}</div>
                </div>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </article>
          </div>

          <form class="form" @submit.prevent="createReply">
            <label>
              发布回复
              <textarea
                v-model="newReply.content"
                rows="4"
                placeholder="写下您的看法或经验..."
              />
            </label>
            <footer class="form-actions right">
              <button type="submit" class="primary-btn">发布回复</button>
            </footer>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  color: #1f2937;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'Helvetica Neue', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.header-desc {
  color: #6b7280;
  font-size: 1rem;
}

.statistics-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.stat-label {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.primary-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-btn:hover {
  background: #2563eb;
}

.secondary-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.secondary-btn:hover {
  background: #4b5563;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.filters-bar input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.filters-bar select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  min-width: 120px;
}

.posts-section {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.author-avatar.large {
  width: 50px;
  height: 50px;
  font-size: 1.25rem;
}

.author-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.author-meta {
  color: #6b7280;
  font-size: 0.875rem;
}

.category-tag {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.post-preview {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

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

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.form {
  padding: 1.5rem;
}

.form label {
  display: block;
  margin-bottom: 1.5rem;
  font-weight: 500;
  color: #374151;
}

.form input,
.form select,
.form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.form input:focus,
.form select:focus,
.form textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form textarea {
  resize: vertical;
  min-height: 120px;
}

.tags-input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.5rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag-item {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-item button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
}

.tag-item button:hover {
  color: #374151;
}

.tags-input input {
  border: none;
  padding: 0.25rem 0;
  margin-top: 0;
}

.tags-input input:focus {
  border: none;
  box-shadow: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-actions.right {
  justify-content: flex-end;
}

.post-detail {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.post-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.post-detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.post-detail-content {
  color: #374151;
  line-height: 1.7;
  white-space: pre-wrap;
  margin-bottom: 1.5rem;
}

.post-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.replies-section {
  padding: 1.5rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.reply-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.reply-content {
  color: #374151;
  line-height: 1.6;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .forum-container {
    padding: 1rem 1rem 2rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .statistics-bar {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .modal {
    margin: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .post-detail-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
