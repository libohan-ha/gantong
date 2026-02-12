<template>
  <div class="doctor-profile-container">
    <!-- 页头 -->
    <div class="page-hero">
      <div class="hero-deco">
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
      </div>
      <div class="hero-inner">
        <span class="hero-badge">个人资料</span>
        <h1>医生工作台</h1>
        <p>完善个人资料，提升专业形象</p>
      </div>
    </div>

    <div class="content-grid">
      <!-- 左列：头像 + 统计 -->
      <aside class="aside-col">
        <!-- 头像卡片 -->
        <div class="card avatar-card" v-loading="loading">
          <div class="avatar-wrap">
            <div class="avatar">
              <img
                v-if="doctorProfile?.avatarUrl"
                :src="resolveAvatarUrl(doctorProfile.avatarUrl)"
                alt="doctor-avatar"
              />
              <span v-else class="avatar-letter">{{ doctorProfile?.name?.charAt(0) || '医' }}</span>
            </div>
            <input
              ref="avatarInputRef"
              class="avatar-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              @change="handleAvatarChange"
            />
            <el-button size="small" text :loading="avatarUploading" @click="triggerAvatarUpload" class="upload-btn">
              更换头像
            </el-button>
          </div>

          <div class="avatar-info">
            <h3>{{ doctorProfile?.name || '未填写姓名' }}</h3>
            <span class="title-tag" v-if="doctorProfile?.title">{{ doctorProfile.title }}</span>
            <span class="hospital-text" v-if="doctorProfile?.hospital">{{ doctorProfile.hospital }}</span>
          </div>

          <div class="status-chip" :class="{ verified: doctorProfile?.verified }">
            <span class="chip-dot"></span>
            {{ doctorProfile?.verified ? '已认证' : '未认证' }}
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="card stats-card">
          <h3 class="card-title">数据概览</h3>
          <div class="stats-list">
            <div class="stat-row">
              <span class="stat-icon" style="background: #eef3ff; color: #5b8def">📹</span>
              <div class="stat-text">
                <span class="stat-num">{{ stats?.videoCount || 0 }}</span>
                <span class="stat-label">上传视频</span>
              </div>
            </div>
            <div class="stat-row">
              <span class="stat-icon" style="background: #f3efff; color: #a78bfa">▶️</span>
              <div class="stat-text">
                <span class="stat-num">{{ stats?.totalViews || 0 }}</span>
                <span class="stat-label">总播放量</span>
              </div>
            </div>
            <div class="stat-row">
              <span class="stat-icon" style="background: #fff8ee; color: #f59e42">👍</span>
              <div class="stat-text">
                <span class="stat-num">{{ stats?.totalLikes || 0 }}</span>
                <span class="stat-label">获得点赞</span>
              </div>
            </div>
            <div class="stat-row">
              <span class="stat-icon" style="background: #edfaf5; color: #4ec3a0">📊</span>
              <div class="stat-text">
                <span class="stat-num">{{ stats?.profileCompleteness || 0 }}%</span>
                <span class="stat-label">资料完整度</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右列：表单 -->
      <div class="form-col">
        <div class="card form-card" v-loading="loading">
          <h3 class="card-title">基本信息</h3>

          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
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

            <div class="form-actions">
              <el-button @click="resetForm" round>重置</el-button>
              <el-button type="primary" @click="saveProfile" :loading="saving" round>保存资料</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { API_BASE_URL } from '@/services/api'
import {
  getMyProfile,
  getMyStats,
  updateMyProfile,
  uploadAvatar,
  type DoctorProfile,
  type DoctorStats,
  type UpdateDoctorProfileRequest,
} from '@/services/doctor'

const profileFormRef = ref<FormInstance>()
const avatarInputRef = ref<HTMLInputElement>()

const saving = ref(false)
const avatarUploading = ref(false)
const loading = ref(false)

const doctorProfile = ref<DoctorProfile | null>(null)
const stats = ref<DoctorStats | null>(null)

type ApiError = {
  response?: {
    data?: {
      message?: string
    }
  }
}

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError)?.response?.data?.message
  return typeof message === 'string' && message.trim() ? message : fallback
}

const profileForm = reactive({
  name: '',
  age: undefined as number | undefined,
  title: '',
  phone: '',
  hospital: '',
})

const profileRules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应为 2-20 个字符', trigger: 'blur' },
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 18, max: 100, message: '年龄必须在 18-100 之间', trigger: 'blur' },
  ],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  hospital: [
    { required: true, message: '请输入工作医院', trigger: 'blur' },
    { min: 2, max: 50, message: '医院名称长度应为 2-50 个字符', trigger: 'blur' },
  ],
}

