import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }, // 只允许未登录用户访问
    },
    {
      path: '/hospital',
      name: 'hospital',
      component: () => import('../views/HospitalView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
    },
    {
      path: '/hospital/appointment-management',
      name: 'appointment-management',
      component: () => import('../views/AppointmentManagementView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
    },
    {
      path: '/hospital/training-management',
      name: 'training-management',
      component: () => import('../views/TrainingManagementView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
    },
    {
      path: '/hospital/video-upload',
      name: 'video-upload',
      component: () => import('../views/VideoUploadView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
    },
    {
      path: '/hospital/forum-management',
      name: 'forum-management',
      component: () => import('../views/ForumManagementView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
    },
    {
      path: '/hospital/case-privacy',
      name: 'case-privacy',
      component: () => import('../views/CasePrivacyView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
    },
    {
      path: '/parent',
      name: 'parent',
      component: () => import('../views/ParentView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },
    {
      path: '/parent/expert-courses',
      name: 'expert-courses',
      component: () => import('../views/ExpertCoursesView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },
    {
      path: '/parent/sensory-test',
      name: 'sensory-test',
      component: () => import('../views/SensoryTestView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },
    {
      path: '/parent/expert-appointment',
      name: 'expert-appointment',
      component: () => import('../views/ExpertAppointmentView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },
    {
      path: '/parent/growth-profile',
      name: 'growth-profile',
      component: () => import('../views/GrowthProfileView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },
    {
      path: '/parent/forum',
      name: 'parent-forum',
      component: () => import('../views/ParentForumView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },
    {
      path: '/parent/training-base',
      name: 'training-base',
      component: () => import('../views/TrainingBaseView.vue'),
      meta: { requiresAuth: true, roles: ['PARENT'] },
    },
    {
      path: '/school',
      name: 'school',
      component: () => import('../views/SchoolView.vue'),
      meta: { requiresAuth: true, roles: ['SCHOOL_ADMIN'] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN'] },
    },
    {
      path: '/doctor/profile',
      name: 'doctor-profile',
      component: () => import('../views/DoctorProfileView.vue'),
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'] },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 初始化认证状态
  if (!authStore.user && localStorage.getItem('accessToken')) {
    await authStore.initAuth()
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // 检查角色权限
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const userRole = authStore.userRole
      if (!userRole || !to.meta.roles.includes(userRole)) {
        // 权限不足，跳转到首页
        next({ name: 'home' })
        return
      }
    }
  }

  // 检查是否只允许访客访问（如登录页）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // 已登录用户不能访问登录页，跳转到首页
    next({ name: 'home' })
    return
  }

  next()
})

export default router
