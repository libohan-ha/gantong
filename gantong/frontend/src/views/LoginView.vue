<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>慧悦-学院</h2>
        <p>感统训练管理系统</p>
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
          <el-link type="primary" @click="showRegister = true">
            还没有账号？立即注册
          </el-link>
        </div>
      </el-form>
    </div>

    <!-- 注册对话框 -->
    <el-dialog
      v-model="showRegister"
      title="用户注册"
      width="400px"
      :before-close="handleRegisterClose"
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
          <el-button
            type="primary"
            :loading="authStore.isLoading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, RegisterRequest } from '@/services/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<InstanceType<typeof ElForm>>()
const registerFormRef = ref<InstanceType<typeof ElForm>>()

// 登录表单
const loginForm = reactive<LoginRequest>({
  email: '',
  password: '',
})

// 注册表单
const registerForm = reactive<RegisterRequest & { confirmPassword: string }>({
  email: '',
  password: '',
  confirmPassword: '',
  role: 'PARENT',
})

// 显示注册对话框
const showRegister = ref(false)

// 验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (valid) {
      const success = await authStore.login(loginForm)
      if (success) {
        // 根据用户角色跳转到相应页面
        const role = authStore.userRole
        switch (role) {
          case 'SUPER_ADMIN':
            router.push('/admin')
            break
          case 'HOSPITAL_ADMIN':
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
      }
    }
  } catch (error) {
    console.error('登录验证失败:', error)
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (valid) {
      const { confirmPassword, ...registerData } = registerForm
      const success = await authStore.register(registerData)
      if (success) {
        showRegister.value = false
        // 重置注册表单
        registerFormRef.value.resetFields()
      }
    }
  } catch (error) {
    console.error('注册验证失败:', error)
  }
}

// 关闭注册对话框
const handleRegisterClose = () => {
  showRegister.value = false
  registerFormRef.value?.resetFields()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
}
</style>
