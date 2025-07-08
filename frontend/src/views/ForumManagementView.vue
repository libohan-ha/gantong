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

// 共享论坛帖子数据（从家长端论坛获取）
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
    status: 'published',
    hasDoctoReply: true,
    urgencyLevel: 'low'
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
    status: 'published',
    hasDoctoReply: false,
    urgencyLevel: 'high'
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
    status: 'published',
    hasDoctoReply: false,
    urgencyLevel: 'medium'
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
    status: 'published',
    hasDoctoReply: true,
    urgencyLevel: 'low'
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
    status: 'published',
    hasDoctoReply: false,
    urgencyLevel: 'medium'
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
    status: 'published',
    hasDoctoReply: false,
    urgencyLevel: 'low'
  }
])

// 回复数据
const replies = ref<Reply[]>([
  {
    id: 1,
    postId: 1,
    content: '作为康复医师，我为您孩子的进步感到高兴。平衡能力的改善确实是感统训练的重要指标。建议您继续坚持训练，同时可以适当增加一些前庭觉训练项目，这有助于进一步提升孩子的空间感知能力。如果有任何疑问，欢迎随时咨询。',
    author: {
      name: '张慧敏医生',
      avatar: '/api/placeholder/40/40',
      title: '主任医师',
      hospital: '北京儿童医院',
      isDoctor: true
    },
    createdAt: '2024-07-08 15:30:00',
    likes: 12,
    isOfficial: true
  },
  {
    id: 2,
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
    id: 3,
    postId: 4,
    content: '这些家庭训练方法很实用！作为治疗师，我补充几点建议：\n1. 平衡木游戏可以逐渐增加难度，比如闭眼走或倒着走\n2. 触觉袋可以加入不同温度的物品\n3. 每个游戏时间控制在孩子注意力集中的范围内\n\n感谢家长们的用心分享，这对其他家庭很有帮助。',
    author: {
      name: '李建华医生',
      avatar: '/api/placeholder/40/40',
      title: '副主任医师',
      hospital: '上海市儿童医院',
      isDoctor: true
    },
    createdAt: '2024-07-07 19:20:00',
    likes: 18,
    isOfficial: true
  }
])

// 页面状态
const selectedPost = ref<ForumPost | null>(null)
const showPostDetail = ref(false)
const showReplyModal = ref(false)
const filterCategory = ref('全部')
const filterUrgency = ref('全部')
const filterStatus = ref('全部')
const searchKeyword = ref('')
const sortBy = ref('latest')

// 医生回复表单
const doctorReply = ref({
  content: '',
  isOfficial: true
})

// 当前医生信息
const currentDoctor = ref({
  name: '张慧敏',
  title: '主任医师',
  hospital: '北京儿童医院',
  department: '康复科',
  avatar: '/api/placeholder/80/80'
})

// 筛选选项
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

const urgencyOptions = [
  { value: '全部', label: '全部优先级' },
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' }
]

const statusOptions = [
  { value: '全部', label: '全部状态' },
  { value: 'replied', label: '已回复' },
  { value: 'unreplied', label: '待回复' }
]

const sortOptions = [
  { value: 'latest', label: '最新回复' },
  { value: 'created', label: '发布时间' },
  { value: 'urgency', label: '优先级' },
  { value: 'replies', label: '回复最多' }
]

// 过滤后的帖子列表
const filteredPosts = computed(() => {
  let posts = forumPosts.value.filter(post => {
    const categoryMatch = filterCategory.value === '全部' || post.category === filterCategory.value
    const urgencyMatch = filterUrgency.value === '全部' || post.urgencyLevel === filterUrgency.value
    const statusMatch = filterStatus.value === '全部' || 
      (filterStatus.value === 'replied' && post.hasDoctoReply) ||
      (filterStatus.value === 'unreplied' && !post.hasDoctoReply)
    const keywordMatch = searchKeyword.value === '' || 
      post.title.includes(searchKeyword.value) ||
      post.content.includes(searchKeyword.value) ||
      post.author.name.includes(searchKeyword.value)
    
    return categoryMatch && urgencyMatch && statusMatch && keywordMatch && post.status === 'published'
  })
  
  // 排序
  switch (sortBy.value) {
    case 'created':
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'urgency':
      const urgencyOrder = { high: 3, medium: 2, low: 1 }
      posts.sort((a, b) => urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel])
      break
    case 'replies':
      posts.sort((a, b) => b.replies - a.replies)
      break
    default: // latest
      posts.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
  }
  
  return posts
})

