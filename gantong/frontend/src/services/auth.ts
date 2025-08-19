import api from './api'

export interface LoginRequest {
  email?: string
  phone?: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface User {
  id: number
  email?: string
  phone?: string
  role: 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'DOCTOR' | 'PARENT' | 'SCHOOL_ADMIN'
}

export interface RegisterRequest {
  email?: string
  phone?: string
  password: string
  role: 'PARENT' | 'DOCTOR' | 'SCHOOL_ADMIN'
}

export class AuthService {
  /**
   * 用户登录
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  }

  /**
   * 用户注册
   */
  static async register(userData: RegisterRequest): Promise<void> {
    await api.post('/auth/register', userData)
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  }

  /**
   * 登出
   */
  static logout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  /**
   * 检查是否已登录
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  }

  /**
   * 获取存储的用户信息
   */
  static getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * 存储用户信息
   */
  static storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  /**
   * 存储访问令牌
   */
  static storeToken(token: string): void {
    localStorage.setItem('accessToken', token)
  }
}
