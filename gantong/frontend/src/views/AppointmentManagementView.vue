<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'
import {
  Calendar,
  Clock,
  Check,
  Warning,
  User,
  Phone,
  Document,
  View,
  Check as CheckIcon,
  Close,
  ArrowRight,
  Search,
  Filter,
} from '@element-plus/icons-vue'

type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
type UrgencyLevel = 'normal' | 'urgent' | 'emergency'

interface Appointment {
  id: number
  doctorUserId: number
  childName: string
  childAge: number
  childGender: string
  parentName: string
  parentPhone: string
  preferredDate: string | null
  preferredTime: string | null
  symptoms: string | null
  previousTreatment: string | null
  expertName: string
  expertHospital: string
  status: AppointmentStatus
  submitTime: string
  urgency: UrgencyLevel
  notes: string | null
}

interface AppointmentApiItem {
  id: number
  doctorUserId?: number
  childName: string
  childAge: number
  childGender: string
  parentName: string
  parentPhone: string
  preferredDate: string | null
  preferredTime: string | null
  symptoms: string | null
  previousTreatment: string | null
  doctorName?: string
  doctorHospital?: string
  status?: AppointmentStatus
  createdAt: string
  notes?: string | null
}

type ApiError = {
  response?: {
    data?: {
      message?: string | string[]
    }
  }
}

const appointments = ref<Appointment[]>([])
const loading = ref(false)
const error = ref('')
const selectedAppointment = ref<Appointment | null>(null)
const showDetailModal = ref(false)
const filterStatus = ref<'all' | AppointmentStatus>('all')
const filterUrgency = ref<'all' | UrgencyLevel>('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const getErrorMessage = (e: unknown, fallback: string) => {
  const message = (e as ApiError)?.response?.data?.message
  if (Array.isArray(message)) return message.join('，')
  return typeof message === 'string' && message.trim() ? message : fallback
}

const loadAppointments = async () => {
  try {
    loading.value = true
    error.value = ''
    const res = await api.get('/admin/appointments', { params: { page: 1, pageSize: 100 } })
    const items = ((res.data as { items?: AppointmentApiItem[] }).items ?? [])
    appointments.value = items.map((it) => ({
      id: it.id,
      doctorUserId: it.doctorUserId ?? 0,
      childName: it.childName,
      childAge: it.childAge,
      childGender: it.childGender,
      parentName: it.parentName,
      parentPhone: it.parentPhone,
      preferredDate: it.preferredDate,
      preferredTime: it.preferredTime,
      symptoms: it.symptoms,
      previousTreatment: it.previousTreatment,
      expertName: it.doctorName ?? '',
      expertHospital: it.doctorHospital ?? '',
      status: it.status ?? 'pending',
      submitTime: it.createdAt,
      urgency: 'normal',
      notes: it.notes ?? null,
    }))
  } catch (e) {
    error.value = getErrorMessage(e, '加载预约列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadAppointments)

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'confirmed', label: '已确认' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
] as const

const urgencyOptions = [
  { value: 'all', label: '全部等级' },
  { value: 'normal', label: '普通' },
  { value: 'urgent', label: '紧急' },
  { value: 'emergency', label: '特急' },
] as const

const filteredAppointments = computed(() => {
  const keyword = searchKeyword.value.trim()
  return appointments.value.filter((appointment) => {
    const statusMatch = filterStatus.value === 'all' || appointment.status === filterStatus.value
    const urgencyMatch = filterUrgency.value === 'all' || appointment.urgency === filterUrgency.value
    const keywordMatch = !keyword
      || appointment.childName.includes(keyword)
      || appointment.parentName.includes(keyword)
      || appointment.parentPhone.includes(keyword)
      || appointment.expertName.includes(keyword)
      || String(appointment.id).includes(keyword)

    return statusMatch && urgencyMatch && keywordMatch
  })
})

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredAppointments.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.max(Math.ceil(filteredAppointments.value.length / itemsPerPage), 1)
})

const statistics = computed(() => {
  const total = appointments.value.length
  const pending = appointments.value.filter((a) => a.status === 'pending').length
  const confirmed = appointments.value.filter((a) => a.status === 'confirmed').length
  const urgent = appointments.value.filter((a) => a.urgency === 'urgent' || a.urgency === 'emergency').length
  return { total, pending, confirmed, urgent }
})

