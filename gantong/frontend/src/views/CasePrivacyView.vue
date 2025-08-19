<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getMyProfile, type DoctorProfile as Profile } from '@/services/doctor'
import { uploadCase, getMyCases, updateCase as apiUpdateCase, deleteCase as apiDeleteCase, type BackendCaseRecord } from '@/services/cases'

// 病例类型枚举
type CaseType = 'online' | 'offline'
type BodyPartType = 'head' | 'limbs' | 'torso' | 'joints' | 'partial' | 'functional'
type PrivacyLevel = 'low' | 'medium' | 'high' | 'critical'
type CaseStatus = 'draft' | 'uploaded' | 'reviewed' | 'approved' | 'rejected'

// 病例文件接口
interface CaseFile {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  size: number
  uploadDate: string
  bodyPart: BodyPartType
  description: string
  isEncrypted: boolean
  privacyLevel: PrivacyLevel
  url?: string
  thumbnail?: string
}

// 病例记录接口
interface CaseRecord {
  id: string
  patientId: string
  caseType: CaseType
  title: string
  description: string
  bodyParts: BodyPartType[]
  symptoms: string[]
  diagnosis?: string
  files: CaseFile[]
  doctorInfo: DoctorInfo
  privacySettings: PrivacySettings
  status: CaseStatus
  createdAt: string
  updatedAt: string
  tags: string[]
  isAnonymized: boolean
}

// 医生信息接口
interface DoctorInfo {
  id: string
  name: string
  title: string
  hospital: string
  department: string
  licenseNumber: string
  phone: string
  email: string
}

// 隐私设置接口
interface PrivacySettings {
  anonymizePatient: boolean
  hidePersonalInfo: boolean
  limitedAccess: boolean
  encryptFiles: boolean
  retentionPeriod: number // 天数
  accessLevel: 'public' | 'hospital' | 'department' | 'private'
  allowSharing: boolean
  watermark: boolean
}

// 上传规则接口
interface UploadRule {
  id: string
  name: string
  description: string
  allowedBodyParts: BodyPartType[]
  maxFileSize: number // MB
  allowedFileTypes: string[]
  requiredPrivacyLevel: PrivacyLevel
  guidelines: string[]
  examples: string[]
}

// 当前医生信息（从后端加载）
const doctorProfile = ref<Profile | null>(null)
const loadingDoctor = ref(false)

const loadDoctorProfile = async () => {
  try {
    loadingDoctor.value = true
    doctorProfile.value = await getMyProfile()
  } finally {
    loadingDoctor.value = false
  }
}

onMounted(() => {
  loadDoctorProfile()
  loadMyCases()
})


// 兼容旧的 DoctorInfo 使用示例：将后端资料映射为 DoctorInfo 结构
const currentDoctor = computed<DoctorInfo>(() => ({
  id: String(doctorProfile.value?.userId ?? ''),
  name: doctorProfile.value?.name || '医生',
  title: doctorProfile.value?.title || '',
  hospital: doctorProfile.value?.hospital || '',
  department: '',
  licenseNumber: '',
  phone: doctorProfile.value?.phone || '',
  email: ''
}))

