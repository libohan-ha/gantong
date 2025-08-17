<script setup lang="ts">
import { ref, computed } from 'vue'

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
}

interface Reply {
  id: number
  postId: number
  content: string
  author: {
    name: string
    avatar: string
    childAge?: number
  }
  createdAt: string
  likes: number
  parentReplyId?: number | null // 用于嵌套回复
}

// 论坛帖子数据
const forumPosts = ref<ForumPost[]>([
  {
    id: 1,
    title: '我家5岁儿子的感统训练进步分享',
    content: '经过半年的感统训练，孩子的平衡能力和注意力都有了明显改善。从最初的单脚站立不到3秒，到现在可以稳定站立10秒以上。想和大家分享一下我们的训练经历和心得，希望能帮助到有同样困扰的家长朋友们。\n\n训练初期孩子很抗拒，经常哭闹不配合。我们采用了游戏化的方式，把训练包装成有趣的小游戏，逐渐建立了孩子的信心。现在他每天都主动要求做训练，看到孩子的进步，我们全家都很开心。',
    category: '训练分享',
    author: {
      name: '小明妈妈',
      avatar: '/api/placeholder/50/50',
      childAge: 5,
      location: '北京'
    },
    createdAt: '2024-07-08 09:30:00',
    likes: 28,
    replies: 15,
    views: 156,
    isSticky: true,
    tags: ['进步分享', '平衡训练', '注意力'],
    images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
    status: 'published'
  },
  {
    id: 2,
    title: '孩子触觉敏感，求经验分享',
    content: '我家女儿3岁半，对触觉特别敏感。不愿意穿毛衣，洗头时会大哭，剪指甲也很困难。去医院检查说是感统失调中的触觉敏感问题。\n\n想请教有经验的家长，你们是怎么帮助孩子克服触觉敏感的？有什么好的训练方法吗？现在每天的生活都很困难，希望能得到大家的建议和支持。',
    category: '求助咨询',
    author: {
      name: '小花爸爸',
      avatar: '/api/placeholder/50/50',
      childAge: 3,
      location: '上海'
    },
    createdAt: '2024-07-08 11:15:00',
    likes: 12,
    replies: 23,
    views: 89,
    tags: ['触觉敏感', '求助', '日常护理'],
    status: 'published'
  },
  {
    id: 3,
    title: '感统训练中心选择经验分享',
    content: '最近在为孩子选择感统训练中心，走访了好几家机构。想和大家分享一下我的考察心得，希望能帮助其他家长做出更好的选择。\n\n主要关注的几个方面：\n1. 师资力量：是否有专业康复治疗师\n2. 训练设备：器械是否齐全和安全\n3. 环境设施：场地是否宽敞明亮\n4. 训练方案：是否能制定个性化方案\n5. 费用合理：性价比是否合适\n\n最终选择了离家比较近的一家，虽然不是最便宜的，但是老师很专业，孩子也喜欢那里的环境。',
    category: '机构推荐',
    author: {
      name: '乐乐妈妈',
      avatar: '/api/placeholder/50/50',
      childAge: 4,
      location: '广州'
    },
    createdAt: '2024-07-07 16:45:00',
    likes: 19,
    replies: 8,
    views: 67,
    tags: ['机构选择', '经验分享'],
    status: 'published'
  },
  {
    id: 4,
    title: '家庭感统训练小游戏推荐',
    content: '分享几个在家就能做的感统训练小游戏，简单易行，孩子也很喜欢：\n\n1. 平衡木游戏：用胶带在地上贴一条直线，让孩子沿着线走\n2. 触觉袋游戏：准备不同材质的小物品，让孩子闭眼触摸猜测\n3. 抛接球游戏：训练手眼协调能力\n4. 滚筒游戏：用大毛巾包裹孩子轻轻滚动\n\n这些游戏不需要特殊器械，在家就能做，效果也不错。关键是要坚持，每天花15-20分钟就可以了。',
    category: '家庭训练',
    author: {
      name: '阳阳妈妈',
      avatar: '/api/placeholder/50/50',
      childAge: 6,
      location: '深圳'
    },
    createdAt: '2024-07-07 14:20:00',
    likes: 35,
    replies: 12,
    views: 134,
    tags: ['家庭训练', '小游戏', 'DIY'],
    status: 'published'
  },
  {
    id: 5,
    title: '孩子确诊感统失调后的心路历程',
    content: '当医生告诉我孩子有感统失调时，我的心情五味杂陈。担心、焦虑、自责各种情绪涌上心头。\n\n刚开始我无法接受这个事实，觉得是不是我照顾不周导致的。后来通过学习了解，才知道这不是任何人的错，而是需要科学的训练和干预。\n\n现在经过几个月的训练，孩子有了很大进步。我想告诉刚刚知道孩子有感统问题的家长们：不要害怕，不要自责，早发现早干预，孩子一定会越来越好的！',
    category: '心情分享',
    author: {
      name: '豆豆妈妈',
      avatar: '/api/placeholder/50/50',
      childAge: 4,
      location: '成都'
    },
    createdAt: '2024-07-06 20:30:00',
    likes: 24,
    replies: 18,
    views: 78,
    tags: ['心路历程', '鼓励', '新手家长'],
    status: 'published'
  },
  {
    id: 6,
    title: '感统训练费用和效果的性价比分析',
    content: '很多家长都关心感统训练的费用问题，我来分享一下我们家的情况。\n\n我们选择的机构每节课200元，一周3次课，一个月大概2400元。虽然不便宜，但看到孩子的进步，觉得这钱花得值得。\n\n建议大家在选择时不要只看价格，要综合考虑效果。便宜的不一定不好，贵的也不一定就是最好的。关键是要找到适合自己孩子的训练方式。',
    category: '费用讨论',
    author: {
      name: '星星爸爸',
      avatar: '/api/placeholder/50/50',
      childAge: 5,
      location: '杭州'
    },
    createdAt: '2024-07-06 15:10:00',
    likes: 16,
    replies: 25,
    views: 92,
    tags: ['费用', '性价比', '理性讨论'],
    status: 'published'
  }
])

