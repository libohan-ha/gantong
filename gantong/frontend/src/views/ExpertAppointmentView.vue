<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  cancelMyDoctorAppointment,
  createDoctorAppointment,
  listDoctors,
  listMyDoctorAppointments,
  type DoctorAppointmentStatus,
  type DoctorListItem,
  type ParentAppointmentItem,
} from '@/services/experts'

interface Expert {
  id: number
  name: string
  title: string
  hospital: string
  specialty: string[]
  experience: number
  education: string
  achievements: string[]
  introduction: string
  availableTime: string[]
  rating: number
  consultationCount: number
  city: string
}

type ApiError = {
  response?: {
    data?: {
      message?: string | string[]
    }
  }
}

const getErrorMessage = (e: unknown, fallback: string) => {
  const message = (e as ApiError)?.response?.data?.message
  if (Array.isArray(message)) return message.join('，')
  return typeof message === 'string' && message.trim() ? message : fallback
}

const mobilePhoneRegex = /^1[3-9]\d{9}$/

const activeTab = ref<'experts' | 'mine'>('experts')

const experts = ref<Expert[]>([])
const loadingExperts = ref(false)
const expertsError = ref('')

const myAppointments = ref<ParentAppointmentItem[]>([])
const loadingMyAppointments = ref(false)
const myAppointmentsError = ref('')
const appointmentStatusFilter = ref<'all' | DoctorAppointmentStatus>('all')
const cancellingAppointmentIds = ref<number[]>([])

const selectedExpert = ref<Expert | null>(null)
const showBookingForm = ref(false)
const selectedCity = ref('全部')
const selectedSpecialty = ref('全部')
const searchKeyword = ref('')

const bookingForm = ref({
  childName: '',
  childAge: '',
  childGender: '',
  parentName: '',
  parentPhone: '',
  preferredDate: '',
  preferredTime: '',
  symptoms: '',
  previousTreatment: '',
})

const resetBookingForm = () => {
  bookingForm.value = {
    childName: '',
    childAge: '',
    childGender: '',
    parentName: '',
    parentPhone: '',
    preferredDate: '',
    preferredTime: '',
    symptoms: '',
    previousTreatment: '',
  }
}

const validateBookingForm = (): string | null => {
  const childName = bookingForm.value.childName.trim()
  const childAge = Number(bookingForm.value.childAge)
  const childGender = bookingForm.value.childGender.trim()
  const parentName = bookingForm.value.parentName.trim()
  const parentPhone = bookingForm.value.parentPhone.trim()
  const preferredDate = bookingForm.value.preferredDate.trim()
  const preferredTime = bookingForm.value.preferredTime.trim()

  if (!childName) return '请填写儿童姓名'
  if (!Number.isInteger(childAge) || childAge < 0 || childAge > 18) return '儿童年龄需在 0-18 岁之间'
  if (!childGender) return '请选择儿童性别'
  if (!parentName) return '请填写家长姓名'
  if (!mobilePhoneRegex.test(parentPhone)) return '联系电话需为 11 位中国大陆手机号，例如 13800138000'
  if (!preferredDate) return '请选择预约日期'
  if (!preferredTime) return '请选择预约时间'
  return null
}

const loadExperts = async () => {
  try {
    loadingExperts.value = true
    expertsError.value = ''
    const res = await listDoctors({ page: 1, pageSize: 50 })
    experts.value = res.items.map((d: DoctorListItem) => ({
      id: d.doctorId,
      name: d.name,
      title: d.title || '医生',
      hospital: d.hospital,
      specialty: [],
      experience: 0,
      education: '',
      achievements: [],
      introduction: '暂无更多介绍',
      availableTime: ['上午', '下午'],
      rating: 5.0,
      consultationCount: 0,
      city: '全部',
    }))
  } catch (e) {
    expertsError.value = getErrorMessage(e, '加载专家列表失败')
  } finally {
    loadingExperts.value = false
  }
}

const loadMyAppointments = async () => {
  try {
    loadingMyAppointments.value = true
    myAppointmentsError.value = ''
    const res = await listMyDoctorAppointments({
      page: 1,
      pageSize: 100,
      status: appointmentStatusFilter.value,
    })
    myAppointments.value = res.items
  } catch (e) {
    myAppointmentsError.value = getErrorMessage(e, '加载我的预约失败')
  } finally {
    loadingMyAppointments.value = false
  }
}

