<script setup lang="ts">
// 家长端主页
</script>

<template>
  <div class="parent-container">
    <h1>家长端</h1>
    
    <div class="categories-grid">
      <div class="category-card">
        <h3>分类1 - 专家课程</h3>
        <p>专家课程（免费看三节课程的权限，后续第一节 - 200元，后面所有系列全部课程500元可听所有系列全部课程）</p>
        <p>课程内容包含专家针对感统失调的科普讲解、产生原因，家庭方面可以做哪些干预，如何给孩子做家庭训练等</p>
        <button class="btn" @click="$router.push('/parent/expert-courses')">查看课程</button>
      </div>
      
      <div class="category-card">
        <h3>分类2 - 感统测试</h3>
        <p>感统测试，集成十余套感统测试题放在里面，完成后AI给出数据分析和训练建议</p>
        <button class="btn" @click="$router.push('/parent/sensory-test')">开始测试</button>
      </div>
      
      <div class="category-card">
        <h3>分类3 - 训练基地</h3>
        <p>我们自己开发及集成的一套家庭版感统小游戏，有很多小模块，每个小模块可以进行感统测评</p>
        <p>根据测试结果做个性化定制训练。每个小模块的游戏时间控制在三到四分钟</p>
        <button class="btn" @click="$router.push('/parent/training-base')">开始训练</button>
      </div>
      
      <div class="category-card">
        <h3>分类4 - 家长论坛</h3>
        <p>家长可以发帖发布所照小孩的情况，家长之间互相鼓励，互相支持</p>
        <button class="btn" @click="$router.push('/parent/forum')">进入论坛</button>
      </div>
      
      <div class="category-card">
        <h3>分类5 - 线下门诊预约</h3>
        <p>线下门诊预约（我们正在邀请全国的专家加入我们的团队为大家服务，暂不收取预约费）</p>
        <p>家长可以看到入驻的专家名片，并选择进行预约</p>
        <button class="btn" @click="$router.push('/parent/expert-appointment')">预约专家</button>
      </div>
      
      <div class="category-card">
        <h3>分类6 - 个性化成长</h3>
        <p>用系统为每个孩子建立一个专属的成长档案，包含：生长发育史、自身状况以及测评评估结果</p>
        <button class="btn" @click="$router.push('/parent/growth-profile')">查看档案</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parent-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.parent-container h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  justify-content: center;
}

.category-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  text-align: left;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.category-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.category-card p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #369870;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .category-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    gap: 1rem;
  }
  
  .category-card {
    padding: 1rem;
  }
  
  .category-card h3 {
    font-size: 1.1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>