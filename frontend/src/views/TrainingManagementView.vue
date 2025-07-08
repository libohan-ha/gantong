<script setup lang="ts">
import { ref, computed } from 'vue'

interface TrainingCourse {
  id: number
  title: string
  description: string
  instructor: {
    name: string
    title: string
    hospital: string
    avatar: string
    expertise: string[]
  }
  type: 'online' | 'offline' | 'hybrid'
  category: string
  targetAudience: string[]
  duration: number // 小时
  maxParticipants: number
  currentParticipants: number
  fee: number
  startDate: string
  endDate: string
  schedule: {
    date: string
    time: string
    topic: string
    duration: number
  }[]
  location?: string
  meetingLink?: string
  materials: string[]
  requirements: string[]
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: string
  tags: string[]
}

interface Participant {
  id: number
  name: string
  title: string
  hospital: string
  hospitalLevel: string
  phone: string
  email: string
  experience: number
  registrationDate: string
  status: 'registered' | 'confirmed' | 'attended' | 'absent' | 'cancelled'
}

// 模拟培训课程数据
const trainingCourses = ref<TrainingCourse[]>([
  {
    id: 1,
    title: '儿童感统失调诊断与评估实务',
    description: '深入讲解儿童感统失调的临床诊断标准、评估工具使用、案例分析等内容，适合基层医院儿科医生和康复治疗师参加。',
    instructor: {
      name: '张慧敏',
      title: '主任医师、教授',
      hospital: '北京儿童医院',
      avatar: '/api/placeholder/80/80',
      expertise: ['感统失调', '儿童发育', '康复评估']
    },
    type: 'online',
    category: '诊断评估',
    targetAudience: ['儿科医生', '康复治疗师', '心理治疗师'],
    duration: 16,
    maxParticipants: 100,
    currentParticipants: 78,
    fee: 0,
    startDate: '2024-07-20',
    endDate: '2024-07-22',
    schedule: [
      { date: '2024-07-20', time: '09:00-12:00', topic: '感统失调理论基础', duration: 3 },
      { date: '2024-07-20', time: '14:00-17:00', topic: '评估工具与方法', duration: 3 },
      { date: '2024-07-21', time: '09:00-12:00', topic: '典型案例分析', duration: 3 },
      { date: '2024-07-21', time: '14:00-17:00', topic: '诊断报告撰写', duration: 3 },
      { date: '2024-07-22', time: '09:00-13:00', topic: '实操演练与答疑', duration: 4 }
    ],
    meetingLink: 'https://meeting.tencent.com/s/xxxxx',
    materials: ['评估量表模板', '案例分析资料', '诊断指南PDF'],
    requirements: ['具备儿科或康复科临床经验', '熟悉基本计算机操作'],
    status: 'published',
    createdAt: '2024-07-01',
    tags: ['免费', '热门', '基础']
  },
  {
    id: 2,
    title: '感统训练技术与方法实训班',
    description: '通过实际操作学习各种感统训练技术，包括前庭训练、本体觉训练、触觉训练等具体方法和注意事项。',
    instructor: {
      name: '李建华',
      title: '副主任医师',
      hospital: '上海市儿童医院',
      avatar: '/api/placeholder/80/80',
      expertise: ['感统训练', '运动康复', '器械使用']
    },
    type: 'offline',
    category: '训练技术',
    targetAudience: ['康复治疗师', '特教老师', '感统训练师'],
    duration: 24,
    maxParticipants: 30,
    currentParticipants: 25,
    fee: 1200,
    startDate: '2024-08-10',
    endDate: '2024-08-12',
    schedule: [
      { date: '2024-08-10', time: '09:00-12:00', topic: '感统训练器械介绍', duration: 3 },
      { date: '2024-08-10', time: '14:00-18:00', topic: '前庭觉训练实操', duration: 4 },
      { date: '2024-08-11', time: '09:00-12:00', topic: '本体觉训练实操', duration: 3 },
      { date: '2024-08-11', time: '14:00-18:00', topic: '触觉训练实操', duration: 4 },
      { date: '2024-08-12', time: '09:00-12:00', topic: '综合训练方案设计', duration: 3 },
      { date: '2024-08-12', time: '14:00-17:00', topic: '考核与认证', duration: 3 },
      { date: '2024-08-12', time: '17:00-19:00', topic: '交流与总结', duration: 2 }
    ],
    location: '上海市儿童医院康复科训练室',
    materials: ['训练器械使用手册', '训练方案模板', '安全操作指南'],
    requirements: ['具备康复治疗相关背景', '身体健康，能参与体感训练'],
    status: 'published',
    createdAt: '2024-06-15',
    tags: ['实操', '认证', '小班']
  },
  {
    id: 3,
    title: '家庭感统训练指导与咨询',
    description: '教授医务人员如何指导家长进行家庭感统训练，提升家庭康复效果，减轻医院治疗压力。',
    instructor: {
      name: '王芳',
      title: '主治医师',
      hospital: '广州市妇女儿童医疗中心',
      avatar: '/api/placeholder/80/80',
      expertise: ['家庭康复', '家长指导', '康复咨询']
    },
    type: 'hybrid',
    category: '家庭指导',
    targetAudience: ['儿科医生', '康复医师', '护理人员'],
    duration: 12,
    maxParticipants: 50,
    currentParticipants: 35,
    fee: 800,
    startDate: '2024-07-25',
    endDate: '2024-07-27',
    schedule: [
      { date: '2024-07-25', time: '19:00-22:00', topic: '家庭训练理论基础（线上）', duration: 3 },
      { date: '2024-07-26', time: '09:00-12:00', topic: '家庭训练方法演示（线下）', duration: 3 },
      { date: '2024-07-26', time: '14:00-17:00', topic: '家长沟通技巧（线下）', duration: 3 },
      { date: '2024-07-27', time: '19:00-22:00', topic: '案例督导与答疑（线上）', duration: 3 }
    ],
    location: '广州市妇女儿童医疗中心',
    meetingLink: 'https://zoom.us/j/xxxxx',
    materials: ['家庭训练手册', '沟通话术模板', '评估追踪表格'],
    requirements: ['有儿童康复相关经验', '具备网络视频会议条件'],
    status: 'ongoing',
    createdAt: '2024-06-20',
    tags: ['混合模式', '实用']
  },
  {
    id: 4,
    title: '感统失调研究前沿与循证实践',
    description: '介绍国内外感统失调领域最新研究成果，循证医学在感统康复中的应用，提升临床实践水平。',
    instructor: {
      name: '陈明',
      title: '主任医师、博导',
      hospital: '成都市儿童医院',
      avatar: '/api/placeholder/80/80',
      expertise: ['循证医学', '科研方法', '学术前沿']
    },
    type: 'online',
    category: '学术研究',
    targetAudience: ['高年资医师', '科研人员', '研究生'],
    duration: 8,
    maxParticipants: 200,
    currentParticipants: 145,
    fee: 600,
    startDate: '2024-08-15',
    endDate: '2024-08-16',
    schedule: [
      { date: '2024-08-15', time: '19:00-23:00', topic: '国际研究前沿动态', duration: 4 },
      { date: '2024-08-16', time: '19:00-23:00', topic: '循证实践与临床应用', duration: 4 }
    ],
    meetingLink: 'https://meeting.tencent.com/s/yyyyy',
    materials: ['最新文献汇编', '循证医学指南', '研究方法手册'],
    requirements: ['具备医学研究基础', '英文文献阅读能力'],
    status: 'published',
    createdAt: '2024-07-05',
    tags: ['高级', '学术', '前沿']
  },
  {
    id: 5,
    title: '基层医院感统科室建设指南',
    description: '帮助基层医院建立感统康复科室，包括人员配置、设备采购、流程建立等全方位指导。',
    instructor: {
      name: '刘秀英',
      title: '副主任医师',
      hospital: '西安市儿童医院',
      avatar: '/api/placeholder/80/80',
      expertise: ['科室管理', '设备配置', '流程优化']
    },
    type: 'offline',
    category: '科室建设',
    targetAudience: ['科室主任', '医院管理者', '康复科负责人'],
    duration: 6,
    maxParticipants: 20,
    currentParticipants: 18,
    fee: 2000,
    startDate: '2024-09-05',
    endDate: '2024-09-05',
    schedule: [
      { date: '2024-09-05', time: '09:00-12:00', topic: '科室规划与设计', duration: 3 },
      { date: '2024-09-05', time: '14:00-17:00', topic: '设备选型与管理', duration: 3 }
    ],
    location: '西安市儿童医院行政会议室',
    materials: ['科室建设标准', '设备清单模板', '管理制度范本'],
    requirements: ['具备科室管理权限', '有建设康复科室计划'],
    status: 'draft',
    createdAt: '2024-07-10',
    tags: ['管理', '建设', '高端']
  }
])

