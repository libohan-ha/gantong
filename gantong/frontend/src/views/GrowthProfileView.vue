<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
              <span v-else class="value">{{ currentStatus.physicalDevelopment.height }}</span>
            </div>
            <div class="info-item">
              <span class="label">体重(kg)</span>
              <template v-if="editMode">
                <input class="input" type="number" v-model.number="currentStatus.physicalDevelopment.weight" placeholder="例如 18" />
              </template>
              <span v-else class="value">{{ currentStatus.physicalDevelopment.weight }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后更新</span>
              <template v-if="editMode">
                <input class="input" type="date" v-model="currentStatus.physicalDevelopment.lastUpdated" />
              </template>
              <span v-else class="value">{{ currentStatus.physicalDevelopment.lastUpdated }}</span>
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
                    <input class="input" type="text" v-model="strengthsText" placeholder="使用逗号分隔" />
                  </div>
                  <div class="info-item">
                    <span class="label">挑战</span>
                    <input class="input" type="text" v-model="challengesText" placeholder="使用逗号分隔" />
                  </div>
                  <div class="info-item">
                    <span class="label">改善</span>
                    <input class="input" type="text" v-model="improvementsText" placeholder="使用逗号分隔" />
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

          <div class="update-info">最后更新：{{ currentStatus.physicalDevelopment.lastUpdated }}</div>
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
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.selfCare + '%' }"></div>
              </div>
              <div class="skill-description">包括穿衣、洗漱、用餐等基本生活技能</div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">沟通能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.communication }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.communication + '%' }"></div>
              </div>
              <div class="skill-description">语言表达、理解能力和非语言沟通技巧</div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">社交能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.social }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.social + '%' }"></div>
              </div>
              <div class="skill-description">与同龄人互动、合作游戏和情感表达</div>
            </div>

            <div class="skill-detailed-item">
              <div class="skill-header">
                <span class="skill-name">运动能力</span>
                <span class="skill-percentage">{{ currentStatus.dailySkills.motor }}%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: currentStatus.dailySkills.motor + '%' }"></div>
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
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --surface-alt: #eef7f4;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --brand: #0f9d75;
  --brand-strong: #0a7f61;
  --brand-soft: #dff5ed;
  --line: #dbe5f0;
  --danger: #e53935;
  --warning: #f59e0b;
  --success: #16a34a;

  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--text-primary);
  font-family: 'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.growth-profile-container::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(900px 420px at 10% -15%, #d8f2ea 0%, transparent 55%),
    radial-gradient(760px 340px at 95% -10%, #e6f0ff 0%, transparent 60%),
    linear-gradient(180deg, #f6fbff 0%, #f3f9f7 40%, #f7fbff 100%);
  border-radius: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.8rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fcff 100%);
  border: 1px solid #dde8f3;
  border-radius: 18px;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.06);
}

.child-info {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  min-width: 0;
}

.child-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 104px;
  height: 104px;
  border-radius: 28px;
  background:
    linear-gradient(145deg, #6f79ff 0%, #6d4acb 45%, #108d78 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.24);
}

.child-details {
  min-width: 0;
}

.child-details h1 {
  margin: 0.65rem 0 0.45rem;
  color: var(--text-primary);
  font-size: clamp(1.75rem, 2.2vw, 2.2rem);
  letter-spacing: 0.4px;
}

