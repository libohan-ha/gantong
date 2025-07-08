<script setup lang="ts">
// 专家课程页面
const courses = [
  {
    id: 1,
    title: '感统失调科普',
    description: '专家详细讲解感统失调的基本概念、表现症状及影响',
    duration: '约30分钟',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: 'https://www.bilibili.com/video/BV14P411J7Fe/?spm_id_from=333.337.search-card.all.click'
  },
  {
    id: 2,
    title: '感统失调产生原因',
    description: '深入分析感统失调的成因，帮助家长了解问题根源',
    duration: '约25分钟',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: 'https://www.bilibili.com/video/BV1GwX1Y9Edr/?spm_id_from=333.337.search-card.all.click'
  },
  {
    id: 3,
    title: '感统失调训练',
    description: '实用的家庭训练方法和技巧，帮助孩子改善感统能力',
    duration: '约35分钟',
    thumbnail: '/api/placeholder/400/225',
    videoUrl: 'https://www.bilibili.com/video/BV1Jg3reqEiL/?spm_id_from=333.337.search-card.all.click'
  }
]

const openVideo = (videoUrl: string) => {
  window.open(videoUrl, '_blank')
}
</script>

<template>
  <div class="expert-courses-container">
    <div class="header">
      <h1>专家课程</h1>
      <p class="subtitle">专业的感统失调科普与训练指导</p>
    </div>
    
    <div class="courses-grid">
      <div 
        v-for="course in courses" 
        :key="course.id"
        class="course-card"
        @click="openVideo(course.videoUrl)"
      >
        <div class="course-thumbnail">
          <div class="play-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="white"/>
            </svg>
          </div>
          <div class="duration-badge">{{ course.duration }}</div>
        </div>
        
        <div class="course-content">
          <h3>{{ course.title }}</h3>
          <p>{{ course.description }}</p>
          <div class="course-meta">
            <span class="free-badge">免费观看</span>
            <button class="watch-btn">立即观看</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="notice">
      <h3>课程说明</h3>
      <p>• 前三节课程完全免费观看</p>
      <p>• 后续单节课程：200元/节</p>
      <p>• 全系列课程套餐：500元（包含所有课程）</p>
    </div>
  </div>
</template>

<style scoped>
.expert-courses-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.course-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.course-thumbnail {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.course-card:hover .play-button {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.duration-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.course-content {
  padding: 1.5rem;
}

.course-content h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.course-content p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.free-badge {
  background: #e8f5e8;
  color: #4caf50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.watch-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.watch-btn:hover {
  background: #369870;
}

.notice {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.notice h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.notice p {
  color: #666;
  margin-bottom: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .expert-courses-container {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .course-thumbnail {
    height: 160px;
  }
  
  .course-content {
    padding: 1rem;
  }
  
  .notice {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .courses-grid {
    gap: 1rem;
  }
  
  .course-thumbnail {
    height: 140px;
  }
  
  .play-button {
    width: 50px;
    height: 50px;
  }
  
  .course-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .watch-btn {
    width: 100%;
  }
}
</style>