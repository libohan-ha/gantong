<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 校园环境训练接口
interface EnvironmentTraining {
  id: number
  name: string
  type: 'attention' | 'balance' | 'coordination' | 'cognitive'
  description: string
  ageRange: {
    min: number
    max: number
  }
  duration: number // 分钟
  difficulty: 'easy' | 'medium' | 'hard'
  equipment: string[]
  space: string
  benefits: string[]
  instructions: string[]
  safety: string[]
}

// 环境训练推送接口
interface TrainingEnvironment {
  id: number
  name: string
  type: 'indoor' | 'outdoor' | 'mixed'
  description: string
  suitableFor: string[]
  equipment: string[]
  activities: string[]
  benefits: string[]
  setupTime: number
  space: string
  cost: number
}

// 学校信息接口
interface School {
  name: string
  city: string
  district: string
  coordinates: {
    lat: number
    lng: number
  }
  studentAgeRange: {
    min: number
    max: number
  }
  currentGrade: string
}

// 研学地点接口
interface StudyTourLocation {
  id: number
  name: string
  type: 'heritage' | 'nature' | 'sensory' | 'cultural' | 'science'
  description: string
  address: string
  city: string
  coordinates: {
    lat: number
    lng: number
  }
  ageGroups: string[]
  duration: string
  capacity: number
  safetyRating: number
  trafficCondition: 'excellent' | 'good' | 'moderate' | 'poor'
  features: string[]
  sensoryBenefits: string[]
  culturalValue: string[]
  season: string[]
  price: number
  images: string[]
  contactInfo: {
    phone: string
    email: string
  }
  equipment: string[]
  activities: string[]
}

// 研学方案接口
interface StudyTourPlan {
  id: number
  title: string
  type: 'heritage' | 'sensory' | 'nature' | 'cultural'
  description: string
  locations: StudyTourLocation[]
  duration: string
  totalDistance: number
  safetyScore: number
  educationalValue: number
  sensoryBenefits: string[]
  targetAge: string
  totalPrice: number
  schedule: {
    time: string
    activity: string
    location: string
    duration: number
  }[]
  transportation: string
  safetyMeasures: string[]
  learningObjectives: string[]
  equipment: string[]
  teacher: {
    name: string
    title: string
    experience: string
  }
  matchScore: number
}

// 页面状态管理
const activeModule = ref('campus-training')

// 当前学校信息
const currentSchool = ref<School>({
  name: '实验小学',
  city: '北京市',
  district: '海淀区',
  coordinates: { lat: 39.9042, lng: 116.4074 },
  studentAgeRange: { min: 6, max: 12 },
  currentGrade: '三年级'
})

// 校园环境训练数据
const campusTrainings = ref<EnvironmentTraining[]>([
  {
    id: 1,
    name: '注意力专注训练',
    type: 'attention',
    description: '利用校园安静的图书角或专用教室，通过视觉追踪和听觉辨别训练提升学生专注力。',
    ageRange: { min: 6, max: 12 },
    duration: 15,
    difficulty: 'easy',
    equipment: ['彩色卡片', '铃铛', '计时器', '记录表'],
    space: '安静教室或图书角',
    benefits: ['提升专注力', '增强视觉追踪', '改善听觉注意'],
    instructions: [
      '准备不同颜色的卡片，让学生按指令找出特定颜色',
      '使用铃铛进行听觉注意训练，学生听到特定节拍举手',
      '进行视觉追踪游戏，眼睛跟随移动物体',
      '记录每次训练的表现和进步'
    ],
    safety: ['确保环境安全无障碍物', '控制训练时间避免疲劳', '及时给予休息']
  },
  {
    id: 2,
    name: '平衡协调训练',
    type: 'balance',
    description: '利用校园操场和体育设施，通过平衡木、跳跃等活动提升学生的身体协调能力。',
    ageRange: { min: 6, max: 12 },
    duration: 20,
    difficulty: 'medium',
    equipment: ['平衡木', '软垫', '彩色圆环', '小球'],
    space: '操场或体育馆',
    benefits: ['改善平衡能力', '增强协调性', '提升本体觉'],
    instructions: [
      '在平衡木上进行前进、后退、侧走训练',
      '单脚站立练习，逐渐延长时间',
      '跳跃训练：双脚跳、单脚跳、跨越障碍',
      '抛接球训练提升手眼协调'
    ],
    safety: ['铺设软垫防止跌倒', '有老师全程陪护', '根据能力调整难度']
  },
  {
    id: 3,
    name: '感觉统合游戏',
    type: 'coordination',
    description: '在校园绿地和活动区域，通过多感官游戏活动促进感觉统合发展。',
    ageRange: { min: 6, max: 12 },
    duration: 25,
    difficulty: 'medium',
    equipment: ['触觉球', '沙包', '音响设备', '彩带'],
    space: '校园绿地或多功能活动室',
    benefits: ['促进感觉统合', '改善触觉敏感', '增强社交能力'],
    instructions: [
      '触觉探索：使用不同材质物品进行触觉刺激',
      '听觉游戏：音乐律动和声音辨别',
      '视觉训练：色彩识别和空间感知',
      '团体协作游戏增强社交技能'
    ],
    safety: ['确保材料清洁卫生', '注意过敏反应', '控制刺激强度']
  }
])