watch(appointmentStatusFilter, () => {
  if (activeTab.value === 'mine') {
    void loadMyAppointments()
  }
})

const cities = computed(() => {
  const citySet = new Set(experts.value.map((expert) => expert.city))
  return ['全部', ...Array.from(citySet)]
})

const specialties = computed(() => {
  const specialtySet = new Set<string>()
  experts.value.forEach((expert) => {
    expert.specialty.forEach((s) => specialtySet.add(s))
  })
  return ['全部', ...Array.from(specialtySet)]
})

const filteredExperts = computed(() => {
  return experts.value.filter((expert) => {
    const cityMatch = selectedCity.value === '全部' || expert.city === selectedCity.value
    const specialtyMatch = selectedSpecialty.value === '全部'
      || expert.specialty.some((s) => s.includes(selectedSpecialty.value))
    const keywordMatch = searchKeyword.value === ''
      || expert.name.includes(searchKeyword.value)
      || expert.hospital.includes(searchKeyword.value)
      || expert.title.includes(searchKeyword.value)
      || expert.specialty.some((s) => s.includes(searchKeyword.value))
    return cityMatch && specialtyMatch && keywordMatch
  })
})

const statusOptions: Array<{ value: 'all' | DoctorAppointmentStatus; label: string }> = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'confirmed', label: '已确认' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const getStatusLabel = (status: DoctorAppointmentStatus) => {
  switch (status) {
    case 'pending':
      return '待处理'
    case 'confirmed':
      return '已确认'
    case 'rejected':
      return '已拒绝'
    case 'completed':
      return '已完成'
    case 'cancelled':
      return '已取消'
    default:
      return status
  }
}

const getStatusClass = (status: DoctorAppointmentStatus) => `status-${status}`

const formatDateTime = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN')
}

const selectExpert = (expert: Expert) => {
  selectedExpert.value = expert
}

const startBooking = (expert: Expert) => {
  selectedExpert.value = expert
  showBookingForm.value = true
}

const closeExpertDetail = () => {
  selectedExpert.value = null
  showBookingForm.value = false
}

const closeBookingForm = () => {
  showBookingForm.value = false
  resetBookingForm()
}

const switchTab = async (tab: 'experts' | 'mine') => {
  activeTab.value = tab
  if (tab === 'mine') {
    await loadMyAppointments()
  }
}

const isCancellingAppointment = (appointmentId: number) => cancellingAppointmentIds.value.includes(appointmentId)

const cancelAppointment = async (item: ParentAppointmentItem) => {
  if (item.status !== 'pending') return
  if (!window.confirm('确定要取消这条预约吗？')) return

  const reason = window.prompt('可选：请输入取消原因（可留空）') ?? ''
  cancellingAppointmentIds.value = [...cancellingAppointmentIds.value, item.id]

  try {
    await cancelMyDoctorAppointment(item.id, reason)
    alert('预约已取消')
    await loadMyAppointments()
  } catch (e) {
    alert(getErrorMessage(e, '取消预约失败，请稍后重试'))
  } finally {
    cancellingAppointmentIds.value = cancellingAppointmentIds.value.filter((id) => id !== item.id)
  }
}

const submitBooking = async () => {
  if (!selectedExpert.value) return

  const validationError = validateBookingForm()
  if (validationError) {
    alert(validationError)
    return
  }

  try {
    await createDoctorAppointment({
      doctorId: selectedExpert.value.id,
      childName: bookingForm.value.childName.trim(),
      childAge: Number(bookingForm.value.childAge),
      childGender: bookingForm.value.childGender.trim(),
      parentName: bookingForm.value.parentName.trim(),
      parentPhone: bookingForm.value.parentPhone.trim(),
      preferredDate: bookingForm.value.preferredDate || undefined,
      preferredTime: bookingForm.value.preferredTime || undefined,
      symptoms: bookingForm.value.symptoms.trim() || undefined,
      previousTreatment: bookingForm.value.previousTreatment.trim() || undefined,
    })

    alert('预约提交成功，我们会尽快为您安排门诊。')
    showBookingForm.value = false
    selectedExpert.value = null
    await loadMyAppointments()
  } catch (e) {
    alert(getErrorMessage(e, '预约失败，请稍后重试'))
  } finally {
    resetBookingForm()
  }
}

const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

