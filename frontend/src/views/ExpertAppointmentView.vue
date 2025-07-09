<script setup lang="ts">
import { ref, computed } from 'vue'

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
  avatar: string
  city: string
}

// 模拟专家数据
const experts: Expert[] = [
  {
    id: 1,
    name: '张慧敏',
    title: '主任医师、教授',
    hospital: '北京儿童医院',
    specialty: ['感统失调训练', '儿童发育迟缓', '注意力缺陷'],
    experience: 15,
    education: '北京大学医学部博士',
    achievements: [
      '中国儿童康复医学会常委',
      '发表SCI论文30余篇',
      '主持国家自然科学基金项目2项'
    ],
    introduction: '专注于儿童感统失调的诊断和治疗，在感统训练领域有丰富的临床经验。擅长为不同年龄段的儿童制定个性化的康复方案。',
    availableTime: ['周一上午', '周三下午', '周五上午'],
    rating: 4.9,
    consultationCount: 1280,
    avatar: '/api/placeholder/120/120',
    city: '北京'
  },
  {
    id: 2,
    name: '李建华',
    title: '副主任医师',
    hospital: '上海市儿童医院',
    specialty: ['感统评估', '运动协调训练', '精细动作训练'],
    experience: 12,
    education: '复旦大学医学院硕士',
    achievements: [
      '上海市康复医学会委员',
      '感统训练标准化方案制定者',
      '儿童康复治疗师培训导师'
    ],
    introduction: '在儿童感统评估和训练方面有深厚造诣，特别擅长运动协调能力的提升训练，帮助数千名儿童改善感统功能。',
    availableTime: ['周二上午', '周四下午', '周六上午'],
    rating: 4.8,
    consultationCount: 980,
    avatar: '/api/placeholder/120/120',
    city: '上海'
  },
  {
    id: 3,
    name: '王芳',
    title: '主治医师',
    hospital: '广州市妇女儿童医疗中心',
    specialty: ['触觉敏感训练', '前庭觉训练', '家庭康复指导'],
    experience: 10,
    education: '中山大学医学院硕士',
    achievements: [
      '广东省儿童康复医学会理事',
      '家庭康复指导专家',
      '感统训练器材研发顾问'
    ],
    introduction: '专门从事儿童感统障碍的临床治疗和家庭指导，在触觉敏感和前庭觉训练方面有独特的治疗方法。',
    availableTime: ['周一下午', '周三上午', '周五下午'],
    rating: 4.7,
    consultationCount: 756,
    avatar: '/api/placeholder/120/120',
    city: '广州'
  },
  {
    id: 4,
    name: '陈明',
    title: '主任医师',
    hospital: '成都市儿童医院',
    specialty: ['本体觉训练', '平衡能力训练', '多动症干预'],
    experience: 18,
    education: '四川大学华西医学院博士',
    achievements: [
      '四川省儿童康复医学会主委',
      '国家级康复治疗师考官',
      '感统训练临床指南编写者'
    ],
    introduction: '从事儿童康复医学18年，在本体觉和平衡训练领域有深入研究，对多动症合并感统失调的治疗有丰富经验。',
    availableTime: ['周二下午', '周四上午', '周六下午'],
    rating: 4.9,
    consultationCount: 1456,
    avatar: '/api/placeholder/120/120',
    city: '成都'
  },
  {
    id: 5,
    name: '刘秀英',
    title: '副主任医师',
    hospital: '西安市儿童医院',
    specialty: ['语言发育迟缓', '感统综合训练', '社交能力训练'],
    experience: 14,
    education: '西安交通大学医学院硕士',
    achievements: [
      '陕西省康复医学会专委',
      '儿童语言康复专家',
      '感统训练课程开发者'
    ],
    introduction: '专注于语言发育迟缓合并感统失调的治疗，在提高儿童社交能力和语言表达方面有显著成效。',
    availableTime: ['周一上午', '周三下午', '周日上午'],
    rating: 4.6,
    consultationCount: 892,
    avatar: '/api/placeholder/120/120',
    city: '西安'
  },
  {
    id: 6,
    name: '赵志强',
    title: '主治医师',
    hospital: '深圳市儿童医院',
    specialty: ['感统评估', '个性化训练方案', '家长指导培训'],
    experience: 8,
    education: '南方医科大学硕士',
    achievements: [
      '深圳市康复医学会青年委员',
      '感统训练新技术推广者',
      '家长培训课程设计师'
    ],
    introduction: '年轻有为的感统训练专家，善于运用最新的评估技术和训练方法，为家长提供专业的指导和培训。',
    availableTime: ['周二上午', '周四下午', '周日下午'],
    rating: 4.5,
    consultationCount: 423,
    avatar: '/api/placeholder/120/120',
    city: '深圳'
  }
]