// 环境训练推送数据
const trainingEnvironments = ref<TrainingEnvironment[]>([
  {
    id: 1,
    name: '室内专注力训练环境',
    type: 'indoor',
    description: '安静、光线适中的室内环境，适合进行专注力和认知训练。',
    suitableFor: ['注意力不集中', '多动症', '学习困难'],
    equipment: ['隔音材料', '柔和灯光', '舒适座椅', '训练工具'],
    activities: ['专注力游戏', '认知训练', '静坐冥想', '阅读练习'],
    benefits: ['提升专注力', '改善学习效果', '减少干扰'],
    setupTime: 30,
    space: '20平方米独立房间',
    cost: 5000
  },
  {
    id: 2,
    name: '户外运动训练场',
    type: 'outdoor',
    description: '开放的户外空间，配备各种运动器械，适合大肌肉群训练。',
    suitableFor: ['平衡协调障碍', '肌张力不足', '运动技能落后'],
    equipment: ['平衡器械', '攀爬设施', '跳跃垫', '球类器材'],
    activities: ['平衡训练', '攀爬游戏', '球类运动', '团队协作'],
    benefits: ['增强体质', '改善协调', '提升自信'],
    setupTime: 60,
    space: '200平方米户外场地',
    cost: 15000
  },
  {
    id: 3,
    name: '多感官体验室',
    type: 'mixed',
    description: '集成多种感官刺激设备的综合训练环境。',
    suitableFor: ['感觉统合失调', '自闭症谱系', '感觉敏感'],
    equipment: ['触觉墙', '音响系统', '彩色灯光', '香薰设备'],
    activities: ['感官探索', '放松训练', '感觉整合', '情绪调节'],
    benefits: ['改善感觉统合', '减少感觉防御', '促进放松'],
    setupTime: 45,
    space: '30平方米专用房间',
    cost: 25000
  }
])

// 模拟研学地点数据
const studyLocations = ref<StudyTourLocation[]>([
  {
    id: 1,
    name: '故宫博物院',
    type: 'heritage',
    description: '中国明清两代的皇家宫殿，现为世界文化遗产，是了解中国古代宫廷文化和建筑艺术的绝佳场所。',
    address: '北京市东城区景山前街4号',
    city: '北京市',
    coordinates: { lat: 39.9163, lng: 116.3972 },
    ageGroups: ['6-8岁', '9-12岁', '13-15岁'],
    duration: '3小时',
    capacity: 150,
    safetyRating: 5,
    trafficCondition: 'excellent',
    features: ['明清建筑', '文物收藏', '皇家园林', '历史文化'],
    sensoryBenefits: ['视觉刺激', '空间认知', '历史感知', '美感培养'],
    culturalValue: ['传统文化', '历史教育', '艺术鉴赏', '民族自豪感'],
    season: ['春季', '秋季', '冬季'],
    price: 60,
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    contactInfo: { phone: '010-85007421', email: 'education@dpm.org.cn' },
    equipment: ['无障碍设施', '语音导览', '互动展区'],
    activities: ['文物观赏', '建筑学习', '历史讲解', '互动体验']
  },
  {
    id: 2,
    name: '北京感统训练基地',
    type: 'sensory',
    description: '专业的感觉统合训练基地，结合户外自然环境进行感统训练，提供个性化训练方案。',
    address: '北京市昌平区沙河镇七里渠南村',
    city: '北京市',
    coordinates: { lat: 40.1394, lng: 116.2464 },
    ageGroups: ['3-6岁', '6-8岁', '9-12岁'],
    duration: '5小时',
    capacity: 60,
    safetyRating: 5,
    trafficCondition: 'good',
    features: ['专业器械', '自然环境', '个性训练', '专业指导'],
    sensoryBenefits: ['前庭觉', '本体觉', '触觉', '视觉', '听觉'],
    culturalValue: ['健康教育', '团队合作', '自信建立', '能力发展'],
    season: ['春季', '夏季', '秋季'],
    price: 150,
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    contactInfo: { phone: '010-69745623', email: 'info@sensorytraining.com' },
    equipment: ['感统器械', '平衡设备', '攀爬设施', '触觉材料'],
    activities: ['感统测评', '训练游戏', '团队合作', '成果展示']
  }
])