// 回复数据
const replies = ref<Reply[]>([
  {
    id: 1,
    postId: 1,
    content: '太棒了！我家孩子也在做感统训练，看到你们的进步我更有信心了。请问你们训练了多长时间才看到明显效果的？',
    author: {
      name: '佳佳妈妈',
      avatar: '/api/placeholder/40/40',
      childAge: 4
    },
    createdAt: '2024-07-08 10:15:00',
    likes: 5
  },
  {
    id: 2,
    postId: 1,
    content: '我们训练了大概3个月才看到明显改善，前期确实需要很大的耐心。加油！',
    author: {
      name: '小明妈妈',
      avatar: '/api/placeholder/40/40',
      childAge: 5
    },
    createdAt: '2024-07-08 11:20:00',
    likes: 3
  },
  {
    id: 3,
    postId: 2,
    content: '我家孩子之前也有触觉敏感问题，我们用了脱敏训练的方法，从比较舒适的材质开始，逐渐过渡到粗糙的材质。需要很大的耐心，但是有效果的。',
    author: {
      name: '亮亮妈妈',
      avatar: '/api/placeholder/40/40',
      childAge: 6
    },
    createdAt: '2024-07-08 12:30:00',
    likes: 8
  }
])

// 页面状态
const selectedPost = ref<ForumPost | null>(null)
const showPostDetail = ref(false)
const showCreateForm = ref(false)
const filterCategory = ref('全部')
const searchKeyword = ref('')
const sortBy = ref('latest')

// 新帖表单
const newPost = ref({
  title: '',
  content: '',
  category: '',
  tags: [] as string[],
  images: [] as string[]
})

// 新回复表单
const newReply = ref({
  content: '',
  parentReplyId: null as number | null
})

// 分类选项
const categoryOptions = [
  '全部',
  '训练分享',
  '求助咨询',
  '机构推荐',
  '家庭训练',
  '心情分享',
  '费用讨论',
  '康复经验',
  '医院就诊'
]

// 排序选项
const sortOptions = [
  { value: 'latest', label: '最新回复' },
  { value: 'created', label: '发布时间' },
  { value: 'likes', label: '点赞最多' },
  { value: 'replies', label: '回复最多' }
]

// 过滤后的帖子列表
const filteredPosts = computed(() => {
  let posts = forumPosts.value.filter(post => {
    const categoryMatch = filterCategory.value === '全部' || post.category === filterCategory.value
    const keywordMatch = searchKeyword.value === '' || 
      post.title.includes(searchKeyword.value) ||
      post.content.includes(searchKeyword.value) ||
      post.tags.some(tag => tag.includes(searchKeyword.value))
    
    return categoryMatch && keywordMatch && post.status === 'published'
  })
  
  // 排序
  switch (sortBy.value) {
    case 'created':
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'likes':
      posts.sort((a, b) => b.likes - a.likes)
      break
    case 'replies':
      posts.sort((a, b) => b.replies - a.replies)
      break
    default: // latest
      posts.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
  }
  
  // 置顶帖子优先
  const stickyPosts = posts.filter(post => post.isSticky)
  const normalPosts = posts.filter(post => !post.isSticky)
  
  return [...stickyPosts, ...normalPosts]
})

