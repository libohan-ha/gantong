<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue'
import { API_BASE_URL } from '@/services/api'
import { getMyProfile, type DoctorProfile as Profile } from '@/services/doctor'
import {
  addCaseFiles,
  deleteCase as apiDeleteCase,
  getMyCases,
  removeCaseFile,
  type BackendCaseFile,
  type BackendCaseRecord,
  type CaseType,
  updateCase as apiUpdateCase,
  uploadCase,
} from '@/services/cases'
import {
  Lock,
  Upload,
  FolderOpened,
  Document,
  VideoCamera,
  Picture,
  Download,
  Edit,
  Delete,
  View,
  Plus,
  Close,
  ArrowRight,
} from '@element-plus/icons-vue'

type CaseStatus = BackendCaseRecord['status']
type TabKey = 'upload' | 'manage' | 'rules'
type ApiError = { response?: { data?: { message?: string | string[] } } }
interface UploadRule {
  id: string
  name: string
  description: string
  maxFileSizeMB: number
  allowedFileTypes: string[]
  icon: Component
  color: string
  bg: string
  tag: string
}

const rules: UploadRule[] = [
  { id: 'partial', name: '局部症状上传', description: '只上传症状相关片段，避免暴露隐私。', maxFileSizeMB: 50, allowedFileTypes: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'], icon: Picture, color: '#5b8def', bg: '#eef3ff', tag: '隐私' },
  { id: 'functional', name: '功能评估上传', description: '上传训练过程、动作评估素材。', maxFileSizeMB: 100, allowedFileTypes: ['video/mp4', 'image/jpeg', 'image/png'], icon: VideoCamera, color: '#e67e5a', bg: '#fff3ee', tag: '评估' },
  { id: 'document', name: '匿名文档上传', description: '上传脱敏报告和检查文档。', maxFileSizeMB: 20, allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'], icon: Document, color: '#4ec3a0', bg: '#edfaf5', tag: '文档' },
]
const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4']
const DEFAULT_MAX_MB = 200

const doctorProfile = ref<Profile | null>(null)
const activeTab = ref<TabKey>('upload')
const caseRecords = ref<BackendCaseRecord[]>([])
const selectedRule = ref<UploadRule | null>(null)
const showUploadModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const loadingCases = ref(false)
const editingCase = ref<BackendCaseRecord | null>(null)
const detailCase = ref<BackendCaseRecord | null>(null)
const filterStatus = ref<CaseStatus | 'all'>('all')
const filterType = ref<CaseType | 'all'>('all')
const searchKeyword = ref('')

const uploadForm = ref({ title: '', description: '', caseType: 'online' as CaseType, files: [] as File[] })
const editForm = ref({ title: '', description: '', caseType: 'online' as CaseType, newFiles: [] as File[] })

const errorMessage = (e: unknown, fallback: string) => {
  const msg = (e as ApiError)?.response?.data?.message
  if (Array.isArray(msg)) return msg.find((i) => typeof i === 'string' && i.trim()) ?? fallback
  return typeof msg === 'string' && msg.trim() ? msg : fallback
}
const hasCjk = (value: string) => /[\u4e00-\u9fff]/.test(value)
const decodeLatin1ToUtf8 = (value: string) => {
  const bytes = Uint8Array.from(Array.from(value), (char) => char.charCodeAt(0) & 0xff)
  return new TextDecoder('utf-8').decode(bytes)
}
const normalizeFilename = (value: string) => {
  if (!value) return value
  const decoded = decodeLatin1ToUtf8(value)
  if (!decoded || decoded.includes('�')) return value
  if (!hasCjk(value) && hasCjk(decoded)) return decoded
  return value
}
const normalize = (r: BackendCaseRecord): BackendCaseRecord => ({
  ...r,
  caseType: r.caseType === 'offline' ? 'offline' : 'online',
  files: Array.isArray(r.files)
    ? r.files.map((file) => ({
      ...file,
      originalName: normalizeFilename(file.originalName),
    }))
    : [],
})
const upsert = (r: BackendCaseRecord, prepend = false) => {
  const item = normalize(r)
  const i = caseRecords.value.findIndex((x) => x.id === item.id)
  if (i >= 0) caseRecords.value[i] = item
  else if (prepend) caseRecords.value.unshift(item)
  else caseRecords.value.push(item)
  if (editingCase.value?.id === item.id) editingCase.value = item
  if (detailCase.value?.id === item.id) detailCase.value = item
}
const removeById = (id: number) => {
  caseRecords.value = caseRecords.value.filter((x) => x.id !== id)
  if (editingCase.value?.id === id) editingCase.value = null
  if (detailCase.value?.id === id) detailCase.value = null
}

const load = async () => {
  loadingCases.value = true
  try {
    doctorProfile.value = await getMyProfile()
    const res = await getMyCases({ page: 1, pageSize: 100 })
    caseRecords.value = res.items.map((i) => normalize(i))
  } catch (e) {
    console.error(e)
  } finally {
    loadingCases.value = false
  }
}
onMounted(load)

const filteredCaseRecords = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  return [...caseRecords.value]
    .filter((r) => filterStatus.value === 'all' || r.status === filterStatus.value)
    .filter((r) => filterType.value === 'all' || r.caseType === filterType.value)
    .filter((r) => !kw || r.title.toLowerCase().includes(kw) || (r.description ?? '').toLowerCase().includes(kw))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

const statistics = computed(() => ({
  total: caseRecords.value.length,
  uploaded: caseRecords.value.filter((r) => r.status === 'uploaded').length,
  approved: caseRecords.value.filter((r) => r.status === 'approved').length,
  online: caseRecords.value.filter((r) => r.caseType === 'online').length,
  offline: caseRecords.value.filter((r) => r.caseType === 'offline').length,
}))

const statusText: Record<CaseStatus, string> = { uploaded: '已上传', reviewed: '审核中', approved: '已通过', rejected: '已拒绝' }
const statusColor: Record<CaseStatus, string> = { uploaded: '#5b8def', reviewed: '#f59e42', approved: '#4ec3a0', rejected: '#ef4444' }
const typeText = (t: CaseType) => (t === 'offline' ? '线下门诊' : '线上诊疗')
const formatDate = (v: string) => new Date(v).toLocaleString('zh-CN')
const formatSize = (size: number) => {
  if (!size) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(size) / Math.log(k))
  return `${(size / Math.pow(k, i)).toFixed(1)} ${u[i]}`
}

const validateFiles = (files: File[], maxMB = DEFAULT_MAX_MB, allow = DEFAULT_ACCEPT) =>
  files.filter((f) => {
    if (!allow.includes(f.type)) return false
    if (f.size > maxMB * 1024 * 1024) return false
    return true
  })

const onUploadFiles = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  uploadForm.value.files = validateFiles(files, selectedRule.value?.maxFileSizeMB, selectedRule.value?.allowedFileTypes)
}
const onEditFiles = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  editForm.value.newFiles = validateFiles(files)
}
const rmUploadFile = (idx: number) => uploadForm.value.files.splice(idx, 1)
const rmEditFile = (idx: number) => editForm.value.newFiles.splice(idx, 1)