onMounted(async () => {
  await Promise.all([loadExperts(), loadMyAppointments()])
})
</script>

<template>
  <div class="expert-appointment-container">
    <!-- Hero Header -->
    <section class="hero-header">
      <div class="hero-inner">
        <span class="hero-badge">专家预约</span>
        <h1>感统专家门诊预约</h1>
        <p>我们正在邀请全国专家加入团队，为家长提供更便捷的线下门诊预约服务</p>
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-circle c3"></div>
      </div>
    </section>

    <!-- Tab Switch -->
    <div class="tab-switch">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'experts' }"
        @click="switchTab('experts')"
      >
        专家列表
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'mine' }"
        @click="switchTab('mine')"
      >
        我的预约
      </button>
    </div>

    <!-- Experts Tab -->
    <template v-if="activeTab === 'experts'">
      <!-- Search & Filters Card -->
      <div class="search-card">
        <div class="search-bar">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索专家姓名、医院或职称..."
            class="search-input"
          >
        </div>
        <div class="filter-group">
          <select v-model="selectedCity" class="filter-select">
            <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
          <select v-model="selectedSpecialty" class="filter-select">
            <option v-for="specialty in specialties" :key="specialty" :value="specialty">{{ specialty }}</option>
          </select>
        </div>
      </div>

      <div v-if="expertsError" class="inline-error">{{ expertsError }}</div>
      <div v-if="loadingExperts" class="inline-tip">专家列表加载中...</div>

      <div v-else-if="filteredExperts.length === 0" class="empty-state">
        暂无符合条件的专家
      </div>

      <div v-else class="experts-grid">
        <div
          v-for="expert in filteredExperts"
          :key="expert.id"
          class="expert-card"
          @click="selectExpert(expert)"
        >
          <div class="card-top-row">
            <div class="expert-avatar">
              <span>{{ expert.name.charAt(0) }}</span>
            </div>
            <div class="expert-meta">
              <h3>{{ expert.name }}</h3>
              <p class="expert-title">{{ expert.title }}</p>
              <p class="expert-hospital">{{ expert.hospital }}</p>
            </div>
          </div>

          <div class="expert-chips">
            <span class="chip">{{ expert.experience }}年经验</span>
            <span class="chip">{{ expert.consultationCount }}次咨询</span>
            <span class="chip accent">{{ expert.rating }}★</span>
          </div>

          <div class="card-footer">
            <span class="enter-link">查看详情</span>
            <span class="enter-arrow">→</span>
          </div>

          <div class="card-bottom-bar"></div>
        </div>
      </div>
    </template>

    <!-- My Appointments Tab -->
    <template v-else>
      <div class="my-appointments-panel">
        <div class="appointments-toolbar">
          <div class="status-pills">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              class="pill-btn"
              :class="{ active: appointmentStatusFilter === option.value }"
              @click="appointmentStatusFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <button class="refresh-btn" @click="loadMyAppointments">刷新</button>
        </div>

        <div v-if="myAppointmentsError" class="inline-error">{{ myAppointmentsError }}</div>
        <div v-if="loadingMyAppointments" class="inline-tip">我的预约加载中...</div>

        <div v-else-if="myAppointments.length === 0" class="empty-state">
          你还没有预约记录，先去专家列表提交一个预约吧
        </div>

        <div v-else class="my-appointments-list">
          <article
            v-for="item in myAppointments"
            :key="item.id"
            class="appointment-card"
          >
            <div class="appointment-card-header">
              <div>
                <h3>预约 #{{ item.id }}</h3>
                <p class="submit-time">提交时间：{{ formatDateTime(item.createdAt) }}</p>
              </div>
              <span class="status-badge" :class="getStatusClass(item.status)">
                {{ getStatusLabel(item.status) }}
              </span>
            </div>

            <div class="appointment-grid">
              <div class="info-cell">
                <p class="label">专家</p>
                <p class="value">{{ item.doctorName || `医生ID ${item.doctorUserId}` }}</p>
              </div>
              <div class="info-cell">
                <p class="label">医院</p>
                <p class="value">{{ item.doctorHospital || '-' }}</p>
              </div>
              <div class="info-cell">
                <p class="label">职称</p>
                <p class="value">{{ item.doctorTitle || '-' }}</p>
              </div>
              <div class="info-cell">
                <p class="label">预约时间</p>
                <p class="value">{{ item.preferredDate || '-' }} {{ item.preferredTime || '' }}</p>
              </div>
            </div>

            <div class="appointment-grid">
              <div class="info-cell">
                <p class="label">儿童信息</p>
                <p class="value">{{ item.childName }} / {{ item.childAge }}岁 / {{ item.childGender }}</p>
              </div>
              <div class="info-cell">
                <p class="label">家长</p>
                <p class="value">{{ item.parentName }} / {{ item.parentPhone }}</p>
              </div>
            </div>

            <div v-if="item.symptoms" class="appointment-note">
              <p class="label">主要症状</p>
              <p class="value">{{ item.symptoms }}</p>
            </div>

            <div v-if="item.previousTreatment" class="appointment-note">
              <p class="label">既往治疗</p>
              <p class="value">{{ item.previousTreatment }}</p>
            </div>

            <div v-if="item.notes" class="appointment-note">
              <p class="label">处理备注</p>
              <p class="value">{{ item.notes }}</p>
            </div>

            <div v-if="item.status === 'pending'" class="appointment-actions">
              <button
                class="cancel-appointment-btn"
                :disabled="isCancellingAppointment(item.id)"
                @click="cancelAppointment(item)"
              >
                {{ isCancellingAppointment(item.id) ? '取消中...' : '取消预约' }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </template>

    <!-- Expert Detail Modal -->
    <div v-if="selectedExpert && !showBookingForm" class="modal-overlay" @click="closeExpertDetail">
      <div class="modal-panel" @click.stop>
        <div class="modal-header">
          <h2>专家详情</h2>
          <button class="close-btn" @click="closeExpertDetail">×</button>
        </div>

        <div class="modal-body">
          <div class="expert-profile">
            <div class="profile-left">
              <div class="large-avatar">{{ selectedExpert.name.charAt(0) }}</div>
              <div class="profile-rating">
                <span class="rating-score">{{ selectedExpert.rating }} ★</span>
                <span class="consultation-count">{{ selectedExpert.consultationCount }}次咨询</span>
              </div>
            </div>

            <div class="profile-right">
              <h3>{{ selectedExpert.name }}</h3>
              <p class="profile-title">{{ selectedExpert.title }}</p>
              <p class="profile-hospital">{{ selectedExpert.hospital }}</p>
              <p class="profile-experience">从业 {{ selectedExpert.experience }} 年</p>
            </div>
          </div>

          <div class="detail-section">
            <h4>专业简介</h4>
            <p class="introduction-text">{{ selectedExpert.introduction }}</p>
          </div>

          <div class="detail-section">
            <h4>可预约时间</h4>
            <div class="available-time">
              <span
                v-for="time in selectedExpert.availableTime"
                :key="time"
                class="time-slot"
              >
                {{ time }}
              </span>
            </div>
          </div>

          <button
            class="book-detail-btn"
            @click="startBooking(selectedExpert)"
          >
            立即预约
          </button>
        </div>
      </div>
    </div>

    <!-- Booking Form Modal -->
    <div v-if="showBookingForm" class="modal-overlay" @click="closeBookingForm">
      <div class="modal-panel wide" @click.stop>
        <div class="modal-header">
          <h2>预约 {{ selectedExpert?.name }} 医生</h2>
          <button class="close-btn" @click="closeBookingForm">×</button>
        </div>

        <form class="booking-form" @submit.prevent="submitBooking">
          <div class="form-section">
            <h3>儿童信息</h3>

            <div class="form-row">
              <div class="form-group">
                <label>儿童姓名 *</label>
                <input v-model="bookingForm.childName" type="text" required>
              </div>

              <div class="form-group">
                <label>年龄 *</label>
                <input v-model="bookingForm.childAge" type="number" min="0" max="18" required>
              </div>

              <div class="form-group">
                <label>性别 *</label>
                <select v-model="bookingForm.childGender" required>
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>家长信息</h3>

            <div class="form-row">
              <div class="form-group">
                <label>家长姓名 *</label>
                <input v-model="bookingForm.parentName" type="text" required>
              </div>

              <div class="form-group">
                <label>联系电话 *</label>
                <input v-model="bookingForm.parentPhone" type="tel" required>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>预约信息</h3>

            <div class="form-row">
              <div class="form-group">
                <label>希望预约日期 *</label>
                <input
                  v-model="bookingForm.preferredDate"
                  type="date"
                  :min="getTomorrowDate()"
                  required
                >
              </div>

              <div class="form-group">
                <label>希望预约时间 *</label>
                <select v-model="bookingForm.preferredTime" required>
                  <option value="">请选择</option>
                  <option v-for="time in selectedExpert?.availableTime" :key="time" :value="time">
                    {{ time }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label>主要症状描述</label>
              <textarea
                v-model="bookingForm.symptoms"
                placeholder="请描述孩子的主要症状或问题..."
                rows="3"
              />
            </div>

            <div class="form-group">
              <label>是否有过相关治疗</label>
              <textarea
                v-model="bookingForm.previousTreatment"
                placeholder="请描述之前的治疗经历（如无则填无）..."
                rows="3"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeBookingForm">取消</button>
            <button type="submit" class="submit-btn">提交预约</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.expert-appointment-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

/* ── Hero Header ── */
.hero-header {
  margin-bottom: 2rem;
}

.hero-inner {
  position: relative;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  padding: 2.5rem 2.5rem 2.2rem;
  color: #fff;
  overflow: hidden;
}

.hero-badge {
  display: inline-block;
  background: rgba(167, 139, 250, 0.18);
  color: #c4b5fd;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  margin-bottom: 0.85rem;
  letter-spacing: 0.5px;
}

.hero-inner h1 {
  font-size: 1.75rem;
  font-weight: 750;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.hero-inner p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.92rem;
  line-height: 1.5;
  max-width: 520px;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}

.c1 { width: 180px; height: 180px; background: #a78bfa; top: -60px; right: -30px; }
.c2 { width: 120px; height: 120px; background: #c4b5fd; bottom: -40px; right: 100px; }
.c3 { width: 80px; height: 80px; background: #8b5cf6; top: 10px; right: 180px; }

/* ── Tab Switch ── */
.tab-switch {
  display: inline-flex;
  gap: 0.35rem;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 0.3rem;
  margin-bottom: 1.75rem;
}

.tab-btn {
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 10px;
  padding: 0.6rem 1.25rem;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #a78bfa;
  color: #fff;
  box-shadow: 0 2px 8px rgba(167, 139, 250, 0.3);
}

/* ── Search Card ── */
.search-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.search-bar {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #a78bfa;
  background: #fff;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.7rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 0.92rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #a78bfa;
}

/* ── Inline States ── */
.inline-error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 12px;
  padding: 0.85rem 1.15rem;
  margin-bottom: 1.25rem;
  font-size: 0.92rem;
}

.inline-tip {
  color: #64748b;
  margin-bottom: 1.25rem;
  font-size: 0.92rem;
  padding: 0.5rem 0;
}

.empty-state {
  background: #f8fafc;
  border: 1.5px dashed #d7dee7;
  border-radius: 16px;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.95rem;
}

/* ── Experts Grid ── */
.experts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.15rem;
}

.expert-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.4rem 1.4rem 1.15rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.expert-card:hover {
  border-color: transparent;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px);
}

.card-top-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.expert-avatar {
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.expert-avatar span {
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
}

.expert-meta {
  flex: 1;
  min-width: 0;
}

.expert-meta h3 {
  margin: 0 0 0.15rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
}

.expert-title {
  margin: 0 0 0.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a78bfa;
}

.expert-hospital {
  margin: 0;
  font-size: 0.82rem;
  color: #94a3b8;
}

.expert-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
  flex: 1;
}

.chip {
  background: #f8fafc;
  border: 1px solid #eef0f4;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
}

.chip.accent {
  background: #fef9c3;
  border-color: #fde68a;
  color: #92400e;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.expert-card:hover .card-footer {
  opacity: 1;
  transform: translateX(0);
}

.enter-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: #a78bfa;
}

.enter-arrow {
  color: #a78bfa;
  font-size: 0.82rem;
}

.card-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #a78bfa;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.expert-card:hover .card-bottom-bar {
  opacity: 1;
}

