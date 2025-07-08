<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 感统训练模块接口
interface TrainingModule {
  id: number
  name: string
  type: 'vestibular' | 'proprioceptive' | 'tactile' | 'visual' | 'auditory' | 'coordination'
  description: string
  icon: string
  color: string
  bgColor: string
  duration: number // 游戏时长（分钟）
  difficulty: 'easy' | 'medium' | 'hard'
  ageRange: {
    min: number
    max: number
  }
  skills: string[]
  assessmentCriteria: string[]
  gameInstructions: string[]
  equipment: string[]
  isCompleted: boolean
  lastScore?: number
  personalizedTraining?: PersonalizedTraining
}

// 个性化训练接口
interface PersonalizedTraining {
  id: number
  moduleId: number
  childProfile: ChildProfile
  assessmentResult: AssessmentResult
  trainingPlan: TrainingPlan
  progress: TrainingProgress[]
  recommendations: string[]
  nextSession?: Date
}

// 儿童档案接口
interface ChildProfile {
  id: number
  name: string
  age: number
  gender: 'male' | 'female'
  avatar: string
  strengths: string[]
  challenges: string[]
  preferences: string[]
}

// 评估结果接口
interface AssessmentResult {
  moduleId: number
  score: number
  weakAreas: string[]
  strongAreas: string[]
  recommendations: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  timestamp: string
}

// 训练计划接口
interface TrainingPlan {
  id: number
  name: string
  exercises: Exercise[]
  frequency: string
  duration: number
  goals: string[]
}

// 训练练习接口
interface Exercise {
  id: number
  name: string
  description: string
  duration: number
  instructions: string[]
  visualAids: string[]
  adaptations: string[]
}

// 训练进度接口
interface TrainingProgress {
  date: string
  score: number
  timeSpent: number
  completed: boolean
  notes: string
  improvements: string[]
}

// 游戏状态接口
interface GameState {
  isPlaying: boolean
  currentModule: TrainingModule | null
  timeRemaining: number
  score: number
  level: number
  isAssessment: boolean
}

// 当前儿童档案
const currentChild = ref<ChildProfile>({
  id: 1,
  name: '小明',
  age: 6,
  gender: 'male',
  avatar: '/api/placeholder/80/80',
  strengths: ['视觉注意力', '大动作协调'],
  challenges: ['平衡感', '精细动作'],
  preferences: ['音乐游戏', '颜色识别']
})

