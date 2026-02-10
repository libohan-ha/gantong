/**
 * 路由配置文件
 *
 * 本文件定义了整个前端应用的路由规则和导航守卫。
 * 路由按角色分组：公共路由、医院端（医生/超管）、家长端、学校端、管理员端。
 *
 * meta 字段说明：
 *   - requiresAuth: boolean  —— 是否需要登录才能访问
 *   - requiresGuest: boolean —— 是否仅限未登录用户访问（如登录页）
 *   - roles: string[]        —— 允许访问的角色列表（SUPER_ADMIN / DOCTOR / PARENT / SCHOOL_ADMIN）
 */

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  // 使用 HTML5 History 模式，基础路径从 Vite 环境变量读取
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ==================== 公共路由（无需登录） ====================

    /** 首页 */
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    /** 登录页 —— 仅限未登录用户访问（requiresGuest） */
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },

    // ==================== 医院端路由（SUPER_ADMIN / DOCTOR） ====================

    /** 医院端主页 */
    {
      path: '/hospital',
      name: 'hospital',
      component: () => import('../views/HospitalView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'DOCTOR'] },
    },

    /** 预约管理 —— 医生/管理员管理患者预约 */
    {
      path: '/hospital/appointment-management',
      name: 'appointment-management',
      component: () => import('../views/AppointmentManagementView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'DOCTOR'] },
    },

    /** 训练管理 —— 管理感统训练课程 */
    {
      path: '/hospital/training-management',
      name: 'training-management',
      component: () => import('../views/TrainingManagementView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'DOCTOR'] },
    },

    /** 视频上传 —— 上传训练/教学视频 */
    {
      path: '/hospital/video-upload',
      name: 'video-upload',
      component: () => import('../views/VideoUploadView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'DOCTOR'] },
    },

    /** 论坛管理 —— 管理医院端论坛帖子 */
    {
      path: '/hospital/forum-management',
      name: 'forum-management',
      component: () => import('../views/ForumManagementView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'DOCTOR'] },
    },

    /** 病例隐私管理 —— 管理病例数据的隐私设置 */
    {
      path: '/hospital/case-privacy',
      name: 'case-privacy',
      component: () => import('../views/CasePrivacyView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'DOCTOR'] },
    },

    /** 医生个人资料 —— 医生编辑自己的个人信息 */
    {
      path: '/doctor/profile',
      name: 'doctor-profile',
      component: () => import('../views/DoctorProfileView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'DOCTOR'] },
    },

    // ==================== 家长端路由（PARENT） ====================

    /** 家长端主页 */
    {
      path: '/parent',
      name: 'parent',
      component: () => import('../views/ParentView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },

    /** 专家课程 —— 家长浏览和观看专家课程 */
    {
      path: '/parent/expert-courses',
      name: 'expert-courses',
      component: () => import('../views/ExpertCoursesView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },

    /** 感统测评 —— 家长为孩子做感统测评 */
    {
      path: '/parent/sensory-test',
      name: 'sensory-test',
      component: () => import('../views/SensoryTestView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },

    /** 专家预约 —— 家长预约专家咨询 */
    {
      path: '/parent/expert-appointment',
      name: 'expert-appointment',
      component: () => import('../views/ExpertAppointmentView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },

    /** 成长档案 —— 记录和查看孩子的成长数据 */
    {
      path: '/parent/growth-profile',
      name: 'growth-profile',
      component: () => import('../views/GrowthProfileView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },

    /** 家长论坛 —— 家长交流讨论区 */
    {
      path: '/parent/forum',
      name: 'parent-forum',
      component: () => import('../views/ParentForumView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },

    /** 训练基地 —— 家长查看和预约训练课程 */
    {
      path: '/parent/training-base',
      name: 'training-base',
      component: () => import('../views/TrainingBaseView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },

    // ==================== 学校端路由 ====================

    /** 学校端主页 —— 超管/家长/学校管理员均可访问 */
    {
      path: '/school',
      name: 'school',
      component: () => import('../views/SchoolView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'PARENT', 'SCHOOL_ADMIN'] },
    },

    // ==================== 管理员路由（仅 SUPER_ADMIN） ====================

    /** 超级管理员后台 */
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN'] },
    },
  ],
})

/**
 * 全局前置导航守卫
 *
 * 执行顺序：
 * 1. 如果本地有 token 但 store 中无用户信息，则先初始化认证状态（刷新页面场景）
 * 2. 如果目标路由需要认证（requiresAuth）：
 *    a. 未登录 → 重定向到登录页，并携带 redirect 参数以便登录后跳回
 *    b. 已登录但角色不匹配 → 重定向到首页
 * 3. 如果目标路由仅限游客（requiresGuest）且用户已登录 → 重定向到首页
 * 4. 其他情况正常放行
 */
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // 页面刷新时，从 localStorage 的 token 恢复用户登录状态
  if (!authStore.user && localStorage.getItem('accessToken')) {
    await authStore.initAuth()
  }

  // 需要认证的路由：检查登录状态和角色权限
  if (to.meta.requiresAuth) {
    // 未登录 → 跳转登录页，携带原目标路径用于登录后回跳
    if (!authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // 角色权限校验：当前用户角色不在允许列表中 → 回到首页
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const userRole = authStore.userRole
      if (!userRole || !to.meta.roles.includes(userRole)) {
        next({ name: 'home' })
        return
      }
    }
  }

  // 游客专属页面（如登录页）：已登录用户不允许访问 → 回到首页
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // 放行
  next()
})

export default router
