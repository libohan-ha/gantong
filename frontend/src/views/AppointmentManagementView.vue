<script setup lang="ts">
import { ref, computed } from 'vue'

interface Appointment {
  id: number
  appointmentNo: string
  childName: string
  childAge: number
  childGender: string
  parentName: string
  parentPhone: string
  preferredDate: string
  preferredTime: string
  symptoms: string
  previousTreatment: string
  expertName: string
  expertHospital: string
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
  submitTime: string
  urgency: 'normal' | 'urgent' | 'emergency'
  notes?: string
}

// 模拟预约数据
const appointments = ref<Appointment[]>([
  {
    id: 1,
    appointmentNo: 'APT2024070801',
    childName: '小明',
    childAge: 5,
    childGender: '男',
    parentName: '张女士',
    parentPhone: '138****5678',
    preferredDate: '2024-07-15',
    preferredTime: '周一上午',
    symptoms: '孩子经常注意力不集中，容易分心，在学校坐不住，老师反映课堂表现不佳。运动协调性较差，骑自行车和跳绳都有困难。',
    previousTreatment: '无相关治疗经历',
    expertName: '张慧敏',
    expertHospital: '北京儿童医院',
    status: 'pending',
    submitTime: '2024-07-08 09:30:00',
    urgency: 'normal'
  },
  {
    id: 2,
    appointmentNo: 'APT2024070802',
    childName: '小红',
    childAge: 4,
    childGender: '女',
    parentName: '李先生',
    parentPhone: '139****1234',
    preferredDate: '2024-07-16',
    preferredTime: '周二上午',
    symptoms: '孩子对触觉非常敏感，不愿意穿毛衣，洗头时会哭闹不止，剪指甲也很困难。平衡感较差，走路容易摔倒。',
    previousTreatment: '曾在当地医院做过简单检查，建议进行感统训练',
    expertName: '李建华',
    expertHospital: '上海市儿童医院',
    status: 'confirmed',
    submitTime: '2024-07-08 10:15:00',
    urgency: 'urgent'
  },
  {
    id: 3,
    appointmentNo: 'APT2024070803',
    childName: '小亮',
    childAge: 6,
    childGender: '男',
    parentName: '王女士',
    parentPhone: '137****9876',
    preferredDate: '2024-07-17',
    preferredTime: '周三下午',
    symptoms: '孩子语言发育迟缓，6岁了还不能说完整的句子，与同龄人交流困难。同时存在多动问题，无法安静坐着。',
    previousTreatment: '在康复中心接受过6个月语言训练，效果不明显',
    expertName: '王芳',
    expertHospital: '广州市妇女儿童医疗中心',
    status: 'pending',
    submitTime: '2024-07-08 11:45:00',
    urgency: 'urgent'
  },
  {
    id: 4,
    appointmentNo: 'APT2024070804',
    childName: '小娟',
    childAge: 3,
    childGender: '女',
    parentName: '赵先生',
    parentPhone: '135****4567',
    preferredDate: '2024-07-18',
    preferredTime: '周四上午',
    symptoms: '孩子经常转圈不会头晕，喜欢剧烈的摇摆和旋转活动，但是精细动作发育落后，无法正确使用勺子吃饭。',
    previousTreatment: '无',
    expertName: '陈明',
    expertHospital: '成都市儿童医院',
    status: 'rejected',
    submitTime: '2024-07-08 14:20:00',
    urgency: 'normal',
    notes: '专家时间冲突，建议改期'
  },
  {
    id: 5,
    appointmentNo: 'APT2024070805',
    childName: '小强',
    childAge: 7,
    childGender: '男',
    parentName: '陈女士',
    parentPhone: '134****8901',
    preferredDate: '2024-07-19',
    preferredTime: '周五下午',
    symptoms: '孩子在学校经常与同学发生冲突，情绪控制能力差，容易发脾气。运动技能正常，但社交能力明显落后。',
    previousTreatment: '心理咨询3次，效果有限',
    expertName: '刘秀英',
    expertHospital: '西安市儿童医院',
    status: 'completed',
    submitTime: '2024-07-08 15:30:00',
    urgency: 'normal'
  },
  {
    id: 6,
    appointmentNo: 'APT2024070806',
    childName: '小美',
    childAge: 4,
    childGender: '女',
    parentName: '周先生',
    parentPhone: '133****2345',
    preferredDate: '2024-07-20',
    preferredTime: '周六上午',
    symptoms: '孩子非常害怕新环境，去陌生地方会大哭大闹，适应能力极差。同时存在睡眠问题，经常夜醒。',
    previousTreatment: '无',
    expertName: '赵志强',
    expertHospital: '深圳市儿童医院',
    status: 'pending',
    submitTime: '2024-07-08 16:45:00',
    urgency: 'emergency'
  }
])