// 获取帖子回复
const getPostReplies = (postId: number) => {
  return replies.value.filter(reply => reply.postId === postId)
}

// 统计数据
const statistics = computed(() => {
  const totalPosts = forumPosts.value.length
  const totalReplies = replies.value.length
  const activeUsers = new Set(forumPosts.value.map(p => p.author.name)).size
  const todayPosts = forumPosts.value.filter(p => 
    new Date(p.createdAt).toDateString() === new Date().toDateString()
  ).length
  
  return { totalPosts, totalReplies, activeUsers, todayPosts }
})

// 查看帖子详情
const viewPostDetail = (post: ForumPost) => {
  selectedPost.value = post
  showPostDetail.value = true
  // 增加浏览量
  post.views++
}

// 关闭帖子详情
const closePostDetail = () => {
  showPostDetail.value = false
  selectedPost.value = null
  newReply.value.content = ''
  newReply.value.parentReplyId = null
}

// 点赞帖子
const likePost = (postId: number) => {
  const post = forumPosts.value.find(p => p.id === postId)
  if (post) {
    post.likes++
  }
}

// 点赞回复
const likeReply = (replyId: number) => {
  const reply = replies.value.find(r => r.id === replyId)
  if (reply) {
    reply.likes++
  }
}

// 发布新帖
const createPost = () => {
  if (!validatePostForm()) {
    alert('请填写完整的帖子信息')
    return
  }
  
  const post: ForumPost = {
    id: Date.now(),
    ...newPost.value,
    author: {
      name: '当前用户',
      avatar: '/api/placeholder/50/50',
      childAge: 5,
      location: '北京'
    },
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: 0,
    views: 0,
    status: 'published'
  }
  
  forumPosts.value.unshift(post)
  resetPostForm()
  showCreateForm.value = false
  alert('发帖成功！')
}

// 发布回复
const createReply = () => {
  if (!newReply.value.content.trim()) {
    alert('请输入回复内容')
    return
  }
  
  if (!selectedPost.value) return
  
  const reply: Reply = {
    id: Date.now(),
    postId: selectedPost.value.id,
    content: newReply.value.content,
    author: {
      name: '当前用户',
      avatar: '/api/placeholder/40/40',
      childAge: 5
    },
    createdAt: new Date().toISOString(),
    likes: 0,
    parentReplyId: newReply.value.parentReplyId
  }
  
  replies.value.push(reply)
  selectedPost.value.replies++
  newReply.value.content = ''
  newReply.value.parentReplyId = null
}

// 验证发帖表单
const validatePostForm = () => {
  return newPost.value.title.trim() && 
         newPost.value.content.trim() && 
         newPost.value.category &&
         newPost.value.tags.length > 0
}

// 重置发帖表单
const resetPostForm = () => {
  newPost.value = {
    title: '',
    content: '',
    category: '',
    tags: [],
    images: []
  }
}

// 格式化时间
const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) {
    return '刚刚'
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 截取内容
const truncateContent = (content: string, maxLength = 150) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}
</script>