// 感统训练模块数据
const trainingModules = ref<TrainingModule[]>([
  {
    id: 1,
    name: '前庭觉平衡训练',
    type: 'vestibular',
    description: '通过平衡、旋转和摇摆动作训练前庭觉，提升身体平衡和空间感知能力。',
    icon: '⚖️',
    color: '#2196f3',
    bgColor: '#e3f2fd',
    duration: 4,
    difficulty: 'medium',
    ageRange: { min: 4, max: 12 },
    skills: ['平衡感', '空间感知', '身体协调', '姿势控制'],
    assessmentCriteria: ['单脚站立时间', '平衡木行走', '旋转后平衡恢复', '眼球追踪稳定性'],
    gameInstructions: [
      '游戏开始前先进行简单的平衡测试',
      '根据屏幕提示做相应的平衡动作',
      '保持动作稳定，避免晃动',
      '完成指定时间后进入下一关'
    ],
    equipment: ['平衡垫', '手机或平板'],
    isCompleted: false
  },
  {
    id: 2,
    name: '本体觉身体意识',
    type: 'proprioceptive',
    description: '增强对身体位置和肌肉张力的感知，提升精细动作和大动作技能。',
    icon: '🤸',
    color: '#4caf50',
    bgColor: '#e8f5e8',
    duration: 3,
    difficulty: 'easy',
    ageRange: { min: 3, max: 10 },
    skills: ['身体意识', '肌肉控制', '动作计划', '空间定位'],
    assessmentCriteria: ['动作模仿准确性', '肌肉张力控制', '身体部位识别', '动作协调性'],
    gameInstructions: [
      '观察屏幕上的动作示范',
      '模仿做出相同的身体动作',
      '注意动作的准确性和流畅性',
      '根据提示调整动作幅度'
    ],
    equipment: ['舒适的活动空间'],
    isCompleted: true,
    lastScore: 85
  },
  {
    id: 3,
    name: '触觉敏感度训练',
    type: 'tactile',
    description: '通过不同材质和温度的触觉刺激，改善触觉敏感或触觉迟钝问题。',
    icon: '✋',
    color: '#ff9800',
    bgColor: '#fff3e0',
    duration: 3,
    difficulty: 'easy',
    ageRange: { min: 2, max: 8 },
    skills: ['触觉辨别', '材质识别', '压力感知', '温度感知'],
    assessmentCriteria: ['材质辨别准确性', '触觉反应适当性', '触觉探索主动性', '触觉防御反应'],
    gameInstructions: [
      '准备不同材质的小物品',
      '根据游戏提示触摸相应物品',
      '描述触摸的感受',
      '完成触觉探索任务'
    ],
    equipment: ['触觉材料包', '不同材质物品'],
    isCompleted: false
  },
  {
    id: 4,
    name: '视觉追踪与专注',
    type: 'visual',
    description: '训练视觉注意力、眼球追踪和视觉-动作协调能力。',
    icon: '👁️',
    color: '#9c27b0',
    bgColor: '#f3e5f5',
    duration: 4,
    difficulty: 'medium',
    ageRange: { min: 4, max: 12 },
    skills: ['视觉注意力', '眼球追踪', '视觉记忆', '视觉辨别'],
    assessmentCriteria: ['视觉追踪流畅性', '注意力持续时间', '视觉记忆准确性', '视觉-动作协调'],
    gameInstructions: [
      '眼睛跟随屏幕上移动的目标',
      '点击指定的视觉目标',
      '记住并重复视觉序列',
      '在规定时间内完成视觉任务'
    ],
    equipment: ['平板或手机', '良好光线环境'],
    isCompleted: true,
    lastScore: 92
  },
  {
    id: 5,
    name: '听觉处理与记忆',
    type: 'auditory',
    description: '提升听觉注意力、听觉记忆和听觉辨别能力。',
    icon: '👂',
    color: '#f44336',
    bgColor: '#ffebee',
    duration: 3,
    difficulty: 'easy',
    ageRange: { min: 3, max: 10 },
    skills: ['听觉注意力', '听觉记忆', '声音辨别', '听觉-动作协调'],
    assessmentCriteria: ['声音辨别准确性', '听觉记忆长度', '听觉注意力', '听觉-动作反应'],
    gameInstructions: [
      '仔细听游戏中的声音指令',
      '按照听到的顺序重复动作',
      '识别并分类不同的声音',
      '根据音乐节拍做动作'
    ],
    equipment: ['耳机或音响', '安静环境'],
    isCompleted: false
  },
  {
    id: 6,
    name: '双侧协调与手眼配合',
    type: 'coordination',
    description: '训练双手协调、手眼配合和精细动作技能。',
    icon: '🙌',
    color: '#607d8b',
    bgColor: '#eceff1',
    duration: 4,
    difficulty: 'hard',
    ageRange: { min: 5, max: 12 },
    skills: ['双手协调', '手眼配合', '精细动作', '节奏感'],
    assessmentCriteria: ['双手协调性', '手眼配合准确性', '精细动作控制', '动作节奏感'],
    gameInstructions: [
      '同时使用双手完成指定动作',
      '根据屏幕提示做手眼配合练习',
      '保持动作的节奏和准确性',
      '逐步提高动作的复杂度'
    ],
    equipment: ['平板触屏', '小物品操作'],
    isCompleted: false
  }
])

// 游戏状态
const gameState = ref<GameState>({
  isPlaying: false,
  currentModule: null,
  timeRemaining: 0,
  score: 0,
  level: 1,
  isAssessment: false
})

