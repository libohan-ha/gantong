<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-deco">
      <div class="bg-circle c1"></div>
      <div class="bg-circle c2"></div>
      <div class="bg-circle c3"></div>
      <div class="bg-circle c4"></div>
    </div>

    <!-- 左侧品牌区 -->
    <div class="brand-side">
      <div class="brand-content">
        <div class="brand-dots">
          <span class="dot d1"></span>
          <span class="dot d2"></span>
          <span class="dot d3"></span>
        </div>
        <h1>感统学院</h1>
        <p class="brand-subtitle">专业感觉统合训练管理平台</p>
        <div class="brand-features">
          <div class="feature-item">
            <span class="feature-icon">📋</span>
            <span>专家课程 · 在线学习</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🏥</span>
            <span>门诊预约 · 专家问诊</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>感统测评 · 成长档案</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <span>训练基地 · 科学指导</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录卡片 -->
    <div class="login-side">
      <div class="login-card">
        <div class="login-header">
          <span class="login-badge">欢迎回来</span>
          <h2>登录账号</h2>
          <p>请输入您的账号信息</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              placeholder="请输入邮箱"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="authStore.isLoading"
              @click="handleLogin"
              class="login-button"
            >
              登录
            </el-button>
          </el-form-item>

          <div class="login-footer">
            <el-link type="primary" @click="showRegister = true">还没有账号？立即注册</el-link>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 注册弹窗 -->
    <el-dialog
      v-model="showRegister"
      title="用户注册"
      width="400px"
      :before-close="handleRegisterClose"
      class="register-dialog"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="registerForm.role" placeholder="请选择角色">
            <el-option label="家长" value="PARENT" />
            <el-option label="医生" value="DOCTOR" />
            <el-option label="学校管理员" value="SCHOOL_ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleRegisterClose">取消</el-button>
          <el-button type="primary" :loading="authStore.isLoading" @click="handleRegister">注册</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm } from 'element-plus'
import type { FormItemRule, FormRules } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, RegisterRequest } from '@/services/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref<InstanceType<typeof ElForm>>()
const registerFormRef = ref<InstanceType<typeof ElForm>>()

const loginForm = reactive<LoginRequest>({
  email: '',
  password: '',
})

const registerForm = reactive<RegisterRequest & { confirmPassword: string }>({
  email: '',
  password: '',
  confirmPassword: '',
  role: 'PARENT',
})

const showRegister = ref(false)

const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' } as FormItemRule,
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' } as FormItemRule,
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' } as FormItemRule,
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' } as FormItemRule,
  ],
}

const registerRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' } as FormItemRule,
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' } as FormItemRule,
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' } as FormItemRule,
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' } as FormItemRule,
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' } as FormItemRule,
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur',
    } as FormItemRule,
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' } as FormItemRule],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    const success = await authStore.login(loginForm)
    if (!success) return

    switch (authStore.userRole) {
      case 'SUPER_ADMIN':
        router.push('/admin')
        break
      case 'DOCTOR':
        router.push('/hospital')
        break
      case 'PARENT':
        router.push('/parent')
        break
      case 'SCHOOL_ADMIN':
        router.push('/school')
        break
      default:
        router.push('/')
    }
  } catch (error) {
    console.error('登录校验失败:', error)
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    const registerData = {
      email: registerForm.email,
      password: registerForm.password,
      role: registerForm.role,
    }
    const success = await authStore.register(registerData)
    if (!success) return

    showRegister.value = false
    registerFormRef.value.resetFields()
  } catch (error) {
    console.error('注册校验失败:', error)
  }
}

const handleRegisterClose = () => {
  showRegister.value = false
  registerFormRef.value?.resetFields()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  background: #f0f4f8;
}

/* ── 背景装饰圆 ── */
.bg-deco {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}

.c1 {
  width: 500px;
  height: 500px;
  background: #5b8def;
  top: -150px;
  left: -100px;
}

