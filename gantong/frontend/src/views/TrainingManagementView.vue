<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createTraining,
  getMyTrainings,
  updateTraining,
  deleteTraining,
  type Training,
  type TrainingType,
  type CreateTrainingDto,
  type UpdateTrainingDto
} from '@/services/trainings'

// 使用后端的 Training 接口
type CourseStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'

interface CourseInstructor {
  name: string
  title: string
  hospital: string
  avatar: string
  expertise: string[]
}

interface CourseScheduleItem {
  date: string
  time: string
  topic: string
  duration: number
}

interface TrainingCourse extends Training {
  instructor: CourseInstructor
  category: string
  targetAudience: string[]
  duration: number
  fee: number
  endDate: string
  schedule: CourseScheduleItem[]
  materials: string[]
  requirements: string[]
  status: CourseStatus
  tags: string[]
  location?: string
  meetingLink?: string
  currentParticipants?: number
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
    doctorUserId: 1,
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
    durationHours: 16,
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
    updatedAt: '2024-07-01',
    tags: ['免费', '热门', '基础']
  },
  {
    id: 2,
    doctorUserId: 2,
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
    durationHours: 24,
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
    updatedAt: '2024-06-15',
    tags: ['实操', '认证', '小班']
  },
  {
    id: 3,
    doctorUserId: 3,
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
    durationHours: 12,
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
    updatedAt: '2024-06-20',
    tags: ['混合模式', '实用']
  },
  {
    id: 4,
    doctorUserId: 4,
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
    durationHours: 8,
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
    updatedAt: '2024-07-05',
    tags: ['高级', '学术', '前沿']
  },
  {
    id: 5,
    doctorUserId: 5,
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
    durationHours: 6,
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
    updatedAt: '2024-07-10',
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
const selectedCourse = ref<TrainingCourse | null>(null)
const showCourseDetail = ref(false)
const showCreateForm = ref(false)
const showParticipants = ref(false)

// 筛选状态
const filterType = ref('all')
const filterStatus = ref('all')
const filterCategory = ref('all')
const searchKeyword = ref('')

// 新建培训表单
const newCourse = ref<CreateTrainingDto>({
  title: '',
  description: '',
  type: 'online' as TrainingType,
  durationHours: 0,
  maxParticipants: 0,
  startDate: ''
})

// 编辑培训表单
const editingCourse = ref<Training | null>(null)

// 培训类型选项
const typeOptions = [
  { value: 'all', label: '全部类型' },
  { value: 'online', label: '线上培训' },
  { value: 'offline', label: '线下培训' },
  { value: 'hybrid', label: '混合培训' }
]

// 培训类型选项（不含全部）
const trainingTypeOptions = [
  { value: 'online', label: '线上培训' },
  { value: 'offline', label: '线下培训' },
  { value: 'hybrid', label: '混合培训' }
]

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
    const keyword = searchKeyword.value.trim()
    const typeMatch = filterType.value === 'all' || course.type === filterType.value
    const statusMatch = filterStatus.value === 'all' || course.status === filterStatus.value
    const categoryMatch = filterCategory.value === 'all' || course.category === filterCategory.value
    const keywordMatch =
      keyword === '' ||
      course.title.includes(keyword) ||
      course.instructor.name.includes(keyword) ||
      (course.description || '').includes(keyword)
    
    return typeMatch && statusMatch && categoryMatch && keywordMatch
  })
})