<template>
  <div class="forum-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>家长论坛</h1>
      <p class="header-desc">分享经验，互相支持，共同为孩子的成长加油</p>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-bar">
      <div class="stat-item">
        <span class="stat-label">帖子总数</span>
        <span class="stat-value">{{ statistics.totalPosts }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">回复总数</span>
        <span class="stat-value">{{ statistics.totalReplies }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">活跃用户</span>
        <span class="stat-value">{{ statistics.activeUsers }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">今日新帖</span>
        <span class="stat-value">{{ statistics.todayPosts }}</span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="create-btn" @click="showCreateForm = true">
        ✏️ 发布新帖
      </button>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-group">
          <input 
            v-model="searchKeyword"
            type="text" 
            placeholder="搜索帖子标题、内容或标签..."
            class="search-input"
          >
        </div>
        
        <div class="filter-group">
          <select v-model="filterCategory" class="filter-select">
            <option v-for="category in categoryOptions" :key="category" :value="category">
              {{ category }}
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

    <!-- 帖子列表 -->
    <div class="posts-list">
      <div 
        v-for="post in filteredPosts" 
        :key="post.id"
        class="post-card"
        :class="{ sticky: post.isSticky }"
        @click="viewPostDetail(post)"
      >
        <div class="post-header">
          <div class="author-info">
            <div class="author-avatar">{{ post.author.name.charAt(0) }}</div>
            <div class="author-details">
              <div class="author-name">{{ post.author.name }}</div>
              <div class="author-meta">
                <span v-if="post.author.childAge">孩子{{ post.author.childAge }}岁</span>
                <span v-if="post.author.location">{{ post.author.location }}</span>
                <span>{{ formatDateTime(post.createdAt) }}</span>
              </div>
            </div>
          </div>
          
          <div class="post-category">
            <span class="category-tag">{{ post.category }}</span>
            <span v-if="post.isSticky" class="sticky-badge">置顶</span>
          </div>
        </div>
        
        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-preview">{{ truncateContent(post.content) }}</p>
          
          <div v-if="post.images && post.images.length > 0" class="post-images">
            <div 
              v-for="(image, index) in post.images.slice(0, 3)" 
              :key="index"
              class="image-thumbnail"
            >
              <div class="image-placeholder">📷</div>
            </div>
            <div v-if="post.images.length > 3" class="more-images">
              +{{ post.images.length - 3 }}
            </div>
          </div>
          
          <div class="post-tags">
            <span 
              v-for="tag in post.tags" 
              :key="tag"
              class="post-tag"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
        
        <div class="post-stats">
          <button 
            class="stat-btn like-btn"
            @click.stop="likePost(post.id)"
          >
            👍 {{ post.likes }}
          </button>
          <span class="stat-item">💬 {{ post.replies }}</span>
          <span class="stat-item">👁️ {{ post.views }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="filteredPosts.length === 0" class="no-posts">
      <p>暂时没有相关帖子</p>
      <button class="create-btn" @click="showCreateForm = true">
        发布第一个帖子
      </button>
    </div>

    <!-- 发帖弹窗 -->
    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="create-form-modal" @click.stop>
        <div class="modal-header">
          <h2>发布新帖</h2>
          <button class="close-btn" @click="showCreateForm = false">×</button>
        </div>
        
        <form @submit.prevent="createPost" class="create-form">
          <div class="form-group">
            <label>帖子标题 *</label>
            <input v-model="newPost.title" type="text" placeholder="请输入帖子标题" required>
          </div>
          
          <div class="form-group">
            <label>分类 *</label>
            <select v-model="newPost.category" required>
              <option value="">请选择分类</option>
              <option v-for="category in categoryOptions.slice(1)" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>内容 *</label>
            <textarea 
              v-model="newPost.content" 
              rows="8" 
              placeholder="分享您的经历、困惑或建议..."
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>标签</label>
            <div class="tags-input">
              <div class="selected-tags">
                <span 
                  v-for="tag in newPost.tags" 
                  :key="tag"
                  class="tag-item"
                >
                  #{{ tag }}
                  <button type="button" @click="newPost.tags = newPost.tags.filter(t => t !== tag)">
                    ×
                  </button>
                </span>
              </div>
              <input 
                type="text" 
                placeholder="输入标签后按回车（至少添加一个标签）"
                @keydown.enter.prevent="(e) => {
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (value && !newPost.tags.includes(value) && newPost.tags.length < 5) {
                    newPost.tags.push(value);
                    (e.target as HTMLInputElement).value = ''
                  }
                }"
              >
            </div>
            <p class="form-hint">最多可添加5个标签，帮助其他家长找到您的帖子</p>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showCreateForm = false">
              取消
            </button>
            <button type="submit" class="submit-btn">
              发布帖子
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 帖子详情弹窗 -->
    <div v-if="showPostDetail" class="modal-overlay" @click="closePostDetail">
      <div class="post-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>帖子详情</h2>
          <button class="close-btn" @click="closePostDetail">×</button>
        </div>
        
        <div v-if="selectedPost" class="modal-content">
          <!-- 帖子内容 -->
          <div class="post-detail">
            <div class="post-detail-header">
              <div class="author-info">
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
              
              <div class="post-category">
                <span class="category-tag">{{ selectedPost.category }}</span>
              </div>
            </div>
            
            <h1 class="post-detail-title">{{ selectedPost.title }}</h1>
            
            <div class="post-detail-content">
              {{ selectedPost.content }}
            </div>
            
            <div v-if="selectedPost.images && selectedPost.images.length > 0" class="post-detail-images">
              <div 
                v-for="(image, index) in selectedPost.images" 
                :key="index"
                class="detail-image"
              >
                <div class="image-placeholder large">📷</div>
              </div>
            </div>
            
            <div class="post-detail-tags">
              <span 
                v-for="tag in selectedPost.tags" 
                :key="tag"
                class="post-tag"
              >
                #{{ tag }}
              </span>
            </div>
            
            <div class="post-detail-stats">
              <button 
                class="stat-btn like-btn"
                @click="likePost(selectedPost.id)"
              >
                👍 {{ selectedPost.likes }}
              </button>
              <span class="stat-item">💬 {{ selectedPost.replies }}</span>
              <span class="stat-item">👁️ {{ selectedPost.views }}</span>
            </div>
          </div>
          
          <!-- 回复列表 -->
          <div class="replies-section">
            <h3>回复 ({{ getPostReplies(selectedPost.id).length }})</h3>
            
            <div class="reply-form">
              <textarea 
                v-model="newReply.content"
                placeholder="写下您的回复..."
                rows="3"
              ></textarea>
              <button 
                class="reply-btn"
                @click="createReply"
                :disabled="!newReply.content.trim()"
              >
                发布回复
              </button>
            </div>
            
            <div class="replies-list">
              <div 
                v-for="reply in getPostReplies(selectedPost.id)" 
                :key="reply.id"
                class="reply-item"
              >
                <div class="reply-author">
                  <div class="author-avatar small">{{ reply.author.name.charAt(0) }}</div>
                  <div class="author-details">
                    <div class="author-name">{{ reply.author.name }}</div>
                    <div class="reply-time">{{ formatDateTime(reply.createdAt) }}</div>
                  </div>
                </div>
                
                <div class="reply-content">
                  {{ reply.content }}
                </div>
                
                <div class="reply-actions">
                  <button 
                    class="stat-btn like-btn small"
                    @click="likeReply(reply.id)"
                  >
                    👍 {{ reply.likes }}
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="getPostReplies(selectedPost.id).length === 0" class="no-replies">
              <p>还没有回复，来发表第一个回复吧！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-container {
  max-width: 1200px;
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

/* 统计信息 */
.statistics-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: bold;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.create-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.create-btn:hover {
  background: #369870;
}

/* 筛选区域 */
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
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

/* 帖子列表 */
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.post-card.sticky {
  border-left: 4px solid #ffc107;
  background: linear-gradient(135deg, #fff9c4 0%, #ffffff 100%);
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
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

.author-avatar.large {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.author-avatar.small {
  width: 35px;
  height: 35px;
  font-size: 1rem;
}

.author-details {
  flex: 1;
}

.author-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.author-meta {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  gap: 1rem;
}

.post-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-tag {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.sticky-badge {
  background: #ffc107;
  color: #212529;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.post-content {
  margin-bottom: 1rem;
}

.post-title {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.3rem;
  line-height: 1.4;
}

.post-preview {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.post-images {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.image-thumbnail {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.more-images {
  width: 60px;
  height: 60px;
  background: #e0e0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.8rem;
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
}

.stat-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.stat-btn:hover {
  background: #f0f0f0;
  color: #2c3e50;
}

.stat-btn.small {
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
}

.stat-item {
  color: #666;
  font-size: 0.9rem;
}

.no-posts {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.no-posts p {
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

.create-form-modal,
.post-detail-modal {
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

/* 发帖表单 */
.create-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
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
  min-height: 120px;
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

.form-hint {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
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

/* 帖子详情 */
.post-detail {
  margin-bottom: 2rem;
}

.post-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.post-time {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.post-detail-title {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  line-height: 1.4;
}

.post-detail-content {
  color: #2c3e50;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  white-space: pre-wrap;
}

.post-detail-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-image {
  aspect-ratio: 16/9;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.image-placeholder.large {
  font-size: 3rem;
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

/* 回复区域 */
.replies-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.reply-form {
  margin-bottom: 2rem;
}

.reply-form textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  margin-bottom: 1rem;
}

.reply-form textarea:focus {
  outline: none;
  border-color: #42b883;
}

.reply-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.reply-btn:hover:not(:disabled) {
  background: #369870;
}

.reply-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.reply-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.reply-time {
  color: #666;
  font-size: 0.8rem;
}

.reply-content {
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 0.75rem;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .forum-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .statistics-bar {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .stat-item {
    flex: 1;
    min-width: 120px;
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
  }
  
  .post-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .post-category {
    align-self: flex-start;
  }
  
  .author-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .post-images {
    flex-wrap: wrap;
  }
  
  .post-stats {
    flex-wrap: wrap;
  }
  
  .post-detail-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .post-detail-images {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>