// 模拟参与者数据
const participants = ref<{ [courseId: number]: Participant[] }>({
  1: [
    {
      id: 1,
      name: '张医生',
      title: '主治医师',
      hospital: '某县人民医院',
      hospitalLevel: '二级',
      phone: '138****1234',
      email: 'zhang@hospital.com',
      experience: 5,
      registrationDate: '2024-07-02',
      status: 'confirmed'
    },
    {
      id: 2,
      name: '李治疗师',
      title: '康复治疗师',
      hospital: '某市中心医院',
      hospitalLevel: '三级',
      phone: '139****5678',
      email: 'li@hospital.com',
      experience: 3,
      registrationDate: '2024-07-03',
      status: 'registered'
    }
  ]
})

// 页面状态
const activeTab = ref('courses')
const selectedCourse = ref<TrainingCourse | null>(null)
const showCourseDetail = ref(false)
const showCreateForm = ref(false)
const showParticipants = ref(false)

// 筛选状态
const filterType = ref('all')
const filterStatus = ref('all')
const filterCategory = ref('all')
const searchKeyword = ref('')

// 新建课程表单
const newCourse = ref({
  title: '',
  description: '',
  type: 'online' as 'online' | 'offline' | 'hybrid',
  category: '',
  targetAudience: [] as string[],
  duration: 0,
  maxParticipants: 0,
  fee: 0,
  startDate: '',
  endDate: '',
  location: '',
  meetingLink: '',
  materials: [] as string[],
  requirements: [] as string[]
})

