<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { ArrowRight } from '@element-plus/icons-vue'

const authStore = useAuthStore()

const getRoleDisplayName = (role: string | undefined) => {
  const roleMap: Record<string, string> = {
    SUPER_ADMIN: '超级管理员',
    DOCTOR: '医生',
    PARENT: '家长',
    SCHOOL_ADMIN: '学校管理员',
  }
  return role ? roleMap[role] || role : '未知'
}

interface PortalEntry {
  title: string
  desc: string
  route: string
  color: string
  bg: string
  emoji: string
  roles: string[]
}

const portals: PortalEntry[] = [
  {
    title: '管理控制台',
    desc: '账号与角色总控，用户管理',
    route: '/admin',
    color: '#ef4444',
    bg: '#fef2f2',
    emoji: '🛡️',
    roles: ['SUPER_ADMIN'],
  },
  {
    title: '医院端',
    desc: '专业医师培训与管理平台',
    route: '/hospital',
    color: '#5b8def',
    bg: '#eef3ff',
    emoji: '🏥',
    roles: ['SUPER_ADMIN', 'DOCTOR'],
  },
  {
    title: '家长端',
    desc: '家庭感统训练与学习平台',
    route: '/parent',
    color: '#4ec3a0',
    bg: '#edfaf5',
    emoji: '👨‍👩‍👧',
    roles: ['PARENT'],
  },
  {
    title: '校园端',
    desc: '校园环境智能训练推送',
    route: '/school',
    color: '#a78bfa',
    bg: '#f3efff',
    emoji: '🏫',
    roles: ['SUPER_ADMIN', 'PARENT', 'SCHOOL_ADMIN'],
  },
]

const visiblePortals = () => {
  if (!authStore.userRole) return []
  return portals.filter((p) => p.roles.includes(authStore.userRole!))
}
</script>

<template>
  <main class="home-main">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-deco">
        <div class="deco-blob b1"></div>
        <div class="deco-blob b2"></div>
        <div class="deco-blob b3"></div>
      </div>

      <div class="hero-inner">
        <span class="hero-badge">感统训练平台</span>
        <h1>感统学院</h1>
        <p class="hero-sub">为每一个孩子的感觉统合发展，提供专业科学的支持</p>

        <div v-if="!authStore.isAuthenticated" class="hero-cta">
          <router-link to="/login" class="cta-btn">立即登录</router-link>
          <span class="cta-hint">登录后可访问全部功能模块</span>
        </div>

        <div v-else class="hero-welcome">
          <div class="welcome-row">
            <div class="welcome-avatar">{{ (authStore.user?.email || authStore.user?.phone || '?').charAt(0).toUpperCase() }}</div>
            <div class="welcome-info">
              <span class="welcome-name">{{ authStore.user?.email || authStore.user?.phone }}</span>
              <span class="welcome-role">{{ getRoleDisplayName(authStore.userRole) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Portals -->
    <section v-if="authStore.isAuthenticated" class="portals-section">
      <div class="section-label">
        <h2>我的工作台</h2>
        <span class="section-line"></span>
      </div>

      <div class="portals-grid">
        <router-link
          v-for="p in visiblePortals()"
          :key="p.route"
          :to="p.route"
          class="portal-card"
        >
          <div class="portal-left">
            <div class="portal-emoji" :style="{ background: p.bg }">{{ p.emoji }}</div>
            <div class="portal-text">
              <h3>{{ p.title }}</h3>
              <p>{{ p.desc }}</p>
            </div>
          </div>
          <span class="portal-arrow" :style="{ color: p.color }">
            <el-icon :size="18"><ArrowRight /></el-icon>
          </span>
          <div class="portal-bar" :style="{ background: p.color }"></div>
        </router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-main {
  max-width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── Hero ── */
.hero {
  position: relative;
  text-align: center;
  padding: 3.5rem 2rem 3rem;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 20px;
  color: #fff;
  overflow: hidden;
}

.hero-inner {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.85rem;
  background: rgba(91, 141, 239, 0.2);
  color: #93b4f8;
  border-radius: 999px;
  margin-bottom: 1rem;
  letter-spacing: 1px;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.6rem;
  letter-spacing: 1px;
}

.hero-sub {
  color: #94a3b8;
  font-size: 1rem;
  margin: 0 0 2rem;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}

/* deco */
.deco-blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}

.b1 {
  width: 300px;
  height: 300px;
  background: #5b8def;
  top: -80px;
  right: -60px;
}

.b2 {
  width: 180px;
  height: 180px;
  background: #a78bfa;
  bottom: -50px;
  left: 10%;
}

.b3 {
  width: 100px;
  height: 100px;
  background: #4ec3a0;
  top: 30%;
  left: -20px;
}

/* CTA */
.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.cta-btn {
  display: inline-block;
  padding: 0.7rem 2.2rem;
  background: #5b8def;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.25s ease;
}

.cta-btn:hover {
  background: #4a7de0;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(91, 141, 239, 0.3);
}

.cta-hint {
  font-size: 0.8rem;
  color: #64748b;
}

/* Welcome */
.hero-welcome {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0.75rem 1.5rem;
}

.welcome-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.welcome-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #5b8def, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.welcome-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.welcome-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.welcome-role {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* ── Portals ── */
.section-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.section-label h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
}

.section-line {
  flex: 1;
  height: 1px;
  background: #e8eaef;
}

.portals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.portal-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.35rem 1.5rem;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.portal-card:hover {
  border-color: transparent;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.07);
  transform: translateY(-3px);
}

.portal-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.portal-emoji {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.portal-text h3 {
  font-size: 1rem;
  font-weight: 650;
  color: #1e293b;
  margin: 0 0 0.2rem;
}

.portal-text p {
  font-size: 0.83rem;
  color: #64748b;
  margin: 0;
}

.portal-arrow {
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.portal-card:hover .portal-arrow {
  opacity: 1;
  transform: translateX(0);
}

.portal-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.portal-card:hover .portal-bar {
  opacity: 1;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero {
    padding: 2.5rem 1.5rem 2rem;
    border-radius: 16px;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .portals-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 2rem 1rem;
  }

  .hero h1 {
    font-size: 1.7rem;
  }

  .hero-sub {
    font-size: 0.9rem;
  }
}
</style>