// 智能推荐的研学方案
const recommendedPlans = ref<StudyTourPlan[]>([])

// 页面状态
const selectedPlan = ref<StudyTourPlan | null>(null)
const showPlanDetail = ref(false)
const filterType = ref('all')
const sortBy = ref('match')

// 筛选选项
const typeOptions = [
  { value: 'all', label: '全部类型', icon: '🎯' },
  { value: 'heritage', label: '非遗研学', icon: '🏛️' },
  { value: 'sensory', label: '感统研学', icon: '🧠' },
  { value: 'nature', label: '自然研学', icon: '🌲' },
  { value: 'cultural', label: '文化研学', icon: '🎨' }
]

const sortOptions = [
  { value: 'match', label: '匹配度' },
  { value: 'distance', label: '距离' },
  { value: 'safety', label: '安全评分' },
  { value: 'price', label: '价格' }
]

// 智能推荐算法
const generateRecommendations = () => {
  const plans: StudyTourPlan[] = []
  
  // 感统研学方案
  const sensoryPlan: StudyTourPlan = {
    id: 1,
    title: '自然环境感统训练营',
    type: 'sensory',
    description: '结合自然环境进行感觉统合训练，提升孩子的感知能力和身体协调性。',
    locations: studyLocations.value.filter(l => l.type === 'sensory'),
    duration: '1天',
    totalDistance: 28.5,
    safetyScore: 5,
    educationalValue: 8,
    sensoryBenefits: ['前庭觉', '本体觉', '触觉', '视觉', '听觉'],
    targetAge: '3-12岁',
    totalPrice: 150,
    schedule: [
      { time: '09:00-09:30', activity: '集合出发', location: '学校', duration: 30 },
      { time: '10:00-12:00', activity: '感统能力测评', location: '感统训练基地', duration: 120 },
      { time: '13:30-16:00', activity: '感统训练游戏', location: '感统训练基地', duration: 150 },
      { time: '16:30-17:00', activity: '返回学校', location: '学校', duration: 30 }
    ],
    transportation: '专用校车',
    safetyMeasures: ['专业治疗师', '医护人员', '安全保险', '紧急预案'],
    learningObjectives: ['提升感知能力', '改善协调性', '增强自信心', '培养团队精神'],
    equipment: ['感统器械', '安全设备', '测评工具', '游戏道具'],
    teacher: {
      name: '李康复',
      title: '感统训练专家',
      experience: '12年儿童康复经验'
    },
    matchScore: 96
  }
  
  // 非遗研学方案
  const heritagePlan: StudyTourPlan = {
    id: 2,
    title: '传统文化非遗体验之旅',
    type: 'heritage',
    description: '深度体验中国传统文化和非物质文化遗产，培养文化自信和动手能力。',
    locations: studyLocations.value.filter(l => l.type === 'heritage'),
    duration: '1天',
    totalDistance: 15.6,
    safetyScore: 5,
    educationalValue: 9,
    sensoryBenefits: ['精细动作', '手眼协调', '触觉发展', '创造能力'],
    targetAge: '6-12岁',
    totalPrice: 60,
    schedule: [
      { time: '09:00-09:30', activity: '集合出发', location: '学校', duration: 30 },
      { time: '10:00-12:00', activity: '故宫历史文化学习', location: '故宫博物院', duration: 120 },
      { time: '13:30-16:30', activity: '文化体验活动', location: '故宫博物院', duration: 180 },
      { time: '17:00-17:30', activity: '返回学校', location: '学校', duration: 30 }
    ],
    transportation: '专用校车',
    safetyMeasures: ['专业导游', '医护人员', '安全保险', '紧急联系'],
    learningObjectives: ['了解传统文化', '体验历史技艺', '培养文化自信', '提升艺术素养'],
    equipment: ['导览设备', '活动材料', '安全装备', '记录工具'],
    teacher: {
      name: '张文华',
      title: '文化教育专家',
      experience: '15年文化教育经验'
    },
    matchScore: 92
  }
  
  plans.push(sensoryPlan, heritagePlan)
  
  // 根据学校位置和学生年龄计算匹配度
  plans.forEach(plan => {
    let score = 0
    
    // 距离评分 (40%)
    const avgDistance = plan.totalDistance
    if (avgDistance < 20) score += 40
    else if (avgDistance < 50) score += 30
    else score += 20
    
    // 安全评分 (30%)
    score += plan.safetyScore * 6
    
    // 教育价值 (20%)
    score += plan.educationalValue * 2
    
    // 价格评分 (10%)
    if (plan.totalPrice < 100) score += 10
    else if (plan.totalPrice < 200) score += 8
    else score += 5
    
    plan.matchScore = Math.min(score, 100)
  })
  
  recommendedPlans.value = plans.sort((a, b) => b.matchScore - a.matchScore)
}

