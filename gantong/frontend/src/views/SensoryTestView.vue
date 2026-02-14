<script setup lang="ts">
import { ref, computed } from 'vue'

interface Question {
  id: number
  section: string
  title: string
  description: string
  options: {
    label: string
    text: string
    score: number
  }[]
}

const questions: Question[] = [
  // 第一部分：身体协调与平衡
  {
    id: 1,
    section: '身体协调与平衡',
    title: '跑跳攀爬',
    description: '孩子跑动、跳跃、攀爬（如滑梯、攀爬架）时：',
    options: [
      { label: 'A', text: '非常协调灵活，很少摔倒', score: 3 },
      { label: 'B', text: '基本协调，有时显得笨拙或偶尔摔倒', score: 2 },
      { label: 'C', text: '动作明显笨拙、僵硬，经常摔倒或害怕尝试', score: 1 },
      { label: 'D', text: '极度抗拒或完全无法进行跑跳攀爬活动', score: 0 }
    ]
  },
  {
    id: 2,
    section: '身体协调与平衡',
    title: '平衡能力',
    description: '孩子单脚站立（不需辅助）：',
    options: [
      { label: 'A', text: '4岁及以上能站5秒以上；3岁能站3秒以上', score: 3 },
      { label: 'B', text: '勉强能站，但摇晃厉害或时间很短（接近年龄下限）', score: 2 },
      { label: 'C', text: '很难站稳，几乎无法完成', score: 1 },
      { label: 'D', text: '完全拒绝或无法尝试', score: 0 }
    ]
  },
  {
    id: 3,
    section: '身体协调与平衡',
    title: '走平衡木/窄路',
    description: '孩子走马路牙子、矮墙边或平衡木时：',
    options: [
      { label: 'A', text: '能平稳行走，不需要或很少需要帮助', score: 3 },
      { label: 'B', text: '能走但摇晃，需要偶尔搀扶或张开手臂保持平衡', score: 2 },
      { label: 'C', text: '非常害怕，需要大量帮助或完全拒绝走', score: 1 },
      { label: 'D', text: '完全无法尝试', score: 0 }
    ]
  },
  {
    id: 4,
    section: '身体协调与平衡',
    title: '喜欢旋转/摇晃',
    description: '孩子是否非常喜欢转圈、荡秋千（幅度大、时间长）、在转椅上旋转且不晕？',
    options: [
      { label: 'A', text: '极少或从不主动寻求，或很快就晕', score: 3 },
      { label: 'B', text: '偶尔喜欢玩，但不会过度', score: 2 },
      { label: 'C', text: '非常喜欢，经常主动寻求且转很久也不晕', score: 1 },
      { label: 'D', text: '极度沉迷，几乎停不下来', score: 0 }
    ]
  },
  // 第二部分：身体意识与运动计划
  {
    id: 5,
    section: '身体意识与运动计划',
    title: '动作力度控制',
    description: '孩子玩耍、拿东西时（如搭积木、关门、拥抱）：',
    options: [
      { label: 'A', text: '力度通常适中，很少弄坏东西或弄疼别人', score: 3 },
      { label: 'B', text: '有时用力过猛（摔门、捏人疼）或过轻（东西拿不稳）', score: 2 },
      { label: 'C', text: '经常控制不好力度，容易弄坏玩具、弄疼他人或自己', score: 1 },
      { label: 'D', text: '几乎总是无法控制力度', score: 0 }
    ]
  },
  {
    id: 6,
    section: '身体意识与运动计划',
    title: '空间判断',
    description: '孩子玩耍或走动时，是否经常撞到家具、门框或其他人？',
    options: [
      { label: 'A', text: '很少发生', score: 3 },
      { label: 'B', text: '偶尔发生', score: 2 },
      { label: 'C', text: '经常发生', score: 1 },
      { label: 'D', text: '几乎每天多次发生', score: 0 }
    ]
  },
  {
    id: 7,
    section: '身体意识与运动计划',
    title: '学习新动作',
    description: '孩子学习新的身体动作（如新操、新游戏规则动作）时：',
    options: [
      { label: 'A', text: '学得比较快，模仿能力强', score: 3 },
      { label: 'B', text: '需要多教几遍，有时显得笨拙', score: 2 },
      { label: 'C', text: '学得很慢，动作不协调，需要大量练习和帮助', score: 1 },
      { label: 'D', text: '非常困难，难以模仿和掌握', score: 0 }
    ]
  },
  {
    id: 8,
    section: '身体意识与运动计划',
    title: '姿势维持',
    description: '孩子坐着（如吃饭、看书）或站着时：',
    options: [
      { label: 'A', text: '能保持良好姿势较长时间', score: 3 },
      { label: 'B', text: '有时会无精打采、趴着、靠着或扭来扭去', score: 2 },
      { label: 'C', text: '经常瘫坐、跪坐、W坐姿、趴着或需要不停变换姿势', score: 1 },
      { label: 'D', text: '几乎无法维持端正姿势，极度好动或懒散', score: 0 }
    ]
  },
  // 第三部分：触觉反应
  {
    id: 9,
    section: '触觉反应',
    title: '对触碰的敏感度',
    description: '孩子对于轻微的触碰、衣服标签、特定布料（如毛衣）、洗头洗脸、剪指甲、赤脚踩草地/沙子的反应：',
    options: [
      { label: 'A', text: '基本都能接受，反应正常', score: 3 },
      { label: 'B', text: '对其中1-2项轻微排斥或抱怨', score: 2 },
      { label: 'C', text: '对多项明显排斥、躲避、抱怨痒/痛，甚至发脾气哭闹', score: 1 },
      { label: 'D', text: '极度敏感，对日常触碰都反应强烈，影响生活', score: 0 }
    ]
  },
  {
    id: 10,
    section: '触觉反应',
    title: '寻求触觉刺激',
    description: '孩子是否特别喜欢用力拥抱/挤压、到处摸东西、在粗糙表面摩擦、甚至咬非食物物品？',
    options: [
      { label: 'A', text: '很少或没有这种行为', score: 3 },
      { label: 'B', text: '偶尔有，程度不重', score: 2 },
      { label: 'C', text: '经常主动寻求强烈的触觉刺激', score: 1 },
      { label: 'D', text: '非常沉迷于寻求触觉刺激，难以制止', score: 0 }
    ]
  },
  {
    id: 11,
    section: '触觉反应',
    title: '对疼痛的反应',
    description: '孩子跌倒、磕碰后：',
    options: [
      { label: 'A', text: '反应适度（哭一下或告诉大人）', score: 3 },
      { label: 'B', text: '有时反应过度（哭闹很久），有时反应不足（好像不疼）', score: 2 },
      { label: 'C', text: '经常反应过度（小伤大哭）或反应不足（大伤没反应）', score: 1 },
      { label: 'D', text: '几乎总是反应过度或反应不足', score: 0 }
    ]
  },
  // 第四部分：注意力与情绪行为
  {
    id: 12,
    section: '注意力与情绪行为',
    title: '专注力',
    description: '孩子进行安静活动（如看书、画画、拼图）时：',
    options: [
      { label: 'A', text: '能专注一段时间（接近年龄水平）', score: 3 },
      { label: 'B', text: '容易分心，需要提醒，但还能完成', score: 2 },
      { label: 'C', text: '非常容易分心，坐不住，很难完成', score: 1 },
      { label: 'D', text: '几乎无法进行任何需要专注的活动', score: 0 }
    ]
  },
  {
    id: 13,
    section: '注意力与情绪行为',
    title: '活动水平',
    description: '孩子的整体活动量：',
    options: [
      { label: 'A', text: '适中，能动能静', score: 3 },
      { label: 'B', text: '偏活跃或偏安静，但在可接受范围', score: 2 },
      { label: 'C', text: '极度好动，停不下来，或极度安静不爱动', score: 1 },
      { label: 'D', text: '活动量异常极端，影响日常生活和社交', score: 0 }
    ]
  },
  {
    id: 14,
    section: '注意力与情绪行为',
    title: '情绪稳定性',
    description: '孩子情绪波动：',
    options: [
      { label: 'A', text: '比较稳定，容易安抚', score: 3 },
      { label: 'B', text: '偶尔容易激动、发脾气或退缩', score: 2 },
      { label: 'C', text: '经常情绪波动大，易怒、易哭、易焦虑或退缩，安抚困难', score: 1 },
      { label: 'D', text: '情绪极其不稳定，难以预测和管理', score: 0 }
    ]
  },
  {
    id: 15,
    section: '注意力与情绪行为',
    title: '新环境/变化适应',
    description: '孩子到新地方（如陌生人家、游乐场）或日常安排改变时：',
    options: [
      { label: 'A', text: '能较快适应或反应正常', score: 3 },
      { label: 'B', text: '需要一些时间适应，可能短暂不安', score: 2 },
      { label: 'C', text: '非常谨慎、害怕或抗拒，需要很长时间适应或大哭大闹', score: 1 },
      { label: 'D', text: '极度恐惧或抗拒新环境和变化，难以适应', score: 0 }
    ]
  },
  // 第五部分：视听觉反应
  {
    id: 16,
    section: '视听觉反应',
    title: '对视觉刺激',
    description: '孩子是否对光线（尤其是闪光、强光）、密集图案（如条纹、格子）、快速移动的物体（如风扇）特别敏感或害怕？',
    options: [
      { label: 'A', text: '没有明显反应', score: 3 },
      { label: 'B', text: '偶尔表现出轻微不适或注意', score: 2 },
      { label: 'C', text: '经常表现出明显不适、回避或害怕', score: 1 },
      { label: 'D', text: '极度敏感，严重影响活动', score: 0 }
    ]
  },
  {
    id: 17,
    section: '视听觉反应',
    title: '对听觉刺激',
    description: '孩子是否对吸尘器、吹风机、鞭炮、人多的嘈杂声等特别敏感（捂耳朵、哭闹、烦躁）？或者相反，对叫名字、指令反应迟钝？',
    options: [
      { label: 'A', text: '没有明显异常', score: 3 },
      { label: 'B', text: '对个别声音轻微敏感或偶尔反应慢', score: 2 },
      { label: 'C', text: '对多种声音明显敏感，或经常对声音反应迟钝', score: 1 },
      { label: 'D', text: '听觉反应异常极端（过度敏感或迟钝），影响沟通和生活', score: 0 }
    ]
  }
]