const openUpload = (rule: UploadRule) => { selectedRule.value = rule; showUploadModal.value = true }
const closeUpload = () => { showUploadModal.value = false; selectedRule.value = null; uploadForm.value = { title: '', description: '', caseType: 'online', files: [] } }
const submitUpload = async () => {
  if (!uploadForm.value.title.trim()) return alert('请填写病例标题')
  if (!uploadForm.value.files.length) return alert('请至少上传一个附件')
  try {
    const created = await uploadCase({ title: uploadForm.value.title.trim(), description: uploadForm.value.description.trim() || undefined, caseType: uploadForm.value.caseType, files: uploadForm.value.files })
    upsert(created, true)
    closeUpload()
    activeTab.value = 'manage'
  } catch (e) {
    alert(errorMessage(e, '上传失败'))
  }
}

const openEdit = (r: BackendCaseRecord) => { editingCase.value = r; editForm.value = { title: r.title, description: r.description ?? '', caseType: r.caseType, newFiles: [] }; showEditModal.value = true }
const closeEdit = () => { showEditModal.value = false; editingCase.value = null; editForm.value.newFiles = [] }
const submitEdit = async () => {
  if (!editingCase.value) return
  if (!editForm.value.title.trim()) return alert('请填写病例标题')
  try {
    let updated = await apiUpdateCase(editingCase.value.id, { title: editForm.value.title.trim(), description: editForm.value.description.trim() || null, caseType: editForm.value.caseType })
    if (editForm.value.newFiles.length) updated = await addCaseFiles(editingCase.value.id, editForm.value.newFiles)
    upsert(updated)
    closeEdit()
  } catch (e) {
    alert(errorMessage(e, '保存失败'))
  }
}
const removeExistingFile = async (file: BackendCaseFile) => {
  if (!editingCase.value) return
  if (!confirm(`确认删除附件"${file.originalName}"？`)) return
  try {
    const updated = await removeCaseFile(editingCase.value.id, file.id)
    upsert(updated)
  } catch (e) {
    alert(errorMessage(e, '删除附件失败'))
  }
}
const removeCase = async (r: BackendCaseRecord) => {
  if (!confirm('确认删除该病例？')) return
  try { await apiDeleteCase(r.id); removeById(r.id) } catch (e) { alert(errorMessage(e, '删除失败')) }
}