// 统计数据
const statistics = computed(() => {
  const total = trainingCourses.value.length
  const published = trainingCourses.value.filter(c => c.status === 'published').length
  const ongoing = trainingCourses.value.filter(c => c.status === 'ongoing').length
  const totalParticipants = trainingCourses.value.reduce(
    (sum, c) => sum + (c.currentParticipants || 0),
    0
  )
  
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
  editingCourse.value = null

  // 重置表单
  newCourse.value = {
    title: '',
    description: '',
    type: 'online',
    durationHours: 0,
    maxParticipants: 0,
    startDate: ''
  }
}

// 创建新课程
const createCourse = () => {
  showCreateForm.value = true
}



// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 计算课程进度
const getCourseProgress = (course: TrainingCourse) => {
  return Math.round(((course.currentParticipants || 0) / course.maxParticipants) * 100)
}

// 加载状态
const loading = ref(false)

// 分页信息
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 加载培训列表
const loadTrainings = async () => {
  try {
    loading.value = true
    const response = await getMyTrainings({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })

    // 转换后端数据格式为前端格式
    trainingCourses.value = response.items.map(item => ({
      ...item,
      duration: item.durationHours, // 兼容前端字段名
      currentParticipants: 0, // 暂时设为0，后续可扩展
      instructor: {
        name: item.doctor?.username || '未命名医生',
        title: item.doctor?.doctorProfile?.title || '医生',
        hospital: item.doctor?.doctorProfile?.hospital || '未填写医院',
        avatar: '/api/placeholder/80/80',
        expertise: item.doctor?.doctorProfile?.specialties
          ? item.doctor.doctorProfile.specialties
              .split(',')
              .map(specialty => specialty.trim())
              .filter(Boolean)
          : []
      },
      category: '感统训练', // 暂时固定
      targetAudience: ['基层医生'],
      fee: 0,
      schedule: [],
      materials: [],
      requirements: [],
      status: 'published' as const,
      tags: [],
      endDate: item.startDate, // 暂时设为相同
      location: '',
      meetingLink: ''
    }))

    pagination.value.total = response.total
  } catch (error) {
    console.error('加载培训列表失败:', error)
    ElMessage.error('加载培训列表失败')
  } finally {
    loading.value = false
  }
}

// 提交新培训
const submitNewCourse = async () => {
  try {
    loading.value = true

    // 验证表单
    if (!newCourse.value.title.trim()) {
      ElMessage.error('请输入培训标题')
      return
    }
    if (!newCourse.value.startDate) {
      ElMessage.error('请选择开始日期')
      return
    }
    if (newCourse.value.durationHours <= 0) {
      ElMessage.error('请输入有效的培训时长')
      return
    }
    if (newCourse.value.maxParticipants <= 0) {
      ElMessage.error('请输入有效的参与人数')
      return
    }

    await createTraining(newCourse.value)
    ElMessage.success('培训创建成功')

    // 重置表单
    newCourse.value = {
      title: '',
      description: '',
      type: 'online',
      durationHours: 0,
      maxParticipants: 0,
      startDate: ''
    }

    showCreateForm.value = false
    await loadTrainings() // 重新加载列表
  } catch (error) {
    console.error('创建培训失败:', error)
    ElMessage.error('创建培训失败')
  } finally {
    loading.value = false
  }
}

// 删除培训
const deleteCourse = async (courseId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个培训吗？', '确认删除', {
      type: 'warning'
    })

    await deleteTraining(courseId)
    ElMessage.success('培训删除成功')
    await loadTrainings() // 重新加载列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除培训失败:', error)
      ElMessage.error('删除培训失败')
    }
  }
}

// 编辑培训
const editCourse = (course: TrainingCourse) => {
  editingCourse.value = course
  newCourse.value = {
    title: course.title,
    description: course.description || '',
    type: course.type,
    durationHours: course.durationHours,
    maxParticipants: course.maxParticipants,
    startDate: course.startDate
  }
  showCreateForm.value = true
}