// 过滤后的方案列表
const filteredPlans = computed(() => {
  let plans = recommendedPlans.value
  
  if (filterType.value !== 'all') {
    plans = plans.filter(plan => plan.type === filterType.value)
  }
  
  // 排序
  switch (sortBy.value) {
    case 'distance':
      plans.sort((a, b) => a.totalDistance - b.totalDistance)
      break
    case 'safety':
      plans.sort((a, b) => b.safetyScore - a.safetyScore)
      break
    case 'price':
      plans.sort((a, b) => a.totalPrice - b.totalPrice)
      break
    default: // match
      plans.sort((a, b) => b.matchScore - a.matchScore)
  }
  
  return plans
})

// 统计数据
const statistics = computed(() => {
  const totalPlans = recommendedPlans.value.length
  const avgSafety = recommendedPlans.value.reduce((sum, p) => sum + p.safetyScore, 0) / totalPlans || 0
  const avgDistance = recommendedPlans.value.reduce((sum, p) => sum + p.totalDistance, 0) / totalPlans || 0
  const avgPrice = recommendedPlans.value.reduce((sum, p) => sum + p.totalPrice, 0) / totalPlans || 0
  
  return {
    totalPlans,
    avgSafety: Math.round(avgSafety * 10) / 10,
    avgDistance: Math.round(avgDistance * 10) / 10,
    avgPrice: Math.round(avgPrice)
  }
})

// 模块切换
const switchModule = (module: string) => {
  activeModule.value = module
  if (module === 'study-tour') {
    generateRecommendations()
  }
}

// 获取训练类型信息
const getTrainingTypeInfo = (type: string) => {
  const typeMap = {
    attention: { text: '注意力训练', color: '#2196f3', bgColor: '#e3f2fd', icon: '🎯' },
    balance: { text: '平衡训练', color: '#4caf50', bgColor: '#e8f5e8', icon: '⚖️' },
    coordination: { text: '协调训练', color: '#ff9800', bgColor: '#fff3e0', icon: '🤸' },
    cognitive: { text: '认知训练', color: '#9c27b0', bgColor: '#f3e5f5', icon: '🧠' }
  }
  return typeMap[type as keyof typeof typeMap] || { text: type, color: '#666', bgColor: '#f0f0f0', icon: '📚' }
}

// 获取环境类型信息
const getEnvironmentTypeInfo = (type: string) => {
  const typeMap = {
    indoor: { text: '室内环境', color: '#2196f3', bgColor: '#e3f2fd', icon: '🏠' },
    outdoor: { text: '户外环境', color: '#4caf50', bgColor: '#e8f5e8', icon: '🌳' },
    mixed: { text: '混合环境', color: '#ff9800', bgColor: '#fff3e0', icon: '🏫' }
  }
  return typeMap[type as keyof typeof typeMap] || { text: type, color: '#666', bgColor: '#f0f0f0', icon: '📍' }
}