// 选中的模块
const selectedModule = ref<TrainingModule | null>(null)
const showModuleDetail = ref(false)
const showGameInterface = ref(false)
const gameTimer = ref<NodeJS.Timeout | null>(null)

// 筛选状态
const filterType = ref('all')
const filterDifficulty = ref('all')
const filterCompleted = ref('all')

// 筛选选项
const typeOptions = [
  { value: 'all', label: '全部类型', icon: '🎯' },
  { value: 'vestibular', label: '前庭觉', icon: '⚖️' },
  { value: 'proprioceptive', label: '本体觉', icon: '🤸' },
  { value: 'tactile', label: '触觉', icon: '✋' },
  { value: 'visual', label: '视觉', icon: '👁️' },
  { value: 'auditory', label: '听觉', icon: '👂' },
  { value: 'coordination', label: '协调', icon: '🙌' }
]

const difficultyOptions = [
  { value: 'all', label: '全部难度' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' }
]

const completedOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'completed', label: '已完成' },
  { value: 'uncompleted', label: '未完成' }
]

// 过滤后的模块列表
const filteredModules = computed(() => {
  return trainingModules.value.filter(module => {
    const typeMatch = filterType.value === 'all' || module.type === filterType.value
    const difficultyMatch = filterDifficulty.value === 'all' || module.difficulty === filterDifficulty.value
    const completedMatch = filterCompleted.value === 'all' || 
      (filterCompleted.value === 'completed' && module.isCompleted) ||
      (filterCompleted.value === 'uncompleted' && !module.isCompleted)
    
    return typeMatch && difficultyMatch && completedMatch
  })
})

// 统计数据
const statistics = computed(() => {
  const total = trainingModules.value.length
  const completed = trainingModules.value.filter(m => m.isCompleted).length
  const averageScore = trainingModules.value
    .filter(m => m.lastScore)
    .reduce((sum, m) => sum + (m.lastScore || 0), 0) / 
    trainingModules.value.filter(m => m.lastScore).length || 0
  
  return {
    total,
    completed,
    uncompleted: total - completed,
    averageScore: Math.round(averageScore)
  }
})

// 获取难度信息
const getDifficultyInfo = (difficulty: string) => {
  const difficultyMap = {
    easy: { text: '简单', color: '#4caf50', bgColor: '#e8f5e8' },
    medium: { text: '中等', color: '#ff9800', bgColor: '#fff3e0' },
    hard: { text: '困难', color: '#f44336', bgColor: '#ffebee' }
  }
  return difficultyMap[difficulty as keyof typeof difficultyMap] || { text: difficulty, color: '#666', bgColor: '#f0f0f0' }
}

// 查看模块详情
const viewModuleDetail = (module: TrainingModule) => {
  selectedModule.value = module
  showModuleDetail.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModuleDetail.value = false
  showGameInterface.value = false
  selectedModule.value = null
  stopGame()
}

// 开始训练
const startTraining = (module: TrainingModule, isAssessment = false) => {
  selectedModule.value = module
  gameState.value = {
    isPlaying: true,
    currentModule: module,
    timeRemaining: module.duration * 60, // 转换为秒
    score: 0,
    level: 1,
    isAssessment
  }
  showGameInterface.value = true
  startGameTimer()
}

// 开始游戏计时器
const startGameTimer = () => {
  gameTimer.value = setInterval(() => {
    if (gameState.value.timeRemaining > 0) {
      gameState.value.timeRemaining--
    } else {
      endGame()
    }
  }, 1000)
}

// 停止游戏
const stopGame = () => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
    gameTimer.value = null
  }
  gameState.value.isPlaying = false
}

// 结束游戏
const endGame = () => {
  stopGame()
  
  if (selectedModule.value) {
    // 更新模块完成状态和分数
    selectedModule.value.isCompleted = true
    selectedModule.value.lastScore = gameState.value.score
    
    // 模拟生成个性化训练计划
    generatePersonalizedTraining(selectedModule.value, gameState.value.score)
  }
  
  alert(`训练完成！\n得分：${gameState.value.score}\n根据您的表现，我们已为您生成个性化训练计划。`)
  closeModal()
}