/* ── My Appointments ── */
.my-appointments-panel {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.5rem;
}

.appointments-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.status-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.pill-btn {
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn.active {
  background: #a78bfa;
  color: #fff;
  border-color: #a78bfa;
}

.pill-btn:hover:not(.active) {
  border-color: #a78bfa;
  color: #a78bfa;
}

.refresh-btn {
  border: 1.5px solid #a78bfa;
  border-radius: 10px;
  background: rgba(167, 139, 250, 0.08);
  color: #7c3aed;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #a78bfa;
  color: #fff;
}

.my-appointments-list {
  display: grid;
  gap: 1rem;
}

.appointment-card {
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 1.25rem;
  background: #fff;
  transition: box-shadow 0.2s;
}

.appointment-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.appointment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.appointment-card-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.05rem;
  font-weight: 700;
}

.submit-time {
  margin: 0.3rem 0 0;
  color: #94a3b8;
  font-size: 0.82rem;
}

.appointment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
  margin-bottom: 0.75rem;
}

.info-cell {
  padding: 0.6rem 0.75rem;
  background: #f8fafc;
  border-radius: 10px;
}

.label {
  margin: 0;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 500;
}

.value {
  margin: 0.25rem 0 0;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.45;
}

.appointment-note {
  margin-top: 0.75rem;
  padding: 0.65rem 0.75rem;
  background: #f8fafc;
  border-radius: 10px;
}