// 获取难度信息
const getDifficultyInfo = (difficulty: string) => {
  const difficultyMap = {
    easy: { text: '简单', color: '#4caf50', bgColor: '#e8f5e8' },
    medium: { text: '中等', color: '#ff9800', bgColor: '#fff3e0' },
    hard: { text: '困难', color: '#f44336', bgColor: '#ffebee' }
  }
  return difficultyMap[difficulty as keyof typeof difficultyMap] || { text: difficulty, color: '#666', bgColor: '#f0f0f0' }
}

// 获取类型显示信息
const getTypeInfo = (type: string) => {
  const typeMap = {
    heritage: { text: '非遗研学', color: '#8b4513', bgColor: '#f4f2e9', icon: '🏛️' },
    sensory: { text: '感统研学', color: '#9c27b0', bgColor: '#f3e5f5', icon: '🧠' },
    nature: { text: '自然研学', color: '#4caf50', bgColor: '#e8f5e8', icon: '🌲' },
    cultural: { text: '文化研学', color: '#2196f3', bgColor: '#e3f2fd', icon: '🎨' },
    science: { text: '科学研学', color: '#ff9800', bgColor: '#fff3e0', icon: '🔬' }
  }
  return typeMap[type as keyof typeof typeMap] || { text: type, color: '#666', bgColor: '#f0f0f0', icon: '📚' }
}

// 查看方案详情
const viewPlanDetail = (plan: StudyTourPlan) => {
  selectedPlan.value = plan
  showPlanDetail.value = true
}

// 关闭弹窗
const closeModal = () => {
  showPlanDetail.value = false
  selectedPlan.value = null
}

// 预约研学
const bookStudyTour = (plan: StudyTourPlan) => {
  alert(`研学预约成功！\n方案：${plan.title}\n我们将在24小时内联系您确认详细安排。`)
  closeModal()
}

// 获取安全评级文本
const getSafetyRating = (rating: number) => {
  if (rating >= 5) return { text: '极安全', color: '#4caf50' }
  if (rating >= 4) return { text: '很安全', color: '#8bc34a' }
  if (rating >= 3) return { text: '较安全', color: '#ffc107' }
  return { text: '一般', color: '#ff9800' }
}

// 组件挂载时生成推荐
onMounted(() => {
  generateRecommendations()
})
</script>