// 上传规则配置
const uploadRules = ref<UploadRule[]>([
  {
    id: 'rule_partial',
    name: '局部病症上传',
    description: '只允许上传患者身体的特定局部区域，保护整体隐私',
    allowedBodyParts: ['limbs', 'joints', 'partial'],
    maxFileSize: 50,
    allowedFileTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    requiredPrivacyLevel: 'medium',
    guidelines: [
      '仅拍摄病症相关的局部区域',
      '避免包含患者面部或身份标识',
      '确保背景环境中无个人信息',
      '图像质量要清晰但不过度暴露'
    ],
    examples: ['手部动作范围', '足部步态分析', '关节活动度']
  },
  {
    id: 'rule_functional',
    name: '功能性评估上传',
    description: '上传功能性动作和行为评估，不涉及敏感身体部位',
    allowedBodyParts: ['functional', 'partial'],
    maxFileSize: 100,
    allowedFileTypes: ['video/mp4', 'video/avi'],
    requiredPrivacyLevel: 'low',
    guidelines: [
      '专注于功能性动作演示',
      '可包含治疗师指导过程',
      '确保患者穿着适当',
      '避免录制个人身份信息'
    ],
    examples: ['平衡训练视频', '精细动作练习', '感统训练过程']
  },
  {
    id: 'rule_document',
    name: '匿名化文档上传',
    description: '上传经过匿名化处理的评估报告和诊断文档',
    allowedBodyParts: ['head', 'limbs', 'torso', 'joints'],
    maxFileSize: 20,
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    requiredPrivacyLevel: 'high',
    guidelines: [
      '移除所有个人身份信息',
      '使用代码或编号替代姓名',
      '隐藏具体日期，使用相对时间',
      '确保文档内容仅包含医学相关信息'
    ],
    examples: ['匿名评估报告', '治疗进度记录', '康复计划文档']
  }
])

// 页面状态
const activeTab = ref<'upload' | 'manage' | 'rules'>('upload')
const selectedRule = ref<UploadRule | null>(null)
const showUploadModal = ref(false)
const showPrivacySettings = ref(false)

// 上传表单
const uploadForm = ref({
  title: '',
  description: '',
  caseType: 'online' as CaseType,
  bodyParts: [] as BodyPartType[],
  symptoms: [] as string[],
  tags: [] as string[],
  files: [] as File[],
  privacySettings: {
    anonymizePatient: true,
    hidePersonalInfo: true,
    limitedAccess: true,
    encryptFiles: true,
    retentionPeriod: 365,
    accessLevel: 'department' as const,
    allowSharing: false,
    watermark: true
  } as PrivacySettings
})

// 病例记录列表（从后端获取）
const caseRecords = ref<BackendCaseRecord[]>([])

const loadMyCases = async () => {
  try {
    const res = await getMyCases({ page: 1, pageSize: 50 })
    caseRecords.value = res.items
  } catch (e) {
    console.error('加载病例失败', e)
  }
}

// 编辑弹窗与表单（放在顶层，供模板和事件处理使用）
const showEditModal = ref(false)
const editingCase = ref<BackendCaseRecord | null>(null)
const editForm = ref<{ title: string; description: string | null }>({ title: '', description: '' })

const openEdit = (rec: BackendCaseRecord) => {
  editingCase.value = rec
  editForm.value = { title: rec.title, description: (rec as any).description ?? '' }
  showEditModal.value = true
}
const closeEdit = () => { showEditModal.value = false; editingCase.value = null }

const submitEdit = async () => {
  if (!editingCase.value) return
  try {
    const updated = await apiUpdateCase(editingCase.value.id, {
      title: editForm.value.title?.trim() || undefined,
      description: (editForm.value.description ?? '').toString(),
    })
    const idx = caseRecords.value.findIndex(c => c.id === updated.id)
    if (idx >= 0) caseRecords.value[idx] = updated
    closeEdit()
  } catch (e: any) {
    alert(e?.response?.data?.message || '更新失败，请重试')
  }
}

const confirmDelete = async (rec: BackendCaseRecord) => {
  if (!confirm('确定要删除该病例吗？此操作不可恢复')) return
  try {
    await apiDeleteCase(rec.id)
    caseRecords.value = caseRecords.value.filter(c => c.id !== rec.id)
  } catch (e: any) {
    alert(e?.response?.data?.message || '删除失败，请重试')
  }
}

// 筛选状态
const filterStatus = ref<CaseStatus | 'all'>('all')
const filterType = ref<CaseType | 'all'>('all')
const searchKeyword = ref('')

// 身体部位选项
const bodyPartOptions: Array<{ value: BodyPartType; label: string; icon: string; description: string }> = [
  { value: 'head', label: '头部相关', icon: '🧠', description: '认知、注意力相关评估' },
  { value: 'limbs', label: '四肢局部', icon: '🦵', description: '手足部分功能展示' },
  { value: 'torso', label: '躯干部分', icon: '🫁', description: '核心稳定性相关' },
  { value: 'joints', label: '关节活动', icon: '🦴', description: '关节活动度评估' },
  { value: 'partial', label: '局部病症', icon: '🎯', description: '特定局部区域' },
  { value: 'functional', label: '功能动作', icon: '🤸', description: '功能性动作评估' }
]