.appointment-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.cancel-appointment-btn {
  border: 1.5px solid #f59e0b;
  background: #fffbeb;
  color: #b45309;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-appointment-btn:hover:not(:disabled) {
  background: #fef3c7;
}

.cancel-appointment-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.status-badge {
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid transparent;
  flex-shrink: 0;
}

.status-pending {
  color: #b45309;
  background: #fffbeb;
  border-color: #fde68a;
}

.status-confirmed {
  color: #065f46;
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.status-rejected {
  color: #991b1b;
  background: #fef2f2;
  border-color: #fecaca;
}

.status-completed {
  color: #1e3a8a;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.status-cancelled {
  color: #6b7280;
  background: #f9fafb;
  border-color: #e5e7eb;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-panel {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
}

.modal-panel.wide {
  max-width: 720px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 1.3rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* ── Expert Profile (modal) ── */
.modal-body {
  padding: 1.5rem;
}

.expert-profile {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
}

.profile-left {
  text-align: center;
  flex-shrink: 0;
}

.large-avatar {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
}

.profile-rating {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.rating-score {
  color: #f59e0b;
  font-weight: 700;
  font-size: 0.95rem;
}

.consultation-count {
  color: #94a3b8;
  font-size: 0.82rem;
}

.profile-right {
  flex: 1;
}

.profile-right h3 {
  margin: 0 0 0.4rem;
  color: #1e293b;
  font-size: 1.6rem;
  font-weight: 750;
}

.profile-title {
  color: #a78bfa;
  font-weight: 600;
  margin: 0 0 0.2rem;
  font-size: 0.95rem;
}

.profile-hospital,
.profile-experience {
  color: #64748b;
  margin: 0 0 0.2rem;
  font-size: 0.9rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  color: #1e293b;
  margin: 0 0 0.6rem;
  font-size: 1rem;
  font-weight: 650;
}

.introduction-text {
  color: #64748b;
  line-height: 1.7;
  margin: 0;
  font-size: 0.92rem;
}

.available-time {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.time-slot {
  background: rgba(167, 139, 250, 0.08);
  color: #7c3aed;
  padding: 0.4rem 0.9rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(167, 139, 250, 0.2);
}

.book-detail-btn {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
  margin-top: 0.5rem;
  transition: all 0.2s;
}

.book-detail-btn:hover {
  box-shadow: 0 6px 20px rgba(167, 139, 250, 0.35);
  transform: translateY(-1px);
}

/* ── Booking Form ── */
.booking-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.75rem;
}

.form-section h3 {
  color: #1e293b;
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 0.85rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  color: #475569;
  font-weight: 600;
  font-size: 0.88rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #a78bfa;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.submit-btn {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  color: #fff;
}

.submit-btn:hover {
  box-shadow: 0 4px 14px rgba(167, 139, 250, 0.35);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .expert-appointment-container {
    padding: 1rem;
  }

  .hero-inner {
    padding: 1.75rem 1.5rem;
  }

  .hero-inner h1 {
    font-size: 1.35rem;
  }

  .search-card {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .experts-grid {
    grid-template-columns: 1fr;
  }

  .expert-profile {
    flex-direction: column;
    text-align: center;
  }

  .profile-left {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .appointments-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .status-pills {
    justify-content: flex-start;
  }

  .appointment-card-header {
    flex-direction: column;
  }

  .appointment-grid {
    grid-template-columns: 1fr;
  }
}
</style>