// 测试状态管理
const currentQuestionIndex = ref(0)
const answers = ref<Record<number, number>>({})
const showResult = ref(false)
const testStarted = ref(false)

// 当前问题
const currentQuestion = computed(() => questions[currentQuestionIndex.value])

// 进度百分比
const progressPercentage = computed(() => {
  return Math.round((currentQuestionIndex.value / questions.length) * 100)
})

// 总分计算
const totalScore = computed(() => {
  return Object.values(answers.value).reduce((sum, score) => sum + score, 0)
})

// 测试结果分析
const getResult = computed(() => {
  const score = totalScore.value
  
  if (score > 40) {
    return {
      level: '良好',
      color: '#4caf50',
      description: '孩子在日常观察中表现出的感统相关行为挑战较少，各项功能发展相对协调。',
      suggestion: '继续保持关注和提供丰富的感觉体验即可。可以多进行户外活动，促进孩子全面发展。'
    }
  } else if (score >= 25) {
    return {
      level: '中等',
      color: '#ff9800',
      description: '孩子在某些方面可能存在轻微的感统差异或挑战，属于相对常见的范围。',
      suggestion: '可以多关注得分较低的项，在日常生活中有意识地提供相应的感觉刺激或支持（如触觉按摩、前庭活动、本体觉游戏）。观察是否有改善。'
    }
  } else {
    return {
      level: '需要关注',
      color: '#f44336',
      description: '孩子在多个方面表现出较明显的感统相关挑战，这些挑战可能已经影响到其日常生活、学习、社交或情绪。',
      suggestion: '强烈建议寻求专业的儿童康复科医生、作业治疗师或感统训练师进行全面评估和诊断。他们能提供更精确的评估和个性化的干预方案。'
    }
  }
})