.c2 {
  width: 350px;
  height: 350px;
  background: #a78bfa;
  bottom: -80px;
  right: -60px;
}

.c3 {
  width: 200px;
  height: 200px;
  background: #4ec3a0;
  top: 40%;
  left: 45%;
}

.c4 {
  width: 280px;
  height: 280px;
  background: #f472b6;
  top: -60px;
  right: 30%;
}

/* ── 左侧品牌区 ── */
.brand-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  padding: 3rem;
  position: relative;
  z-index: 1;
}

.brand-content {
  max-width: 380px;
  color: #fff;
}

.brand-dots {
  display: flex;
  gap: 6px;
  margin-bottom: 1.5rem;
}

.dot {
  border-radius: 50%;
}

.d1 {
  width: 12px;
  height: 12px;
  background: #5b8def;
}

.d2 {
  width: 9px;
  height: 9px;
  background: #a78bfa;
  align-self: flex-end;
}

.d3 {
  width: 7px;
  height: 7px;
  background: #4ec3a0;
  align-self: center;
}

.brand-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 2.5rem;
  letter-spacing: 0.5px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.75);
  transition: background 0.2s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.feature-icon {
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  flex-shrink: 0;
}

/* ── 右侧登录区 ── */
.login-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.login-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.03);
  padding: 2.75rem 2.5rem;
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  background: rgba(91, 141, 239, 0.1);
  color: #5b8def;
  border-radius: 999px;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.login-header h2 {
  color: #1e293b;
  margin: 0 0 0.4rem;
  font-size: 1.65rem;
  font-weight: 750;
}

.login-header p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.88rem;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.login-footer {
  text-align: center;
  margin-top: 1.25rem;
}

/* ── Element Plus 覆盖 ── */
:deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1.5px #e2e8f0;
  padding: 4px 14px;
  transition: box-shadow 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1.5px #cbd5e1;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1.5px #5b8def, 0 0 0 4px rgba(91, 141, 239, 0.1);
}

:deep(.el-button--primary) {
  border-radius: 12px;
  background: linear-gradient(135deg, #5b8def 0%, #4f6fdc 100%);
  border: none;
  box-shadow: 0 8px 20px rgba(91, 141, 239, 0.3);
  transition: all 0.25s ease;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #4f6fdc 0%, #4361c9 100%);
  box-shadow: 0 10px 24px rgba(91, 141, 239, 0.4);
  transform: translateY(-1px);
}

:deep(.el-link--primary) {
  color: #5b8def;
  font-size: 0.88rem;
}

/* ── 注册弹窗 ── */
:deep(.register-dialog .el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.register-dialog .el-dialog__header) {
  border-bottom: 1px solid #f1f5f9;
  padding: 1.25rem 1.5rem;
  margin-right: 0;
}

:deep(.register-dialog .el-dialog__title) {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.1rem;
}

:deep(.register-dialog .el-dialog__body) {
  padding: 1.5rem;
}

:deep(.register-dialog .el-dialog__footer) {
  border-top: 1px solid #f1f5f9;
  padding: 1rem 1.5rem;
}

:deep(.register-dialog .el-select) {
  width: 100%;
}

/* ── 响应式 ── */
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
  }

  .brand-side {
    padding: 2rem 1.5rem;
    min-height: auto;
  }

  .brand-content h1 {
    font-size: 1.8rem;
  }

  .brand-features {
    display: none;
  }

  .login-side {
    padding: 1.5rem;
  }

  .login-card {
    max-width: 100%;
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .brand-side {
    padding: 1.5rem 1rem;
  }

  .brand-content h1 {
    font-size: 1.5rem;
  }

  .brand-subtitle {
    font-size: 0.85rem;
    margin-bottom: 0;
  }

  .login-card {
    border-radius: 16px;
    padding: 1.75rem 1.25rem;
  }
}
</style>