// 页面状态
const selectedExpert = ref<Expert | null>(null)
const showBookingForm = ref(false)
const selectedCity = ref('全部')
const selectedSpecialty = ref('全部')
const searchKeyword = ref('')

// 预约表单数据
const bookingForm = ref({
  childName: '',
  childAge: '',
  childGender: '',
  parentName: '',
  parentPhone: '',
  preferredDate: '',
  preferredTime: '',
  symptoms: '',
  previousTreatment: ''
})

// 城市列表
const cities = computed(() => {
  const citySet = new Set(experts.map(expert => expert.city))
  return ['全部', ...Array.from(citySet)]
})

// 专业领域列表
const specialties = computed(() => {
  const specialtySet = new Set<string>()
  experts.forEach(expert => {
    expert.specialty.forEach(s => specialtySet.add(s))
  })
  return ['全部', ...Array.from(specialtySet)]
})

// 过滤后的专家列表
const filteredExperts = computed(() => {
  return experts.filter(expert => {
    const cityMatch = selectedCity.value === '全部' || expert.city === selectedCity.value
    const specialtyMatch = selectedSpecialty.value === '全部' || 
      expert.specialty.some(s => s.includes(selectedSpecialty.value))
    const keywordMatch = searchKeyword.value === '' || 
      expert.name.includes(searchKeyword.value) ||
      expert.hospital.includes(searchKeyword.value) ||
      expert.specialty.some(s => s.includes(searchKeyword.value))
    
    return cityMatch && specialtyMatch && keywordMatch
  })
})

// 选择专家
const selectExpert = (expert: Expert) => {
  selectedExpert.value = expert
}

// 开始预约
const startBooking = (expert: Expert) => {
  selectedExpert.value = expert
  showBookingForm.value = true
}

// 关闭专家详情
const closeExpertDetail = () => {
  selectedExpert.value = null
  showBookingForm.value = false
}

// 关闭预约表单
const closeBookingForm = () => {
  showBookingForm.value = false
  // 不重置 selectedExpert，保持在专家详情页
  bookingForm.value = {
    childName: '',
    childAge: '',
    childGender: '',
    parentName: '',
    parentPhone: '',
    preferredDate: '',
    preferredTime: '',
    symptoms: '',
    previousTreatment: ''
  }
}

// 提交预约
const submitBooking = () => {
  // 这里应该调用后端API
  alert('预约提交成功！我们会在24小时内与您联系确认预约时间。')
  showBookingForm.value = false
  selectedExpert.value = null
  // 重置表单
  bookingForm.value = {
    childName: '',
    childAge: '',
    childGender: '',
    parentName: '',
    parentPhone: '',
    preferredDate: '',
    preferredTime: '',
    symptoms: '',
    previousTreatment: ''
  }
}

// 获取明天的日期（用于日期选择的最小值）
const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}
</script>