// 生成个性化训练计划
const generatePersonalizedTraining = (module: TrainingModule, score: number) => {
  const weakAreas: string[] = []
  const strongAreas: string[] = []
  const recommendations: string[] = []
  
  // 基于分数分析强弱项
  if (score < 60) {
    weakAreas.push(...module.skills.slice(0, 2))
    recommendations.push('建议增加基础训练频次', '可以降低训练难度', '需要更多的辅助和鼓励')
  } else if (score < 80) {
    weakAreas.push(module.skills[0])
    strongAreas.push(module.skills[1])
    recommendations.push('保持当前训练强度', '可以适当增加挑战性', '重点关注薄弱环节')
  } else {
    strongAreas.push(...module.skills)
    recommendations.push('可以提高训练难度', '尝试更复杂的变化', '考虑挑战更高级别')
  }
  
  // 模拟个性化训练计划
  module.personalizedTraining = {
    id: Date.now(),
    moduleId: module.id,
    childProfile: currentChild.value,
    assessmentResult: {
      moduleId: module.id,
      score,
      weakAreas,
      strongAreas,
      recommendations,
      difficulty: score > 80 ? 'hard' : score > 60 ? 'medium' : 'easy',
      timestamp: new Date().toISOString()
    },
    trainingPlan: {
      id: Date.now(),
      name: `${module.name} - 个性化计划`,
      exercises: generateExercises(module, score),
      frequency: score > 80 ? '每日1次' : '每日2次',
      duration: module.duration,
      goals: [`提升${module.skills[0]}`, `改善${module.skills[1]}`]
    },
    progress: [],
    recommendations,
    nextSession: new Date(Date.now() + 24 * 60 * 60 * 1000) // 明天
  }
}

// 生成训练练习
const generateExercises = (module: TrainingModule, score: number): Exercise[] => {
  const baseExercises: Exercise[] = [
    {
      id: 1,
      name: `基础${module.name}练习`,
      description: `针对${module.skills[0]}的基础训练`,
      duration: 60,
      instructions: module.gameInstructions,
      visualAids: ['示范视频', '图片指导'],
      adaptations: score < 60 ? ['降低难度', '增加提示', '延长时间'] : []
    },
    {
      id: 2,
      name: `进阶${module.name}练习`,
      description: `针对${module.skills[1]}的进阶训练`,
      duration: 90,
      instructions: ['在基础练习基础上增加复杂度', '提高动作精确度'],
      visualAids: ['进阶示范', '对比图例'],
      adaptations: score > 80 ? ['增加难度', '减少提示', '缩短时间'] : []
    }
  ]
  
  return baseExercises
}

// 格式化时间
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 模拟游戏操作
const simulateGameAction = () => {
  if (gameState.value.isPlaying) {
    gameState.value.score += Math.floor(Math.random() * 10) + 5
  }
}

// 清理定时器
onUnmounted(() => {
  stopGame()
})
</script>

