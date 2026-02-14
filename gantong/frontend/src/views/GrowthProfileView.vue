<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createChild,
  createHealthRecord,
  deleteHealthRecord,
  getProfile,
  listChildren,
  listHealthRecords,
  updateHealthRecord,
  upsertProfile,
  type ChildItem,
  type HealthRecord,
} from '@/services/growth'

type Gender = '男' | '女' | '未知'

interface GrowthMilestone {
  age: string
  milestone: string
  achieved: boolean
  achievedDate?: string
  notes?: string
}

interface CurrentStatus {
  physicalDevelopment: {
    height: number | null
    weight: number | null
    lastUpdated: string | null
  }
  behaviorObservation: {
    strengths: string[]
    challenges: string[]
    improvements: string[]
  }
  dailySkills: {
    selfCare: number
    communication: number
    social: number
    motor: number
  }
}

const emptyStatus = (): CurrentStatus => ({
  physicalDevelopment: { height: null, weight: null, lastUpdated: null },
  behaviorObservation: { strengths: [], challenges: [], improvements: [] },
  dailySkills: { selfCare: 0, communication: 0, social: 0, motor: 0 },
})

const child = ref<ChildItem | null>(null)
const children = ref<ChildItem[]>([])
const selectedChildId = ref<number | null>(null)
const creatingChild = ref(false)

const newChild = ref<{ name: string; gender: Gender; birthDate: string }>({
  name: '',
  gender: '未知',
  birthDate: '',
})

const growthMilestones = ref<GrowthMilestone[]>([
  {
    age: '0-3个月',
    milestone: '可抬头、会微笑、能追视物体',
    achieved: true,
    achievedDate: '2019-05-20',
    notes: '发育正常',
  },
  {
    age: '4-6个月',
    milestone: '会翻身、可扶坐、主动抓握玩具',
    achieved: true,
    achievedDate: '2019-08-10',
    notes: '平衡能力较好',
  },
  {
    age: '7-12个月',
    milestone: '会爬行、可站立、发出简单音节',
    achieved: true,
    achievedDate: '2020-01-15',
    notes: '语言能力稳步提升',
  },
  {
    age: '1-2岁',
    milestone: '可独立行走并开始简单表达',
    achieved: true,
    achievedDate: '2020-10-30',
    notes: '大运动发育稳定',
  },
  {
    age: '2-3岁',
    milestone: '会跑跳并进行简单独立游戏',
    achieved: true,
    achievedDate: '2021-12-20',
    notes: '仍需持续协调训练',
  },
  {
    age: '3-4岁',
    milestone: '可骑三轮车并表达完整句子',
    achieved: true,
    achievedDate: '2023-02-10',
    notes: '注意力仍需支持',
  },
  {
    age: '4-5岁',
    milestone: '可单脚跳并遵守活动规则',
    achieved: false,
    notes: '继续进行平衡专项练习',
  },
  {
    age: '5-6岁',
    milestone: '可骑自行车并进行早期书写练习',
    achieved: false,
    notes: '纳入下一阶段训练计划',
  },
])

const healthRecords = ref<HealthRecord[]>([])
const currentStatus = ref<CurrentStatus>(emptyStatus())
const strengthsText = ref('')
const challengesText = ref('')
const improvementsText = ref('')
const activeTab = ref('overview')
const editMode = ref(false)
const saving = ref(false)

const profileStats = computed(() => {
  const achieved = growthMilestones.value.filter((m) => m.achieved).length
  return {
    childCount: children.value.length,
    milestonesAchieved: achieved,
    milestonesTotal: growthMilestones.value.length,
    healthRecordCount: healthRecords.value.length,
  }
})

const bmiValue = computed(() => {
  const h = currentStatus.value.physicalDevelopment.height
  const w = currentStatus.value.physicalDevelopment.weight
  if (!h || !w) return null
  const m = h / 100
  if (!m) return null
  const v = w / (m * m)
  if (!Number.isFinite(v)) return null
  return Math.round(v * 10) / 10
})