<template>
  <div class="expert-appointment-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>专家预约</h1>
      <p class="header-desc">我们正在邀请全国的专家加入我们的团队为大家服务，暂不收取预约费</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filters">
      <div class="search-bar">
        <input 
          v-model="searchKeyword"
          type="text" 
          placeholder="搜索专家姓名、医院或专业领域..."
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

    <!-- 专家列表 -->
    <div class="experts-grid">
      <div 
        v-for="expert in filteredExperts" 
        :key="expert.id"
        class="expert-card"
        @click="selectExpert(expert)"
      >
        <div class="expert-avatar">
          <div class="avatar-placeholder">{{ expert.name.charAt(0) }}</div>
          <div class="rating-badge">{{ expert.rating }}★</div>
        </div>
        
        <div class="expert-info">
          <h3>{{ expert.name }}</h3>
          <p class="expert-title">{{ expert.title }}</p>
          <p class="expert-hospital">{{ expert.hospital }}</p>
          
          <div class="expert-specialty">
            <span 
              v-for="specialty in expert.specialty.slice(0, 2)" 
              :key="specialty"
              class="specialty-tag"
            >
              {{ specialty }}
            </span>
            <span v-if="expert.specialty.length > 2" class="more-specialty">
              +{{ expert.specialty.length - 2 }}
            </span>
          </div>
          
          <div class="expert-stats">
            <span class="stat-item">{{ expert.experience }}年经验</span>
            <span class="stat-item">{{ expert.consultationCount }}次咨询</span>
          </div>
          
          <button 
            class="book-btn"
            @click.stop="selectExpert(expert)"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>

    <!-- 专家详情弹窗 -->
    <div v-if="selectedExpert && !showBookingForm" class="modal-overlay" @click="closeExpertDetail">
      <div class="expert-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>专家详情</h2>
          <button class="close-btn" @click="closeExpertDetail">×</button>
        </div>
        
        <div class="modal-content">
          <div class="expert-profile">
            <div class="profile-left">
              <div class="large-avatar">{{ selectedExpert.name.charAt(0) }}</div>
              <div class="profile-rating">
                <span class="rating-score">{{ selectedExpert.rating }}★</span>
                <span class="consultation-count">{{ selectedExpert.consultationCount }}次咨询</span>
              </div>
            </div>
            
            <div class="profile-right">
              <h3>{{ selectedExpert.name }}</h3>
              <p class="profile-title">{{ selectedExpert.title }}</p>
              <p class="profile-hospital">{{ selectedExpert.hospital }} · {{ selectedExpert.city }}</p>
              <p class="profile-education">{{ selectedExpert.education }}</p>
              <p class="profile-experience">从业{{ selectedExpert.experience }}年</p>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>专业领域</h4>
            <div class="specialty-list">
              <span 
                v-for="specialty in selectedExpert.specialty" 
                :key="specialty"
                class="specialty-item"
              >
                {{ specialty }}
              </span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>专业简介</h4>
            <p class="introduction-text">{{ selectedExpert.introduction }}</p>
          </div>
          
          <div class="detail-section">
            <h4>主要成就</h4>
            <ul class="achievements-list">
              <li v-for="achievement in selectedExpert.achievements" :key="achievement">
                {{ achievement }}
              </li>
            </ul>
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

    <!-- 预约表单弹窗 -->
    <div v-if="showBookingForm" class="modal-overlay" @click="closeBookingForm">
      <div class="booking-form-modal" @click.stop>
        <div class="modal-header">
          <h2>预约 {{ selectedExpert?.name }} 医生</h2>
          <button class="close-btn" @click="closeBookingForm">×</button>
        </div>
        
        <form @submit.prevent="submitBooking" class="booking-form">
          <div class="form-section">
            <h3>儿童信息</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>儿童姓名 *</label>
                <input v-model="bookingForm.childName" type="text" required>
              </div>
              
              <div class="form-group">
                <label>年龄 *</label>
                <input v-model="bookingForm.childAge" type="number" min="1" max="18" required>
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
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>是否有过相关治疗</label>
              <textarea 
                v-model="bookingForm.previousTreatment"
                placeholder="请描述之前的治疗经历（如无则填无）..."
                rows="3"
              ></textarea>
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
.expert-appointment-container {
  max-width: 1200px;
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

/* 搜索和筛选 */
.search-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-bar {
  flex: 1;
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
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

/* 专家列表 */
.experts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.expert-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  gap: 1rem;
}

.expert-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.expert-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.rating-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: #ffd700;
  color: #333;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
}

.expert-info {
  flex: 1;
}

.expert-info h3 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.expert-title {
  color: #42b883;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.expert-hospital {
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.expert-specialty {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.specialty-tag {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.more-specialty {
  background: #f0f0f0;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.expert-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  color: #666;
  font-size: 0.9rem;
}

.book-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  width: 100%;
}

.book-btn:hover {
  background: #369870;
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

.expert-detail-modal,
.booking-form-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
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

/* 专家详情 */
.expert-profile {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.profile-left {
  text-align: center;
}

.large-avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
}

.profile-rating {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rating-score {
  color: #ffd700;
  font-weight: bold;
}

.consultation-count {
  color: #666;
  font-size: 0.9rem;
}

.profile-right {
  flex: 1;
}

.profile-right h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.profile-title {
  color: #42b883;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.profile-hospital,
.profile-education,
.profile-experience {
  color: #666;
  margin: 0 0 0.25rem 0;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.specialty-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.specialty-item {
  background: #e8f5e8;
  color: #42b883;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.introduction-text {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.achievements-list {
  margin: 0;
  padding-left: 1.5rem;
}

.achievements-list li {
  color: #666;
  margin-bottom: 0.5rem;
}

.available-time {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.time-slot {
  background: #f0f8ff;
  color: #42b883;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.9rem;
  border: 1px solid #42b883;
}

.book-detail-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  margin-top: 1rem;
}

.book-detail-btn:hover {
  background: #369870;
}

/* 预约表单 */
.booking-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b883;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
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
  .expert-appointment-container {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .search-filters {
    flex-direction: column;
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
  
  .expert-card {
    flex-direction: column;
    text-align: center;
  }
  
  .expert-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>