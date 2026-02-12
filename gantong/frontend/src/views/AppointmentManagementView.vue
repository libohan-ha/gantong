<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '@/services/api'

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
      return { text: '待处理', color: '#ff9800', bgColor: '#fff3e0' }
    case 'confirmed':
      return { text: '已确认', color: '#4caf50', bgColor: '#e8f5e8' }
    case 'rejected':
      return { text: '已拒绝', color: '#f44336', bgColor: '#ffebee' }
    case 'completed':
      return { text: '已完成', color: '#2196f3', bgColor: '#e3f2fd' }
    case 'cancelled':
      return { text: '已取消', color: '#9e9e9e', bgColor: '#f5f5f5' }
    default:
      return { text: status, color: '#666', bgColor: '#f0f0f0' }
  }
}

const getUrgencyInfo = (urgency: UrgencyLevel) => {
  switch (urgency) {
    case 'normal':
      return { text: '普通', color: '#666' }
    case 'urgent':
      return { text: '紧急', color: '#ff9800' }
    case 'emergency':
      return { text: '特急', color: '#f44336' }
    default:
      return { text: urgency, color: '#666' }
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
  <div class="appointment-management-container">
    <div class="page-header">
      <h1>门诊预约管理</h1>
      <p class="header-desc">管理和处理线下门诊预约申请</p>
    </div>

    <div class="statistics-grid">
      <div class="stat-card">
        <div class="stat-icon total">📋</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.total }}</div>
          <div class="stat-label">总预约数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">⏰</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.pending }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon confirmed">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.confirmed }}</div>
          <div class="stat-label">已确认</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon urgent">🚨</div>
        <div class="stat-info">
          <div class="stat-number">{{ statistics.urgent }}</div>
          <div class="stat-label">紧急处理</div>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="filters-row">
        <div class="search-group">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索预约编号、患儿姓名、家长或专家..."
            class="search-input"
          >
        </div>

        <div class="filter-group">
          <select v-model="filterStatus" class="filter-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select v-model="filterUrgency" class="filter-select">
            <option v-for="option in urgencyOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <button class="reset-btn" @click="resetFilters">重置</button>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-box">{{ error }}</div>
    <div v-if="loading" class="loading-box">加载中...</div>

    <div v-else-if="paginatedAppointments.length === 0" class="empty-box">
      暂无预约数据
    </div>

    <div v-else class="appointments-table">
      <div class="table-header">
        <div class="header-cell">预约编号</div>
        <div class="header-cell">患儿信息</div>
        <div class="header-cell">联系人</div>
        <div class="header-cell">预约专家</div>
        <div class="header-cell">预约时间</div>
        <div class="header-cell">状态</div>
        <div class="header-cell">紧急程度</div>
        <div class="header-cell">操作</div>
      </div>

      <div class="table-body">
        <div
          v-for="appointment in paginatedAppointments"
          :key="appointment.id"
          class="table-row"
          :class="{ urgent: appointment.urgency === 'urgent' || appointment.urgency === 'emergency' }"
        >
          <div class="table-cell" data-label="预约编号">
            <span class="appointment-no">{{ appointment.id }}</span>
            <span class="submit-time">{{ formatDateTime(appointment.submitTime) }}</span>
          </div>

          <div class="table-cell" data-label="患儿信息">
            <div class="child-info">
              <span class="child-name">{{ appointment.childName }}</span>
              <span class="child-meta">{{ appointment.childAge }}岁 {{ appointment.childGender }}</span>
            </div>
          </div>

          <div class="table-cell" data-label="联系人">
            <div class="parent-info">
              <span class="parent-name">{{ appointment.parentName }}</span>
              <span class="parent-phone">{{ appointment.parentPhone }}</span>
            </div>
          </div>

          <div class="table-cell" data-label="预约专家">
            <div class="expert-info">
              <span class="expert-name">{{ appointment.expertName || (appointment.doctorUserId ? `医生#${appointment.doctorUserId}` : '-') }}</span>
              <span class="expert-hospital">{{ appointment.expertHospital || '-' }}</span>
            </div>
          </div>

          <div class="table-cell" data-label="预约时间">
            <div class="appointment-time">
              <span class="date">{{ appointment.preferredDate || '-' }}</span>
              <span class="time">{{ appointment.preferredTime || '-' }}</span>
            </div>
          </div>

          <div class="table-cell" data-label="状态">
            <span
              class="status-badge"
              :style="{
                color: getStatusInfo(appointment.status).color,
                backgroundColor: getStatusInfo(appointment.status).bgColor,
              }"
            >
              {{ getStatusInfo(appointment.status).text }}
            </span>
          </div>

          <div class="table-cell" data-label="紧急程度">
            <span
              class="urgency-badge"
              :style="{ color: getUrgencyInfo(appointment.urgency).color }"
            >
              {{ getUrgencyInfo(appointment.urgency).text }}
            </span>
          </div>

          <div class="table-cell actions" data-label="操作">
            <button class="action-btn view-btn" @click="viewDetails(appointment)">
              查看
            </button>

            <button
              v-if="appointment.status === 'pending'"
              class="action-btn confirm-btn"
              @click="confirmAppointment(appointment.id)"
            >
              确认
            </button>

            <button
              v-if="appointment.status === 'pending'"
              class="action-btn reject-btn"
              @click="rejectAppointment(appointment.id)"
            >
              拒绝
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
        上一页
      </button>

      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>

      <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
        下一页
      </button>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="appointment-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>预约详情</h2>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>

        <div v-if="selectedAppointment" class="modal-content">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">预约编号</span>
                <span class="value">{{ selectedAppointment.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">提交时间</span>
                <span class="value">{{ formatDateTime(selectedAppointment.submitTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">当前状态</span>
                <span class="value status" :style="{ color: getStatusInfo(selectedAppointment.status).color }">
                  {{ getStatusInfo(selectedAppointment.status).text }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">紧急程度</span>
                <span class="value urgency" :style="{ color: getUrgencyInfo(selectedAppointment.urgency).color }">
                  {{ getUrgencyInfo(selectedAppointment.urgency).text }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>患儿信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">姓名</span>
                <span class="value">{{ selectedAppointment.childName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">年龄</span>
                <span class="value">{{ selectedAppointment.childAge }}岁</span>
              </div>
              <div class="detail-item">
                <span class="label">性别</span>
                <span class="value">{{ selectedAppointment.childGender }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>家长信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">姓名</span>
                <span class="value">{{ selectedAppointment.parentName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">联系电话</span>
                <span class="value">{{ selectedAppointment.parentPhone }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>预约信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">专家</span>
                <span class="value">{{ selectedAppointment.expertName || (selectedAppointment.doctorUserId ? `医生#${selectedAppointment.doctorUserId}` : '-') }}</span>
              </div>
              <div class="detail-item">
                <span class="label">医院</span>
                <span class="value">{{ selectedAppointment.expertHospital || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">希望日期</span>
                <span class="value">{{ selectedAppointment.preferredDate || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">希望时间</span>
                <span class="value">{{ selectedAppointment.preferredTime || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>症状描述</h3>
            <div class="symptoms-content">
              {{ selectedAppointment.symptoms || '未填写' }}
            </div>
          </div>

          <div class="detail-section">
            <h3>既往治疗</h3>
            <div class="treatment-content">
              {{ selectedAppointment.previousTreatment || '未填写' }}
            </div>
          </div>

          <div v-if="selectedAppointment.notes" class="detail-section">
            <h3>备注信息</h3>
            <div class="notes-content">
              {{ selectedAppointment.notes }}
            </div>
          </div>

          <div v-if="selectedAppointment.status === 'pending'" class="detail-actions">
            <button class="action-btn confirm-btn large" @click="handleAppointmentFromDetail('confirm')">
              确认预约
            </button>
            <button class="action-btn reject-btn large" @click="handleAppointmentFromDetail('reject')">
              拒绝预约
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.appointment-management-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.stat-icon.pending {
  background: #fff3e0;
}

.stat-icon.confirmed {
  background: #e8f5e8;
}

.stat-icon.urgent {
  background: #ffebee;
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

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.reset-btn {
  background: #f0f0f0;
  color: #666;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.reset-btn:hover {
  background: #e0e0e0;
}

.error-box {
  margin-bottom: 1rem;
  border: 1px solid #ffd2d2;
  background: #fff5f5;
  color: #d13232;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.loading-box,
.empty-box {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.appointments-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-header {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1.2fr 1fr 0.8fr 0.8fr 1.2fr;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.header-cell {
  padding: 1rem;
  font-weight: 600;
  color: #2c3e50;
  border-right: 1px solid #e0e0e0;
  text-align: center;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1.2fr 1fr 0.8fr 0.8fr 1.2fr;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row.urgent {
  border-left: 4px solid #f44336;
}

.table-cell {
  padding: 1rem;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.appointment-no {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.submit-time {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.child-info,
.parent-info,
.expert-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.child-name,
.parent-name,
.expert-name {
  font-weight: 500;
  color: #2c3e50;
}

.child-meta,
.parent-phone,
.expert-hospital {
  font-size: 0.8rem;
  color: #666;
}

.appointment-time {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date {
  color: #2c3e50;
  font-weight: 500;
}

.time {
  font-size: 0.8rem;
  color: #666;
}

.status-badge,
.urgency-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge {
  border: 1px solid currentColor;
}

.actions {
  display: flex;
  gap: 0.25rem;
  flex-direction: column;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.view-btn {
  background: #2196f3;
  color: white;
}

.view-btn:hover {
  background: #1976d2;
}

.confirm-btn {
  background: #4caf50;
  color: white;
}

.confirm-btn:hover {
  background: #45a049;
}

.reject-btn {
  background: #f44336;
  color: white;
}

.reject-btn:hover {
  background: #d32f2f;
}

.action-btn.large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #369870;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.appointment-detail-modal {
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

.detail-item .value.status,
.detail-item .value.urgency {
  font-weight: 600;
}

.symptoms-content,
.treatment-content,
.notes-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.6;
  color: #2c3e50;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 1200px) {
  .appointments-table {
    background: transparent;
    box-shadow: none;
    overflow: visible;
  }

  .table-header {
    display: none;
  }

  .table-body {
    max-height: none;
    overflow: visible;
    display: grid;
    gap: 0.75rem;
  }

  .table-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border: 1px solid #e6eaf0;
    border-radius: 10px;
    overflow: hidden;
    background: white;
  }

  .table-row:hover {
    background: white;
  }

  .table-cell {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    align-items: flex-start;
    text-align: left;
  }

  .table-cell:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  .actions {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: #666;
    margin-bottom: 0.35rem;
    display: block;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .appointment-management-container {
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
    justify-content: stretch;
    flex-wrap: wrap;
  }

  .filter-select,
  .reset-btn {
    flex: 1 1 140px;
  }

  .table-row {
    grid-template-columns: 1fr;
  }

  .table-cell {
    min-height: auto;
    border-bottom: 1px solid #f0f0f0;
  }

  .table-cell:last-child {
    border-bottom: none;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
