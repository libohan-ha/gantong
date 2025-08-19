import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthService, type User, type LoginRequest, type RegisterRequest } from '@/services/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role)

  // 初始化 - 从本地存储恢复用户状态
  const initAuth = async () => {
    if (AuthService.isAuthenticated()) {
      const storedUser = AuthService.getStoredUser()
      if (storedUser) {
        user.value = storedUser
        try {
          // 验证 token 是否仍然有效
          const currentUser = await AuthService.getCurrentUser()
          user.value = currentUser
          AuthService.storeUser(currentUser)
        } catch (error) {
          // Token 无效，清除状态
          logout()
        }
      }
    }
  }

  // 登录
  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      const response = await AuthService.login(credentials)

      // 存储 token
      AuthService.storeToken(response.accessToken)

      // 获取用户信息
      const userData = await AuthService.getCurrentUser()
      user.value = userData
      AuthService.storeUser(userData)

      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      const message = error.response?.data?.message || '登录失败'
      ElMessage.error(message)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData: RegisterRequest) => {
    try {
      isLoading.value = true
      await AuthService.register(userData)
      ElMessage.success('注册成功，请登录')
      return true
    } catch (error: any) {
      const message = error.response?.data?.message || '注册失败'
      ElMessage.error(message)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = () => {
    AuthService.logout()
    user.value = null
    ElMessage.success('已退出登录')
  }

  return {
    // 状态
    user,
    isLoading,
    // 计算属性
    isAuthenticated,
    userRole,
    // 方法
    initAuth,
    login,
    register,
    logout,
  }
})