const getStatusInfo = (status: AppointmentStatus) => {
  switch (status) {
    case 'pending':
      return { text: '待处理', color: '#f59e0b', bgColor: '#fffbeb' }
    case 'confirmed':
      return { text: '已确认', color: '#10b981', bgColor: '#ecfdf5' }
    case 'rejected':
      return { text: '已拒绝', color: '#ef4444', bgColor: '#fef2f2' }
    case 'completed':
      return { text: '已完成', color: '#3b82f6', bgColor: '#eff6ff' }
    case 'cancelled':
      return { text: '已取消', color: '#6b7280', bgColor: '#f9fafb' }
    default:
      return { text: status, color: '#6b7280', bgColor: '#f3f4f6' }
  }
}

const getUrgencyInfo = (urgency: UrgencyLevel) => {
  switch (urgency) {
    case 'normal':
      return { text: '普通', color: '#6b7280', bgColor: '#f3f4f6' }
    case 'urgent':
      return { text: '紧急', color: '#f59e0b', bgColor: '#fffbeb' }
    case 'emergency':
      return { text: '特急', color: '#ef4444', bgColor: '#fef2f2' }
    default:
      return { text: urgency, color: '#6b7280', bgColor: '#f3f4f6' }
  }
}

const viewDetails = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedAppointment.value = null
}

const confirmAppointment = async (appointmentId: number) => {
  try {
    await api.patch(`/admin/appointments/${appointmentId}`, { status: 'confirmed' })
    await loadAppointments()
    alert('预约已确认')
  } catch (e) {
    alert(getErrorMessage(e, '确认失败，请稍后重试'))
  }
}

const rejectAppointment = async (appointmentId: number, reason?: string) => {
  try {
    await api.patch(`/admin/appointments/${appointmentId}`, {
      status: 'rejected',
      notes: reason || '',
    })
    await loadAppointments()
    alert('预约已拒绝')
  } catch (e) {
    alert(getErrorMessage(e, '拒绝失败，请稍后重试'))
  }
}

const handleAppointmentFromDetail = (action: 'confirm' | 'reject') => {
  if (!selectedAppointment.value) return

  if (action === 'confirm') {
    void confirmAppointment(selectedAppointment.value.id)
  } else {
    const reason = prompt('请输入拒绝原因（可选）：')
    void rejectAppointment(selectedAppointment.value.id, reason ?? undefined)
  }

  closeDetailModal()
}