// 开始测试
const startTest = () => {
  testStarted.value = true
  currentQuestionIndex.value = 0
  answers.value = {}
  showResult.value = false
}

// 选择答案
const selectAnswer = (score: number) => {
  answers.value[currentQuestion.value.id] = score
  
  // 自动进入下一题
  setTimeout(() => {
    nextQuestion()
  }, 300)
}

// 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++
  } else {
    showResult.value = true
  }
}

// 上一题
const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// 重新开始测试
const restartTest = () => {
  testStarted.value = false
  currentQuestionIndex.value = 0
  answers.value = {}
  showResult.value = false
}

// 按部分统计分数
const getSectionScores = computed(() => {
  const sections = ['身体协调与平衡', '身体意识与运动计划', '触觉反应', '注意力与情绪行为', '视听觉反应']
  const sectionScores: Record<string, { score: number, maxScore: number }> = {}
  
  sections.forEach(section => {
    const sectionQuestions = questions.filter(q => q.section === section)
    const sectionScore = sectionQuestions.reduce((sum, q) => {
      return sum + (answers.value[q.id] || 0)
    }, 0)
    const maxSectionScore = sectionQuestions.length * 3
    
    sectionScores[section] = {
      score: sectionScore,
      maxScore: maxSectionScore
    }
  })
  
  return sectionScores
})
</script>