const loadProfile = async () => {
  try {
    loading.value = true
    const profile = await getMyProfile()
    doctorProfile.value = profile

    Object.assign(profileForm, {
      name: profile.name || '',
      age: profile.age,
      title: profile.title || '',
      phone: profile.phone || '',
      hospital: profile.hospital || '',
    })
  } catch (error) {
    console.error('加载资料失败:', error)
    ElMessage.error('加载资料失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

const calculateProfileCompleteness = (): number => {
  if (!doctorProfile.value) return 0

  const fields: Array<keyof DoctorProfile> = ['name', 'age', 'title', 'phone', 'hospital']
  const filledCount = fields.filter((field) => {
    const value = doctorProfile.value?.[field]
    return value !== null && value !== undefined && value !== ''
  }).length

  return Math.round((filledCount / fields.length) * 100)
}

const loadStats = async () => {
  try {
    stats.value = await getMyStats()
  } catch (error) {
    console.error('加载统计失败:', error)
    stats.value = {
      videoCount: 0,
      totalViews: 0,
      totalLikes: 0,
      profileCompleteness: calculateProfileCompleteness(),
    }
  }
}

const resolveAvatarUrl = (avatarUrl?: string): string => {
  if (!avatarUrl) return ''
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl

  const base = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`
  return `${base}${normalizedPath}`
}

const triggerAvatarUpload = () => {
  avatarInputRef.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    input.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    input.value = ''
    return
  }

  try {
    avatarUploading.value = true
    const { avatarUrl } = await uploadAvatar(file)

    if (doctorProfile.value) {
      doctorProfile.value.avatarUrl = avatarUrl
    }

    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error(getErrorMessage(error, '头像上传失败，请重试'))
  } finally {
    avatarUploading.value = false
    input.value = ''
  }
}

const saveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    saving.value = true

    const payload: UpdateDoctorProfileRequest = {
      name: profileForm.name,
      age: profileForm.age,
      title: profileForm.title,
      hospital: profileForm.hospital,
    }

    if (profileForm.phone && profileForm.phone.trim()) {
      payload.phone = profileForm.phone.trim()
    }

    const updated = await updateMyProfile(payload)
    doctorProfile.value = updated

    ElMessage.success('资料保存成功')

    if (stats.value) {
      stats.value.profileCompleteness = calculateProfileCompleteness()
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(getErrorMessage(error, '保存失败，请重试'))
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  if (doctorProfile.value) {
    Object.assign(profileForm, {
      name: doctorProfile.value.name || '',
      age: doctorProfile.value.age,
      title: doctorProfile.value.title || '',
      phone: doctorProfile.value.phone || '',
      hospital: doctorProfile.value.hospital || '',
    })
  }
  profileFormRef.value?.clearValidate()
}

onMounted(async () => {
  await Promise.all([loadProfile(), loadStats()])
})
</script>

<style scoped>
.doctor-profile-container {
  max-width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* ── Hero ── */
.page-hero {
  position: relative;
  text-align: center;
  padding: 2.5rem 2rem 2rem;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
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
  padding: 0.2rem 0.75rem;
  background: rgba(91, 141, 239, 0.22);
  color: #93b4f8;
  border-radius: 999px;
  margin-bottom: 0.7rem;
  letter-spacing: 0.5px;
}

.page-hero h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
}

.page-hero p {
  margin: 0;
  font-size: 0.88rem;
  color: #94a3b8;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}

.c1 {
  width: 200px;
  height: 200px;
  background: #5b8def;
  top: -60px;
  right: -30px;
}

.c2 {
  width: 120px;
  height: 120px;
  background: #a78bfa;
  bottom: -40px;
  left: 5%;
}

/* ── Layout grid ── */
.content-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 650;
  color: #1e293b;
  margin: 0 0 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f3f7;
}

/* ── Aside: avatar card ── */
.aside-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 22px;
  background: linear-gradient(135deg, #5b8def 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(91, 141, 239, 0.2);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  color: #fff;
  font-size: 2.2rem;
  font-weight: 700;
}

.avatar-input {
  display: none;
}

.upload-btn {
  font-size: 0.8rem;
  color: #64748b;
}

.avatar-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.avatar-info h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.title-tag {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #5b8def;
  background: #eef3ff;
  padding: 0.15rem 0.6rem;
  border-radius: 6px;
}

.hospital-text {
  font-size: 0.82rem;
  color: #64748b;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  background: #f8f9fa;
  color: #94a3b8;
}

.status-chip.verified {
  background: #edfaf5;
  color: #4ec3a0;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* ── Stats card ── */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.stat-text {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.78rem;
  color: #94a3b8;
}

/* ── Form card ── */
.form-card {
  padding: 1.75rem;
}

.profile-form {
  margin-top: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.form-item {
  margin-bottom: 0 !important;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f3f7;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 10px;
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .aside-col {
    flex-direction: row;
    gap: 1rem;
  }

  .avatar-card,
  .stats-card {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .aside-col {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .page-hero {
    padding: 1.75rem 1rem;
  }

  .page-hero h1 {
    font-size: 1.35rem;
  }
}
</style>