// 症状选项
const symptomOptions = [
  '平衡失调', '注意力不集中', '精细动作困难', '大运动发育迟缓',
  '感觉统合失调', '语言发育迟缓', '社交技能不足', '认知发育异常',
  '情绪调节困难', '学习困难', '多动症状', '自闭症谱系障碍'
]

// 过滤后的病例记录
const filteredCaseRecords = computed(() => {
  let records = caseRecords.value

  if (filterStatus.value !== 'all') {
    records = records.filter(record => record.status === filterStatus.value)
  }

  // 后端暂未存 caseType 与 tags，这两个筛选/搜索项做降级
  if (filterType.value !== 'all') {
    // 无 caseType 信息，忽略类型过滤
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    records = records.filter(record =>
      (record.title || '').toLowerCase().includes(keyword) ||
      (record.description || '').toLowerCase().includes(keyword)
    )
  }

  return records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

// 统计数据
const statistics = computed(() => {
  const total = caseRecords.value.length
  const uploaded = caseRecords.value.filter(r => r.status === 'uploaded').length
  const approved = caseRecords.value.filter(r => r.status === 'approved').length
  // 后端暂未存 caseType，这里统计值置为 0/0 以兼容 UI
  const online = 0
  const offline = 0
  return { total, uploaded, approved, online, offline }
})

// 获取状态显示信息
const getStatusInfo = (status: CaseStatus) => {
  const statusMap = {
    draft: { text: '草稿', color: '#666', bgColor: '#f5f5f5', icon: '📝' },
    uploaded: { text: '已上传', color: '#2196f3', bgColor: '#e3f2fd', icon: '⬆️' },
    reviewed: { text: '审核中', color: '#ff9800', bgColor: '#fff3e0', icon: '👁️' },
    approved: { text: '已通过', color: '#4caf50', bgColor: '#e8f5e8', icon: '✅' },
    rejected: { text: '已拒绝', color: '#f44336', bgColor: '#ffebee', icon: '❌' }
  }
  return statusMap[status]
}

// 获取隐私级别信息
const getPrivacyLevelInfo = (level: PrivacyLevel) => {
  const levelMap = {
    low: { text: '低敏感', color: '#4caf50', bgColor: '#e8f5e8' },
    medium: { text: '中敏感', color: '#ff9800', bgColor: '#fff3e0' },
    high: { text: '高敏感', color: '#f44336', bgColor: '#ffebee' },
    critical: { text: '极敏感', color: '#9c27b0', bgColor: '#f3e5f5' }
  }
  return levelMap[level]
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 选择上传规则
const selectRule = (rule: UploadRule) => {
  selectedRule.value = rule
  showUploadModal.value = true
  // 根据规则预设一些表单值
  uploadForm.value.bodyParts = [...rule.allowedBodyParts]
}

// 文件上传处理
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    uploadForm.value.files = Array.from(target.files)
  }
}

// 提交病例上传
const submitCaseUpload = async () => {
  if (!uploadForm.value.title || uploadForm.value.files.length === 0) {
    alert('请填写标题并至少上传一个文件')
    return
  }

  try {
    const created = await uploadCase({
      title: uploadForm.value.title,
      description: uploadForm.value.description?.trim() || undefined,
      files: uploadForm.value.files,
    })

    // 插入到列表顶部
    caseRecords.value.unshift(created)

    // 重置表单
    uploadForm.value = {
      title: '',
      description: '',
      caseType: 'online',
      bodyParts: [],
      symptoms: [],
      tags: [],
      files: [],
      privacySettings: {
        anonymizePatient: true,
        hidePersonalInfo: true,
        limitedAccess: true,
        encryptFiles: true,
        retentionPeriod: 365,
        accessLevel: 'department',
        allowSharing: false,
        watermark: true
      }
    }

    closeModal()
    alert('病例上传成功！')
  } catch (e: any) {
    console.error('上传失败', e)
    alert(e?.response?.data?.message || '上传失败，请重试')
  }
}

// 关闭弹窗
const closeModal = () => {
  showUploadModal.value = false
  showPrivacySettings.value = false
  selectedRule.value = null
}

// 格式化时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 切换标签页
const switchTab = (tab: 'upload' | 'manage' | 'rules') => {
  activeTab.value = tab
}
</script>

<template>
  <div class="case-privacy-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>病例隐私保护</h1>
      <p class="header-desc">安全上传患者局部病例资料，确保隐私保护</p>
    </div>

    <!-- 医生身份验证卡片 -->
    <div class="doctor-verification-card">
      <div class="verification-content">
        <div class="doctor-info">
          <div class="doctor-avatar">{{ (doctorProfile?.name || '医').charAt(0) }}</div>
          <div class="doctor-details">
            <h3>{{ doctorProfile?.name || '—' }}</h3>
            <p v-if="doctorProfile?.nickname">昵称：{{ doctorProfile?.nickname }}</p>
            <p>{{ doctorProfile?.hospital || '—' }}</p>
          </div>
        </div>
        <div class="verification-status">
          <span class="verified-badge">✅ 已认证</span>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.total }}</div>
          <div class="stat-label">总病例数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⬆️</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.uploaded }}</div>
          <div class="stat-label">已上传</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.approved }}</div>
          <div class="stat-label">已通过</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🌐</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.online }}/{{ statistics.offline }}</div>
          <div class="stat-label">线上/线下</div>
        </div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="tab-navigation">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'upload' }"
        @click="switchTab('upload')"
      >
        📤 安全上传
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'manage' }"
        @click="switchTab('manage')"
      >
        📋 病例管理
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'rules' }"
        @click="switchTab('rules')"
      >
        📜 隐私规则
      </button>
    </div>

    <!-- 安全上传标签页 -->
    <div v-if="activeTab === 'upload'" class="upload-section">
      <div class="upload-header">
        <h2>选择上传类型</h2>
        <p>请根据病例内容选择合适的隐私保护级别</p>
      </div>

      <div class="upload-rules-grid">
        <div
          v-for="rule in uploadRules"
          :key="rule.id"
          class="rule-card"
          @click="selectRule(rule)"
        >
          <div class="rule-header">
            <h3>{{ rule.name }}</h3>
            <span
              class="privacy-level"
              :style="{
                color: getPrivacyLevelInfo(rule.requiredPrivacyLevel).color,
                backgroundColor: getPrivacyLevelInfo(rule.requiredPrivacyLevel).bgColor
              }"
            >
              {{ getPrivacyLevelInfo(rule.requiredPrivacyLevel).text }}
            </span>
          </div>

          <p class="rule-description">{{ rule.description }}</p>

          <div class="rule-details">
            <div class="rule-info">
              <span class="info-label">最大文件：</span>
              <span class="info-value">{{ rule.maxFileSize }}MB</span>
            </div>
            <div class="rule-info">
              <span class="info-label">允许部位：</span>
              <span class="info-value">{{ rule.allowedBodyParts.length }}种</span>
            </div>
          </div>

          <div class="rule-guidelines">
            <h5>上传指导：</h5>
            <ul>
              <li v-for="guideline in rule.guidelines.slice(0, 2)" :key="guideline">
                {{ guideline }}
              </li>
            </ul>
          </div>

          <button class="upload-btn">选择此类型</button>
        </div>
      </div>
    </div>

    <!-- 病例管理标签页 -->
    <div v-if="activeTab === 'manage'" class="manage-section">
      <!-- 筛选区域 -->
      <div class="filters-section">
        <div class="search-group">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索病例标题、描述或标签..."
            class="search-input"
          >
        </div>

        <div class="filter-group">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="uploaded">已上传</option>
            <option value="reviewed">审核中</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>

          <select v-model="filterType" class="filter-select">
            <option value="all">全部类型</option>
            <option value="online">线上</option>
            <option value="offline">线下</option>
          </select>
        </div>
      </div>

      <!-- 病例列表 -->
      <div class="cases-list">
        <div
          v-for="caseRecord in filteredCaseRecords"
          :key="caseRecord.id"
          class="case-card"
        >
          <div class="case-header">
            <div class="case-title-section">
              <h3 class="case-title">{{ caseRecord.title }}</h3>
              <div class="case-meta">
                <span class="case-type">附件 {{ caseRecord.files?.length || 0 }} 个</span>
                <span
                  class="case-status"
                  :style="{
                    color: getStatusInfo(caseRecord.status).color,
                    backgroundColor: getStatusInfo(caseRecord.status).bgColor
                  }"
                >
                  {{ getStatusInfo(caseRecord.status).icon }} {{ getStatusInfo(caseRecord.status).text }}
                </span>
              </div>
            </div>

            <div class="case-date">
              <span class="date-label">更新时间：</span>
              <span class="date-value">{{ formatDateTime(caseRecord.updatedAt) }}</span>
            </div>
          </div>

          <div class="case-content">
            <p class="case-description">{{ caseRecord.description || '暂无描述' }}</p>

            <div class="case-details">
              <div class="detail-section">
                <h5>主要症状：</h5>
                <div class="symptoms-tags">
                  <span class="symptom-tag">暂无症状记录</span>
                </div>
              </div>
            </div>

            <div class="case-files">
              <h5>附件文件 ({{ caseRecord.files?.length || 0 }})：</h5>
              <div class="files-list">
                <div
                  v-for="file in caseRecord.files || []"
                  :key="file.id"
                  class="file-item"
                >
                  <div class="file-thumbnail">
                    <div class="file-icon">
                      {{ file.mimeType?.startsWith('video/') ? '🎥' : file.mimeType?.startsWith('image/') ? '🖼️' : '📄' }}
                    </div>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.originalName }}</div>
                    <div class="file-meta">
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      <span class="file-privacy">🔒 已上传</span>
                    </div>
                  </div>
                </div>
                <div v-if="!caseRecord.files || caseRecord.files.length === 0" class="no-files">
                  暂无附件
                </div>
              </div>
            </div>

            <div class="privacy-indicators">
              <div class="privacy-item">
                <span class="privacy-icon">🔒</span>
                <span class="privacy-text">安全存储</span>
              </div>
            </div>
          </div>

          <div class="case-actions">
            <button class="action-btn edit-btn" @click="openEdit(caseRecord)">编辑</button>
            <button class="action-btn danger-btn" @click="confirmDelete(caseRecord)">删除</button>
            <button class="action-btn view-btn">查看详情</button>
            <button class="action-btn download-btn">下载附件</button>
          </div>
        </div>
      </div>

      <div v-if="filteredCaseRecords.length === 0" class="no-cases">
        <p>暂无符合条件的病例记录</p>
      </div>
    </div>

    <!-- 隐私规则标签页 -->
    <div v-if="activeTab === 'rules'" class="rules-section">
      <div class="rules-header">
        <h2>隐私保护规则</h2>
        <p>了解各类病例上传的隐私保护要求和指导原则</p>
      </div>

      <div class="rules-content">
        <div
          v-for="rule in uploadRules"
          :key="rule.id"
          class="rule-detail-card"
        >
          <div class="rule-detail-header">
            <h3>{{ rule.name }}</h3>
            <span
              class="privacy-level"
              :style="{
                color: getPrivacyLevelInfo(rule.requiredPrivacyLevel).color,
                backgroundColor: getPrivacyLevelInfo(rule.requiredPrivacyLevel).bgColor
              }"
            >
              {{ getPrivacyLevelInfo(rule.requiredPrivacyLevel).text }}
            </span>
          </div>

          <p class="rule-detail-description">{{ rule.description }}</p>

          <div class="rule-specifications">
            <div class="spec-section">
              <h4>📋 技术规格</h4>
              <ul>
                <li>最大文件大小：{{ rule.maxFileSize }}MB</li>
                <li>支持文件类型：{{ rule.allowedFileTypes.join(', ') }}</li>
                <li>允许身体部位：{{ rule.allowedBodyParts.length }}种</li>
              </ul>
            </div>

            <div class="spec-section">
              <h4>📖 操作指导</h4>
              <ol>
                <li v-for="guideline in rule.guidelines" :key="guideline">
                  {{ guideline }}
                </li>
              </ol>
            </div>



            <div class="spec-section">
              <h4>💡 示例说明</h4>
              <div class="examples-list">
                <span
                  v-for="example in rule.examples"
                  :key="example"
                  class="example-tag"
                >
                  {{ example }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeModal">
      <div class="upload-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedRule?.name }} - 安全上传</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="modal-content">
          <form @submit.prevent="submitCaseUpload" class="upload-form">
            <div class="form-section">
              <h3>基本信息</h3>

              <div class="form-group">
                <label>病例标题 *</label>
                <input
                  v-model="uploadForm.title"
                  type="text"
                  placeholder="请输入病例标题"
                  required
                >
              </div>

              <div class="form-group">
                <label>病例描述（可选）</label>
                <textarea
                  v-model="uploadForm.description"
                  rows="4"
                  placeholder="请详细描述病例情况，注意保护患者隐私"
                ></textarea>
              </div>

              <div class="form-group">
                <label>类型</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="uploadForm.caseType" value="online">
                    <span>线上诊疗</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="uploadForm.caseType" value="offline">
                    <span>线下门诊</span>
                  </label>
                </div>
              </div>
            </div>



            <div class="form-section">
              <h3>文件上传</h3>
              <div class="file-upload-area">
                <input
                  type="file"
                  multiple
                  :accept="selectedRule?.allowedFileTypes.join(',')"
                  @change="handleFileUpload"
                  class="file-input"
                  id="file-upload"
                >
                <label for="file-upload" class="file-upload-label">
                  <div class="upload-icon">📤</div>
                  <div class="upload-text">
                    <p>点击上传文件或拖拽文件到此处</p>
                    <p class="upload-hint">
                      支持：{{ selectedRule?.allowedFileTypes.join(', ') }}，
                      最大 {{ selectedRule?.maxFileSize }}MB
                    </p>
                  </div>
                </label>

                <div v-if="uploadForm.files.length > 0" class="uploaded-files">
                  <h4>已选择文件：</h4>
                  <div
                    v-for="(file, index) in uploadForm.files"
                    :key="index"
                    class="uploaded-file-item"
                  >
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
              </div>
            </div>



            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">
                取消
              </button>
              <button type="submit" class="submit-btn">
                安全上传
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEdit">
      <div class="upload-modal" @click.stop>
        <div class="modal-header">
          <h2>编辑病例</h2>
          <button class="close-btn" @click="closeEdit">×</button>
        </div>
        <div class="modal-content">
          <form @submit.prevent="submitEdit" class="upload-form">
            <div class="form-section">
              <div class="form-group">
                <label>病例标题 *</label>
                <input v-model="editForm.title" type="text" required />
              </div>
              <div class="form-group">
                <label>病例描述（可选）</label>
                <textarea v-model="editForm.description" rows="4"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeEdit">取消</button>
              <button type="submit" class="submit-btn">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.case-privacy-container {
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

/* 医生认证卡片 */
.doctor-verification-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: white;
}

.verification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.verified-badge {
  background: rgba(76, 175, 80, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  backdrop-filter: blur(10px);
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

/* 标签页导航 */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tab-btn {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.tab-btn:hover {
  background: #f0f8ff;
  color: #2196f3;
}

.tab-btn.active {
  background: #42b883;
  color: white;
}

/* 上传规则网格 */
.upload-header {
  text-align: center;
  margin-bottom: 2rem;
}

.upload-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.upload-rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.rule-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.rule-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: #42b883;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.rule-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.privacy-level {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.rule-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.rule-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.rule-info {
  text-align: center;
}

.info-label {
  display: block;
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
}

.rule-guidelines h5 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.rule-guidelines ul {
  margin: 0 0 1rem 0;
  padding-left: 1.2rem;
}

.rule-guidelines li {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.upload-btn {
  width: 100%;
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.upload-btn:hover {
  background: #369870;
}

/* 筛选区域 */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
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
}

.search-input:focus {
  outline: none;
  border-color: #42b883;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

/* 病例列表 */
.cases-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.case-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.case-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.case-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.case-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.case-type {
  background: #e3f2fd;
  color: #2196f3;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.case-status {
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
}

.case-date {
  text-align: right;
}

.date-label {
  color: #666;
  font-size: 0.8rem;
}

.date-value {
  color: #2c3e50;
  font-weight: 500;
}

.case-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.case-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-section h5 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.symptoms-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.symptom-tag {
  background: #fff3e0;
  color: #ff9800;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.more-symptoms {
  background: #f0f0f0;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.case-files {
  margin-bottom: 1rem;
}

.case-files h5 {
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
}

.files-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  min-width: 200px;
}

.file-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 1.5rem;
}

.file-name {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.file-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.file-size {
  color: #666;
}

.file-privacy {
  color: #42b883;
}

.privacy-indicators {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.privacy-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0f8ff;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.privacy-icon {
  font-size: 1rem;
}

.privacy-text {
  color: #2196f3;
  font-size: 0.85rem;
  font-weight: 500;
}

.case-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
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

.edit-btn {
  background: #fff3e0;
  color: #ff9800;
}

.edit-btn:hover {
  background: #ffe0b2;
}

.download-btn {
  background: #e8f5e8;
  color: #42b883;
}

.download-btn:hover {
  background: #c8e6c9;
}

.no-cases {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

/* 规则详情 */
.rules-header {
  text-align: center;
  margin-bottom: 2rem;
}

.rules-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.rule-detail-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.rule-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #42b883;
}

.rule-detail-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.4rem;
}

.rule-detail-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.rule-specifications {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.spec-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.spec-section ul,
.spec-section ol {
  margin: 0;
  padding-left: 1.5rem;
}

.spec-section li {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.examples-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.example-tag {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.3rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
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

.upload-modal {
  background: white;
  border-radius: 12px;
  max-width: 700px;
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

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-section h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b883;
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}



.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkbox-label:hover {
  border-color: #42b883;
  background: #f0f8ff;
}

.checkbox-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.option-icon {
  font-size: 1.5rem;
}

.option-text {
  display: flex;
  flex-direction: column;
}

.option-label {
  color: #2c3e50;
  font-weight: 500;
}

.option-description {
  color: #666;
  font-size: 0.85rem;
}

.file-upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.file-upload-area:hover {
  border-color: #42b883;
  background: #f0f8ff;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.upload-icon {
  font-size: 3rem;
  color: #42b883;
}

.upload-text p {
  margin: 0;
  color: #2c3e50;
}

.upload-hint {
  font-size: 0.9rem;
  color: #666;
}

.uploaded-files {
  margin-top: 1rem;
  text-align: left;
}

.uploaded-files h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.uploaded-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.file-name {
  color: #2c3e50;
  font-weight: 500;
}

.file-size {
  color: #666;
  font-size: 0.9rem;
}



.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.submit-btn {
  background: #42b883;
  color: white;
}

.submit-btn:hover {
  background: #369870;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-privacy-container {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .verification-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .doctor-info {
    flex-direction: column;
    text-align: center;
  }

  .statistics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .tab-navigation {
    flex-direction: column;
  }

  .filters-section {
    flex-direction: column;
    gap: 1rem;
  }

  .search-group {
    min-width: auto;
  }

  .upload-rules-grid {
    grid-template-columns: 1fr;
  }

  .case-header {
    flex-direction: column;
    gap: 1rem;
  }

  .case-details {
    grid-template-columns: 1fr;
  }

  .files-list {
    flex-direction: column;
  }

  .case-actions {
    flex-direction: column;
  }

  .rule-specifications {
    grid-template-columns: 1fr;
  }





  .form-actions {
    flex-direction: column;
  }
}

.no-files {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}
</style>