<template>
  <div class="sensory-test-container">
    <!-- 测试开始页 -->
    <div v-if="!testStarted" class="test-intro">
      <!-- Hero Header -->
      <div class="intro-hero">
        <div class="hero-circle hero-circle--1"></div>
        <div class="hero-circle hero-circle--2"></div>
        <div class="hero-circle hero-circle--3"></div>
        <span class="hero-badge">感统测评</span>
        <h1 class="hero-title">儿童感统能力测试</h1>
        <p class="hero-subtitle">
          通过17个问题，从身体协调、触觉反应、注意力等5个维度评估孩子的感统发展情况，测试大约需要5-10分钟完成。
        </p>
      </div>

      <!-- Section Cards -->
      <div class="test-sections">
        <div class="section-card">
          <div class="section-icon-wrap"><span class="section-icon">🏃</span></div>
          <div class="section-info">
            <h3>身体协调与平衡</h3>
            <p>评估孩子的运动协调能力和平衡感</p>
          </div>
        </div>

        <div class="section-card">
          <div class="section-icon-wrap"><span class="section-icon">🤲</span></div>
          <div class="section-info">
            <h3>身体意识与运动计划</h3>
            <p>评估孩子的空间感和动作控制能力</p>
          </div>
        </div>

        <div class="section-card">
          <div class="section-icon-wrap"><span class="section-icon">✋</span></div>
          <div class="section-info">
            <h3>触觉反应</h3>
            <p>评估孩子对触觉刺激的敏感度和反应</p>
          </div>
        </div>

        <div class="section-card">
          <div class="section-icon-wrap"><span class="section-icon">🧠</span></div>
          <div class="section-info">
            <h3>注意力与情绪行为</h3>
            <p>评估孩子的专注力和情绪调节能力</p>
          </div>
        </div>

        <div class="section-card">
          <div class="section-icon-wrap"><span class="section-icon">👁️</span></div>
          <div class="section-info">
            <h3>视听觉反应</h3>
            <p>评估孩子对视觉和听觉刺激的反应</p>
          </div>
        </div>
      </div>

      <button class="start-btn" @click="startTest">
        <span>开始测试</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    </div>

    <!-- 测试进行中 -->
    <div v-else-if="!showResult" class="test-content">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>

      <div class="question-info">
        <span class="question-number">第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</span>
        <span class="section-tag">{{ currentQuestion.section }}</span>
      </div>

      <div class="question-card">
        <h2 class="question-title">{{ currentQuestion.title }}</h2>
        <p class="question-desc">{{ currentQuestion.description }}</p>

        <div class="options-grid">
          <div
            v-for="option in currentQuestion.options"
            :key="option.label"
            class="option-card"
            :class="{ selected: answers[currentQuestion.id] === option.score }"
            @click="selectAnswer(option.score)"
          >
            <div class="option-label">{{ option.label }}</div>
            <div class="option-text">{{ option.text }}</div>
          </div>
        </div>
      </div>

      <div class="navigation-buttons">
        <button
          class="nav-btn prev-btn"
          @click="previousQuestion"
          :disabled="currentQuestionIndex === 0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          上一题
        </button>
        <button
          class="nav-btn next-btn"
          @click="nextQuestion"
          :disabled="!answers[currentQuestion.id]"
        >
          {{ currentQuestionIndex === questions.length - 1 ? '查看结果' : '下一题' }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <!-- 测试结果页 -->
    <div v-else class="test-result">
      <div class="result-hero">
        <div class="hero-circle hero-circle--1"></div>
        <div class="hero-circle hero-circle--2"></div>
        <span class="hero-badge">测试完成</span>
        <div class="score-display">
          <div class="total-score">
            <span class="score-number">{{ totalScore }}</span>
            <span class="score-max">/ {{ questions.length * 3 }}</span>
          </div>
          <div class="result-level" :style="{ color: getResult.color, borderColor: getResult.color, backgroundColor: getResult.color + '18' }">
            {{ getResult.level }}
          </div>
        </div>
      </div>

      <div class="result-content">
        <div class="result-card result-description">
          <div class="result-card-header">
            <span class="result-card-icon">📊</span>
            <h3>结果分析</h3>
          </div>
          <p>{{ getResult.description }}</p>
        </div>

        <div class="result-card result-suggestion">
          <div class="result-card-header">
            <span class="result-card-icon">💡</span>
            <h3>建议</h3>
          </div>
          <p>{{ getResult.suggestion }}</p>
        </div>

        <div class="result-card section-breakdown">
          <div class="result-card-header">
            <span class="result-card-icon">📈</span>
            <h3>各维度得分</h3>
          </div>
          <div class="section-scores">
            <div
              v-for="(section, sectionName) in getSectionScores"
              :key="sectionName"
              class="section-score-item"
            >
              <div class="section-name">{{ sectionName }}</div>
              <div class="section-score-bar">
                <div
                  class="section-score-fill"
                  :style="{ width: (section.score / section.maxScore) * 100 + '%' }"
                ></div>
              </div>
              <div class="section-score-text">
                {{ section.score }} / {{ section.maxScore }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button class="restart-btn" @click="restartTest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 9 9"/><path d="M3 21v-6h6"/></svg>
          重新测试
        </button>
        <button class="export-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          导出结果
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.sensory-test-container {
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

/* ===== Hero (shared intro + result) ===== */
.intro-hero,
.result-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  padding: 3rem 2.5rem 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
}

.hero-circle {
  position: absolute;
  border-radius: 50%;
  background: #f472b6;
  opacity: 0.07;
  pointer-events: none;
}
.hero-circle--1 {
  width: 260px;
  height: 260px;
  top: -80px;
  right: -60px;
}
.hero-circle--2 {
  width: 180px;
  height: 180px;
  bottom: -50px;
  left: -40px;
}
.hero-circle--3 {
  width: 120px;
  height: 120px;
  top: 40%;
  left: 60%;
}

.hero-badge {
  display: inline-block;
  background: rgba(244, 114, 182, 0.18);
  color: #f9a8d4;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 1rem;
  border-radius: 999px;
  margin-bottom: 1rem;
  letter-spacing: 0.04em;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.hero-subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 0;
  max-width: 520px;
  margin-inline: auto;
}

/* ===== Intro - Section Cards ===== */
.test-intro {
  text-align: center;
}

.test-sections {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 2rem;
  text-align: left;
}

.section-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.section-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.section-icon-wrap {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fdf2f8, #fce7f3);
  border-radius: 14px;
  flex-shrink: 0;
}

.section-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.section-info h3 {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 650;
  color: #1e293b;
}

.section-info p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.5;
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f472b6;
  color: #fff;
  border: none;
  padding: 0.85rem 2.2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.start-btn:hover {
  background: #ec4899;
  transform: translateY(-1px);
}

/* ===== Test In-Progress ===== */
.test-content {
  max-width: 640px;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #eef0f4;
  border-radius: 999px;
  margin-bottom: 1.75rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f9a8d4, #f472b6);
  border-radius: 999px;
  transition: width 0.35s ease;
}

.question-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.question-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.section-tag {
  background: rgba(244, 114, 182, 0.1);
  color: #f472b6;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.question-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.question-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.question-desc {
  color: #64748b;
  font-size: 0.92rem;
  margin: 0 0 1.75rem;
  line-height: 1.65;
}

.options-grid {
  display: grid;
  gap: 0.65rem;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.option-card:hover {
  border-color: #f9a8d4;
  background: #fdf2f8;
}

.option-card.selected {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.08);
}

.option-label {
  width: 36px;
  height: 36px;
  background: rgba(244, 114, 182, 0.12);
  color: #f472b6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.option-card.selected .option-label {
  background: #f472b6;
  color: #fff;
}

.option-text {
  flex: 1;
  color: #334155;
  font-size: 0.9rem;
  line-height: 1.5;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.prev-btn {
  background: transparent;
  border: 1.5px solid #e2e8f0;
  color: #64748b;
}

.prev-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.next-btn {
  background: #f472b6;
  border: 1.5px solid #f472b6;
  color: #fff;
}

.next-btn:hover:not(:disabled) {
  background: #ec4899;
  border-color: #ec4899;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== Result Page ===== */
.test-result {
  text-align: center;
}

.result-hero {
  padding-bottom: 2.5rem;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.total-score {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.score-number {
  font-size: 3.5rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.score-max {
  font-size: 1.3rem;
  font-weight: 500;
  color: #94a3b8;
}

.result-level {
  display: inline-block;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.4rem 1.2rem;
  border-radius: 999px;
  border: 1.5px solid;
}

/* Result content cards */
.result-content {
  text-align: left;
  margin-bottom: 1.75rem;
  display: grid;
  gap: 0.75rem;
}

.result-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 16px;
  padding: 1.5rem;
}

.result-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.85rem;
}

.result-card-icon {
  font-size: 1.15rem;
  line-height: 1;
}

.result-card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.result-description p,
.result-suggestion p {
  color: #64748b;
  line-height: 1.7;
  margin: 0;
  font-size: 0.9rem;
}

/* Section breakdown */
.section-scores {
  display: grid;
  gap: 1rem;
}

.section-score-item {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  align-items: center;
  gap: 1rem;
}

.section-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-score-bar {
  height: 8px;
  background: #eef0f4;
  border-radius: 999px;
  overflow: hidden;
}

.section-score-fill {
  height: 100%;
  background: linear-gradient(90deg, #f9a8d4, #f472b6);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.section-score-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  min-width: 56px;
  text-align: right;
}

/* Action buttons */
.result-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.restart-btn,
.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.75rem 1.6rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.restart-btn {
  background: transparent;
  border: 1.5px solid #e2e8f0;
  color: #64748b;
}

.restart-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.export-btn {
  background: #f472b6;
  border: 1.5px solid #f472b6;
  color: #fff;
}

.export-btn:hover {
  background: #ec4899;
  border-color: #ec4899;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .sensory-test-container {
    padding: 1rem;
  }

  .intro-hero,
  .result-hero {
    padding: 2rem 1.25rem 1.75rem;
    border-radius: 14px;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .question-card {
    padding: 1.25rem;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .nav-btn {
    justify-content: center;
  }

  .section-score-item {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .section-score-bar {
    width: 100%;
  }

  .result-actions {
    flex-direction: column;
  }

  .restart-btn,
  .export-btn {
    justify-content: center;
  }
}
</style>