const resetFilters = () => {
  filterStatus.value = 'all'
  filterUrgency.value = 'all'
  searchKeyword.value = ''
  currentPage.value = 1
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="appointment-layout">
    <section class="hero-header">
      <div class="hero-inner">
        <span class="hero-badge">预约管理</span>
        <h1>门诊预约管理</h1>
        <p>管理和处理线下门诊预约申请，高效安排就诊流程</p>
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-circle c3"></div>
      </div>
    </section>

    <section class="stat-strip">
      <div class="stat-chip">
        <div class="stat-icon total">
          <el-icon :size="20"><Document /></el-icon>
        </div>
        <div class="stat-content">
          <span class="chip-num">{{ statistics.total }}</span>
          <span class="chip-label">总预约数</span>
        </div>
      </div>
      <div class="stat-chip">
        <div class="stat-icon pending">
          <el-icon :size="20"><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <span class="chip-num">{{ statistics.pending }}</span>
          <span class="chip-label">待处理</span>
        </div>
      </div>
      <div class="stat-chip">
        <div class="stat-icon confirmed">
          <el-icon :size="20"><Check /></el-icon>
        </div>
        <div class="stat-content">
          <span class="chip-num">{{ statistics.confirmed }}</span>
          <span class="chip-label">已确认</span>
        </div>
      </div>
      <div class="stat-chip">
        <div class="stat-icon urgent">
          <el-icon :size="20"><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <span class="chip-num">{{ statistics.urgent }}</span>
          <span class="chip-label">紧急处理</span>
        </div>
      </div>
    </section>

    <section class="content-panel">
      <div class="toolbar-row">
        <div class="search-box">
          <el-icon :size="16" class="search-icon"><Search /></el-icon>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索预约编号、患儿姓名、家长或专家..."
          />
        </div>
        <div class="filter-group">
          <select v-model="filterStatus">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <select v-model="filterUrgency">
            <option v-for="option in urgencyOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <button class="reset-btn" @click="resetFilters">
            <el-icon :size="14"><Filter /></el-icon>
            重置
          </button>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div v-if="loading" class="empty-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="paginatedAppointments.length === 0" class="empty-state">
        <el-icon :size="48" color="#c0c8d0"><Calendar /></el-icon>
        <p>暂无预约数据</p>
      </div>

      <div v-else class="appointment-list">
        <article
          v-for="appointment in paginatedAppointments"
          :key="appointment.id"
          class="appointment-card"
          :class="{ urgent: appointment.urgency === 'urgent' || appointment.urgency === 'emergency' }"
        >
          <div class="card-main">
            <div class="card-header">
              <div class="id-section">
                <span class="appointment-id">#{{ appointment.id }}</span>
                <span class="submit-time">{{ formatDateTime(appointment.submitTime) }}</span>
              </div>
              <div class="card-badges">
                <span
                  class="urgency-tag"
                  :style="{ background: getUrgencyInfo(appointment.urgency).bgColor, color: getUrgencyInfo(appointment.urgency).color }"
                >
                  {{ getUrgencyInfo(appointment.urgency).text }}
                </span>
                <span
                  class="status-tag"
                  :style="{ background: getStatusInfo(appointment.status).bgColor, color: getStatusInfo(appointment.status).color }"
                >
                  {{ getStatusInfo(appointment.status).text }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <div class="info-section">
                <div class="info-icon">
                  <el-icon :size="18"><User /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">患儿信息</span>
                  <span class="info-value">{{ appointment.childName }} · {{ appointment.childAge }}岁 · {{ appointment.childGender }}</span>
                </div>
              </div>

              <div class="info-section">
                <div class="info-icon">
                  <el-icon :size="18"><Phone /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">联系人</span>
                  <span class="info-value">{{ appointment.parentName }} · {{ appointment.parentPhone }}</span>
                </div>
              </div>

              <div class="info-section">
                <div class="info-icon">
                  <el-icon :size="18"><Calendar /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">预约专家</span>
                  <span class="info-value">
                    {{ appointment.expertName || (appointment.doctorUserId ? `医生#${appointment.doctorUserId}` : '-') }}
                    <small v-if="appointment.expertHospital">{{ appointment.expertHospital }}</small>
                  </span>
                </div>
              </div>

              <div class="info-section" v-if="appointment.preferredDate">
                <div class="info-icon">
                  <el-icon :size="18"><Clock /></el-icon>
                </div>
                <div class="info-content">
                  <span class="info-label">期望时间</span>
                  <span class="info-value">{{ appointment.preferredDate }} {{ appointment.preferredTime || '' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn view" @click="viewDetails(appointment)">
              <el-icon :size="14"><View /></el-icon>
              查看详情
            </button>
            <template v-if="appointment.status === 'pending'">
              <button class="action-btn confirm" @click="confirmAppointment(appointment.id)">
                <el-icon :size="14"><CheckIcon /></el-icon>
                确认
              </button>
              <button class="action-btn reject" @click="rejectAppointment(appointment.id)">
                <el-icon :size="14"><Close /></el-icon>
                拒绝
              </button>
            </template>
          </div>

          <div class="urgent-indicator" v-if="appointment.urgency === 'urgent' || appointment.urgency === 'emergency'"></div>
        </article>
      </div>

      <div v-if="!loading && totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
          <el-icon :size="14"><ArrowRight class="rotate" /></el-icon>
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          下一页
          <el-icon :size="14"><ArrowRight /></el-icon>
        </button>
      </div>
    </section>

    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-panel" @click.stop>
        <header class="modal-header">
          <h2>预约详情</h2>
          <button class="modal-close" @click="closeDetailModal">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </header>

        <div v-if="selectedAppointment" class="modal-content">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">预约编号</span>
                <span class="detail-value">#{{ selectedAppointment.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">提交时间</span>
                <span class="detail-value">{{ formatDateTime(selectedAppointment.submitTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">当前状态</span>
                <span class="detail-value status" :style="{ color: getStatusInfo(selectedAppointment.status).color }">
                  {{ getStatusInfo(selectedAppointment.status).text }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">紧急程度</span>
                <span class="detail-value urgency" :style="{ color: getUrgencyInfo(selectedAppointment.urgency).color }">
                  {{ getUrgencyInfo(selectedAppointment.urgency).text }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>患儿信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">姓名</span>
                <span class="detail-value">{{ selectedAppointment.childName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">年龄</span>
                <span class="detail-value">{{ selectedAppointment.childAge }}岁</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">性别</span>
                <span class="detail-value">{{ selectedAppointment.childGender }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>家长信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">姓名</span>
                <span class="detail-value">{{ selectedAppointment.parentName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">联系电话</span>
                <span class="detail-value">{{ selectedAppointment.parentPhone }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>预约信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">专家</span>
                <span class="detail-value">{{ selectedAppointment.expertName || (selectedAppointment.doctorUserId ? `医生#${selectedAppointment.doctorUserId}` : '-') }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">医院</span>
                <span class="detail-value">{{ selectedAppointment.expertHospital || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">希望日期</span>
                <span class="detail-value">{{ selectedAppointment.preferredDate || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">希望时间</span>
                <span class="detail-value">{{ selectedAppointment.preferredTime || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="selectedAppointment.symptoms">
            <h3>症状描述</h3>
            <div class="detail-text">{{ selectedAppointment.symptoms }}</div>
          </div>

          <div class="detail-section" v-if="selectedAppointment.previousTreatment">
            <h3>既往治疗</h3>
            <div class="detail-text">{{ selectedAppointment.previousTreatment }}</div>
          </div>

          <div class="detail-section" v-if="selectedAppointment.notes">
            <h3>备注信息</h3>
            <div class="detail-text">{{ selectedAppointment.notes }}</div>
          </div>

          <div v-if="selectedAppointment.status === 'pending'" class="modal-actions">
            <button class="action-btn confirm large" @click="handleAppointmentFromDetail('confirm')">
              <el-icon :size="16"><CheckIcon /></el-icon>
              确认预约
            </button>
            <button class="action-btn reject large" @click="handleAppointmentFromDetail('reject')">
              <el-icon :size="16"><Close /></el-icon>
              拒绝预约
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.appointment-layout {
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
.c3 { width: 60px; height: 60px; background: #f59e0b; top: 15px; right: 150px; }

.stat-strip {
  display: flex;
  gap: 0.85rem;
}

.stat-chip {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-icon.pending {
  background: #fffbeb;
  color: #f59e0b;
}

.stat-icon.confirmed {
  background: #ecfdf5;
  color: #10b981;
}

.stat-icon.urgent {
  background: #fef2f2;
  color: #ef4444;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.chip-num {
  font-size: 1.35rem;
  font-weight: 750;
  color: #1e293b;
  line-height: 1;
}

.chip-label {
  font-size: 0.75rem;
  color: #64748b;
}

.content-panel {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 1.25rem;
}

.toolbar-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.5rem;
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

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.error-message {
  padding: 0.75rem 1rem;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 8px;
  font-size: 0.88rem;
  margin-bottom: 1rem;
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

.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.appointment-card {
  position: relative;
  display: flex;
  gap: 1rem;
  padding: 1rem 1.15rem;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.appointment-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.appointment-card.urgent {
  border-left: 3px solid #ef4444;
}

.card-main {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.id-section {
  display: flex;
  flex-direction: column;
}

.appointment-id {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.submit-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.card-badges {
  display: flex;
  gap: 0.4rem;
}

.urgency-tag, .status-tag {
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
}

.card-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem 1.5rem;
}

.info-section {
  display: flex;
  gap: 0.5rem;
}

.info-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.info-label {
  font-size: 0.7rem;
  color: #94a3b8;
}

.info-value {
  font-size: 0.82rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-value small {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-left: 0.35rem;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.45rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn.view {
  background: #eff6ff;
  color: #3b82f6;
}

.action-btn.view:hover {
  background: #3b82f6;
  color: #fff;
}

.action-btn.confirm {
  background: #ecfdf5;
  color: #10b981;
}

.action-btn.confirm:hover {
  background: #10b981;
  color: #fff;
}

.action-btn.reject {
  background: #fef2f2;
  color: #ef4444;
}

.action-btn.reject:hover {
  background: #ef4444;
  color: #fff;
}

.action-btn.large {
  flex: 1;
  padding: 0.7rem 1rem;
  font-size: 0.88rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #5b8def;
  border-color: #5b8def;
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rotate {
  transform: rotate(180deg);
}

.page-info {
  font-size: 0.85rem;
  color: #64748b;
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
  max-width: 560px;
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

.modal-content {
  padding: 1.25rem 1.35rem;
}

.detail-section {
  margin-bottom: 1.25rem;
}

.detail-section h3 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.detail-value {
  font-size: 0.88rem;
  color: #334155;
  font-weight: 500;
}

.detail-value.status,
.detail-value.urgency {
  font-weight: 600;
}

.detail-text {
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 0.65rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f5;
}

.modal-actions .action-btn {
  flex: 1;
}

@media (max-width: 768px) {
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

  .card-body {
    grid-template-columns: 1fr;
  }

  .appointment-card {
    flex-direction: column;
  }

  .card-actions {
    flex-direction: row;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