.child-meta {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.meta-item {
  color: #2f415a;
  font-size: 0.9rem;
  background: var(--surface-alt);
  border: 1px solid #d6eee6;
  border-radius: 999px;
  padding: 0.3rem 0.65rem;
}

.child-select {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}

.child-select label {
  color: var(--text-secondary);
  font-weight: 600;
}

.child-select select,
.create-child-form .input,
.info-item .input {
  height: 40px;
  border: 1px solid #cedceb;
  border-radius: 10px;
  padding: 0 0.75rem;
  background: #fff;
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.child-select select:focus,
.create-child-form .input:focus,
.info-item .input:focus,
.input:focus {
  outline: none;
  border-color: #67c8aa;
  box-shadow: 0 0 0 3px rgba(15, 157, 117, 0.14);
}

.create-child-form {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr auto;
  gap: 0.6rem;
  margin-top: 0.7rem;
  align-items: center;
  max-width: 640px;
}

.header-actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.edit-btn,
.save-btn,
.cancel-btn,
.add-btn {
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.edit-btn,
.save-btn,
.add-btn {
  color: #fff;
  background: linear-gradient(135deg, var(--brand) 0%, #0ba57f 100%);
  padding: 0.72rem 1.2rem;
  box-shadow: 0 8px 20px rgba(11, 165, 127, 0.25);
}

.edit-btn:hover,
.save-btn:hover,
.add-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, var(--brand-strong) 0%, var(--brand) 100%);
}

.cancel-btn {
  padding: 0.72rem 1.2rem;
  background: #fff;
  color: #334155;
  border-color: #d0dbe8;
}

.cancel-btn:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

.tab-navigation {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.6rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

.tab-btn {
  padding: 0.65rem 1.15rem;
  border: 1px solid #dbe7f3;
  background: #fff;
  color: #506279;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 650;
  letter-spacing: 0.2px;
  transition: all 0.25s ease;
}

.tab-btn.active {
  border-color: transparent;
  color: #fff;
  background: linear-gradient(135deg, var(--brand) 0%, #10907d 100%);
  box-shadow: 0 8px 16px rgba(16, 144, 125, 0.24);
}

.tab-btn:hover:not(.active) {
  border-color: #b8cbdf;
  background: #f8fbff;
}

.tab-content {
  min-height: 420px;
  animation: fadeInUp 0.28s ease;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-card,
.status-card,
.development-content,
.health-records {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.info-card {
  padding: 1.35rem;
}

.info-card h3,
.status-card h3,
.section-header h3 {
  margin: 0 0 1rem;
  color: #13263e;
  font-size: 1.2rem;
  letter-spacing: 0.2px;
}

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
  color: var(--text-secondary);
  font-weight: 600;
}

.info-item .value {
  font-weight: 700;
  color: #15314f;
}

.edit-form {
  width: 100%;
  background: #f7fbff;
  border: 1px dashed #c9dbee;
  border-radius: 10px;
  padding: 0.65rem;
  margin-bottom: 0.45rem;
}

.edit-form .info-item {
  margin-top: 0;
}

.input {
  padding: 8px 10px;
  border: 1px solid #cfddeb;
  border-radius: 8px;
}

.info-item .input {
  flex: 1;
  min-width: 120px;
}

.skills-overview,
.skills-detailed {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.skill-item,
.skill-detailed-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem;
  border: 1px solid #e3edf7;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.skill-info,
.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}

.skill-name {
  color: #19314f;
  font-weight: 700;
}

.skill-score,
.skill-percentage {
  font-size: 0.92rem;
  font-weight: 700;
}

.skill-bar {
  height: 10px;
  background: #dfebf4;
  border-radius: 999px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(90deg, #00b489 0%, #0b7dca 100%);
  transition: width 0.35s ease;
}

.skill-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.2rem;
  line-height: 1.55;
}

.improvements-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.improvement-item {
  color: #15803d;
  font-weight: 700;
  background: #edfdf4;
  border: 1px solid #c6f2d8;
  border-radius: 10px;
  padding: 0.45rem 0.6rem;
}

.no-data {
  color: #94a3b8;
  text-align: center;
  margin: 2rem 0;
}

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
}

.milestones-timeline {
  position: relative;
}

.milestone-item {
  display: flex;
  gap: 0.95rem;
  margin-bottom: 1.6rem;
  position: relative;
}

.milestone-item:last-child {
  margin-bottom: 0.3rem;
}

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
  background: #d7e3f0;
  border: 2px solid #f7fbff;
  transition: all 0.3s ease;
}

.marker-dot.completed {
  background: var(--success);
  border-color: #b9efcf;
}

.marker-line {
  width: 2px;
  height: 38px;
  background: #d8e4ef;
  margin-top: 6px;
}

.milestone-content {
  flex: 1;
  padding: 0.2rem 0.75rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #e3edf8;
  background: #fafcff;
}

.milestone-age {
  color: #57718e;
  font-size: 0.84rem;
  margin-bottom: 0.18rem;
}

.milestone-title {
  color: #18314f;
  font-weight: 700;
  margin-bottom: 0.45rem;
}

.milestone-date {
  color: #138a4c;
  font-size: 0.86rem;
  margin-bottom: 0.2rem;
}

.milestone-notes {
  color: #5d738d;
  font-size: 0.86rem;
  line-height: 1.45;
}

.current-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.status-card {
  padding: 1.35rem;
}

.status-card.full-width {
  grid-column: 1 / -1;
}

.behavior-section {
  margin-bottom: 1.1rem;
}

.behavior-section h4 {
  margin: 0 0 0.55rem;
  color: #20384f;
  font-size: 1rem;
}

.behavior-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.behavior-tag {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 700;
}

.behavior-tag.positive {
  background: #eafaf0;
  color: #128a49;
}

.behavior-tag.challenge {
  background: #fff1f2;
  color: #dc2626;
}

.behavior-tag.improvement {
  background: #edf6ff;
  color: #1d4ed8;
}

.physical-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.9rem 0.7rem;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f8f8 100%);
  border-radius: 12px;
  border: 1px solid #dbe9f3;
}

.stat-label {
  color: #55708a;
  font-size: 0.82rem;
  margin-bottom: 0.2rem;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1f3a56;
  margin-bottom: 0.2rem;
}

.stat-trend {
  color: #178a4b;
  font-size: 0.78rem;
  font-weight: 600;
}

.update-info {
  color: #4f6b87;
  font-size: 0.88rem;
  text-align: center;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid #dce8f2;
}

.health-records {
  padding: 1.5rem;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.record-item {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 0.9rem;
  background: linear-gradient(180deg, #fbfeff 0%, #f7fbff 100%);
  border-radius: 12px;
  border: 1px solid #dce8f4;
  border-left: 4px solid var(--brand);
}

.record-date {
  flex-shrink: 0;
  width: 108px;
  color: #5b738b;
  font-size: 0.86rem;
  font-weight: 600;
}

.record-content {
  flex: 1;
}

.record-type {
  color: var(--brand-strong);
  font-weight: 700;
  margin-bottom: 0.22rem;
}

.record-description {
  color: #23384f;
  margin-bottom: 0.25rem;
  line-height: 1.45;
}

.record-result {
  color: #5c7289;
  font-size: 0.88rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 992px) {
  .growth-profile-container {
    padding: 1.35rem;
  }

  .profile-header {
    padding: 1.2rem;
  }

  .create-child-form {
    grid-template-columns: 1fr 1fr;
  }

  .header-actions {
    align-self: stretch;
  }

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
    padding: 0.9rem;
  }

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
    width: 84px;
    height: 84px;
    border-radius: 22px;
    font-size: 2.5rem;
  }

  .child-details h1 {
    font-size: 1.7rem;
  }

  .child-meta {
    gap: 0.45rem;
  }

  .tab-navigation {
    gap: 0.4rem;
  }

  .tab-btn {
    padding: 0.55rem 0.95rem;
    font-size: 0.88rem;
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
    gap: 0.45rem;
  }

  .record-date {
    width: auto;
  }

  .create-child-form {
    grid-template-columns: 1fr;
  }
}
</style>