// 页面状态
const selectedAppointment = ref<Appointment | null>(null)
const showDetailModal = ref(false)
const filterStatus = ref('all')
const filterUrgency = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'confirmed', label: '已确认' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

// 紧急程度选项
const urgencyOptions = [
  { value: 'all', label: '全部等级' },
  { value: 'normal', label: '普通' },
  { value: 'urgent', label: '紧急' },
  { value: 'emergency', label: '特急' }
]

// 过滤后的预约列表
const filteredAppointments = computed(() => {
  return appointments.value.filter(appointment => {
    const statusMatch = filterStatus.value === 'all' || appointment.status === filterStatus.value
    const urgencyMatch = filterUrgency.value === 'all' || appointment.urgency === filterUrgency.value
    const keywordMatch = searchKeyword.value === '' || 
      appointment.childName.includes(searchKeyword.value) ||
      appointment.parentName.includes(searchKeyword.value) ||
      appointment.appointmentNo.includes(searchKeyword.value) ||
      appointment.expertName.includes(searchKeyword.value)
    
    return statusMatch && urgencyMatch && keywordMatch
  })
})

// 分页后的预约列表
const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAppointments.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredAppointments.value.length / itemsPerPage)
})

// 统计数据
const statistics = computed(() => {
  const total = appointments.value.length
  const pending = appointments.value.filter(a => a.status === 'pending').length
  const confirmed = appointments.value.filter(a => a.status === 'confirmed').length
  const urgent = appointments.value.filter(a => a.urgency === 'urgent' || a.urgency === 'emergency').length
  
  return { total, pending, confirmed, urgent }
})

// 获取状态显示信息
const getStatusInfo = (status: string) => {
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

// 获取紧急程度显示信息
const getUrgencyInfo = (urgency: string) => {
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

// 查看预约详情
const viewDetails = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  showDetailModal.value = true
}

// 关闭详情弹窗
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedAppointment.value = null
}

// 确认预约
const confirmAppointment = (appointmentId: number) => {
  const appointment = appointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    appointment.status = 'confirmed'
    alert('预约已确认，系统将通知家长')
  }
}

// 拒绝预约
const rejectAppointment = (appointmentId: number, reason?: string) => {
  const appointment = appointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    appointment.status = 'rejected'
    if (reason) {
      appointment.notes = reason
    }
    alert('预约已拒绝，系统将通知家长')
  }
}

// 处理预约（从详情页）
const handleAppointmentFromDetail = (action: 'confirm' | 'reject') => {
  if (!selectedAppointment.value) return
  
  if (action === 'confirm') {
    confirmAppointment(selectedAppointment.value.id)
  } else {
    const reason = prompt('请输入拒绝原因：')
    if (reason) {
      rejectAppointment(selectedAppointment.value.id, reason)
    }
  }
  
  closeDetailModal()
}

// 重置筛选
const resetFilters = () => {
  filterStatus.value = 'all'
  filterUrgency.value = 'all'
  searchKeyword.value = ''
  currentPage.value = 1
}

