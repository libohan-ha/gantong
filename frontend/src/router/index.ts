import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/hospital',
      name: 'hospital',
      component: () => import('../views/HospitalView.vue'),
    },
    {
      path: '/hospital/appointment-management',
      name: 'appointment-management',
      component: () => import('../views/AppointmentManagementView.vue'),
    },
    {
      path: '/hospital/training-management',
      name: 'training-management',
      component: () => import('../views/TrainingManagementView.vue'),
    },
    {
      path: '/hospital/video-upload',
      name: 'video-upload',
      component: () => import('../views/VideoUploadView.vue'),
    },
    {
      path: '/hospital/forum-management',
      name: 'forum-management',
      component: () => import('../views/ForumManagementView.vue'),
    },
    {
      path: '/parent',
      name: 'parent',
      component: () => import('../views/ParentView.vue'),
    },
    {
      path: '/parent/expert-courses',
      name: 'expert-courses',
      component: () => import('../views/ExpertCoursesView.vue'),
    },
    {
      path: '/parent/sensory-test',
      name: 'sensory-test',
      component: () => import('../views/SensoryTestView.vue'),
    },
    {
      path: '/parent/expert-appointment',
      name: 'expert-appointment',
      component: () => import('../views/ExpertAppointmentView.vue'),
    },
    {
      path: '/parent/growth-profile',
      name: 'growth-profile',
      component: () => import('../views/GrowthProfileView.vue'),
    },
    {
      path: '/parent/forum',
      name: 'parent-forum',
      component: () => import('../views/ParentForumView.vue'),
    },
    {
      path: '/parent/training-base',
      name: 'training-base',
      component: () => import('../views/TrainingBaseView.vue'),
    },
    {
      path: '/school',
      name: 'school',
      component: () => import('../views/SchoolView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
