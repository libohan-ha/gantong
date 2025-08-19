<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { listChildren, getProfile, upsertProfile, listHealthRecords, createHealthRecord, updateHealthRecord, deleteHealthRecord, createChild, deleteChild, type ChildItem, type ProfileResponse } from '@/services/growth'

interface Child {
  id: number
  name: string
  gender: string
  birthDate: string
  avatar?: string | null
}

interface GrowthMilestone {
  age: string
  milestone: string
  achieved: boolean
  achievedDate?: string
  notes?: string
}


interface AssessmentResult {
  id: number
  testName: string
  date: string
  totalScore: number
  maxScore: number
  level: string
  sectionScores: {
    section: string
    score: number
    maxScore: number
  }[]
  recommendations: string[]
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

// 选择的孩子
const child = ref<Child | null>(null)
const children = ref<ChildItem[]>([])
const selectedChildId = ref<number | null>(null)
// 创建孩子相关状态
const creatingChild = ref(false)
const newChild = ref<{ name: string; gender: '男' | '女' | '未知'; birthDate: string }>({
  name: '',
  gender: '未知',
  birthDate: ''
})
async function onCreateChild() {
  if (!newChild.value.name || !newChild.value.birthDate) {
    alert('请填写姓名和出生日期')
    return
  }
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
}

// 生长发育里程碑
const growthMilestones = ref<GrowthMilestone[]>([
  {
    age: '0-3个月',
    milestone: '抬头、微笑、注视物体',
    achieved: true,
    achievedDate: '2019-05-20',
    notes: '发育正常，反应敏捷'
  },
  {
    age: '4-6个月',
    milestone: '翻身、坐立、抓握物品',
    achieved: true,
    achievedDate: '2019-08-10',
    notes: '坐立较早，平衡感良好'
  },
  {
    age: '7-12个月',
    milestone: '爬行、站立、说简单词汇',
    achieved: true,
    achievedDate: '2020-01-15',
    notes: '语言发育略慢，运动发育正常'
  },
  {
    age: '1-2岁',
    milestone: '独立行走、简单交流、控制大小便',
    achieved: true,
    achievedDate: '2020-10-30',
    notes: '行走稳定，但社交意愿不强'
  },
  {
    age: '2-3岁',
    milestone: '跑跳、简单句子、独立游戏',
    achieved: true,
    achievedDate: '2021-12-20',
    notes: '运动协调性有待提高'
  },
  {
    age: '3-4岁',
    milestone: '骑三轮车、完整表达、与人合作',
    achieved: true,
    achievedDate: '2023-02-10',
    notes: '表达能力提升，但专注力不足'
  },
  {
    age: '4-5岁',
    milestone: '单脚跳跃、绘画涂色、遵守规则',
    achieved: false,
    notes: '平衡能力需要加强训练'
  },
  {
    age: '5-6岁',
    milestone: '骑自行车、书写字母、团队游戏',
    achieved: false,
    notes: '即将开始相关训练'
  }
])

// 健康记录（从后端加载）
import type { HealthRecord } from '@/services/growth'
const healthRecords = ref<HealthRecord[]>([])

// 当前状况（从后端加载）
const currentStatus = ref<CurrentStatus>({
  physicalDevelopment: { height: null as any, weight: null as any, lastUpdated: '' },
  behaviorObservation: { strengths: [], challenges: [], improvements: [] },
  dailySkills: { selfCare: 0, communication: 0, social: 0, motor: 0 },
})

// 行为观察编辑用的临时文本（逗号/空格分隔）
const strengthsText = ref('')
const challengesText = ref('')
const improvementsText = ref('')

// 评估结果已隐藏，不加载

// 页面状态
const activeTab = ref('overview')
const editMode = ref(false)

// 计算年龄
const calculateAge = (birthDate: string) => {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const now = new Date()
  const ageInMs = now.getTime() - birth.getTime()
  const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25))
  const ageInMonths = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
  return `${ageInYears}岁${ageInMonths}个月`
}