// 格式化时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="appointment-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>门诊预约管理</h1>
      <p class="header-desc">管理和处理线下门诊预约申请</p>
    </div>

    <!-- 统计卡片 -->
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

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-group">
          <input 
            v-model="searchKeyword"
            type="text" 
            placeholder="搜索预约编号、患儿姓名、家长姓名或专家..."
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

    <!-- 预约列表 -->
    <div class="appointments-table">
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
          <div class="table-cell">
            <span class="appointment-no">{{ appointment.appointmentNo }}</span>
            <span class="submit-time">{{ formatDateTime(appointment.submitTime) }}</span>
          </div>
          
          <div class="table-cell">
            <div class="child-info">
              <span class="child-name">{{ appointment.childName }}</span>
              <span class="child-meta">{{ appointment.childAge }}岁 {{ appointment.childGender }}</span>
            </div>
          </div>
          
          <div class="table-cell">
            <div class="parent-info">
              <span class="parent-name">{{ appointment.parentName }}</span>
              <span class="parent-phone">{{ appointment.parentPhone }}</span>
            </div>
          </div>
          
          <div class="table-cell">
            <div class="expert-info">
              <span class="expert-name">{{ appointment.expertName }}</span>
              <span class="expert-hospital">{{ appointment.expertHospital }}</span>
            </div>
          </div>
          
          <div class="table-cell">
            <div class="appointment-time">
              <span class="date">{{ appointment.preferredDate }}</span>
              <span class="time">{{ appointment.preferredTime }}</span>
            </div>
          </div>
          
          <div class="table-cell">
            <span 
              class="status-badge"
              :style="{ 
                color: getStatusInfo(appointment.status).color,
                backgroundColor: getStatusInfo(appointment.status).bgColor
              }"
            >
              {{ getStatusInfo(appointment.status).text }}
            </span>
          </div>
          
          <div class="table-cell">
            <span 
              class="urgency-badge"
              :style="{ color: getUrgencyInfo(appointment.urgency).color }"
            >
              {{ getUrgencyInfo(appointment.urgency).text }}
            </span>
          </div>
          
          <div class="table-cell actions">
            <button 
              class="action-btn view-btn"
              @click="viewDetails(appointment)"
            >
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

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="page-btn"
        :disabled="currentPage <= 1"
        @click="currentPage--"
      >
        上一页
      </button>
      
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      
      <button 
        class="page-btn"
        :disabled="currentPage >= totalPages"
        @click="currentPage++"
      >
        下一页
      </button>
    </div>

    <!-- 预约详情弹窗 -->
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
                <span class="value">{{ selectedAppointment.appointmentNo }}</span>
              </div>
              <div class="detail-item">
                <span class="label">提交时间</span>
                <span class="value">{{ formatDateTime(selectedAppointment.submitTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">当前状态</span>
                <span 
                  class="value status"
                  :style="{ color: getStatusInfo(selectedAppointment.status).color }"
                >
                  {{ getStatusInfo(selectedAppointment.status).text }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">紧急程度</span>
                <span 
                  class="value urgency"
                  :style="{ color: getUrgencyInfo(selectedAppointment.urgency).color }"
                >
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
                <span class="value">{{ selectedAppointment.expertName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">医院</span>
                <span class="value">{{ selectedAppointment.expertHospital }}</span>
              </div>
              <div class="detail-item">
                <span class="label">希望日期</span>
                <span class="value">{{ selectedAppointment.preferredDate }}</span>
              </div>
              <div class="detail-item">
                <span class="label">希望时间</span>
                <span class="value">{{ selectedAppointment.preferredTime }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>症状描述</h3>
            <div class="symptoms-content">
              {{ selectedAppointment.symptoms }}
            </div>
          </div>
          
          <div class="detail-section">
            <h3>既往治疗</h3>
            <div class="treatment-content">
              {{ selectedAppointment.previousTreatment }}
            </div>
          </div>
          
          <div v-if="selectedAppointment.notes" class="detail-section">
            <h3>备注信息</h3>
            <div class="notes-content">
              {{ selectedAppointment.notes }}
            </div>
          </div>
          
          <div v-if="selectedAppointment.status === 'pending'" class="detail-actions">
            <button 
              class="action-btn confirm-btn large"
              @click="handleAppointmentFromDetail('confirm')"
            >
              确认预约
            </button>
            <button 
              class="action-btn reject-btn large"
              @click="handleAppointmentFromDetail('reject')"
            >
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

/* 统计卡片 */
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

/* 预约表格 */
.appointments-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.child-info, .parent-info, .expert-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.child-name, .parent-name, .expert-name {
  font-weight: 500;
  color: #2c3e50;
}

.child-meta, .parent-phone, .expert-hospital {
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

.status-badge, .urgency-badge {
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

/* 分页 */
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }
  
  .header-cell,
  .table-cell {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
  }
  
  .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: #666;
    margin-bottom: 0.25rem;
    display: block;
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
    justify-content: space-between;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-actions {
    flex-direction: column;
  }
}
</style>