const calculateAge = (birthDate: string) => {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const now = new Date()
  const ageInMs = now.getTime() - birth.getTime()
  const years = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
  return `${years}岁${months}个月`
}

const getSkillLevel = (score: number) => {
  if (score >= 90) return { text: '优秀', color: '#4caf50' }
  if (score >= 75) return { text: '良好', color: '#8bc34a' }
  if (score >= 60) return { text: '一般', color: '#ff9800' }
  return { text: '需提升', color: '#f44336' }
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (editMode.value) {
    strengthsText.value = currentStatus.value.behaviorObservation.strengths.join(', ')
    challengesText.value = currentStatus.value.behaviorObservation.challenges.join(', ')
    improvementsText.value = currentStatus.value.behaviorObservation.improvements.join(', ')
  }
}

async function onCreateChild() {
  if (!newChild.value.name || !newChild.value.birthDate) {
    ElMessage.warning('请填写孩子姓名和出生日期')
    return
  }
  try {
    const created = await createChild({
      name: newChild.value.name.trim(),
      gender: newChild.value.gender,
      birthDate: newChild.value.birthDate,
    })
    children.value.push(created)
    selectedChildId.value = created.id
    creatingChild.value = false
    newChild.value = { name: '', gender: '未知', birthDate: '' }
    await loadSelectedChild()
    ElMessage.success('创建孩子成功')
  } catch (error) {
    console.error('创建孩子失败', error)
    ElMessage.error('创建孩子失败，请重试')
  }
}

