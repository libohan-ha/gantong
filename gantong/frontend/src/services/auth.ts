/**
 * 认证服务模块
 *
 * 封装所有与用户认证相关的 API 调用和本地状态管理，包括：
 *   - 登录 / 注册
 *   - 获取当前用户信息
 *   - 登出
 *   - 本地 Token 和用户信息的存取
 */

import api from './api'

// ==================== 请求/响应 类型定义 ====================

/**
 * 登录请求参数
 * 支持邮箱或手机号 + 密码登录
 */
export interface LoginRequest {
  /** 邮箱（与 phone 二选一） */
  email?: string
  /** 手机号（与 email 二选一） */
  phone?: string
  /** 密码 */
  password: string
}

/** 登录成功后返回的数据 */
export interface LoginResponse {
  /** JWT 访问令牌 */
  accessToken: string
}

/** 用户信息 */
export interface User {
  /** 用户ID */
  id: number
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 用户角色：超级管理员 / 医生 / 家长 / 学校管理员 */
  role: 'SUPER_ADMIN' | 'DOCTOR' | 'PARENT' | 'SCHOOL_ADMIN'
}

/**
 * 注册请求参数
 * 注册时需指定角色（不允许直接注册为超级管理员）
 */
export interface RegisterRequest {
  /** 邮箱（与 phone 二选一） */
  email?: string
  /** 手机号（与 email 二选一） */
  phone?: string
  /** 密码 */
  password: string
  /** 注册角色：家长 / 医生 / 学校管理员 */
  role: 'PARENT' | 'DOCTOR' | 'SCHOOL_ADMIN'
}

// ==================== 认证服务类 ====================

export class AuthService {
  /**
   * 用户登录
   * @param credentials - 登录凭证（邮箱/手机号 + 密码）
   * @returns 包含 accessToken 的响应
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  }

  /**
   * 用户注册
   * @param userData - 注册信息（邮箱/手机号 + 密码 + 角色）
   */
  static async register(userData: RegisterRequest): Promise<void> {
    await api.post('/auth/register', userData)
  }

  /**
   * 获取当前登录用户信息
   * 通过 JWT Token 从后端获取用户详情
   * @returns 当前用户信息
   */
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  }

  /**
   * 登出
   * 清除 localStorage 中的 token 和用户信息
   */
  static logout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  /**
   * 检查用户是否已登录
   * 判断依据：localStorage 中是否存在 accessToken
   * @returns 是否已认证
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  }

  /**
   * 从 localStorage 获取缓存的用户信息
   * @returns 用户对象，未登录时返回 null
   */
  static getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * 将用户信息存入 localStorage
   * @param user - 要缓存的用户对象
   */
  static storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  /**
   * 将 JWT Token 存入 localStorage
   * @param token - 访问令牌
   */
  static storeToken(token: string): void {
    localStorage.setItem('accessToken', token)
  }
}
