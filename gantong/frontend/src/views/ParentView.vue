<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Reading,
  EditPen,
  Trophy,
  ChatDotRound,
  Calendar,
  DataLine,
  ArrowRight,
} from '@element-plus/icons-vue'

const router = useRouter()

const categories = [
  {
    title: '专家课程',
    desc: '专家针对感统失调的科普讲解、家庭干预指导，免费试看三节课程。',
    icon: Reading,
    route: '/parent/expert-courses',
    color: '#5b8def',
    bg: '#eef3ff',
    tag: '学习',
    action: '查看课程',
  },
  {
    title: '感统测试',
    desc: '集成十余套专业感统测试题，完成后 AI 给出数据分析和训练建议。',
    icon: EditPen,
    route: '/parent/sensory-test',
    color: '#e67e5a',
    bg: '#fff3ee',
    tag: '测评',
    action: '开始测试',
  },
  {
    title: '训练基地',
    desc: '家庭版感统小游戏，个性化定制训练，每个模块 3-4 分钟。',
    icon: Trophy,
    route: '/parent/training-base',
    color: '#4ec3a0',
    bg: '#edfaf5',
    tag: '训练',
    action: '开始训练',
  },
  {
    title: '家长论坛',
    desc: '家长互助社区，分享经验、互相鼓励，共同陪伴孩子成长。',
    icon: ChatDotRound,
    route: '/parent/forum',
    color: '#f59e42',
    bg: '#fff8ee',
    tag: '社区',
    action: '进入论坛',
  },
  {
    title: '线下门诊预约',
    desc: '全国专家团队在线预约，查看入驻专家名片，暂不收取预约费。',
    icon: Calendar,
    route: '/parent/expert-appointment',
    color: '#a78bfa',
    bg: '#f3efff',
    tag: '预约',
    action: '预约专家',
  },
  {
    title: '个性化成长档案',
    desc: '为孩子建立专属成长档案：发育史、测评结果、健康记录一站管理。',
    icon: DataLine,
    route: '/parent/growth-profile',
    color: '#38bdf8',
    bg: '#eef9ff',
    tag: '档案',
    action: '查看档案',
  },
]

function go(route: string) {
  router.push(route)
}
</script>

<template>
  <div class="parent-container">
    <!-- Hero -->
    <section class="page-hero">
      <div class="hero-deco">
        <div class="deco-blob b1"></div>
        <div class="deco-blob b2"></div>
        <div class="deco-blob b3"></div>
      </div>
      <div class="hero-inner">
        <span class="hero-badge">家长端</span>
        <h1>家庭感统训练中心</h1>
        <p>课程 · 测评 · 训练 · 成长档案，全方位守护孩子发展</p>
      </div>
    </section>

    <!-- Cards -->
    <section class="cards-section">
      <div class="section-label">
        <h2>功能模块</h2>
        <span class="section-line"></span>
      </div>

      <div class="cards-grid">
        <div
          v-for="cat in categories"
          :key="cat.route"
          class="func-card"
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
            <span class="enter-text" :style="{ color: cat.color }">{{ cat.action }}</span>
            <span class="enter-arrow" :style="{ color: cat.color }">
              <el-icon :size="14"><ArrowRight /></el-icon>
            </span>
          </div>

          <div class="card-bottom-bar" :style="{ background: cat.color }"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.parent-container {
  max-width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── Hero ── */
.page-hero {
  position: relative;
  text-align: center;
  padding: 2.75rem 2rem 2.25rem;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
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
  padding: 0.22rem 0.85rem;
  background: rgba(78, 195, 160, 0.22);
  color: #6ee7b7;
  border-radius: 999px;
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.page-hero h1 {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
}

.page-hero p {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

.deco-blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}

.b1 {
  width: 240px;
  height: 240px;
  background: #4ec3a0;
  top: -70px;
  right: -40px;
}

.b2 {
  width: 150px;
  height: 150px;
  background: #f59e42;
  bottom: -50px;
  left: 8%;
}

.b3 {
  width: 90px;
  height: 90px;
  background: #5b8def;
  top: 25%;
  left: -15px;
}

/* ── Section label ── */
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

/* ── Card grid ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.func-card:hover {
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
  font-size: 1.05rem;
  font-weight: 650;
  color: #1e293b;
  margin: 0 0 0.45rem;
}

.func-card p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.65;
  margin: 0;
  flex: 1;
}

.func-card-footer {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 1.1rem;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s ease;
}

.func-card:hover .func-card-footer {
  opacity: 1;
  transform: translateX(0);
}

.enter-text {
  font-size: 0.84rem;
  font-weight: 600;
}

.enter-arrow {
  display: flex;
  align-items: center;
}

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
@media (max-width: 768px) {
  .page-hero {
    padding: 2rem 1.25rem 1.75rem;
    border-radius: 14px;
  }

  .page-hero h1 {
    font-size: 1.4rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .page-hero {
    padding: 1.5rem 1rem;
  }

  .page-hero h1 {
    font-size: 1.25rem;
  }

  .func-card {
    padding: 1.15rem;
  }
}
</style>
