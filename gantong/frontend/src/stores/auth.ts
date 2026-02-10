import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { AuthService, type LoginRequest, type RegisterRequest, type User } from '@/services/auth'

const getErrorMessage = (error: unknown, fallback: string): string => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  return typeof message === 'string' ? message : fallback
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value && AuthService.isAuthenticated())
  const userRole = computed(() => user.value?.role)

  const logout = () => {
    AuthService.logout()
    user.value = null
    ElMessage.success('已退出登录')
  }

  const initAuth = async () => {
    if (!AuthService.isAuthenticated()) return

    const storedUser = AuthService.getStoredUser()
    if (storedUser) {
      user.value = storedUser
    }

    try {
      const currentUser = await AuthService.getCurrentUser()
      user.value = currentUser
      AuthService.storeUser(currentUser)
    } catch {
      logout()
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      const response = await AuthService.login(credentials)
      AuthService.storeToken(response.accessToken)

      const currentUser = await AuthService.getCurrentUser()
      user.value = currentUser
      AuthService.storeUser(currentUser)

      ElMessage.success('登录成功')
      return true
    } catch (error: unknown) {
      ElMessage.error(getErrorMessage(error, '登录失败'))
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (payload: RegisterRequest) => {
    try {
      isLoading.value = true
      await AuthService.register(payload)
      ElMessage.success('注册成功，请登录')
      return true
    } catch (error: unknown) {
      ElMessage.error(getErrorMessage(error, '注册失败'))
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    userRole,
    initAuth,
    login,
    register,
    logout,
  }
})