// 获取技能等级描述
const getSkillLevel = (score: number) => {
  if (score >= 90) return { text: '优秀', color: '#4caf50' }
  if (score >= 75) return { text: '良好', color: '#8bc34a' }
  if (score >= 60) return { text: '一般', color: '#ff9800' }
  return { text: '需提升', color: '#f44336' }
}

// 获取评估等级颜色
const getAssessmentLevelColor = (level: string) => {
  switch (level) {
    case '优秀':
    case '良好':
      return '#4caf50'
    case '中等':
      return '#ff9800'
    case '需要关注':
      return '#f44336'
    default:
      return '#666'
  }
}

// 切换编辑模式
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (editMode.value) {
    // 进入编辑时，初始化可编辑输入的文本
    strengthsText.value = currentStatus.value.behaviorObservation.strengths.join('、')
    challengesText.value = currentStatus.value.behaviorObservation.challenges.join('、')
    improvementsText.value = currentStatus.value.behaviorObservation.improvements.join('、')
  }
}

// 保存更改（已接后端）
const saving = ref(false)
async function saveChanges() {
  if (saving.value) return
  if (!selectedChildId.value) {
    alert('请先选择孩子后再保存')
    return
  }
  try {
    saving.value = true
    const rawDate = (currentStatus.value.physicalDevelopment.lastUpdated as any) || ''
    const normalizedDate = typeof rawDate === 'string'
      ? rawDate.replaceAll('/', '-').slice(0, 10)
      : ''
    const payload = {
      heightCm: (currentStatus.value.physicalDevelopment.height as any) ?? undefined,
      weightKg: (currentStatus.value.physicalDevelopment.weight as any) ?? undefined,
      lastPhysicalUpdated: normalizedDate || undefined,
      behaviorStrengths: strengthsText.value.split(/[,，、\s]+/).filter(Boolean),
      behaviorChallenges: challengesText.value.split(/[,，、\s]+/).filter(Boolean),
      behaviorImprovements: improvementsText.value.split(/[,，、\s]+/).filter(Boolean),
      dailySelfCare: currentStatus.value.dailySkills.selfCare,
      dailyCommunication: currentStatus.value.dailySkills.communication,
      dailySocial: currentStatus.value.dailySkills.social,
      dailyMotor: currentStatus.value.dailySkills.motor,
    }
    const childId = Number(selectedChildId.value)
    await upsertProfile(childId, payload)
    // 同步到本地显示
    currentStatus.value.behaviorObservation.strengths = payload.behaviorStrengths
    currentStatus.value.behaviorObservation.challenges = payload.behaviorChallenges
    currentStatus.value.behaviorObservation.improvements = payload.behaviorImprovements
    editMode.value = false
    alert('保存成功！')
  } catch (err) {
    console.error('保存失败', err)
    alert('保存失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}

// 添加新的里程碑
const addMilestone = () => {
  growthMilestones.value.push({
    age: '',
    milestone: '',
    achieved: false,
    notes: ''
  })
}


// 初始化加载孩子与数据
onMounted(async () => {
  try {
    const res = await listChildren()
    children.value = res.items
    if (children.value.length) {
      selectedChildId.value = children.value[0].id
      await loadSelectedChild()
      const list = await listHealthRecords(selectedChildId.value)
      healthRecords.value = list.items
    }
  } catch (e) {
    console.error(e)
  }
})

async function loadSelectedChild() {
  if (!selectedChildId.value) return
  const prof = await getProfile(selectedChildId.value)
  child.value = prof.child
  currentStatus.value = prof.currentStatus as any
  const list = await listHealthRecords(selectedChildId.value)
  healthRecords.value = list.items
}

async function addHealthRecord() {
  if (!selectedChildId.value) return
  const newRec = await createHealthRecord(selectedChildId.value, {
    date: new Date().toISOString().split('T')[0],
    type: '体检',
    description: '',
    result: '',
  })
  healthRecords.value.unshift(newRec)
}

async function onUpdateRecord(record: any) {
  if (!record?.id) return
  await updateHealthRecord(record.id, {
    date: record.date,
    type: record.type,
    description: record.description,
    result: record.result,
  })
}

async function onDeleteRecord(record: any) {
  if (!record?.id) return
  if (!confirm('确定删除该健康记录？')) return
  await deleteHealthRecord(record.id)
  healthRecords.value = healthRecords.value.filter((r) => r.id !== record.id)
}

</script>


<template>
  <div class="growth-profile-container">
    <!-- 页面头部 -->
    <div class="profile-header">
      <div class="child-info">
        <div class="child-avatar">
          <div v-if="child" class="avatar-placeholder">{{ child.name.charAt(0) }}</div>
        </div>
        <div class="child-details">
          <div class="child-select">
            <label>选择孩子：</label>
            <select v-model="selectedChildId" @change="() => loadSelectedChild()">
              <option v-for="c in children" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <button class="add-btn" type="button" @click="creatingChild = !creatingChild">{{ creatingChild ? '取消' : '新建' }}</button>
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
          <h1 v-if="child">{{ child.name }}的成长档案</h1>
          <div v-if="child" class="child-meta">
            <span class="meta-item">{{ child.gender }}</span>
            <span class="meta-item">{{ calculateAge(child.birthDate) }}</span>
            <span class="meta-item">出生日期：{{ child.birthDate }}</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button
          v-if="!editMode"
          class="edit-btn"
          @click="toggleEditMode"
        >
          编辑档案
        </button>
        <template v-else>
          <button type="button" class="save-btn" @click="saveChanges">保存</button>
          <button class="cancel-btn" @click="editMode = false">取消</button>
        </template>
      </div>
    </div>

    <!-- 导航标签 -->
    <div class="tab-navigation">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        总览
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'current' }"
        @click="activeTab = 'current'"
      >
        当前状况
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'health' }"
        @click="activeTab = 'health'"
      >
        健康记录
      </button>
    </div>


    <!-- 总览页面 -->
    <div v-if="activeTab === 'overview'" class="tab-content">
      <div class="overview-grid">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <h3>基本信息</h3>
          <div class="info-list">
            <div class="info-item">
              <span class="label">身高</span>
              <template v-if="editMode">
                <input class="input" type="number" v-model.number="(currentStatus.physicalDevelopment.height as any)" placeholder="例如 110" />
              </template>
              <span v-else class="value">{{ currentStatus.physicalDevelopment.height }}</span>
            </div>
            <div class="info-item">
              <span class="label">体重</span>
              <template v-if="editMode">
                <input class="input" type="number" v-model.number="(currentStatus.physicalDevelopment.weight as any)" placeholder="例如 18" />
              </template>
              <span v-else class="value">{{ currentStatus.physicalDevelopment.weight }}</span>
            </div>
            <div class="info-item">
              <span class="label">最近更新</span>
              <template v-if="editMode">
                <input class="input" type="date" v-model="(currentStatus.physicalDevelopment.lastUpdated as any)" />
              </template>
              <span v-else class="value">{{ currentStatus.physicalDevelopment.lastUpdated }}</span>
            </div>
          </div>
        </div>

        <!-- 能力雷达图 -->
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
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.selfCare + '%' }"></div>
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
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.communication + '%' }"></div>
              </div>
            </div>

            <div class="skill-item">
              <div class="skill-info">
              <div v-if="editMode" class="edit-form">
                <div class="info-item">
                  <span class="label">优势</span>
                  <input class="input" type="text" v-model="strengthsText" placeholder="逗号或顿号分隔" />
                </div>
                <div class="info-item">
                  <span class="label">挑战</span>
                  <input class="input" type="text" v-model="challengesText" placeholder="逗号或顿号分隔" />
                </div>
                <div class="info-item">
                  <span class="label">改善</span>
                  <input class="input" type="text" v-model="improvementsText" placeholder="逗号或顿号分隔" />
                </div>
              </div>

                <span class="skill-name">社交能力</span>
                <span class="skill-score" :style="{ color: getSkillLevel(currentStatus.dailySkills.social).color }">
                  {{ getSkillLevel(currentStatus.dailySkills.social).text }}
                </span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.social + '%' }"></div>
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
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.motor + '%' }"></div>
              </div>
            </div>
          </div>
        </div>


        <!-- 近期表现 -->
        <div class="info-card">
          <h3>近期改善</h3>
          <div class="improvements-list">
            <div
              v-for="improvement in currentStatus.behaviorObservation.improvements"
              :key="improvement"
              class="improvement-item"
            >
              ✓ {{ improvement }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生长发育史 -->
    <div v-if="activeTab === 'development'" class="tab-content">
      <div class="development-content">
        <div class="section-header">
          <h3>发育里程碑</h3>
          <button v-if="editMode" class="add-btn" @click="addMilestone">添加里程碑</button>
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

    <!-- 当前状况 -->
    <div v-if="activeTab === 'current'" class="tab-content">
      <div class="current-status-grid">
        <!-- 行为观察 -->
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
            <h4>改善方面</h4>
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

        <!-- 体格发育 -->
        <div class="status-card">
          <h3>体格发育</h3>
          <div class="physical-stats">
            <div class="stat-item">
              <div class="stat-label">身高</div>
              <div class="stat-value">{{ currentStatus.physicalDevelopment.height }}</div>
              <div class="stat-trend">正常范围</div>
            </div>

            <div class="stat-item">
              <div class="stat-label">体重</div>
              <div class="stat-value">{{ currentStatus.physicalDevelopment.weight }}</div>
              <div class="stat-trend">正常范围</div>
            </div>

            <div class="stat-item">
              <div class="stat-label">BMI</div>
              <div class="stat-value">14.9</div>
              <div class="stat-trend">健康</div>
            </div>
          </div>

          <div class="update-info">
            最后更新：{{ currentStatus.physicalDevelopment.lastUpdated }}
          </div>
        </div>

        <!-- 日常技能 -->
        <div class="status-card full-width">
          <h3>日常技能评估</h3>
          <div class="skills-detailed">
            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">自理能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.selfCare }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.selfCare + '%' }"></div>
              </div>
              <div class="skill-description">
                包括穿衣、洗漱、用餐等基本生活技能
              </div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">沟通能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.communication }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.communication + '%' }"></div>
              </div>
              <div class="skill-description">
                语言表达、理解能力和非语言沟通技巧
              </div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">社交能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.social }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.social + '%' }"></div>
              </div>
              <div class="skill-description">
                与同龄人互动、合作游戏和情感表达
              </div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">运动能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.motor }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.motor + '%' }"></div>
              </div>
              <div class="skill-description">
                大运动和精细运动协调性和灵活性
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 健康记录 -->
    <div v-if="activeTab === 'health'" class="tab-content">
      <div class="health-records">
        <div class="section-header">
          <h3>健康记录</h3>
          <button v-if="editMode" class="add-btn" @click="addHealthRecord">添加记录</button>
        </div>

        <div class="records-list">
          <div
            v-for="record in healthRecords"
            :key="record.date + record.type"
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.growth-profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 页面头部 */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.child-info {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.child-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
}

.child-details h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 2rem;
}