async function saveChanges() {
  if (saving.value) return
  if (!selectedChildId.value) {
    ElMessage.warning('请先选择孩子')
    return
  }

  try {
    saving.value = true
    const rawDate = currentStatus.value.physicalDevelopment.lastUpdated || ''
    const normalizedDate = typeof rawDate === 'string' ? rawDate.split('/').join('-').slice(0, 10) : ''

    const payload = {
      heightCm: currentStatus.value.physicalDevelopment.height ?? undefined,
      weightKg: currentStatus.value.physicalDevelopment.weight ?? undefined,
      lastPhysicalUpdated: normalizedDate || undefined,
      behaviorStrengths: strengthsText.value.split(/[,，、\s]+/).filter(Boolean),
      behaviorChallenges: challengesText.value.split(/[,，、\s]+/).filter(Boolean),
      behaviorImprovements: improvementsText.value.split(/[,，、\s]+/).filter(Boolean),
      dailySelfCare: currentStatus.value.dailySkills.selfCare,
      dailyCommunication: currentStatus.value.dailySkills.communication,
      dailySocial: currentStatus.value.dailySkills.social,
      dailyMotor: currentStatus.value.dailySkills.motor,
    }

    await upsertProfile(selectedChildId.value, payload)
    currentStatus.value.behaviorObservation.strengths = payload.behaviorStrengths
    currentStatus.value.behaviorObservation.challenges = payload.behaviorChallenges
    currentStatus.value.behaviorObservation.improvements = payload.behaviorImprovements
    editMode.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const addMilestone = () => {
  growthMilestones.value.push({
    age: '',
    milestone: '',
    achieved: false,
    notes: '',
  })
}

async function loadSelectedChild() {
  if (!selectedChildId.value) return
  try {
    const profile = await getProfile(selectedChildId.value)
    child.value = profile.child
    currentStatus.value = profile.currentStatus || emptyStatus()
    const records = await listHealthRecords(selectedChildId.value)
    healthRecords.value = records.items
  } catch (error) {
    console.error('加载孩子资料失败', error)
    ElMessage.error('加载孩子资料失败')
  }
}

async function addHealthRecord() {
  if (!selectedChildId.value) return
  const newRecord = await createHealthRecord(selectedChildId.value, {
    date: new Date().toISOString().split('T')[0],
    type: '体检',
    description: '',
    result: '',
  })
  healthRecords.value.unshift(newRecord)
}

async function onUpdateRecord(record: HealthRecord) {
  if (!record?.id) return
  await updateHealthRecord(record.id, {
    date: record.date,
    type: record.type,
    description: record.description,
    result: record.result,
  })
}

async function onDeleteRecord(record: HealthRecord) {
  if (!record?.id) return
  if (!confirm('确认删除这条健康记录吗？')) return
  await deleteHealthRecord(record.id)
  healthRecords.value = healthRecords.value.filter((r) => r.id !== record.id)
}

onMounted(async () => {
  try {
    const res = await listChildren()
    children.value = res.items
    if (children.value.length > 0) {
      selectedChildId.value = children.value[0].id
      await loadSelectedChild()
    }
  } catch (error) {
    console.error('加载孩子列表失败', error)
    ElMessage.error('加载孩子列表失败')
  }
})
</script>

<template>
  <div class="growth-profile-container">
    <!-- Hero Header -->
    <div class="hero-header">
      <div class="hero-deco hero-deco-1"></div>
      <div class="hero-deco hero-deco-2"></div>
      <div class="hero-deco hero-deco-3"></div>
      <span class="hero-badge">成长档案</span>
      <h1 class="hero-title">{{ child?.name ? child.name + ' 的成长档案' : '成长档案' }}</h1>
      <p class="hero-subtitle">记录每一个成长瞬间</p>

      <div class="hero-chips">
        <div class="stat-chip">
          <span class="chip-num">{{ profileStats.childCount }}</span>
          <span class="chip-label">孩子</span>
        </div>
        <div class="stat-chip">
          <span class="chip-num">{{ profileStats.milestonesAchieved }}<small>/{{ profileStats.milestonesTotal }}</small></span>
          <span class="chip-label">里程碑</span>
        </div>
        <div class="stat-chip">
          <span class="chip-num">{{ profileStats.healthRecordCount }}</span>
          <span class="chip-label">健康记录</span>
        </div>
      </div>
    </div>

    <div class="profile-header">
      <div class="child-info">
        <div class="child-avatar">
          <div v-if="child" class="avatar-placeholder">{{ child.name.charAt(0) }}</div>
        </div>
        <div class="child-details">
          <div class="child-select">
            <label>选择孩子：</label>
            <select v-model="selectedChildId" @change="() => loadSelectedChild()">
              <option v-if="!children.length" :value="null">暂无孩子</option>
              <option v-for="c in children" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <button class="add-btn" type="button" @click="creatingChild = !creatingChild">
              {{ creatingChild ? '取消' : '新建' }}
            </button>
          </div>

          <div v-if="creatingChild" class="create-child-form">
            <input class="input" v-model="newChild.name" placeholder="孩子姓名" />
            <select class="input" v-model="newChild.gender">
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="未知">未知</option>
            </select>
            <input class="input" type="date" v-model="newChild.birthDate" />
            <button class="save-btn" type="button" @click="onCreateChild">创建</button>
          </div>

          <h1 v-if="child">{{ child.name }} 成长档案</h1>
          <div v-if="child" class="child-meta">
            <span class="meta-item">{{ child.gender }}</span>
            <span class="meta-item">{{ calculateAge(child.birthDate) }}</span>
            <span class="meta-item">出生日期：{{ child.birthDate }}</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button v-if="!editMode" class="edit-btn" @click="toggleEditMode">编辑档案</button>
        <template v-else>
          <button type="button" class="save-btn" @click="saveChanges">保存</button>
          <button class="cancel-btn" @click="editMode = false">取消</button>
        </template>
      </div>
    </div>

    <div class="tab-navigation">
      <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">总览</button>
      <button class="tab-btn" :class="{ active: activeTab === 'current' }" @click="activeTab = 'current'">当前状态</button>
      <button class="tab-btn" :class="{ active: activeTab === 'development' }" @click="activeTab = 'development'">成长里程碑</button>
      <button class="tab-btn" :class="{ active: activeTab === 'health' }" @click="activeTab = 'health'">健康记录</button>
    </div>

    <div v-if="activeTab === 'overview'" class="tab-content">
      <div class="overview-grid">
        <div class="info-card">
          <h3>基本信息</h3>
          <div class="info-list">
            <div class="info-item">
              <span class="label">身高(cm)</span>
              <template v-if="editMode">
                <input class="input" type="number" v-model.number="currentStatus.physicalDevelopment.height" placeholder="例如 110" />
              </template>
              <span v-else class="value">{{ currentStatus.physicalDevelopment.height ?? '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">体重(kg)</span>
              <template v-if="editMode">
                <input class="input" type="number" v-model.number="currentStatus.physicalDevelopment.weight" placeholder="例如 18" />
              </template>
              <span v-else class="value">{{ currentStatus.physicalDevelopment.weight ?? '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后更新</span>
              <template v-if="editMode">
                <input class="input" type="date" v-model="currentStatus.physicalDevelopment.lastUpdated" />
              </template>
              <span v-else class="value">{{ currentStatus.physicalDevelopment.lastUpdated ?? '-' }}</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>各项能力</h3>
          <div class="skills-overview">
            <div class="skill-item">
              <div class="skill-info">
                <span class="skill-name">自理能力</span>
                <span class="skill-score" :style="{ color: getSkillLevel(currentStatus.dailySkills.selfCare).color }">
                  {{ getSkillLevel(currentStatus.dailySkills.selfCare).text }}
                </span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.selfCare + '%', background: getSkillLevel(currentStatus.dailySkills.selfCare).color }"></div>
              </div>
            </div>

            <div class="skill-item">
              <div class="skill-info">
                <span class="skill-name">沟通能力</span>
                <span class="skill-score" :style="{ color: getSkillLevel(currentStatus.dailySkills.communication).color }">
                  {{ getSkillLevel(currentStatus.dailySkills.communication).text }}
                </span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.communication + '%', background: getSkillLevel(currentStatus.dailySkills.communication).color }"></div>
              </div>
            </div>

            <div class="skill-item">
              <div class="skill-info">
                <span class="skill-name">社交能力</span>
                <span class="skill-score" :style="{ color: getSkillLevel(currentStatus.dailySkills.social).color }">
                  {{ getSkillLevel(currentStatus.dailySkills.social).text }}
                </span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.social + '%', background: getSkillLevel(currentStatus.dailySkills.social).color }"></div>
              </div>
            </div>

            <div class="skill-item">
              <div class="skill-info">
                <span class="skill-name">运动能力</span>
                <span class="skill-score" :style="{ color: getSkillLevel(currentStatus.dailySkills.motor).color }">
                  {{ getSkillLevel(currentStatus.dailySkills.motor).text }}
                </span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.motor + '%', background: getSkillLevel(currentStatus.dailySkills.motor).color }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>行为观察</h3>

          <div v-if="editMode" class="edit-form">
            <div class="edit-row">
              <label>优势</label>
              <input class="input" type="text" v-model="strengthsText" placeholder="用逗号分隔，例如：专注、配合度高" />
            </div>
            <div class="edit-row">
              <label>挑战</label>
              <input class="input" type="text" v-model="challengesText" placeholder="用逗号分隔，例如：注意力易分散" />
            </div>
            <div class="edit-row">
              <label>改善</label>
              <input class="input" type="text" v-model="improvementsText" placeholder="用逗号分隔，例如：情绪更稳定" />
            </div>
            <div class="edit-tip">提示：支持中文/英文逗号、顿号、空格分隔</div>
          </div>

          <template v-else>
            <div class="behavior-section">
              <h4>优势表现</h4>
              <div class="behavior-tags strengths">
                <span
                  v-for="strength in currentStatus.behaviorObservation.strengths"
                  :key="strength"
                  class="behavior-tag positive"
                >
                  {{ strength }}
                </span>
                <span v-if="!currentStatus.behaviorObservation.strengths.length" class="empty-pill">暂无</span>
              </div>
            </div>

            <div class="behavior-section">
              <h4>挑战领域</h4>
              <div class="behavior-tags challenges">
                <span
                  v-for="challenge in currentStatus.behaviorObservation.challenges"
                  :key="challenge"
                  class="behavior-tag challenge"
                >
                  {{ challenge }}
                </span>
                <span v-if="!currentStatus.behaviorObservation.challenges.length" class="empty-pill">暂无</span>
              </div>
            </div>

            <div class="behavior-section">
              <h4>近期改善</h4>
              <div class="improvements-list compact">
                <div
                  v-for="improvement in currentStatus.behaviorObservation.improvements"
                  :key="improvement"
                  class="improvement-item compact"
                >
                  ✓ {{ improvement }}
                </div>
                <div v-if="!currentStatus.behaviorObservation.improvements.length" class="empty-text">暂无记录</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'development'" class="tab-content">
      <div class="development-content">
        <div class="section-header">
          <h3>成长里程碑</h3>
          <button v-if="editMode" class="add-btn" @click="addMilestone">新增里程碑</button>
        </div>

        <div class="milestones-timeline">
          <div
            v-for="(milestone, index) in growthMilestones"
            :key="index"
            class="milestone-item"
            :class="{ achieved: milestone.achieved }"
          >
            <div class="milestone-marker">
              <div class="marker-dot" :class="{ completed: milestone.achieved }"></div>
              <div v-if="index < growthMilestones.length - 1" class="marker-line"></div>
            </div>

            <div class="milestone-content">
              <div class="milestone-age">{{ milestone.age }}</div>
              <div class="milestone-title">{{ milestone.milestone }}</div>
              <div v-if="milestone.achieved && milestone.achievedDate" class="milestone-date">
                达成时间：{{ milestone.achievedDate }}
              </div>
              <div v-if="milestone.notes" class="milestone-notes">
                {{ milestone.notes }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'current'" class="tab-content">
      <div class="current-status-grid">
        <div class="status-card">
          <h3>行为观察</h3>

          <div class="behavior-section">
            <h4>优势表现</h4>
            <div class="behavior-tags strengths">
              <span
                v-for="strength in currentStatus.behaviorObservation.strengths"
                :key="strength"
                class="behavior-tag positive"
              >
                {{ strength }}
              </span>
            </div>
          </div>

          <div class="behavior-section">
            <h4>挑战领域</h4>
            <div class="behavior-tags challenges">
              <span
                v-for="challenge in currentStatus.behaviorObservation.challenges"
                :key="challenge"
                class="behavior-tag challenge"
              >
                {{ challenge }}
              </span>
            </div>
          </div>

          <div class="behavior-section">
            <h4>改善方向</h4>
            <div class="behavior-tags improvements">
              <span
                v-for="improvement in currentStatus.behaviorObservation.improvements"
                :key="improvement"
                class="behavior-tag improvement"
              >
                {{ improvement }}
              </span>
            </div>
          </div>
        </div>

        <div class="status-card">
          <h3>体格发育</h3>
          <div class="physical-stats">
            <div class="stat-item">
              <div class="stat-label">身高</div>
              <div class="stat-value">{{ currentStatus.physicalDevelopment.height ?? '-' }}</div>
              <div class="stat-trend">正常范围</div>
            </div>

            <div class="stat-item">
              <div class="stat-label">体重</div>
              <div class="stat-value">{{ currentStatus.physicalDevelopment.weight ?? '-' }}</div>
              <div class="stat-trend">正常范围</div>
            </div>

            <div class="stat-item">
              <div class="stat-label">BMI</div>
              <div class="stat-value">{{ bmiValue ?? '-' }}</div>
              <div class="stat-trend">健康</div>
            </div>
          </div>

          <div class="update-info">最后更新：{{ currentStatus.physicalDevelopment.lastUpdated ?? '-' }}</div>
        </div>

        <div class="status-card full-width">
          <h3>日常能力评估</h3>
          <div class="skills-detailed">
            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">自理能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.selfCare }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.selfCare + '%', background: getSkillLevel(currentStatus.dailySkills.selfCare).color }"></div>
              </div>
              <div class="skill-description">包括穿衣、洗漱、用餐等基本生活技能</div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">沟通能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.communication }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.communication + '%', background: getSkillLevel(currentStatus.dailySkills.communication).color }"></div>
              </div>
              <div class="skill-description">语言表达、理解能力和非语言沟通技巧</div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">社交能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.social }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.social + '%', background: getSkillLevel(currentStatus.dailySkills.social).color }"></div>
              </div>
              <div class="skill-description">与同龄人互动、合作游戏和情感表达</div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">运动能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.motor }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.motor + '%', background: getSkillLevel(currentStatus.dailySkills.motor).color }"></div>
              </div>
              <div class="skill-description">大运动与精细运动的协调性和灵活性</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'health'" class="tab-content">
      <div class="health-records">
        <div class="section-header">
          <h3>健康记录</h3>
          <button v-if="editMode" class="add-btn" @click="addHealthRecord">新增记录</button>
        </div>

        <div class="records-list">
          <div v-if="!healthRecords.length" class="empty-text">暂无健康记录</div>
          <template v-else>
            <div
              v-for="record in healthRecords"
              :key="record.id"
              class="record-item"
            >
              <div class="record-date">{{ record.date }}</div>
              <div class="record-content">
                <div class="record-type">{{ record.type }}</div>
                <div class="record-description">{{ record.description }}</div>
                <div v-if="record.result" class="record-result">{{ record.result }}</div>
              </div>
              <div v-if="editMode" style="display:flex; gap:8px; align-items:center;">
                <button class="save-btn" @click="onUpdateRecord(record)">保存</button>
                <button class="cancel-btn" @click="onDeleteRecord(record)">删除</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   Growth Profile — Unified Amber / Slate Design System
   ============================================================ */

.growth-profile-container {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: #1e293b;
}

/* ── Hero Header ── */
.hero-header {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  padding: 2.5rem 2.75rem 2.25rem;
}

.hero-deco {
  position: absolute;
  border-radius: 50%;
  background: #f59e42;
  opacity: 0.07;
}

.hero-deco-1 { width: 260px; height: 260px; top: -80px; right: -40px; }
.hero-deco-2 { width: 140px; height: 140px; bottom: -50px; left: 60px; }
.hero-deco-3 { width: 90px; height: 90px; top: 30px; right: 220px; }

.hero-badge {
  display: inline-block;
  background: rgba(245, 158, 66, 0.2);
  color: #f59e42;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  margin-bottom: 0.7rem;
  letter-spacing: 0.5px;
}

.hero-title {
  color: #fff;
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.88rem;
  margin: 0;
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 1.25rem;
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

.chip-num small {
  font-size: 14px;
  font-weight: 700;
  color: #94a3b8;
  margin-left: 2px;
}

.chip-label {
  font-size: 13px;
  color: #64748b;
}

/* ── Profile Header Card ── */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem 1.75rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
}

.child-info {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  min-width: 0;
}

.child-avatar { flex-shrink: 0; }

.avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f59e42 0%, #e8890a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
}

.child-details { min-width: 0; }

.child-details h1 {
  margin: 0.5rem 0 0.4rem;
  color: #1e293b;
  font-size: 1.35rem;
  font-weight: 700;
}

.child-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-item {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 500;
  background: #f8fafc;
  border: 1px solid #f0f0f5;
  border-radius: 6px;
  padding: 0.2rem 0.55rem;
}

/* ── Child Select / Create ── */
.child-select {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}

.child-select label {
  color: #64748b;
  font-weight: 600;
  font-size: 13.5px;
}

.child-select select,
.create-child-form .input,
.info-item .input {
  height: 38px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 0.75rem;
  background: #f8fafc;
  color: #1e293b;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.child-select select:focus,
.create-child-form .input:focus,
.info-item .input:focus,
.input:focus {
  outline: none;
  border-color: #f59e42;
  box-shadow: 0 0 0 3px rgba(245, 158, 66, 0.1);
  background: #fff;
}

.create-child-form {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr auto;
  gap: 0.6rem;
  margin-top: 0.7rem;
  align-items: center;
  max-width: 640px;
}

/* ── Buttons ── */
.header-actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.edit-btn,
.save-btn,
.cancel-btn,
.add-btn {
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  padding: 0.55rem 1.1rem;
  transition: transform 0.18s, box-shadow 0.18s;
}

.edit-btn,
.save-btn,
.add-btn {
  color: #fff;
  background: linear-gradient(135deg, #f59e42 0%, #e8890a 100%);
  box-shadow: 0 4px 14px rgba(245, 158, 66, 0.25);
}

.edit-btn:hover,
.save-btn:hover,
.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 66, 0.35);
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

/* ── Tab Navigation ── */
.tab-navigation {
  display: flex;
  gap: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  overflow-x: auto;
}

.tab-btn {
  padding: 7px 18px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  font-size: 13.5px;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.tab-btn.active {
  background: #fff;
  color: #1e293b;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-btn:hover:not(.active) {
  color: #1e293b;
}

/* ── Tab Content ── */
.tab-content {
  min-height: 400px;
}

/* ── Cards ── */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.15rem;
}

.info-card,
.status-card,
.development-content,
.health-records {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  transition: transform 0.22s, box-shadow 0.22s;
}

.info-card:hover,
.status-card:hover,
.development-content:hover,
.health-records:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
}

.info-card { padding: 1.35rem; }

.info-card h3,
.status-card h3,
.section-header h3 {
  margin: 0 0 1rem;
  color: #1e293b;
  font-size: 1.05rem;
  font-weight: 700;
}

/* ── Info List ── */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.info-item .label {
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 500;
}

.info-item .value {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
}

/* ── Edit Form ── */
.edit-form {
  width: 100%;
  background: rgba(245, 158, 66, 0.04);
  border: 1px dashed rgba(245, 158, 66, 0.25);
  border-radius: 12px;
  padding: 0.85rem;
  margin: 0;
}

.edit-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.65rem;
}

.edit-row:last-child { margin-bottom: 0; }

.edit-row label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.edit-tip {
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: #94a3b8;
}

.empty-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
}