// 获取帖子回复
const getPostReplies = (postId: number) => {
  return replies.value.filter(reply => reply.postId === postId)
}

// 统计数据
const statistics = computed(() => {
  const totalPosts = forumPosts.value.length
  const unrepliedPosts = forumPosts.value.filter(p => !p.hasDoctoReply).length
  const highUrgencyPosts = forumPosts.value.filter(p => p.urgencyLevel === 'high').length
  const myReplies = replies.value.filter(r => r.author.isDoctor).length
  
  return { totalPosts, unrepliedPosts, highUrgencyPosts, myReplies }
})

// 获取优先级显示信息
const getUrgencyInfo = (urgency: string) => {
  switch (urgency) {
    case 'high':
      return { text: '高', color: '#f44336', bgColor: '#ffebee', icon: '🔥' }
    case 'medium':
      return { text: '中', color: '#ff9800', bgColor: '#fff3e0', icon: '⚡' }
    case 'low':
      return { text: '低', color: '#4caf50', bgColor: '#e8f5e8', icon: '📝' }
    default:
      return { text: urgency, color: '#666', bgColor: '#f0f0f0', icon: '📄' }
  }
}

// 查看帖子详情
const viewPostDetail = (post: ForumPost) => {
  selectedPost.value = post
  showPostDetail.value = true
  // 增加浏览量
  post.views++
}

// 回复帖子
const replyToPost = (post: ForumPost) => {
  selectedPost.value = post
  showReplyModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showPostDetail.value = false
  showReplyModal.value = false
  selectedPost.value = null
  doctorReply.value.content = ''
}

// 提交医生回复
const submitDoctorReply = () => {
  if (!doctorReply.value.content.trim()) {
    alert('请输入回复内容')
    return
  }
  
  if (!selectedPost.value) return
  
  const reply: Reply = {
    id: Date.now(),
    postId: selectedPost.value.id,
    content: doctorReply.value.content,
    author: {
      name: currentDoctor.value.name,
      avatar: currentDoctor.value.avatar,
      title: currentDoctor.value.title,
      hospital: currentDoctor.value.hospital,
      isDoctor: true
    },
    createdAt: new Date().toISOString(),
    likes: 0,
    isOfficial: doctorReply.value.isOfficial
  }
  
  replies.value.push(reply)
  selectedPost.value.replies++
  selectedPost.value.hasDoctoReply = true
  
  doctorReply.value.content = ''
  closeModal()
  alert('回复发布成功！')
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
const truncateContent = (content: string, maxLength = 120) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}
</script>