<template>
  <div class="school-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>校园端管理系统</h1>
      <p class="header-desc">智能化校园环境训练与研学推送平台</p>
    </div>
    
    <!-- 模块导航 -->
    <div class="module-navigation">
      <button 
        class="module-btn"
        :class="{ active: activeModule === 'campus-training' }"
        @click="switchModule('campus-training')"
      >
        <span class="module-icon">🏫</span>
        <span>校园环境智能训练</span>
      </button>
      
      <button 
        class="module-btn"
        :class="{ active: activeModule === 'study-tour' }"
        @click="switchModule('study-tour')"
      >
        <span class="module-icon">🎒</span>
        <span>智能研学推送</span>
      </button>
      
      <button 
        class="module-btn"
        :class="{ active: activeModule === 'environment-training' }"
        @click="switchModule('environment-training')"
      >
        <span class="module-icon">🌟</span>
        <span>环境训练推送</span>
      </button>
    </div>

    <!-- 学校信息卡片 -->
    <div class="school-info-card">
      <div class="school-details">
        <h3>{{ currentSchool.name }}</h3>
        <p>📍 {{ currentSchool.city }} {{ currentSchool.district }}</p>
        <p>👥 学生年龄：{{ currentSchool.studentAgeRange.min }}-{{ currentSchool.studentAgeRange.max }}岁</p>
        <p>📚 当前年级：{{ currentSchool.currentGrade }}</p>
      </div>
    </div>
    
    <!-- 校园环境智能训练模块 -->
    <div v-if="activeModule === 'campus-training'" class="campus-training-module">
      <div class="module-header">
        <h2>🏫 校园环境智能训练</h2>
        <p>利用校园环境和师生关系智能推送适合不同年龄段学生的注意力训练、趣味小游戏等</p>
      </div>
      
      <div class="training-grid">
        <div 
          v-for="training in campusTrainings" 
          :key="training.id"
          class="training-card"
        >
          <div class="training-header">
            <div class="training-type">
              <span class="type-icon">{{ getTrainingTypeInfo(training.type).icon }}</span>
              <span 
                class="type-label"
                :style="{ 
                  color: getTrainingTypeInfo(training.type).color,
                  backgroundColor: getTrainingTypeInfo(training.type).bgColor
                }"
              >
                {{ getTrainingTypeInfo(training.type).text }}
              </span>
            </div>
            
            <div class="difficulty-badge">
              <span 
                class="difficulty-text"
                :style="{ 
                  color: getDifficultyInfo(training.difficulty).color,
                  backgroundColor: getDifficultyInfo(training.difficulty).bgColor
                }"
              >
                {{ getDifficultyInfo(training.difficulty).text }}
              </span>
            </div>
          </div>
          
          <div class="training-content">
            <h3 class="training-title">{{ training.name }}</h3>
            <p class="training-description">{{ training.description }}</p>
            
            <div class="training-info">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-icon">⏱️</span>
                  <span>{{ training.duration }}分钟</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">👥</span>
                  <span>{{ training.ageRange.min }}-{{ training.ageRange.max }}岁</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📍</span>
                  <span>{{ training.space }}</span>
                </div>
              </div>
            </div>
            
            <div class="training-benefits">
              <h5>训练收益：</h5>
              <div class="benefits-tags">
                <span 
                  v-for="benefit in training.benefits" 
                  :key="benefit"
                  class="benefit-tag"
                >
                  {{ benefit }}
                </span>
              </div>
            </div>
            
            <div class="training-equipment">
              <h5>所需器材：</h5>
              <div class="equipment-list">
                <span 
                  v-for="item in training.equipment.slice(0, 3)" 
                  :key="item"
                  class="equipment-item"
                >
                  {{ item }}
                </span>
                <span v-if="training.equipment.length > 3" class="more-equipment">
                  +{{ training.equipment.length - 3 }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="training-actions">
            <button class="action-btn start-btn">
              开始训练
            </button>
            <button class="action-btn detail-btn">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 环境训练推送模块 -->
    <div v-if="activeModule === 'environment-training'" class="environment-training-module">
      <div class="module-header">
        <h2>🌟 环境训练推送</h2>
        <p>上传训练环境，根据家庭环境训练推送适合的训练方案</p>
      </div>
      
      <div class="environment-grid">
        <div 
          v-for="environment in trainingEnvironments" 
          :key="environment.id"
          class="environment-card"
        >
          <div class="environment-header">
            <div class="environment-type">
              <span class="type-icon">{{ getEnvironmentTypeInfo(environment.type).icon }}</span>
              <span 
                class="type-label"
                :style="{ 
                  color: getEnvironmentTypeInfo(environment.type).color,
                  backgroundColor: getEnvironmentTypeInfo(environment.type).bgColor
                }"
              >
                {{ getEnvironmentTypeInfo(environment.type).text }}
              </span>
            </div>
            
            <div class="cost-badge">
              ¥{{ environment.cost }}
            </div>
          </div>
          
          <div class="environment-content">
            <h3 class="environment-title">{{ environment.name }}</h3>
            <p class="environment-description">{{ environment.description }}</p>
            
            <div class="environment-info">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-icon">⏱️</span>
                  <span>{{ environment.setupTime }}分钟布置</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📐</span>
                  <span>{{ environment.space }}</span>
                </div>
              </div>
            </div>
            
            <div class="suitable-for">
              <h5>适用对象：</h5>
              <div class="suitable-tags">
                <span 
                  v-for="item in environment.suitableFor" 
                  :key="item"
                  class="suitable-tag"
                >
                  {{ item }}
                </span>
              </div>
            </div>
            
            <div class="environment-activities">
              <h5>主要活动：</h5>
              <div class="activities-list">
                <span 
                  v-for="activity in environment.activities.slice(0, 3)" 
                  :key="activity"
                  class="activity-item"
                >
                  {{ activity }}
                </span>
                <span v-if="environment.activities.length > 3" class="more-activities">
                  +{{ environment.activities.length - 3 }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="environment-actions">
            <button class="action-btn setup-btn">
              配置环境
            </button>
            <button class="action-btn detail-btn">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 智能研学推送模块 -->
    <div v-if="activeModule === 'study-tour'" class="study-tour-module">
      <div class="module-header">
        <h2>🎒 智能研学推送</h2>
        <p>基于地理位置、交通安全、文化遗产、年龄适宜性智能推荐研学方案</p>
      </div>
      
      <!-- 智能推荐统计 -->
      <div class="statistics-grid">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.totalPlans }}</div>
            <div class="stat-label">推荐方案</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🛡️</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.avgSafety }}</div>
            <div class="stat-label">平均安全评分</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🚗</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.avgDistance }}km</div>
            <div class="stat-label">平均距离</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-number">¥{{ statistics.avgPrice }}</div>
            <div class="stat-label">平均费用</div>
          </div>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label>研学类型：</label>
            <div class="type-filters">
              <button 
                v-for="type in typeOptions" 
                :key="type.value"
                class="type-btn"
                :class="{ active: filterType === type.value }"
                @click="filterType = type.value"
              >
                <span class="type-icon">{{ type.icon }}</span>
                <span>{{ type.label }}</span>
              </button>
            </div>
          </div>
          
          <div class="sort-group">
            <label>排序方式：</label>
            <select v-model="sortBy" class="sort-select">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 研学方案列表 -->
      <div class="plans-grid">
        <div 
          v-for="plan in filteredPlans" 
          :key="plan.id"
          class="plan-card"
          @click="viewPlanDetail(plan)"
        >
          <div class="plan-header">
            <div class="plan-type">
              <span class="type-icon">{{ getTypeInfo(plan.type).icon }}</span>
              <span 
                class="type-label"
                :style="{ 
                  color: getTypeInfo(plan.type).color,
                  backgroundColor: getTypeInfo(plan.type).bgColor
                }"
              >
                {{ getTypeInfo(plan.type).text }}
              </span>
            </div>
            
            <div class="match-score">
              <span class="score-value">{{ plan.matchScore }}%</span>
              <span class="score-label">匹配度</span>
            </div>
          </div>
          
          <div class="plan-content">
            <h3 class="plan-title">{{ plan.title }}</h3>
            <p class="plan-description">{{ plan.description }}</p>
            
            <div class="plan-info">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-icon">🕒</span>
                  <span>{{ plan.duration }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🚗</span>
                  <span>{{ plan.totalDistance }}km</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">💰</span>
                  <span>¥{{ plan.totalPrice }}</span>
                </div>
              </div>
              
              <div class="info-row">
                <div class="info-item">
                  <span class="info-icon">👥</span>
                  <span>{{ plan.targetAge }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🛡️</span>
                  <span :style="{ color: getSafetyRating(plan.safetyScore).color }">
                    {{ getSafetyRating(plan.safetyScore).text }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📍</span>
                  <span>{{ plan.locations.length }}个地点</span>
                </div>
              </div>
            </div>
            
            <div class="sensory-benefits">
              <h5>感统收益：</h5>
              <div class="benefits-tags">
                <span 
                  v-for="benefit in plan.sensoryBenefits.slice(0, 3)" 
                  :key="benefit"
                  class="benefit-tag"
                >
                  {{ benefit }}
                </span>
                <span v-if="plan.sensoryBenefits.length > 3" class="more-benefits">
                  +{{ plan.sensoryBenefits.length - 3 }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="plan-actions">
            <button class="action-btn view-btn" @click.stop="viewPlanDetail(plan)">
              查看详情
            </button>
            <button class="action-btn book-btn" @click.stop="bookStudyTour(plan)">
              立即预约
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 方案详情弹窗 -->
    <div v-if="showPlanDetail" class="modal-overlay" @click="closeModal">
      <div class="plan-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>研学方案详情</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div v-if="selectedPlan" class="modal-content">
          <div class="plan-detail-header">
            <div class="type-info">
              <span class="type-icon large">{{ getTypeInfo(selectedPlan.type).icon }}</span>
              <div class="type-details">
                <h3>{{ selectedPlan.title }}</h3>
                <span 
                  class="type-label"
                  :style="{ 
                    color: getTypeInfo(selectedPlan.type).color,
                    backgroundColor: getTypeInfo(selectedPlan.type).bgColor
                  }"
                >
                  {{ getTypeInfo(selectedPlan.type).text }}
                </span>
              </div>
            </div>
            
            <div class="match-info">
              <div class="match-score large">{{ selectedPlan.matchScore }}%</div>
              <div class="match-label">智能匹配度</div>
            </div>
          </div>
          
          <div class="plan-description-full">
            <p>{{ selectedPlan.description }}</p>
          </div>
          
          <div class="modal-actions">
            <button class="action-btn book-btn large" @click="bookStudyTour(selectedPlan)">
              立即预约此方案
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.school-container {
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

/* 模块导航 */
.module-navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.module-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.module-btn:hover {
  border-color: #42b883;
  color: #42b883;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.2);
}

.module-btn.active {
  border-color: #42b883;
  background: #42b883;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.module-icon {
  font-size: 2rem;
}

/* 学校信息卡片 */
.school-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;
}

.school-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.school-details p {
  margin: 0 0 0.25rem 0;
  opacity: 0.9;
}

/* 模块头部 */
.module-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.module-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.module-header p {
  margin: 0;
  opacity: 0.9;
}

/* 校园训练模块样式 */
.training-grid,
.environment-grid,
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.training-card,
.environment-card,
.plan-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.training-card:hover,
.environment-card:hover,
.plan-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.training-header,
.environment-header,
.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.training-type,
.environment-type,
.plan-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-label {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.difficulty-badge .difficulty-text,
.cost-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.cost-badge {
  background: #e3f2fd;
  color: #2196f3;
  font-size: 0.9rem;
}

.match-score {
  text-align: right;
}

.score-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #42b883;
  display: block;
}

.score-label {
  font-size: 0.8rem;
  color: #666;
}

.training-content,
.environment-content,
.plan-content {
  padding: 1.5rem;
}

.training-title,
.environment-title,
.plan-title {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.training-description,
.environment-description,
.plan-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.training-info,
.environment-info,
.plan-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #666;
}

.info-icon {
  font-size: 0.9rem;
}

.training-benefits,
.training-equipment,
.suitable-for,
.environment-activities,
.sensory-benefits {
  margin-bottom: 1rem;
}

.training-benefits h5,
.training-equipment h5,
.suitable-for h5,
.environment-activities h5,
.sensory-benefits h5 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.benefits-tags,
.equipment-list,
.suitable-tags,
.activities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.benefit-tag,
.equipment-item {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.suitable-tag,
.activity-item {
  background: #fff3e0;
  color: #ff9800;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.more-equipment,
.more-activities,
.more-benefits {
  background: #f0f0f0;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.training-actions,
.environment-actions,
.plan-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
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

.start-btn {
  background: #42b883;
  color: white;
}

.start-btn:hover {
  background: #369870;
}

.setup-btn {
  background: #ff9800;
  color: white;
}

.setup-btn:hover {
  background: #f57c00;
}

.view-btn {
  background: #e3f2fd;
  color: #2196f3;
}

.view-btn:hover {
  background: #bbdefb;
}

.book-btn {
  background: #42b883;
  color: white;
}

.book-btn:hover {
  background: #369870;
}

.detail-btn {
  background: #f0f0f0;
  color: #666;
}

.detail-btn:hover {
  background: #e0e0e0;
}

/* 统计信息 */
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
  font-size: 2rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
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
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group label,
.sort-group label {
  color: #2c3e50;
  font-weight: 500;
  margin-right: 0.5rem;
}

.type-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-btn:hover {
  border-color: #42b883;
  color: #42b883;
}

.type-btn.active {
  border-color: #42b883;
  background: #42b883;
  color: white;
}

.type-icon {
  font-size: 1rem;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
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

.plan-detail-modal {
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

.plan-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.type-icon.large {
  font-size: 2.5rem;
}

.type-details h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.match-info {
  text-align: center;
}

.match-score.large {
  font-size: 2rem;
  font-weight: bold;
  color: #42b883;
}

.match-label {
  color: #666;
  font-size: 0.9rem;
}

.plan-description-full {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.plan-description-full p {
  margin: 0;
  line-height: 1.6;
  color: #2c3e50;
}

.modal-actions {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;
}

.book-btn.large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .school-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .module-navigation {
    flex-direction: column;
  }
  
  .module-btn {
    min-width: auto;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .type-filters {
    justify-content: center;
  }
  
  .training-grid,
  .environment-grid,
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-detail-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .info-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