.empty-text {
  color: #94a3b8;
  font-size: 0.85rem;
}

.input {
  padding: 8px 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
}

.info-item .input {
  flex: 1;
  min-width: 120px;
}

/* ── Skills ── */
.skills-overview,
.skills-detailed {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skill-item,
.skill-detailed-item {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.75rem;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  background: #fafbfc;
}

.skill-info,
.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-name {
  color: #1e293b;
  font-weight: 600;
  font-size: 13.5px;
}

.skill-score,
.skill-percentage {
  font-size: 13px;
  font-weight: 600;
}

.skill-bar {
  height: 5px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.35s ease;
}

.skill-description {
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.55;
}

/* ── Improvements ── */
.improvements-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.improvement-item {
  color: #e8890a;
  font-weight: 600;
  background: rgba(245, 158, 66, 0.06);
  border: 1px solid rgba(245, 158, 66, 0.15);
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  font-size: 0.85rem;
}

.no-data {
  color: #94a3b8;
  text-align: center;
  margin: 2rem 0;
}

/* ── Development / Health sections ── */
.development-content,
.health-records {
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #e8eaef;
}

/* ── Milestones Timeline ── */
.milestones-timeline { position: relative; }

.milestone-item {
  display: flex;
  gap: 0.95rem;
  margin-bottom: 1.6rem;
  position: relative;
}

.milestone-item:last-child { margin-bottom: 0.3rem; }

.milestone-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.marker-dot.completed {
  background: #f59e42;
  box-shadow: 0 0 0 1px #f59e42, 0 0 0 4px rgba(245, 158, 66, 0.15);
}

.marker-line {
  width: 2px;
  height: 38px;
  background: #e8eaef;
  margin-top: 6px;
}

.milestone-content {
  flex: 1;
  padding: 0.6rem 1rem 0.85rem;
  border-radius: 12px;
  border: 1px solid #eef0f4;
  background: #fff;
}

.milestone-age {
  color: #94a3b8;
  font-size: 0.78rem;
  margin-bottom: 0.2rem;
}

.milestone-title {
  color: #1e293b;
  font-weight: 650;
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.milestone-date {
  color: #f59e42;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.milestone-notes {
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.5;
}

/* ── Current Status Grid ── */
.current-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.15rem;
}

.status-card { padding: 1.35rem; }
.status-card.full-width { grid-column: 1 / -1; }

/* ── Behavior Tags ── */
.behavior-section { margin-bottom: 1rem; }
.behavior-section:last-child { margin-bottom: 0; }

.behavior-section h4 {
  margin: 0 0 0.5rem;
  color: #1e293b;
  font-size: 0.88rem;
  font-weight: 650;
}

.behavior-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.behavior-tag {
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
}

.behavior-tag.positive {
  background: rgba(245, 158, 66, 0.08);
  color: #e8890a;
}

.behavior-tag.challenge {
  background: rgba(239, 68, 68, 0.06);
  color: #ef4444;
}

.behavior-tag.improvement {
  background: rgba(56, 189, 248, 0.08);
  color: #0284c7;
}

/* ── Physical Stats ── */
.physical-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.85rem 0.6rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #eef0f4;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.78rem;
  margin-bottom: 0.2rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 750;
  color: #1e293b;
  margin-bottom: 0.15rem;
}