<template>
  <div class="training-base-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>感统训练基地</h1>
      <p class="header-desc">家庭版感统小游戏，个性化定制训练方案</p>
    </div>

    <!-- 儿童档案卡片 -->
    <div class="child-profile-card">
      <div class="child-info">
        <div class="child-avatar">{{ currentChild.name.charAt(0) }}</div>
        <div class="child-details">
          <h3>{{ currentChild.name }}</h3>
          <p>年龄：{{ currentChild.age }}岁 | 性别：{{ currentChild.gender === 'male' ? '男' : '女' }}</p>
          <div class="child-tags">
            <span class="strength-tag" v-for="strength in currentChild.strengths" :key="strength">
              💪 {{ strength }}
            </span>
            <span class="challenge-tag" v-for="challenge in currentChild.challenges" :key="challenge">
              🎯 {{ challenge }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练统计 -->
    <div class="statistics-grid">
      <div class="stat-card">
        <div class="stat-icon">🎮</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.total }}</div>
          <div class="stat-label">训练模块</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.uncompleted }}</div>
          <div class="stat-label">待完成</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.averageScore || 0 }}</div>
          <div class="stat-label">平均得分</div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>训练类型：</label>
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
        
        <div class="filter-group">
          <label>难度：</label>
          <select v-model="filterDifficulty" class="filter-select">
            <option v-for="option in difficultyOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          
          <label>状态：</label>
          <select v-model="filterCompleted" class="filter-select">
            <option v-for="option in completedOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 训练模块网格 -->
    <div class="modules-grid">
      <div 
        v-for="module in filteredModules" 
        :key="module.id"
        class="module-card"
        :class="{ completed: module.isCompleted }"
      >
        <div class="module-header">
          <div class="module-type">
            <span class="type-icon large">{{ module.icon }}</span>
            <span 
              class="type-label"
              :style="{ 
                color: module.color,
                backgroundColor: module.bgColor
              }"
            >
              {{ module.name }}
            </span>
          </div>
          
          <div class="module-status">
            <span v-if="module.isCompleted" class="completed-badge">
              ✅ 已完成
            </span>
            <span v-else class="pending-badge">
              ⏳ 待完成
            </span>
          </div>
        </div>
        
        <div class="module-content">
          <p class="module-description">{{ module.description }}</p>
          
          <div class="module-info">
            <div class="info-row">
              <div class="info-item">
                <span class="info-icon">⏱️</span>
                <span>{{ module.duration }}分钟</span>
              </div>
              <div class="info-item">
                <span class="info-icon">👥</span>
                <span>{{ module.ageRange.min }}-{{ module.ageRange.max }}岁</span>
              </div>
              <div class="info-item">
                <span 
                  class="difficulty-badge"
                  :style="{ 
                    color: getDifficultyInfo(module.difficulty).color,
                    backgroundColor: getDifficultyInfo(module.difficulty).bgColor
                  }"
                >
                  {{ getDifficultyInfo(module.difficulty).text }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="module-skills">
            <h5>训练技能：</h5>
            <div class="skills-tags">
              <span 
                v-for="skill in module.skills.slice(0, 3)" 
                :key="skill"
                class="skill-tag"
              >
                {{ skill }}
              </span>
              <span v-if="module.skills.length > 3" class="more-skills">
                +{{ module.skills.length - 3 }}
              </span>
            </div>
          </div>
          
          <div v-if="module.isCompleted && module.lastScore" class="module-score">
            <span class="score-label">上次得分：</span>
            <span class="score-value">{{ module.lastScore }}</span>
          </div>
        </div>
        
        <div class="module-actions">
          <button class="action-btn detail-btn" @click="viewModuleDetail(module)">
            查看详情
          </button>
          <button class="action-btn assessment-btn" @click="startTraining(module, true)">
            能力评估
          </button>
          <button class="action-btn training-btn" @click="startTraining(module, false)">
            开始训练
          </button>
        </div>
      </div>
    </div>

    <!-- 模块详情弹窗 -->
    <div v-if="showModuleDetail" class="modal-overlay" @click="closeModal">
      <div class="module-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>训练模块详情</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div v-if="selectedModule" class="modal-content">
          <div class="module-detail-header">
            <div class="module-info-section">
              <span class="type-icon huge">{{ selectedModule.icon }}</span>
              <div class="module-details">
                <h3>{{ selectedModule.name }}</h3>
                <p>{{ selectedModule.description }}</p>
                <div class="module-meta">
                  <span class="meta-item">🕒 {{ selectedModule.duration }}分钟</span>
                  <span class="meta-item">👥 {{ selectedModule.ageRange.min }}-{{ selectedModule.ageRange.max }}岁</span>
                  <span 
                    class="meta-item difficulty"
                    :style="{ 
                      color: getDifficultyInfo(selectedModule.difficulty).color,
                      backgroundColor: getDifficultyInfo(selectedModule.difficulty).bgColor
                    }"
                  >
                    {{ getDifficultyInfo(selectedModule.difficulty).text }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="detail-sections">
            <!-- 训练技能 -->
            <div class="detail-section">
              <h4>🎯 训练技能</h4>
              <div class="skills-grid">
                <span 
                  v-for="skill in selectedModule.skills" 
                  :key="skill"
                  class="skill-item"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
            
            <!-- 评估标准 -->
            <div class="detail-section">
              <h4>📊 评估标准</h4>
              <ul class="criteria-list">
                <li v-for="criteria in selectedModule.assessmentCriteria" :key="criteria">
                  {{ criteria }}
                </li>
              </ul>
            </div>
            
            <!-- 游戏说明 -->
            <div class="detail-section">
              <h4>🎮 游戏说明</h4>
              <ol class="instructions-list">
                <li v-for="instruction in selectedModule.gameInstructions" :key="instruction">
                  {{ instruction }}
                </li>
              </ol>
            </div>
            
            <!-- 所需设备 -->
            <div class="detail-section">
              <h4>🛠️ 所需设备</h4>
              <div class="equipment-grid">
                <span 
                  v-for="equipment in selectedModule.equipment" 
                  :key="equipment"
                  class="equipment-item"
                >
                  {{ equipment }}
                </span>
              </div>
            </div>
            
            <!-- 个性化训练计划 -->
            <div v-if="selectedModule.personalizedTraining" class="detail-section">
              <h4>🎯 个性化训练计划</h4>
              <div class="training-plan">
                <div class="plan-header">
                  <h5>{{ selectedModule.personalizedTraining.trainingPlan.name }}</h5>
                  <span class="plan-frequency">{{ selectedModule.personalizedTraining.trainingPlan.frequency }}</span>
                </div>
                <div class="plan-recommendations">
                  <h6>训练建议：</h6>
                  <ul>
                    <li v-for="rec in selectedModule.personalizedTraining.recommendations" :key="rec">
                      {{ rec }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="action-btn assessment-btn large" @click="startTraining(selectedModule, true)">
              开始能力评估
            </button>
            <button class="action-btn training-btn large" @click="startTraining(selectedModule, false)">
              开始训练游戏
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏界面弹窗 -->
    <div v-if="showGameInterface" class="modal-overlay game-overlay">
      <div class="game-interface" @click.stop>
        <div class="game-header">
          <div class="game-info">
            <h3>{{ gameState.currentModule?.name }}</h3>
            <span class="game-type">{{ gameState.isAssessment ? '能力评估' : '训练游戏' }}</span>
          </div>
          <div class="game-controls">
            <div class="timer">⏱️ {{ formatTime(gameState.timeRemaining) }}</div>
            <div class="score">🎯 {{ gameState.score }}</div>
            <button class="close-btn" @click="closeModal">×</button>
          </div>
        </div>
        
        <div class="game-content">
          <div class="game-area">
            <div class="game-instructions">
              <h4>游戏说明：</h4>
              <ul>
                <li v-for="instruction in gameState.currentModule?.gameInstructions" :key="instruction">
                  {{ instruction }}
                </li>
              </ul>
            </div>
            
            <div class="game-simulator">
              <div class="simulator-content">
                <p>🎮 游戏模拟界面</p>
                <p>根据{{ gameState.currentModule?.name }}的要求进行相应训练</p>
                <button class="game-action-btn" @click="simulateGameAction">
                  {{ gameState.isAssessment ? '完成评估动作' : '执行训练动作' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="game-footer">
          <button class="action-btn pause-btn" @click="stopGame">暂停游戏</button>
          <button class="action-btn end-btn" @click="endGame">结束游戏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.training-base-container {
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

/* 儿童档案卡片 */
.child-profile-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;
}

.child-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.child-avatar {
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

.child-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.child-details p {
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.child-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.strength-tag,
.challenge-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  backdrop-filter: blur(10px);
}

.strength-tag {
  background: rgba(76, 175, 80, 0.3);
}

.challenge-tag {
  background: rgba(255, 152, 0, 0.3);
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
  flex-direction: column;
  gap: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group label {
  color: #2c3e50;
  font-weight: 500;
  min-width: 80px;
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

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  margin-right: 1rem;
}

/* 模块网格 */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.module-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.module-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.module-card.completed {
  border-left-color: #4caf50;
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.module-type {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.type-icon.large {
  font-size: 2rem;
}

.type-label {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 1rem;
}

.module-status span {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.completed-badge {
  background: #e8f5e8;
  color: #4caf50;
}

.pending-badge {
  background: #fff3e0;
  color: #ff9800;
}

.module-content {
  padding: 1.5rem;
}

.module-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.module-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #666;
}

.info-icon {
  font-size: 1rem;
}

.difficulty-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.module-skills {
  margin-bottom: 1rem;
}

.module-skills h5 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.skill-tag {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.more-skills {
  background: #f0f0f0;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.module-score {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f0f8ff;
  border-radius: 8px;
  text-align: center;
}

.score-label {
  color: #666;
  font-size: 0.9rem;
}

.score-value {
  color: #2196f3;
  font-size: 1.2rem;
  font-weight: bold;
  margin-left: 0.5rem;
}

.module-actions {
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

.detail-btn {
  background: #e3f2fd;
  color: #2196f3;
}

.detail-btn:hover {
  background: #bbdefb;
}

.assessment-btn {
  background: #fff3e0;
  color: #ff9800;
}

.assessment-btn:hover {
  background: #ffe0b2;
}

.training-btn {
  background: #42b883;
  color: white;
}

.training-btn:hover {
  background: #369870;
}

.action-btn.large {
  padding: 1rem 2rem;
  font-size: 1rem;
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

.game-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.module-detail-modal,
.game-interface {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.game-interface {
  max-width: 1000px;
  max-height: 95vh;
}

.modal-header,
.game-header {
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

.game-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.game-type {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.game-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timer,
.score {
  background: #f0f8ff;
  color: #2196f3;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
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

.modal-content,
.game-content {
  padding: 1.5rem;
}

/* 模块详情 */
.module-detail-header {
  margin-bottom: 2rem;
}

.module-info-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.type-icon.huge {
  font-size: 3rem;
}

.module-details h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.module-details p {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.6;
}

.module-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  padding: 0.25rem 0.5rem;
  background: #e0e0e0;
  border-radius: 8px;
  font-size: 0.8rem;
}

.meta-item.difficulty {
  font-weight: 500;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 2px solid #42b883;
  padding-bottom: 0.5rem;
}

.skills-grid,
.equipment-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-item,
.equipment-item {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.3rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.criteria-list,
.instructions-list {
  margin: 0;
  padding-left: 1.5rem;
}

.criteria-list li,
.instructions-list li {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.training-plan {
  background: #f0f8ff;
  padding: 1rem;
  border-radius: 8px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.plan-header h5 {
  margin: 0;
  color: #2c3e50;
}

.plan-frequency {
  background: #42b883;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.plan-recommendations h6 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

/* 游戏界面 */
.game-area {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.game-instructions h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.game-instructions ul {
  margin: 0 0 2rem 0;
  padding-left: 1.5rem;
}

.game-instructions li {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.game-simulator {
  background: white;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.simulator-content p {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.game-action-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.game-action-btn:hover {
  background: #369870;
}

.game-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.pause-btn {
  background: #ff9800;
  color: white;
}

.pause-btn:hover {
  background: #f57c00;
}

.end-btn {
  background: #f44336;
  color: white;
}

.end-btn:hover {
  background: #d32f2f;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .training-base-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .child-info {
    flex-direction: column;
    text-align: center;
  }
  
  .statistics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .filters-row {
    gap: 1rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .type-filters {
    justify-content: center;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .module-actions {
    flex-direction: column;
  }
  
  .module-info-section {
    flex-direction: column;
    text-align: center;
  }
  
  .game-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .game-footer {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>