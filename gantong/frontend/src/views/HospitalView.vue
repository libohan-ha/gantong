<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  VideoCamera,
  Lock,
  Calendar,
  Reading,
  ChatDotRound,
  Tickets,
  User,
  Upload,
  ArrowRight,
} from '@element-plus/icons-vue'

const router = useRouter()
const activeCategory = ref<number | null>(null)

const categories = [
  {
    id: 1,
    title: '授课视频上传',
    desc: '上传授课视频，需输入主课医师姓名和工作医院名，进入分类页需实名认证。',
    icon: VideoCamera,
    route: '/hospital/video-upload',
    color: '#5b8def',
    bg: '#eef3ff',
    tag: '内容',
  },
  {
    id: 2,
    title: '病例隐私保护',
    desc: '保密病人隐私，仅上传局部和分部位的敏感模块，支持线上线下。',
    icon: Lock,
    route: '/hospital/case-privacy',
    color: '#e67e5a',
    bg: '#fff3ee',
    tag: '安全',
  },
  {
    id: 3,
    title: '门诊预约渠道',
    desc: '线下门诊预约，计划覆盖全国医院合作网络，暂不收取预约费。',
    icon: Calendar,
    route: '/hospital/appointment-management',
    color: '#4ec3a0',
    bg: '#edfaf5',
    tag: '预约',
  },
  {
    id: 4,
    title: '专家培训',
    desc: '城市专家向基层医院授课，线上线下培训由专家自行安排。',
    icon: Reading,
    route: '/hospital/training-management',
    color: '#a78bfa',
    bg: '#f3efff',
    tag: '培训',
  },
  {
    id: 5,
    title: '家长论坛管理',
    desc: '查看家长留言，利用空闲时间给予家长专业解答与指导。',
    icon: ChatDotRound,
    route: '/hospital/forum-management',
    color: '#f59e42',
    bg: '#fff8ee',
    tag: '社区',
  },
  {
    id: 6,
    title: '门诊预约处理',
    desc: '根据预约信息确认和安排门诊排期，高效管理就诊流程。',
    icon: Tickets,
    route: '/hospital/appointment-management',
    color: '#38bdf8',
    bg: '#eef9ff',
    tag: '管理',
  },
]

function go(route: string) {
  router.push(route)
}
</script>

<template>
  <div class="hospital-layout">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-mark">
          <span class="brand-dot"></span>
          <span class="brand-dot s"></span>
        </div>
        <h2>医院端</h2>
        <p>Hospital Portal</p>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="nav-item"
          :class="{ active: activeCategory === cat.id }"
          @mouseenter="activeCategory = cat.id"
          @mouseleave="activeCategory = null"
          @click="go(cat.route)"
        >
          <span class="nav-icon" :style="{ color: cat.color }">
            <el-icon :size="18"><component :is="cat.icon" /></el-icon>
          </span>
          <span class="nav-label">{{ cat.title }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="sidebar-action" @click="go('/doctor/profile')">
          <el-icon :size="16"><User /></el-icon>
          <span>我的资料</span>
        </button>
        <button class="sidebar-action" @click="go('/hospital/video-upload')">
          <el-icon :size="16"><Upload /></el-icon>
          <span>上传视频</span>
        </button>
      </div>
    </aside>

    <!-- 右侧主内容 -->
    <main class="main-content">
      <!-- 顶部欢迎区 -->
      <section class="welcome-banner">
        <div class="welcome-text">
          <span class="welcome-tag">工作台</span>
          <h1>欢迎回来，医师</h1>
          <p>感统训练管理 · 授课 · 预约 · 病例隐私保护</p>
        </div>
        <div class="welcome-deco">
          <div class="deco-circle c1"></div>
          <div class="deco-circle c2"></div>
          <div class="deco-circle c3"></div>
        </div>
      </section>

      <!-- 统计条 -->
      <section class="stat-strip">
        <div class="stat-chip">
          <span class="chip-num">6</span>
          <span class="chip-label">功能模块</span>
        </div>
        <div class="stat-chip">
          <span class="chip-num">—</span>
          <span class="chip-label">待处理预约</span>
        </div>
        <div class="stat-chip">
          <span class="chip-num">—</span>
          <span class="chip-label">论坛新留言</span>
        </div>
      </section>

      <!-- 功能卡片 -->
      <section class="cards-section">
        <div class="section-title">
          <h2>功能模块</h2>
          <span class="section-line"></span>
        </div>

        <div class="cards-grid">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="func-card"
            :class="{ hovered: activeCategory === cat.id }"
            @mouseenter="activeCategory = cat.id"
            @mouseleave="activeCategory = null"
            @click="go(cat.route)"
          >
            <div class="func-card-top">
              <div class="func-icon" :style="{ background: cat.bg, color: cat.color }">
                <el-icon :size="26"><component :is="cat.icon" /></el-icon>
              </div>
              <span class="func-tag" :style="{ background: cat.bg, color: cat.color }">{{ cat.tag }}</span>
            </div>

            <h3>{{ cat.title }}</h3>
            <p>{{ cat.desc }}</p>

            <div class="func-card-footer">
              <span class="enter-text" :style="{ color: cat.color }">进入</span>
              <span class="enter-arrow" :style="{ color: cat.color }">
                <el-icon :size="14"><ArrowRight /></el-icon>
              </span>
            </div>

            <!-- 底部彩条 -->
            <div class="card-bottom-bar" :style="{ background: cat.color }"></div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.hospital-layout {
  display: flex;
  min-height: calc(100vh - 80px);
  gap: 0;
}

/* ── Sidebar ── */
.sidebar {
  width: 230px;
  flex-shrink: 0;
  background: #1e293b;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  padding: 1.75rem 1rem 1.25rem;
  color: #fff;
  position: sticky;
  top: 90px;
  align-self: flex-start;
  min-height: calc(100vh - 100px);
}

.sidebar-header {
  padding: 0 0.5rem;
  margin-bottom: 1.75rem;
}

.brand-mark {
  display: flex;
  gap: 5px;
  margin-bottom: 0.75rem;
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #5b8def;
}

.brand-dot.s {
  width: 7px;
  height: 7px;
  background: #a78bfa;
  align-self: flex-end;
}

.sidebar-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.15rem;
  letter-spacing: 0.5px;
}