// 更新培训
const updateCourse = async () => {
  if (!editingCourse.value) return

  try {
    loading.value = true

    const updateData: UpdateTrainingDto = {}
    if (newCourse.value.title !== editingCourse.value.title) {
      updateData.title = newCourse.value.title
    }
    if (newCourse.value.description !== editingCourse.value.description) {
      updateData.description = newCourse.value.description
    }
    if (newCourse.value.type !== editingCourse.value.type) {
      updateData.type = newCourse.value.type
    }
    if (newCourse.value.durationHours !== editingCourse.value.durationHours) {
      updateData.durationHours = newCourse.value.durationHours
    }
    if (newCourse.value.maxParticipants !== editingCourse.value.maxParticipants) {
      updateData.maxParticipants = newCourse.value.maxParticipants
    }
    if (newCourse.value.startDate !== editingCourse.value.startDate) {
      updateData.startDate = newCourse.value.startDate
    }

    await updateTraining(editingCourse.value.id, updateData)
    ElMessage.success('培训更新成功')

    editingCourse.value = null
    showCreateForm.value = false
    await loadTrainings() // 重新加载列表
  } catch (error) {
    console.error('更新培训失败:', error)
    ElMessage.error('更新培训失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadTrainings()
})
</script>

<template>
  <div class="training-management-container">
    <!-- Hero Header -->
    <div class="hero-header">
      <div class="hero-deco hero-deco--1"></div>
      <div class="hero-deco hero-deco--2"></div>
      <div class="hero-deco hero-deco--3"></div>

      <div class="hero-body">
        <span class="hero-badge">培训管理</span>
        <h1 class="hero-title">专家培训管理</h1>
        <p class="hero-subtitle">一二三线城市医院专家向基层医院授课培训</p>

        <div class="hero-stats">
          <div class="stat-chip">
            <span class="chip-num">{{ statistics.total }}</span>
            <span class="chip-label">培训课程</span>
          </div>
          <div class="stat-chip">
            <span class="chip-num">{{ statistics.published }}</span>
            <span class="chip-label">已发布</span>
          </div>
          <div class="stat-chip">
            <span class="chip-num">{{ statistics.ongoing }}</span>
            <span class="chip-label">进行中</span>
          </div>
          <div class="stat-chip">
            <span class="chip-num">{{ statistics.totalParticipants }}</span>
            <span class="chip-label">总参与人数</span>
          </div>
        </div>

        <button class="create-btn" @click="createCourse">＋ 创建新培训</button>
      </div>
    </div>

    <!-- Search / Filter -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="search-group">
          <span class="search-icon">🔍</span>
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

    <!-- Section Title -->
    <div class="section-heading">
      <h2>培训课程</h2>
      <div class="section-line"></div>
    </div>

    <!-- Course Cards -->
    <div class="courses-grid">
      <div
        v-for="course in filteredCourses"
        :key="course.id"
        class="course-card"
      >
        <div class="course-header">
          <div class="course-type">
            <span class="type-icon-box">{{ getTypeInfo(course.type).icon }}</span>
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
              <div class="detail-chip">
                <span class="detail-label">分类</span>
                <span class="detail-value">{{ course.category }}</span>
              </div>
              <div class="detail-chip">
                <span class="detail-label">时长</span>
                <span class="detail-value">{{ course.duration }}小时</span>
              </div>
              <div class="detail-chip">
                <span class="detail-label">费用</span>
                <span class="detail-value">{{ course.fee === 0 ? '免费' : '¥' + course.fee }}</span>
              </div>
              <div class="detail-chip">
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
          <button class="action-btn ghost-btn" @click="viewCourseDetail(course)">查看详情</button>
          <button class="action-btn ghost-btn" @click="viewParticipants(course)">参与者</button>
          <button class="action-btn ghost-btn" @click="editCourse(course)">编辑</button>
          <button class="action-btn ghost-red-btn" @click="deleteCourse(course.id)">删除</button>
        </div>

        <div class="card-bottom-bar"></div>
      </div>
    </div>

    <!-- Course Detail Modal -->
    <div v-if="showCourseDetail" class="modal-overlay" @click="closeModal">
      <div class="modal modal--detail" @click.stop>
        <div class="modal-header">
          <h2>培训详情</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div v-if="selectedCourse" class="modal-content">
          <div class="detail-section">
            <h3 class="detail-section-title">基本信息</h3>
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
                <span class="label">培训时长</span>
                <span class="value">{{ selectedCourse.durationHours }}小时</span>
              </div>
              <div class="detail-item">
                <span class="label">最大参与人数</span>
                <span class="value">{{ selectedCourse.maxParticipants }}人</span>
              </div>
              <div class="detail-item">
                <span class="label">开始日期</span>
                <span class="value">{{ formatDate(selectedCourse.startDate) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="detail-section-title">讲师信息</h3>
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

          <div v-if="selectedCourse.description" class="detail-section">
            <h3 class="detail-section-title">培训描述</h3>
            <p class="description-text">{{ selectedCourse.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click="closeModal">
      <div class="modal modal--form" @click.stop>
        <div class="modal-header">
          <h2>创建新培训</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <form @submit.prevent="editingCourse ? updateCourse() : submitNewCourse()" class="create-form">
          <div class="form-section">
            <h3>基本信息</h3>

            <div class="form-group">
              <label>培训标题 *</label>
              <input v-model="newCourse.title" type="text" required>
            </div>

            <div class="form-group">
              <label>培训描述</label>
              <textarea v-model="newCourse.description" rows="3" placeholder="请输入培训描述（可选）"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>培训类型 *</label>
                <select v-model="newCourse.type" required>
                  <option v-for="option in trainingTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>培训时长（小时） *</label>
                <input v-model.number="newCourse.durationHours" type="number" min="1" required>
              </div>
              <div class="form-group">
                <label>最大参与人数 *</label>
                <input v-model.number="newCourse.maxParticipants" type="number" min="1" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>开始日期 *</label>
                <input v-model="newCourse.startDate" type="datetime-local" required>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">取消</button>
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ editingCourse ? '更新培训' : '创建培训' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Participants Modal -->
    <div v-if="showParticipants" class="modal-overlay" @click="closeModal">
      <div class="modal modal--participants" @click.stop>
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
/* ============================================================
   Training Management — Amber Design System
   ============================================================ */
.training-management-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 28px 32px 48px;
}

/* ---- Hero Header ---- */
.hero-header {
  position: relative;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  padding: 44px 48px 40px;
  margin-bottom: 28px;
  overflow: hidden;
}

.hero-deco {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  opacity: 0.07;
  pointer-events: none;
}
.hero-deco--1 { width: 260px; height: 260px; top: -80px; right: -60px; }
.hero-deco--2 { width: 140px; height: 140px; bottom: -40px; left: 60px; }
.hero-deco--3 { width: 80px; height: 80px; top: 30px; right: 220px; }

.hero-body {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  background: rgba(245, 158, 66, 0.2);
  color: #f59e42;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 16px;
  border-radius: 100px;
  margin-bottom: 14px;
  letter-spacing: 0.5px;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  margin: 0 0 28px;
}

.hero-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 13px;
  padding: 8px 18px;
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

.create-btn {
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
  transition: transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 4px 14px rgba(245, 158, 66, 0.25);
}
.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 66, 0.35);
}

/* ---- Filters Card ---- */
.filters-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 28px;
}

.filters-row {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.search-group {
  flex: 1;
  min-width: 280px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input::placeholder { color: #94a3b8; }
.search-input:focus {
  outline: none;
  border-color: #f59e42;
  box-shadow: 0 0 0 3px rgba(245, 158, 66, 0.1);
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select {
  padding: 10px 14px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.filter-select:focus {
  outline: none;
  border-color: #f59e42;
  box-shadow: 0 0 0 3px rgba(245, 158, 66, 0.1);
}

/* ---- Section Heading ---- */
.section-heading {
  margin-bottom: 20px;
}
.section-heading h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px;
}
.section-line {
  height: 3px;
  width: 48px;
  background: linear-gradient(90deg, #f59e42, #e8890a);
  border-radius: 2px;
}

/* ---- Course Cards ---- */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 22px;
}

.course-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.22s, box-shadow 0.22s;
}
.course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
}
.course-card:hover .card-bottom-bar {
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
  transition: opacity 0.25s;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.course-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon-box {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 158, 66, 0.08);
  border-radius: 9px;
  font-size: 16px;
}

.type-text {
  font-weight: 600;
  font-size: 14px;
}

.status-badge {
  padding: 4px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.course-content {
  padding: 20px;
}

.course-title {
  color: #1e293b;
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.45;
}

.course-description {
  color: #64748b;
  margin-bottom: 18px;
  font-size: 13.5px;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  margin-bottom: 16px;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.instructor-avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #f59e42 0%, #e8890a 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.instructor-details {
  flex: 1;
  min-width: 0;
}

.instructor-name {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
}

.instructor-title {
  color: #f59e42;
  font-size: 12.5px;
}

.instructor-hospital {
  color: #94a3b8;
  font-size: 12px;
}

.course-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  font-size: 12.5px;
}

.detail-label {
  color: #94a3b8;
}

.detail-value {
  color: #1e293b;
  font-weight: 600;
}

.course-progress {
  margin: 14px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12.5px;
  color: #64748b;
}

.progress-bar {
  height: 5px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e42, #e8890a);
  border-radius: 3px;
  transition: width 0.3s;
}

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}

.course-tag {
  background: rgba(245, 158, 66, 0.08);
  color: #e8890a;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.course-actions {
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

.ghost-btn {
  background: transparent;
  border: 1.5px solid #e2e8f0;
  color: #475569;
}
.ghost-btn:hover {
  border-color: #f59e42;
  color: #f59e42;
  background: rgba(245, 158, 66, 0.04);
}

.ghost-red-btn {
  background: transparent;
  border: 1.5px solid #fecaca;
  color: #ef4444;
}
.ghost-red-btn:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

/* ---- Modals ---- */
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

.modal {
  background: #fff;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
}
.modal--participants {
  max-width: 960px;
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

.modal-content {
  padding: 24px;
}

/* ---- Detail Modal Sections ---- */
.detail-section {
  margin-bottom: 24px;
}

.detail-section-title {
  color: #1e293b;
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  padding-bottom: 10px;
  border-bottom: 2px solid #f59e42;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
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

.instructor-profile {
  display: flex;
  align-items: center;
  gap: 18px;
}

.instructor-avatar.large {
  width: 64px;
  height: 64px;
  font-size: 22px;
  border-radius: 16px;
}

.instructor-info h4 {
  margin: 0 0 4px;
  color: #1e293b;
  font-size: 16px;
}

.instructor-info p {
  margin: 0 0 2px;
  color: #64748b;
  font-size: 13.5px;
}

.expertise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.expertise-tag {
  background: rgba(245, 158, 66, 0.08);
  color: #e8890a;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.description-text {
  color: #64748b;
  line-height: 1.7;
  font-size: 14px;
  margin: 0;
}

/* ---- Form Styles ---- */
.create-form {
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
.form-actions .cancel-btn:hover {
  background: #e2e8f0;
}

.form-actions .submit-btn {
  background: linear-gradient(135deg, #f59e42 0%, #e8890a 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(245, 158, 66, 0.25);
}
.form-actions .submit-btn:hover {
  box-shadow: 0 6px 20px rgba(245, 158, 66, 0.35);
  transform: translateY(-1px);
}
.form-actions .submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ---- Participants Table ---- */
.participants-summary {
  margin-bottom: 20px;
}
.participants-summary h3 {
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 6px;
}
.participants-summary p {
  color: #64748b;
  font-size: 13.5px;
  margin: 0;
}

.participants-table {
  border: 1px solid #eef0f4;
  border-radius: 12px;
  overflow: hidden;
}

.participants-table .table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1.5fr 1fr 0.8fr;
  background: #f8fafc;
}

.participants-table .header-cell {
  padding: 12px 14px;
  font-weight: 600;
  font-size: 12.5px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  text-align: center;
}

.participants-table .table-body {
  max-height: 400px;
  overflow-y: auto;
}

.participants-table .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1.5fr 1fr 0.8fr;
  border-top: 1px solid #f1f5f9;
  transition: background 0.12s;
}
.participants-table .table-row:nth-child(even) {
  background: #fafbfc;
}
.participants-table .table-row:hover {
  background: rgba(245, 158, 66, 0.03);
}

.participants-table .table-cell {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #1e293b;
  font-size: 13.5px;
}

.participant-status {
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.participant-status.registered {
  background: rgba(245, 158, 66, 0.1);
  color: #e8890a;
}
.participant-status.confirmed {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}
.participant-status.attended {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}
.participant-status.absent {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}
.participant-status.cancelled {
  background: #f1f5f9;
  color: #94a3b8;
}

.no-participants {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 14px;
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .training-management-container {
    padding: 16px;
  }
  .hero-header {
    padding: 28px 20px 24px;
    border-radius: 14px;
  }
  .hero-title {
    font-size: 1.5rem;
  }
  .hero-stats {
    gap: 8px;
  }
  .stat-chip {
    padding: 6px 12px;
  }
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-group {
    min-width: auto;
  }
  .filter-group {
    flex-wrap: wrap;
  }
  .courses-grid {
    grid-template-columns: 1fr;
  }
  .course-details {
    flex-direction: column;
  }
  .course-actions {
    flex-wrap: wrap;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .instructor-profile {
    flex-direction: column;
    text-align: center;
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
    border-bottom: 1px solid #f1f5f9;
    text-align: left;
  }
}
</style>