.child-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  color: #666;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .save-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.edit-btn {
  background: #42b883;
  color: white;
}

.edit-btn:hover {
  background: #369870;
}

.save-btn {
  background: #4caf50;
  color: white;
}

.save-btn:hover {
  background: #45a049;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

/* 标签导航 */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #f0f0f0;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #42b883;
  color: white;
}

.tab-btn:hover:not(.active) {
  background: #e0e0e0;
}

/* 标签内容 */
.tab-content {
  min-height: 400px;
}

/* 总览网格 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 简易编辑表单样式 */
.edit-form .info-item {
  margin-top: 8px;
}
.input {
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}
/* 基本信息行内输入布局 */
.info-item .input {
  flex: 1;
  margin-left: 8px;
  min-width: 120px;
}

.info-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  font-weight: 500;
  color: #2c3e50;
}

/* 技能概览 */
.skills-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-name {
  color: #2c3e50;
  font-weight: 500;
}

.skill-score {
  font-size: 0.9rem;
  font-weight: 500;
}

.skill-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #369870);
  transition: width 0.3s ease;
}


.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assessment-name {
  font-weight: 500;
  color: #2c3e50;
}

.assessment-date {
  color: #666;
  font-size: 0.9rem;
}

.assessment-score {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.score-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.score-max {
  color: #666;
}

.score-level {
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: rgba(66, 184, 131, 0.1);
}

/* 改善列表 */
.improvements-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.improvement-item {
  color: #4caf50;
  font-weight: 500;
}

.no-data {
  color: #999;
  text-align: center;
  margin: 2rem 0;
}

/* 发育里程碑 */
.development-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.add-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-btn:hover {
  background: #369870;
}


.create-child-form {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}
.create-child-form .input {
  height: 32px;
  padding: 0 8px;
}

.milestones-timeline {
  position: relative;
}

.milestone-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.milestone-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.marker-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 3px solid #f0f0f0;
  transition: all 0.3s ease;
}