const openDetail = (r: BackendCaseRecord) => { detailCase.value = r; showDetailModal.value = true }
const closeDetail = () => { showDetailModal.value = false; detailCase.value = null }

const fileUrl = (storagePath: string) => {
  if (/^https?:\/\//i.test(storagePath)) return storagePath
  const n = storagePath.replace(/\\/g, '/')
  const relative = n.includes('/uploads/') ? (n.split('/uploads/').pop() ?? '') : n.replace(/^uploads\//, '')
  return `${API_BASE_URL}/static/${relative.replace(/^\/+/, '')}`
}
const downloadFile = (f: BackendCaseFile) => {
  const a = document.createElement('a')
  a.href = fileUrl(f.storagePath)
  a.download = f.originalName
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
const downloadAll = (r: BackendCaseRecord) => {
  if (!r.files.length) return alert('暂无附件')
  r.files.forEach((f, i) => setTimeout(() => downloadFile(f), i * 150))
}
</script>

<template>
  <div class="privacy-layout">
    <section class="hero-header">
      <div class="hero-inner">
        <span class="hero-badge">隐私保护</span>
        <h1>病例隐私保护</h1>
        <p>安全上传患儿资料，支持线上/线下分类与附件管理</p>
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-circle c3"></div>
      </div>
    </section>

    <section class="doctor-card">
      <div class="doctor-avatar">{{ (doctorProfile?.name || '医').charAt(0) }}</div>
      <div class="doctor-info">
        <h3>{{ doctorProfile?.name || '未设置姓名' }}</h3>
        <p>{{ doctorProfile?.hospital || '未设置医院' }}</p>
      </div>
      <span class="verified-badge">
        <el-icon :size="14"><Lock /></el-icon>
        已认证医师
      </span>
    </section>

    <section class="stat-strip">
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.total }}</span>
        <span class="chip-label">总病例数</span>
      </div>
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.uploaded }}</span>
        <span class="chip-label">已上传</span>
      </div>
      <div class="stat-chip">
        <span class="chip-num">{{ statistics.approved }}</span>
        <span class="chip-label">已通过</span>
      </div>
      <div class="stat-chip dual">
        <span class="chip-num">{{ statistics.online }}<small>/{{ statistics.offline }}</small></span>
        <span class="chip-label">线上/线下</span>
      </div>
    </section>

    <nav class="tab-nav">
      <button :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">
        <el-icon :size="16"><Upload /></el-icon>
        <span>安全上传</span>
      </button>
      <button :class="{ active: activeTab === 'manage' }" @click="activeTab = 'manage'">
        <el-icon :size="16"><FolderOpened /></el-icon>
        <span>病例管理</span>
      </button>
      <button :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">
        <el-icon :size="16"><Document /></el-icon>
        <span>隐私规则</span>
      </button>
    </nav>

    <section v-if="activeTab === 'upload'" class="content-panel">
      <div class="section-title">
        <h2>选择上传模板</h2>
        <span class="section-line"></span>
      </div>
      <div class="upload-grid">
        <article v-for="rule in rules" :key="rule.id" class="upload-card" @click="openUpload(rule)">
          <div class="upload-card-top">
            <div class="upload-icon" :style="{ background: rule.bg, color: rule.color }">
              <el-icon :size="24"><component :is="rule.icon" /></el-icon>
            </div>
            <span class="upload-tag" :style="{ background: rule.bg, color: rule.color }">{{ rule.tag }}</span>
          </div>
          <h3>{{ rule.name }}</h3>
          <p>{{ rule.description }}</p>
          <div class="upload-meta">
            <span>上限 {{ rule.maxFileSizeMB }}MB</span>
            <span>{{ rule.allowedFileTypes.length }} 种类型</span>
          </div>
          <div class="upload-footer">
            <span class="enter-text" :style="{ color: rule.color }">使用模板</span>
            <el-icon :size="14" :style="{ color: rule.color }"><ArrowRight /></el-icon>
          </div>
          <div class="card-bottom-bar" :style="{ background: rule.color }"></div>
        </article>
      </div>
    </section>

    <section v-if="activeTab === 'manage'" class="content-panel">
      <div class="toolbar-row">
        <div class="search-box">
          <input v-model="searchKeyword" type="text" placeholder="搜索标题或描述..." />
        </div>
        <div class="filter-group">
          <select v-model="filterStatus">
            <option value="all">全部状态</option>
            <option value="uploaded">已上传</option>
            <option value="reviewed">审核中</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
          <select v-model="filterType">
            <option value="all">全部类型</option>
            <option value="online">线上</option>
            <option value="offline">线下</option>
          </select>
        </div>
      </div>

      <div v-if="loadingCases" class="empty-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="!filteredCaseRecords.length" class="empty-state">
        <el-icon :size="48" color="#c0c8d0"><FolderOpened /></el-icon>
        <p>暂无符合条件的病例</p>
      </div>
      <div v-else class="case-list">
        <article v-for="record in filteredCaseRecords" :key="record.id" class="case-card">
          <header class="case-header">
            <div class="case-title-wrap">
              <h3>{{ record.title }}</h3>
              <small>更新于 {{ formatDate(record.updatedAt) }}</small>
            </div>
            <div class="case-tags">
              <span class="type-tag" :class="record.caseType">{{ typeText(record.caseType) }}</span>
              <span class="status-tag" :style="{ background: statusColor[record.status] + '18', color: statusColor[record.status] }">{{ statusText[record.status] }}</span>
            </div>
          </header>

          <p class="case-desc">{{ record.description || '暂无描述' }}</p>

          <div class="case-files">
            <h4>
              <el-icon :size="14"><Document /></el-icon>
              附件（{{ record.files.length }}）
            </h4>
            <div v-if="record.files.length" class="file-list">
              <div v-for="file in record.files" :key="file.id" class="file-item">
                <span class="file-name">{{ file.originalName }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
                <button class="file-download" @click="downloadFile(file)">
                  <el-icon :size="14"><Download /></el-icon>
                </button>
              </div>
            </div>
            <div v-else class="no-files">暂无附件</div>
          </div>

          <footer class="case-actions">
            <button class="action-btn edit" @click="openEdit(record)">
              <el-icon :size="14"><Edit /></el-icon>
              编辑
            </button>
            <button class="action-btn delete" @click="removeCase(record)">
              <el-icon :size="14"><Delete /></el-icon>
              删除
            </button>
            <button class="action-btn view" @click="openDetail(record)">
              <el-icon :size="14"><View /></el-icon>
              详情
            </button>
            <button class="action-btn download" @click="downloadAll(record)">
              <el-icon :size="14"><Download /></el-icon>
              下载全部
            </button>
          </footer>
        </article>
      </div>
    </section>

    <section v-if="activeTab === 'rules'" class="content-panel">
      <div class="section-title">
        <h2>隐私规则说明</h2>
        <span class="section-line"></span>
      </div>
      <div class="rules-grid">
        <article v-for="rule in rules" :key="`r-${rule.id}`" class="rule-card">
          <div class="rule-icon" :style="{ background: rule.bg, color: rule.color }">
            <el-icon :size="28"><component :is="rule.icon" /></el-icon>
          </div>
          <h3>{{ rule.name }}</h3>
          <p>{{ rule.description }}</p>
          <div class="rule-types">
            <span class="type-label">允许类型：</span>
            <span class="type-value">{{ rule.allowedFileTypes.map(t => t.split('/')[1].toUpperCase()).join('、') }}</span>
          </div>
          <div class="rule-limit">
            <span class="limit-label">大小上限：</span>
            <span class="limit-value">{{ rule.maxFileSizeMB }}MB</span>
          </div>
        </article>
      </div>
    </section>

    <div v-if="showUploadModal" class="modal-overlay" @click="closeUpload">
      <div class="modal-panel" @click.stop>
        <header class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-icon" :style="{ background: selectedRule?.bg, color: selectedRule?.color }">
              <el-icon :size="20"><component :is="selectedRule?.icon" /></el-icon>
            </div>
            <h2>{{ selectedRule?.name }}</h2>
          </div>
          <button class="modal-close" @click="closeUpload">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </header>
        <form class="modal-form" @submit.prevent="submitUpload">
          <div class="form-group">
            <label>病例标题 <span class="required">*</span></label>
            <input v-model="uploadForm.title" required placeholder="请输入病例标题" />
          </div>
          <div class="form-group">
            <label>病例描述</label>
            <textarea v-model="uploadForm.description" rows="3" placeholder="请输入病例描述（可选）" />
          </div>
          <div class="form-group">
            <label>病例类型</label>
            <div class="radio-group">
              <label class="radio-item" :class="{ active: uploadForm.caseType === 'online' }">
                <input v-model="uploadForm.caseType" type="radio" value="online" />
                <span class="radio-label">线上诊疗</span>
              </label>
              <label class="radio-item" :class="{ active: uploadForm.caseType === 'offline' }">
                <input v-model="uploadForm.caseType" type="radio" value="offline" />
                <span class="radio-label">线下门诊</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>上传附件 <span class="required">*</span></label>
            <div class="file-upload-area">
              <input type="file" multiple :accept="selectedRule?.allowedFileTypes.join(',')" @change="onUploadFiles" />
              <div class="upload-hint">
                <el-icon :size="24" color="#a0aec0"><Upload /></el-icon>
                <p>点击或拖拽文件到此处上传</p>
                <small>最大 {{ selectedRule?.maxFileSizeMB }}MB</small>
              </div>
            </div>
          </div>
          <div v-if="uploadForm.files.length" class="file-preview-list">
            <div v-for="(f, i) in uploadForm.files" :key="`${f.name}-${i}`" class="preview-item">
              <span class="preview-name">{{ f.name }}</span>
              <span class="preview-size">{{ formatSize(f.size) }}</span>
              <button type="button" class="preview-remove" @click="rmUploadFile(i)">
                <el-icon :size="14"><Close /></el-icon>
              </button>
            </div>
          </div>
          <footer class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeUpload">取消</button>
            <button type="submit" class="btn-submit">
              <el-icon :size="16"><Upload /></el-icon>
              提交上传
            </button>
          </footer>
        </form>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click="closeEdit">
      <div class="modal-panel" @click.stop>
        <header class="modal-header">
          <h2>编辑病例</h2>
          <button class="modal-close" @click="closeEdit">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </header>
        <form class="modal-form" @submit.prevent="submitEdit">
          <div class="form-group">
            <label>病例标题 <span class="required">*</span></label>
            <input v-model="editForm.title" required placeholder="请输入病例标题" />
          </div>
          <div class="form-group">
            <label>病例描述</label>
            <textarea v-model="editForm.description" rows="3" placeholder="请输入病例描述（可选）" />
          </div>
          <div class="form-group">
            <label>病例类型</label>
            <div class="radio-group">
              <label class="radio-item" :class="{ active: editForm.caseType === 'online' }">
                <input v-model="editForm.caseType" type="radio" value="online" />
                <span class="radio-label">线上诊疗</span>
              </label>
              <label class="radio-item" :class="{ active: editForm.caseType === 'offline' }">
                <input v-model="editForm.caseType" type="radio" value="offline" />
                <span class="radio-label">线下门诊</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>已有附件</label>
            <div v-if="editingCase?.files.length" class="file-preview-list">
              <div v-for="f in editingCase.files" :key="f.id" class="preview-item">
                <span class="preview-name">{{ f.originalName }}</span>
                <span class="preview-size">{{ formatSize(f.size) }}</span>
                <button type="button" class="preview-remove danger" @click="removeExistingFile(f)">
                  <el-icon :size="14"><Delete /></el-icon>
                </button>
              </div>
            </div>
            <div v-else class="no-files-hint">暂无附件</div>
          </div>
          <div class="form-group">
            <label>新增附件</label>
            <div class="file-upload-area small">
              <input type="file" multiple :accept="DEFAULT_ACCEPT.join(',')" @change="onEditFiles" />
              <div class="upload-hint">
                <el-icon :size="20" color="#a0aec0"><Plus /></el-icon>
                <p>添加新附件</p>
              </div>
            </div>
          </div>
          <div v-if="editForm.newFiles.length" class="file-preview-list">
            <div v-for="(f, i) in editForm.newFiles" :key="`${f.name}-${i}`" class="preview-item">
              <span class="preview-name">{{ f.name }}</span>
              <span class="preview-size">{{ formatSize(f.size) }}</span>
              <button type="button" class="preview-remove" @click="rmEditFile(i)">
                <el-icon :size="14"><Close /></el-icon>
              </button>
            </div>
          </div>
          <footer class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeEdit">取消</button>
            <button type="submit" class="btn-submit">
              <el-icon :size="16"><Edit /></el-icon>
              保存修改
            </button>
          </footer>
        </form>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetail">
      <div class="modal-panel" @click.stop>
        <header class="modal-header">
          <h2>病例详情</h2>
          <button class="modal-close" @click="closeDetail">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </header>
        <div v-if="detailCase" class="detail-content">
          <div class="detail-row">
            <span class="detail-label">标题</span>
            <span class="detail-value">{{ detailCase.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">类型</span>
            <span class="type-tag" :class="detailCase.caseType">{{ typeText(detailCase.caseType) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">状态</span>
            <span class="status-tag" :style="{ background: statusColor[detailCase.status] + '18', color: statusColor[detailCase.status] }">{{ statusText[detailCase.status] }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">创建时间</span>
            <span class="detail-value">{{ formatDate(detailCase.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">更新时间</span>
            <span class="detail-value">{{ formatDate(detailCase.updatedAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">描述</span>
            <span class="detail-value">{{ detailCase.description || '暂无描述' }}</span>
          </div>
          <div class="detail-section">
            <h4>附件（{{ detailCase.files.length }}）</h4>
            <div v-if="detailCase.files.length" class="file-preview-list">
              <div v-for="f in detailCase.files" :key="`d-${f.id}`" class="preview-item">
                <span class="preview-name">{{ f.originalName }}</span>
                <span class="preview-size">{{ formatSize(f.size) }}</span>
                <button type="button" class="preview-download" @click="downloadFile(f)">
                  <el-icon :size="14"><Download /></el-icon>
                </button>
              </div>
            </div>
            <div v-else class="no-files-hint">暂无附件</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacy-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hero-header {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 18px;
  padding: 2rem 2.25rem;
  color: #fff;
  overflow: hidden;
}

.hero-inner {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: rgba(91, 141, 239, 0.25);
  color: #93b4f8;
  border-radius: 999px;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.hero-header h1 {
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.hero-header p {
  margin: 0;
  font-size: 0.88rem;
  color: #94a3b8;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.c1 { width: 180px; height: 180px; background: #5b8def; top: -50px; right: -20px; }
.c2 { width: 100px; height: 100px; background: #a78bfa; bottom: -30px; right: 80px; }
.c3 { width: 60px; height: 60px; background: #4ec3a0; top: 15px; right: 150px; }

.doctor-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 1rem 1.25rem;
}

.doctor-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 700;
  flex-shrink: 0;
}

.doctor-info {
  flex: 1;
}

.doctor-info h3 {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.doctor-info p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  background: #edfaf5;
  color: #059669;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
}

.stat-strip {
  display: flex;
  gap: 0.85rem;
}

.stat-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
}

.chip-num {
  font-size: 1.4rem;
  font-weight: 750;
  color: #1e293b;
  line-height: 1;
}

.chip-num small {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
}

.chip-label {
  font-size: 0.78rem;
  color: #64748b;
}

.tab-nav {
  display: flex;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  padding: 0.4rem;
}

.tab-nav button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-nav button:hover {
  background: #f8fafc;
  color: #1e293b;
}

.tab-nav button.active {
  background: #5b8def;
  color: #fff;
}

.content-panel {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 1.25rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-title h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
}

.section-line {
  flex: 1;
  height: 1px;
  background: #e8eaef;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.upload-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.upload-card:hover {
  border-color: transparent;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.upload-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.upload-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.upload-card h3 {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.upload-card p {
  margin: 0 0 0.6rem;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.5;
}

.upload-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.upload-footer {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.enter-text {
  font-size: 0.82rem;
  font-weight: 500;
}

.card-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 0 0 14px 14px;
}

.toolbar-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-box {
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.88rem;
  transition: border-color 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #5b8def;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

.filter-group select {
  padding: 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.85rem;
  background: #fff;
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #94a3b8;
  gap: 0.75rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #5b8def;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.case-card {
  border: 1px solid #eef0f4;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  transition: box-shadow 0.2s ease;
}

.case-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.6rem;
}

.case-title-wrap h3 {
  margin: 0 0 0.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.case-title-wrap small {
  font-size: 0.75rem;
  color: #94a3b8;
}

.case-tags {
  display: flex;
  gap: 0.4rem;
}

.type-tag {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
}

.type-tag.online {
  background: #eef3ff;
  color: #5b8def;
}

.type-tag.offline {
  background: #fff3ee;
  color: #e67e5a;
}

.status-tag {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
}

.case-desc {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
}

.case-files {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.case-files h4 {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: #fff;
  border-radius: 6px;
  font-size: 0.8rem;
}

.file-name {
  flex: 1;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.file-download {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: #eef3ff;
  color: #5b8def;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-download:hover {
  background: #5b8def;
  color: #fff;
}

.no-files {
  font-size: 0.8rem;
  color: #94a3b8;
}

.case-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: #eef3ff;
  color: #5b8def;
}

.action-btn.edit:hover {
  background: #5b8def;
  color: #fff;
}

.action-btn.delete {
  background: #fef2f2;
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #ef4444;
  color: #fff;
}

.action-btn.view {
  background: #f0fdf4;
  color: #059669;
}

.action-btn.view:hover {
  background: #059669;
  color: #fff;
}

.action-btn.download {
  background: #f8fafc;
  color: #64748b;
}

.action-btn.download:hover {
  background: #64748b;
  color: #fff;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.rule-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
}

.rule-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.85rem;
}

.rule-card h3 {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.rule-card p {
  margin: 0 0 0.75rem;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.5;
}

.rule-types, .rule-limit {
  font-size: 0.78rem;
  margin-bottom: 0.25rem;
}

.type-label, .limit-label {
  color: #94a3b8;
}

.type-value, .limit-value {
  color: #475569;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-panel {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.35rem;
  border-bottom: 1px solid #f0f0f5;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.modal-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #f8fafc;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #ef4444;
  color: #fff;
}

.modal-form {
  padding: 1.25rem 1.35rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
}

.required {
  color: #ef4444;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.88rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #5b8def;
}

.radio-group {
  display: flex;
  gap: 0.5rem;
}

.radio-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-item input {
  display: none;
}

.radio-item:hover {
  border-color: #5b8def;
}

.radio-item.active {
  border-color: #5b8def;
  background: #eef3ff;
}

.radio-label {
  font-size: 0.85rem;
  color: #334155;
}

.file-upload-area {
  position: relative;
  border: 2px dashed #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  transition: border-color 0.2s ease;
}

.file-upload-area:hover {
  border-color: #5b8def;
}

.file-upload-area input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.upload-hint p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.upload-hint small {
  font-size: 0.75rem;
  color: #94a3b8;
}

.file-upload-area.small {
  padding: 0.85rem;
}

.file-preview-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  background: #f8fafc;
  border-radius: 8px;
}

.preview-name {
  flex: 1;
  font-size: 0.82rem;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-size {
  font-size: 0.75rem;
  color: #94a3b8;
}

.preview-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-remove:hover {
  background: #ef4444;
  color: #fff;
}

.preview-remove.danger {
  background: #fee2e2;
  color: #ef4444;
}

.preview-download {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: #eef3ff;
  color: #5b8def;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-download:hover {
  background: #5b8def;
  color: #fff;
}

.no-files-hint {
  padding: 0.6rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.82rem;
  color: #94a3b8;
  text-align: center;
}

.modal-footer {
  display: flex;
  gap: 0.65rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f5;
}

.btn-cancel {
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-submit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 1rem;
  border: none;
  background: #5b8def;
  color: #fff;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit:hover {
  background: #4a7de0;
}

.detail-content {
  padding: 1.25rem 1.35rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f0f0f5;
}

.detail-row:last-of-type {
  border-bottom: none;
}

.detail-label {
  width: 80px;
  font-size: 0.82rem;
  color: #94a3b8;
  flex-shrink: 0;
}

.detail-value {
  font-size: 0.88rem;
  color: #334155;
}

.detail-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f5;
}

.detail-section h4 {
  margin: 0 0 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

@media (max-width: 900px) {
  .upload-grid, .rules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .upload-grid, .rules-grid {
    grid-template-columns: 1fr;
  }

  .stat-strip {
    flex-wrap: wrap;
  }

  .stat-chip {
    flex: 1 1 45%;
  }

  .toolbar-row {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    flex: 1;
  }

  .case-actions {
    flex-wrap: wrap;
  }
}
</style>