<template>
  <div class="forum-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>家长论坛管理</h1>
      <p class="header-desc">查看家长帖子，提供专业医疗建议和支持</p>
    </div>

    <!-- 医生信息卡片 -->
    <div class="doctor-card">
      <div class="doctor-info">
        <div class="doctor-avatar">{{ currentDoctor.name.charAt(0) }}</div>
        <div class="doctor-details">
          <h3>{{ currentDoctor.name }}</h3>
          <p>{{ currentDoctor.title }} | {{ currentDoctor.department }}</p>
          <p>{{ currentDoctor.hospital }}</p>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-bar">
      <div class="stat-item">
        <span class="stat-icon">📊</span>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.totalPosts }}</span>
          <span class="stat-label">总帖子数</span>
        </div>
      </div>
      <div class="stat-item urgent">
        <span class="stat-icon">🔥</span>
        <div class="stat-content">
          <span class="stat-value">{{ statistics.unrepliedPosts }}</span>
          <span class="stat-label">待回复</span>
        </div>
      </div>
      <div class="stat-item priority">
        <span class="stat-icon">⚡</span>
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

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-group">
          <input 
            v-model="searchKeyword"
            type="text" 
            placeholder="搜索帖子标题、内容或作者..."
            class="search-input"
          >
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

    <!-- 帖子列表 -->
    <div class="posts-list">
      <div 
        v-for="post in filteredPosts" 
        :key="post.id"
        class="post-card"
        :class="{ 
          sticky: post.isSticky,
          'high-priority': post.urgencyLevel === 'high',
          'unreplied': !post.hasDoctoReply
        }"
      >
        <div class="post-header">
          <div class="post-meta">
            <div class="urgency-badge">
              <span class="urgency-icon">{{ getUrgencyInfo(post.urgencyLevel).icon }}</span>
              <span 
                class="urgency-text"
                :style="{ 
                  color: getUrgencyInfo(post.urgencyLevel).color,
                  backgroundColor: getUrgencyInfo(post.urgencyLevel).bgColor
                }"
              >
                {{ getUrgencyInfo(post.urgencyLevel).text }}优先级
              </span>
            </div>
            
            <div class="category-tag">{{ post.category }}</div>
            
            <div v-if="!post.hasDoctoReply" class="reply-status unreplied">
              待回复
            </div>
            <div v-else class="reply-status replied">
              已回复
            </div>
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
          <span class="stat-item">👁️ {{ post.views }}</span>
          <span class="stat-item">👍 {{ post.likes }}</span>
          <span class="stat-item">💬 {{ post.replies }}</span>
        </div>
        
        <div class="post-actions">
          <button 
            class="action-btn view-btn"
            @click="viewPostDetail(post)"
          >
            查看详情
          </button>
          <button 
            class="action-btn reply-btn"
            @click="replyToPost(post)"
            :class="{ primary: !post.hasDoctoReply }"
          >
            {{ post.hasDoctoReply ? '继续回复' : '专业回复' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="filteredPosts.length === 0" class="no-posts">
      <p>暂时没有相关帖子</p>
    </div>

    <!-- 帖子详情弹窗 -->
    <div v-if="showPostDetail" class="modal-overlay" @click="closeModal">
      <div class="post-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>帖子详情</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div v-if="selectedPost" class="modal-content">
          <!-- 帖子内容 -->
          <div class="post-detail">
            <div class="post-detail-header">
              <div class="urgency-info">
                <span class="urgency-icon">{{ getUrgencyInfo(selectedPost.urgencyLevel).icon }}</span>
                <span 
                  class="urgency-label"
                  :style="{ 
                    color: getUrgencyInfo(selectedPost.urgencyLevel).color,
                    backgroundColor: getUrgencyInfo(selectedPost.urgencyLevel).bgColor
                  }"
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
            
            <div class="post-detail-content">
              {{ selectedPost.content }}
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
              <span class="stat-item">👁️ {{ selectedPost.views }}</span>
              <span class="stat-item">👍 {{ selectedPost.likes }}</span>
              <span class="stat-item">💬 {{ selectedPost.replies }}</span>
            </div>
          </div>
          
          <!-- 回复列表 -->
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
                  
                  <div v-if="reply.isOfficial" class="official-badge">
                    官方回复
                  </div>
                </div>
                
                <div class="reply-content">
                  {{ reply.content }}
                </div>
                
                <div class="reply-actions">
                  <span class="stat-item">👍 {{ reply.likes }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="getPostReplies(selectedPost.id).length === 0" class="no-replies">
              <p>还没有回复</p>
            </div>
            
            <div class="quick-reply">
              <button 
                class="reply-btn primary"
                @click="replyToPost(selectedPost)"
              >
                {{ selectedPost.hasDoctoReply ? '继续回复' : '专业回复' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 医生回复弹窗 -->
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
                <input 
                  type="checkbox" 
                  v-model="doctorReply.isOfficial"
                >
                <span>标记为官方回复</span>
              </label>
            </div>
            
            <div class="reply-tips">
              <h5>专业回复指导：</h5>
              <ul>
                <li>基于专业知识提供建议，避免诊断性表述</li>
                <li>语言温和友善，给予家长情感支持</li>
                <li>必要时建议家长就医或寻求专业评估</li>
                <li>尊重家长的选择和困难</li>
              </ul>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">
                取消
              </button>
              <button type="submit" class="submit-btn">
                发布回复
              </button>
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

/* 医生信息卡片 */
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

/* 统计信息 */
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
  flex-wrap: wrap;
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

/* 帖子详情样式 */
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

/* 回复区域 */
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

/* 回复表单 */
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

/* 响应式设计 */
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