// 培训类型选项
const typeOptions = [
  { value: 'all', label: '全部类型' },
  { value: 'online', label: '线上培训' },
  { value: 'offline', label: '线下培训' },
  { value: 'hybrid', label: '混合培训' }
]

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

// 分类选项
const categoryOptions = [
  { value: 'all', label: '全部分类' },
  { value: '诊断评估', label: '诊断评估' },
  { value: '训练技术', label: '训练技术' },
  { value: '家庭指导', label: '家庭指导' },
  { value: '学术研究', label: '学术研究' },
  { value: '科室建设', label: '科室建设' }
]

// 过滤后的课程列表
const filteredCourses = computed(() => {
  return trainingCourses.value.filter(course => {
    const typeMatch = filterType.value === 'all' || course.type === filterType.value
    const statusMatch = filterStatus.value === 'all' || course.status === filterStatus.value
    const categoryMatch = filterCategory.value === 'all' || course.category === filterCategory.value
    const keywordMatch = searchKeyword.value === '' || 
      course.title.includes(searchKeyword.value) ||
      course.instructor.name.includes(searchKeyword.value) ||
      course.description.includes(searchKeyword.value)
    
    return typeMatch && statusMatch && categoryMatch && keywordMatch
  })
})

// 统计数据
const statistics = computed(() => {
  const total = trainingCourses.value.length
  const published = trainingCourses.value.filter(c => c.status === 'published').length
  const ongoing = trainingCourses.value.filter(c => c.status === 'ongoing').length
  const totalParticipants = trainingCourses.value.reduce((sum, c) => sum + c.currentParticipants, 0)
  
  return { total, published, ongoing, totalParticipants }
})

// 获取类型显示信息
const getTypeInfo = (type: string) => {
  switch (type) {
    case 'online':
      return { text: '线上', color: '#2196f3', icon: '💻' }
    case 'offline':
      return { text: '线下', color: '#4caf50', icon: '🏥' }
    case 'hybrid':
      return { text: '混合', color: '#ff9800', icon: '🔄' }
    default:
      return { text: type, color: '#666', icon: '📚' }
  }
}

