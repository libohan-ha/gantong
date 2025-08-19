<template>
  <div class="doctor-profile-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>医生资料</h1>
      <p class="header-desc">完善您的个人资料，提升专业形象</p>
    </div>

    <!-- 资料卡片 -->
    <div class="profile-card" v-loading="loading">
      <div class="card-header">
        <div class="avatar-section">
          <div class="avatar">
            {{ doctorProfile?.name?.charAt(0) || '医' }}
          </div>
          <div class="upload-avatar">
            <el-button size="small" type="text">更换头像</el-button>
          </div>
        </div>
        <div class="status-badge" :class="{ verified: doctorProfile?.verified }">
          {{ doctorProfile?.verified ? '已认证' : '未认证' }}
        </div>
      </div>

      <!-- 编辑表单 -->
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="100px"
        class="profile-form"
      >
        <div class="form-section">
          <h3>基本信息</h3>
          
          <div class="form-row">
            <el-form-item label="姓名" prop="name" class="form-item">
              <el-input v-model="profileForm.name" placeholder="请输入真实姓名" />
            </el-form-item>
            
            <el-form-item label="年龄" prop="age" class="form-item">
              <el-input-number 
                v-model="profileForm.age" 
                :min="18" 
                :max="100" 
                placeholder="年龄"
                style="width: 100%"
              />
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="职称" prop="title" class="form-item">
              <el-select v-model="profileForm.title" placeholder="请选择职称" style="width: 100%">
                <el-option label="主任医师" value="主任医师" />
                <el-option label="副主任医师" value="副主任医师" />
                <el-option label="主治医师" value="主治医师" />
                <el-option label="住院医师" value="住院医师" />
                <el-option label="主任护师" value="主任护师" />
                <el-option label="副主任护师" value="副主任护师" />
                <el-option label="主管护师" value="主管护师" />
                <el-option label="护师" value="护师" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="联系方式" prop="phone" class="form-item">
              <el-input v-model="profileForm.phone" placeholder="手机号码" />
            </el-form-item>
          </div>

          <el-form-item label="工作医院" prop="hospital">
            <el-input v-model="profileForm.hospital" placeholder="请输入工作医院全称" />
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="saveProfile" :loading="saving">
            保存资料
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <h3>我的统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ stats?.videoCount || 0 }}</div>
          <div class="stat-label">上传视频</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats?.totalViews || 0 }}</div>
          <div class="stat-label">总播放量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats?.totalLikes || 0 }}</div>
          <div class="stat-label">获得点赞</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats?.profileCompleteness || 0 }}%</div>
          <div class="stat-label">资料完整度</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getMyProfile, updateMyProfile, getMyStats, type DoctorProfile, type DoctorStats } from '@/services/doctor'

// 响应式数据
const profileFormRef = ref<FormInstance>()
const saving = ref(false)
const loading = ref(false)
const doctorProfile = ref<DoctorProfile | null>(null)
const stats = ref<DoctorStats | null>(null)

// 表单数据
const profileForm = reactive({
  name: '',
  age: undefined as number | undefined,
  title: '',
  phone: '',
  hospital: ''
})

// 表单验证规则
const profileRules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 18, max: 100, message: '年龄必须在 18 到 100 之间', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请选择职称', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  hospital: [
    { required: true, message: '请输入工作医院', trigger: 'blur' },
    { min: 2, max: 50, message: '医院名称长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 加载医生资料
const loadProfile = async () => {
  try {
    loading.value = true
    const profile = await getMyProfile()
    doctorProfile.value = profile

    // 填充表单
    Object.assign(profileForm, {
      name: profile.name || '',
      age: profile.age,
      title: profile.title || '',
      phone: profile.phone || '',
      hospital: profile.hospital || ''
    })
  } catch (error) {
    console.error('加载资料失败:', error)
    ElMessage.error('加载资料失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

// 加载统计信息
const loadStats = async () => {
  try {
    // TODO: 后端实现后启用
    // const statsData = await getMyStats()
    // stats.value = statsData

    // 临时使用默认值
    stats.value = {
      videoCount: 0,
      totalViews: 0,
      totalLikes: 0,
      profileCompleteness: calculateProfileCompleteness()
    }
  } catch (error) {
    console.error('加载统计失败:', error)
    stats.value = {
      videoCount: 0,
      totalViews: 0,
      totalLikes: 0,
      profileCompleteness: 0
    }
  }
}

// 计算资料完整度
const calculateProfileCompleteness = (): number => {
  if (!doctorProfile.value) return 0

  const fields = ['name', 'age', 'title', 'phone', 'hospital']
  const filledFields = fields.filter(field => {
    const value = doctorProfile.value![field as keyof DoctorProfile]
    return value !== null && value !== undefined && value !== ''
  })

  return Math.round((filledFields.length / fields.length) * 100)
}

// 保存资料
const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    saving.value = true

    // 构造请求体：可选字段为空时不提交，避免后端校验因空字符串失败
    const payload: any = {
      name: profileForm.name,
      age: profileForm.age,
      title: profileForm.title,
      hospital: profileForm.hospital,
    }
    if (profileForm.phone && profileForm.phone.trim()) {
      payload.phone = profileForm.phone.trim()
    }

    // 调用后端API保存资料
    const updated = await updateMyProfile(payload)

    // 更新本地数据
    doctorProfile.value = updated

    ElMessage.success('资料保存成功')

    // 重新计算资料完整度
    if (stats.value) {
      stats.value.profileCompleteness = calculateProfileCompleteness()
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    const message = error.response?.data?.message || '保存失败，请重试'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (doctorProfile.value) {
    Object.assign(profileForm, {
      name: doctorProfile.value.name,
      age: doctorProfile.value.age,
      title: doctorProfile.value.title,
      phone: doctorProfile.value.phone,
      hospital: doctorProfile.value.hospital
    })
  }
  profileFormRef.value?.clearValidate()
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadProfile(),
    loadStats()
  ])
})
</script>

<style scoped>
.doctor-profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.header-desc {
  color: #666;
  font-size: 1rem;
}

/* 资料卡片 */
.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.upload-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  background: #f5f5f5;
  color: #999;
}

.status-badge.verified {
  background: #e8f5e8;
  color: #52c41a;
}

/* 表单样式 */
.profile-form {
  margin-top: 1rem;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-item {
  margin-bottom: 0 !important;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

/* 统计信息 */
.stats-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.stats-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .doctor-profile-container {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
