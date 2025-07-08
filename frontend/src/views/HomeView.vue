<script setup lang="ts">
// 慧悦-学院首页
</script>

<template>
  <main class="home-main">
    <div class="hero-section">
      <h1>慧悦-学院</h1>
      <p>专业的感统训练平台</p>
    </div>
    
    <div class="platform-sections">
      <div class="section-card">
        <div class="card-content">
          <h2>医院端</h2>
          <p>专业医师培训与管理平台</p>
        </div>
        <router-link to="/hospital" class="btn">进入医院端</router-link>
      </div>
      
      <div class="section-card">
        <div class="card-content">
          <h2>家长端</h2>
          <p>家庭感统训练与学习平台</p>
        </div>
        <router-link to="/parent" class="btn">进入家长端</router-link>
      </div>
      
      <div class="section-card">
        <div class="card-content">
          <h2>校园端</h2>
          <p>校园环境智能训练推送</p>
        </div>
        <router-link to="/school" class="btn">进入校园端</router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-main {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.hero-section {
  text-align: center;
  padding: 2rem 0;
  margin-bottom: 3rem;
}

.hero-section h1 {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.platform-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  justify-content: center;
}

.section-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-card:hover {
  transform: translateY(-5px);
}

.section-card h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.btn {
  display: inline-block;
  background: #42b883;
  color: white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s ease;
  margin-top: 1rem;
}

.btn:hover {
  background: #369870;
}

/* 全屏幕响应式设计 */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2.5rem;
  }
  
  .platform-sections {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .section-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 1.5rem 0;
    margin-bottom: 2rem;
  }
  
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .hero-section p {
    font-size: 1rem;
  }
  
  .platform-sections {
    gap: 1rem;
  }
  
  .section-card {
    padding: 1rem;
  }
  
  .section-card h2 {
    font-size: 1.3rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 320px) {
  .hero-section h1 {
    font-size: 1.8rem;
  }
  
  .section-card {
    padding: 0.8rem;
  }
  
  .section-card h2 {
    font-size: 1.2rem;
  }
  
  .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