// 获取状态显示信息
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'draft':
      return { text: '草稿', color: '#9e9e9e', bgColor: '#f5f5f5' }
    case 'published':
      return { text: '已发布', color: '#4caf50', bgColor: '#e8f5e8' }
    case 'ongoing':
      return { text: '进行中', color: '#2196f3', bgColor: '#e3f2fd' }
    case 'completed':
      return { text: '已完成', color: '#ff9800', bgColor: '#fff3e0' }
    case 'cancelled':
      return { text: '已取消', color: '#f44336', bgColor: '#ffebee' }
    default:
      return { text: status, color: '#666', bgColor: '#f0f0f0' }
  }
}

// 查看课程详情
const viewCourseDetail = (course: TrainingCourse) => {
  selectedCourse.value = course
  showCourseDetail.value = true
}

// 查看参与者
const viewParticipants = (course: TrainingCourse) => {
  selectedCourse.value = course
  showParticipants.value = true
}

// 关闭弹窗
const closeModal = () => {
  showCourseDetail.value = false
  showCreateForm.value = false
  showParticipants.value = false
  selectedCourse.value = null
}

// 创建新课程
const createCourse = () => {
  showCreateForm.value = true
}

// 提交新课程
const submitNewCourse = () => {
  // 这里应该调用后端API
  const course: TrainingCourse = {
    id: Date.now(),
    ...newCourse.value,
    instructor: {
      name: '当前用户',
      title: '主治医师',
      hospital: '当前医院',
      avatar: '/api/placeholder/80/80',
      expertise: ['感统失调']
    },
    currentParticipants: 0,
    schedule: [],
    status: 'draft',
    createdAt: new Date().toISOString().split('T')[0],
    tags: []
  }
  
  trainingCourses.value.unshift(course)
  closeModal()
  alert('课程创建成功！')
}

// 发布课程
const publishCourse = (courseId: number) => {
  const course = trainingCourses.value.find(c => c.id === courseId)
  if (course) {
    course.status = 'published'
    alert('课程已发布！')
  }
}