.sidebar-header p {
  font-size: 0.7rem;
  color: #64748b;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

/* nav */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  color: #94a3b8;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.2s ease;
  text-align: left;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-icon {
  display: flex;
  align-items: center;
}

/* footer */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-action {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.75rem;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.2s ease;
}

.sidebar-action:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

/* ── Main content ── */
.main-content {
  flex: 1;
  min-width: 0;
  padding: 0 0 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Welcome banner ── */
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 18px;
  padding: 2.25rem 2.5rem;
  color: #fff;
  overflow: hidden;
}

.welcome-text {
  position: relative;
  z-index: 1;
}

.welcome-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  background: rgba(91, 141, 239, 0.25);
  color: #93b4f8;
  border-radius: 999px;
  margin-bottom: 0.7rem;
  letter-spacing: 0.5px;
}

.welcome-banner h1 {
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.welcome-banner p {
  margin: 0;
  font-size: 0.88rem;
  color: #94a3b8;
}

/* decorative circles */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.c1 {
  width: 200px;
  height: 200px;
  background: #5b8def;
  top: -60px;
  right: -30px;
}

.c2 {
  width: 120px;
  height: 120px;
  background: #a78bfa;
  bottom: -40px;
  right: 100px;
}

.c3 {
  width: 80px;
  height: 80px;
  background: #4ec3a0;
  top: 10px;
  right: 180px;
}

/* ── Stat strip ── */
.stat-strip {
  display: flex;
  gap: 1rem;
}

.stat-chip {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 1.15rem;
  background: #fff;
  border: 1px solid #f0f0f5;
  border-radius: 13px;
}

.chip-num {
  font-size: 1.35rem;
  font-weight: 750;
  color: #1e293b;
  line-height: 1;
}

.chip-label {
  font-size: 0.82rem;
  color: #64748b;
}

/* ── Cards section ── */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title h2 {
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.15rem;
}

.func-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.4rem 1.4rem 1.15rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.func-card:hover,
.func-card.hovered {
  border-color: transparent;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-4px);
}

.func-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.func-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.func-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.func-card h3 {
  font-size: 1rem;
  font-weight: 650;
  color: #1e293b;
  margin: 0 0 0.4rem;
}

.func-card p {
  font-size: 0.83rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.func-card-footer {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 1rem;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.func-card:hover .func-card-footer {
  opacity: 1;
  transform: translateX(0);
}

.enter-text {
  font-size: 0.82rem;
  font-weight: 600;
}

.enter-arrow {
  display: flex;
  align-items: center;
}

/* bottom color bar */
.card-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.func-card:hover .card-bottom-bar {
  opacity: 1;
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .hospital-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: static;
    max-height: none;
    border-radius: 14px;
    padding: 1.25rem;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .sidebar-header {
    margin-bottom: 0;
    margin-right: auto;
  }

  .sidebar-header p,
  .brand-mark {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2px;
    width: 100%;
    order: 3;
  }

  .sidebar-footer {
    flex-direction: row;
    margin-top: 0;
    border-top: none;
    padding-top: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    padding-left: 0.5rem;
    gap: 0;
  }

  .main-content {
    padding: 0;
  }
}

@media (max-width: 640px) {
  .welcome-banner {
    padding: 1.5rem;
  }

  .welcome-banner h1 {
    font-size: 1.3rem;
  }

  .stat-strip {
    flex-direction: column;
    gap: 0.5rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .sidebar-nav {
    display: none;
  }

  .sidebar-footer {
    border-left: none;
    padding-left: 0;
  }
}
</style>