.stat-trend {
  color: #f59e42;
  font-size: 0.72rem;
  font-weight: 600;
}

.update-info {
  color: #94a3b8;
  font-size: 0.82rem;
  text-align: center;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid #e8eaef;
}

/* ── Health Records ── */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.record-item {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem 1.1rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef0f4;
  border-left: 3px solid #f59e42;
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.record-date {
  flex-shrink: 0;
  width: 100px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 500;
}

.record-content { flex: 1; }

.record-type {
  color: #e8890a;
  font-weight: 650;
  font-size: 0.88rem;
  margin-bottom: 0.2rem;
}

.record-description {
  color: #1e293b;
  margin-bottom: 0.2rem;
  line-height: 1.5;
  font-size: 0.88rem;
}

.record-result {
  color: #64748b;
  font-size: 0.82rem;
}

/* ── Responsive ── */
@media (max-width: 992px) {
  .growth-profile-container {
    padding: 1.5rem 1.25rem 2.25rem;
  }

  .profile-header { padding: 1.2rem; }

  .create-child-form {
    grid-template-columns: 1fr 1fr;
  }

  .header-actions { align-self: stretch; }

  .header-actions .edit-btn,
  .header-actions .save-btn,
  .header-actions .cancel-btn {
    flex: 1;
    text-align: center;
  }

  .physical-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .growth-profile-container {
    padding: 1rem;
  }

  .hero-header {
    padding: 1.75rem 1.5rem 1.5rem;
  }

  .hero-title { font-size: 1.3rem; }

  .profile-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .child-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    font-size: 1.5rem;
  }

  .child-details h1 { font-size: 1.2rem; }

  .tab-navigation { gap: 4px; }

  .tab-btn {
    padding: 6px 14px;
    font-size: 13px;
  }

  .overview-grid,
  .current-status-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .record-item {
    flex-direction: column;
    gap: 0.4rem;
  }

  .record-date { width: auto; }

  .create-child-form {
    grid-template-columns: 1fr;
  }
}
</style>