// 取消课程
const cancelCourse = (courseId: number) => {
  const course = trainingCourses.value.find(c => c.id === courseId)
  if (course && confirm('确定要取消这个课程吗？')) {
    course.status = 'cancelled'
    alert('课程已取消！')
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 计算课程进度
const getCourseProgress = (course: TrainingCourse) => {
  return Math.round((course.currentParticipants / course.maxParticipants) * 100)
}
</script>

<template>
  <div class="training-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>专家培训管理</h1>
      <p class="header-desc">一二三线城市医院专家向基层医院授课培训</p>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-grid">
      <div class="stat-card">
        <div class="stat-icon total">📚</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.total }}</div>
          <div class="stat-label">培训课程</div>
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
        <div class="stat-icon ongoing">🎯</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.ongoing }}</div>
          <div class="stat-label">进行中</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon participants">👥</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.totalParticipants }}</div>
          <div class="stat-label">总参与人数</div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="create-btn" @click="createCourse">
        ➕ 创建新培训
      </button>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-group">
          <input 
            v-model="searchKeyword"
            type="text" 
            placeholder="搜索培训标题、讲师姓名或描述..."
            class="search-input"
          >
        </div>
        
        <div class="filter-group">
          <select v-model="filterType" class="filter-select">
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          
          <select v-model="filterStatus" class="filter-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          
          <select v-model="filterCategory" class="filter-select">
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 培训课程列表 -->
    <div class="courses-grid">
      <div 
        v-for="course in filteredCourses" 
        :key="course.id"
        class="course-card"
      >
        <div class="course-header">
          <div class="course-type">
            <span class="type-icon">{{ getTypeInfo(course.type).icon }}</span>
            <span 
              class="type-text"
              :style="{ color: getTypeInfo(course.type).color }"
            >
              {{ getTypeInfo(course.type).text }}
            </span>
          </div>
          
          <span 
            class="status-badge"
            :style="{ 
              color: getStatusInfo(course.status).color,
              backgroundColor: getStatusInfo(course.status).bgColor
            }"
          >
            {{ getStatusInfo(course.status).text }}
          </span>
        </div>
        
        <div class="course-content">
          <h3 class="course-title">{{ course.title }}</h3>
          <p class="course-description">{{ course.description }}</p>
          
          <div class="course-meta">
            <div class="instructor-info">
              <div class="instructor-avatar">{{ course.instructor.name.charAt(0) }}</div>
              <div class="instructor-details">
                <div class="instructor-name">{{ course.instructor.name }}</div>
                <div class="instructor-title">{{ course.instructor.title }}</div>
                <div class="instructor-hospital">{{ course.instructor.hospital }}</div>
              </div>
            </div>
            
            <div class="course-details">
              <div class="detail-item">
                <span class="detail-label">分类</span>
                <span class="detail-value">{{ course.category }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">时长</span>
                <span class="detail-value">{{ course.duration }}小时</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">费用</span>
                <span class="detail-value">{{ course.fee === 0 ? '免费' : '¥' + course.fee }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">时间</span>
                <span class="detail-value">{{ formatDate(course.startDate) }} - {{ formatDate(course.endDate) }}</span>
              </div>
            </div>
          </div>
          
          <div class="course-progress">
            <div class="progress-info">
              <span>报名进度</span>
              <span>{{ course.currentParticipants }}/{{ course.maxParticipants }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: getCourseProgress(course) + '%' }"
              ></div>
            </div>
          </div>
          
          <div class="course-tags">
            <span 
              v-for="tag in course.tags" 
              :key="tag"
              class="course-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="course-actions">
          <button 
            class="action-btn view-btn"
            @click="viewCourseDetail(course)"
          >
            查看详情
          </button>
          
          <button 
            class="action-btn participants-btn"
            @click="viewParticipants(course)"
          >
            参与者 ({{ course.currentParticipants }})
          </button>
          
          <button 
            v-if="course.status === 'draft'"
            class="action-btn publish-btn"
            @click="publishCourse(course.id)"
          >
            发布
          </button>
          
          <button 
            v-if="course.status === 'published' || course.status === 'ongoing'"
            class="action-btn cancel-btn"
            @click="cancelCourse(course.id)"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 课程详情弹窗 -->
    <div v-if="showCourseDetail" class="modal-overlay" @click="closeModal">
      <div class="course-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>培训详情</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div v-if="selectedCourse" class="modal-content">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">培训标题</span>
                <span class="value">{{ selectedCourse.title }}</span>
              </div>
              <div class="detail-item">
                <span class="label">培训类型</span>
                <span class="value">{{ getTypeInfo(selectedCourse.type).text }}</span>
              </div>
              <div class="detail-item">
                <span class="label">培训分类</span>
                <span class="value">{{ selectedCourse.category }}</span>
              </div>
              <div class="detail-item">
                <span class="label">培训时长</span>
                <span class="value">{{ selectedCourse.duration }}小时</span>
              </div>
              <div class="detail-item">
                <span class="label">培训费用</span>
                <span class="value">{{ selectedCourse.fee === 0 ? '免费' : '¥' + selectedCourse.fee }}</span>
              </div>
              <div class="detail-item">
                <span class="label">最大人数</span>
                <span class="value">{{ selectedCourse.maxParticipants }}人</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>讲师信息</h3>
            <div class="instructor-profile">
              <div class="instructor-avatar large">{{ selectedCourse.instructor.name.charAt(0) }}</div>
              <div class="instructor-info">
                <h4>{{ selectedCourse.instructor.name }}</h4>
                <p>{{ selectedCourse.instructor.title }}</p>
                <p>{{ selectedCourse.instructor.hospital }}</p>
                <div class="expertise-tags">
                  <span 
                    v-for="expertise in selectedCourse.instructor.expertise" 
                    :key="expertise"
                    class="expertise-tag"
                  >
                    {{ expertise }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>培训描述</h3>
            <p class="description-text">{{ selectedCourse.description }}</p>
          </div>
          
          <div class="detail-section">
            <h3>目标学员</h3>
            <div class="audience-tags">
              <span 
                v-for="audience in selectedCourse.targetAudience" 
                :key="audience"
                class="audience-tag"
              >
                {{ audience }}
              </span>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>培训安排</h3>
            <div class="schedule-list">
              <div 
                v-for="session in selectedCourse.schedule" 
                :key="session.date + session.time"
                class="schedule-item"
              >
                <div class="schedule-time">
                  <span class="date">{{ formatDate(session.date) }}</span>
                  <span class="time">{{ session.time }}</span>
                </div>
                <div class="schedule-content">
                  <span class="topic">{{ session.topic }}</span>
                  <span class="duration">{{ session.duration }}小时</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedCourse.location" class="detail-section">
            <h3>培训地点</h3>
            <p class="location-text">{{ selectedCourse.location }}</p>
          </div>
          
          <div v-if="selectedCourse.meetingLink" class="detail-section">
            <h3>会议链接</h3>
            <p class="meeting-link">{{ selectedCourse.meetingLink }}</p>
          </div>
          
          <div class="detail-section">
            <h3>培训材料</h3>
            <ul class="materials-list">
              <li v-for="material in selectedCourse.materials" :key="material">
                {{ material }}
              </li>
            </ul>
          </div>
          
          <div class="detail-section">
            <h3>参与要求</h3>
            <ul class="requirements-list">
              <li v-for="requirement in selectedCourse.requirements" :key="requirement">
                {{ requirement }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建课程弹窗 -->
    <div v-if="showCreateForm" class="modal-overlay" @click="closeModal">
      <div class="create-form-modal" @click.stop>
        <div class="modal-header">
          <h2>创建新培训</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <form @submit.prevent="submitNewCourse" class="create-form">
          <div class="form-section">
            <h3>基本信息</h3>
            
            <div class="form-group">
              <label>培训标题 *</label>
              <input v-model="newCourse.title" type="text" required>
            </div>
            
            <div class="form-group">
              <label>培训描述 *</label>
              <textarea v-model="newCourse.description" rows="3" required></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>培训类型 *</label>
                <select v-model="newCourse.type" required>
                  <option value="online">线上培训</option>
                  <option value="offline">线下培训</option>
                  <option value="hybrid">混合培训</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>培训分类 *</label>
                <input v-model="newCourse.category" type="text" required>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>培训时长（小时） *</label>
                <input v-model.number="newCourse.duration" type="number" min="1" required>
              </div>
              
              <div class="form-group">
                <label>最大参与人数 *</label>
                <input v-model.number="newCourse.maxParticipants" type="number" min="1" required>
              </div>
              
              <div class="form-group">
                <label>培训费用（元）</label>
                <input v-model.number="newCourse.fee" type="number" min="0">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>开始日期 *</label>
                <input v-model="newCourse.startDate" type="date" required>
              </div>
              
              <div class="form-group">
                <label>结束日期 *</label>
                <input v-model="newCourse.endDate" type="date" required>
              </div>
            </div>
          </div>
          
          <div v-if="newCourse.type === 'offline' || newCourse.type === 'hybrid'" class="form-section">
            <h3>线下信息</h3>
            <div class="form-group">
              <label>培训地点</label>
              <input v-model="newCourse.location" type="text">
            </div>
          </div>
          
          <div v-if="newCourse.type === 'online' || newCourse.type === 'hybrid'" class="form-section">
            <h3>线上信息</h3>
            <div class="form-group">
              <label>会议链接</label>
              <input v-model="newCourse.meetingLink" type="url">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">取消</button>
            <button type="submit" class="submit-btn">创建培训</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 参与者列表弹窗 -->
    <div v-if="showParticipants" class="modal-overlay" @click="closeModal">
      <div class="participants-modal" @click.stop>
        <div class="modal-header">
          <h2>参与者管理</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div v-if="selectedCourse" class="modal-content">
          <div class="participants-summary">
            <h3>{{ selectedCourse.title }}</h3>
            <p>已报名：{{ selectedCourse.currentParticipants }}/{{ selectedCourse.maxParticipants }}人</p>
          </div>
          
          <div v-if="participants[selectedCourse.id]" class="participants-table">
            <div class="table-header">
              <div class="header-cell">姓名</div>
              <div class="header-cell">职称</div>
              <div class="header-cell">医院</div>
              <div class="header-cell">医院级别</div>
              <div class="header-cell">联系方式</div>
              <div class="header-cell">报名时间</div>
              <div class="header-cell">状态</div>
            </div>
            
            <div class="table-body">
              <div 
                v-for="participant in participants[selectedCourse.id]" 
                :key="participant.id"
                class="table-row"
              >
                <div class="table-cell">{{ participant.name }}</div>
                <div class="table-cell">{{ participant.title }}</div>
                <div class="table-cell">{{ participant.hospital }}</div>
                <div class="table-cell">{{ participant.hospitalLevel }}</div>
                <div class="table-cell">
                  <div>{{ participant.phone }}</div>
                  <div>{{ participant.email }}</div>
                </div>
                <div class="table-cell">{{ formatDate(participant.registrationDate) }}</div>
                <div class="table-cell">
                  <span class="participant-status" :class="participant.status">
                    {{ participant.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="no-participants">
            <p>暂无参与者</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.training-management-container {
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

.stat-icon.ongoing {
  background: #fff3e0;
}

.stat-icon.participants {
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

/* 课程卡片 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.course-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-icon {
  font-size: 1.2rem;
}

.type-text {
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid currentColor;
}

.course-content {
  padding: 1.5rem;
}

.course-title {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  line-height: 1.4;
}

.course-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  margin-bottom: 1.5rem;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.instructor-avatar {
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

.instructor-details {
  flex: 1;
}

.instructor-name {
  font-weight: 500;
  color: #2c3e50;
}

.instructor-title {
  color: #42b883;
  font-size: 0.9rem;
}

.instructor-hospital {
  color: #666;
  font-size: 0.8rem;
}

.course-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.detail-item {
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
  font-weight: 500;
  font-size: 0.9rem;
}

.course-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #369870);
  transition: width 0.3s ease;
}

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.course-tag {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.course-actions {
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

.view-btn {
  background: #2196f3;
  color: white;
}

.view-btn:hover {
  background: #1976d2;
}

.participants-btn {
  background: #ff9800;
  color: white;
}

.participants-btn:hover {
  background: #f57c00;
}

.publish-btn {
  background: #4caf50;
  color: white;
}

.publish-btn:hover {
  background: #45a049;
}

.cancel-btn {
  background: #f44336;
  color: white;
}

.cancel-btn:hover {
  background: #d32f2f;
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

.course-detail-modal,
.create-form-modal,
.participants-modal {
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

/* 详情页样式 */
.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 2px solid #42b883;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

.instructor-profile {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.instructor-avatar.large {
  width: 80px;
  height: 80px;
  font-size: 2rem;
}

.instructor-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.instructor-info p {
  margin: 0 0 0.25rem 0;
  color: #666;
}

.expertise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.expertise-tag {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.description-text {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.audience-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.audience-tag {
  background: #f3e5f5;
  color: #9c27b0;
  padding: 0.3rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.schedule-time {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.schedule-time .date {
  font-weight: 500;
  color: #2c3e50;
}

.schedule-time .time {
  color: #666;
  font-size: 0.9rem;
}

.schedule-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-content .topic {
  color: #2c3e50;
  font-weight: 500;
}

.schedule-content .duration {
  color: #666;
  font-size: 0.9rem;
}

.location-text,
.meeting-link {
  color: #2c3e50;
  margin: 0;
}

.materials-list,
.requirements-list {
  margin: 0;
  padding-left: 1.5rem;
}

.materials-list li,
.requirements-list li {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* 表单样式 */
.create-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
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

/* 参与者表格 */
.participants-summary {
  margin-bottom: 2rem;
}

.participants-summary h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.participants-summary p {
  color: #666;
  margin: 0;
}

.participants-table .table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1.5fr 1fr 0.8fr;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.participants-table .header-cell {
  padding: 1rem;
  font-weight: 600;
  color: #2c3e50;
  border-right: 1px solid #e0e0e0;
  text-align: center;
}

.participants-table .table-body {
  max-height: 400px;
  overflow-y: auto;
}

.participants-table .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1.5fr 1fr 0.8fr;
  border-bottom: 1px solid #f0f0f0;
}

.participants-table .table-cell {
  padding: 1rem;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #2c3e50;
}

.participant-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.participant-status.registered {
  background: #fff3e0;
  color: #ff9800;
}

.participant-status.confirmed {
  background: #e8f5e8;
  color: #4caf50;
}

.participant-status.attended {
  background: #e3f2fd;
  color: #2196f3;
}

.participant-status.absent {
  background: #ffebee;
  color: #f44336;
}

.participant-status.cancelled {
  background: #f5f5f5;
  color: #9e9e9e;
}

.no-participants {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .training-management-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .statistics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .course-details {
    grid-template-columns: 1fr;
  }
  
  .course-actions {
    flex-direction: column;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .instructor-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .schedule-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .participants-table .table-header,
  .participants-table .table-row {
    grid-template-columns: 1fr;
  }
  
  .participants-table .header-cell,
  .participants-table .table-cell {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
  }
}
</style>