.marker-dot.completed {
  background: #4caf50;
  border-color: #4caf50;
}

.marker-line {
  width: 2px;
  height: 40px;
  background: #e0e0e0;
  margin-top: 8px;
}

.milestone-content {
  flex: 1;
  padding-top: 0.25rem;
}

.milestone-age {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.milestone-title {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.milestone-date {
  color: #4caf50;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.milestone-notes {
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

/* 当前状况 */
.current-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.status-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-card.full-width {
  grid-column: 1 / -1;
}

.status-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

/* 行为观察 */
.behavior-section {
  margin-bottom: 1.5rem;
}

.behavior-section h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.behavior-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.behavior-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
}

.behavior-tag.positive {
  background: #e8f5e8;
  color: #4caf50;
}

.behavior-tag.challenge {
  background: #ffebee;
  color: #f44336;
}

.behavior-tag.improvement {
  background: #e3f2fd;
  color: #2196f3;
}

/* 体格发育 */
.physical-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-trend {
  color: #4caf50;
  font-size: 0.8rem;
}

.update-info {
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

/* 详细技能 */
.skills-detailed {
  display: grid;
  gap: 1.5rem;
}

.skill-detailed-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.skill-percentage {
  font-weight: bold;
  color: #42b883;
}

.skill-description {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* 评估结果 */
.assessments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.assessment-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.assessment-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.assessment-meta {
  display: flex;
  gap: 1rem;
}

.assessment-date {
  color: #666;
}

.assessment-level {
  font-weight: 500;
}

.assessment-score-display {
  text-align: center;
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.assessment-details {
  display: grid;
  gap: 2rem;
}

.section-scores-grid {
  display: grid;
  gap: 1rem;
}

.section-score-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  align-items: center;
  gap: 1rem;
}

.section-name {
  color: #2c3e50;
  font-size: 0.9rem;
}

.section-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.section-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #369870);
  transition: width 0.3s ease;
}

.section-score {
  color: #666;
  font-size: 0.9rem;
  min-width: 60px;
  text-align: right;
}

.recommendations h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.recommendation-list {
  margin: 0;
  padding-left: 1.5rem;
}

.recommendation-list li {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* 健康记录 */
.health-records {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.record-date {
  flex-shrink: 0;
  width: 100px;
  color: #666;
  font-size: 0.9rem;
}

.record-content {
  flex: 1;
}

.record-type {
  color: #42b883;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.record-description {
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.record-result {
  color: #666;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .growth-profile-container {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .child-info {
    flex-direction: column;
    text-align: center;
  }

  .child-meta {
    justify-content: center;
  }

  .tab-navigation {
    gap: 0.25rem;
  }

  .tab-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .current-status-grid {
    grid-template-columns: 1fr;
  }

  .assessment-header {
    flex-direction: column;
    gap: 1rem;
  }

  .section-score-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .record-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .record-date {
    width: auto;
  }
}
</style>