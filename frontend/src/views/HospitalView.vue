<script setup lang="ts">
// 医院端主页
</script>

<template>
  <div class="hospital-container">
    <h1>医院端</h1>
    
    <div class="categories-grid">
      <div class="category-card">
        <h3>分类1 - 授课视频上传</h3>
        <p>上传授课视频渠道（上传必须输入主课医师的姓名，工作医院名）</p>
        <p>进入分类页需写入我院医生姓名、年龄、职称和联系方式（需要实名认证）</p>
        <button class="btn" @click="$router.push('/hospital/video-upload')">上传视频</button>
      </div>
      
      <div class="category-card">
        <h3>分类2 - 病例隐私保护</h3>
        <p>保密病人隐私，可以上传仅上传局部和分部位的敏感的模块（线上线下都可以）</p>
        <button class="btn" @click="$router.push('/hospital/case-privacy')">上传病例</button>
      </div>
      
      <div class="category-card">
        <h3>分类3 - 门诊预约渠道</h3>
        <p>线下门诊预约渠道（暂定徐州儿童医院，北京京都儿童医院，计划酝酿合作国内所有医院）</p>
        <button class="btn">预约管理</button>
      </div>
      
      <div class="category-card">
        <h3>分类4 - 专家培训</h3>
        <p>一二三线城市医院专家向基层医院（含社区医院）授课（线上培训，线下培训，由专家定）</p>
        <button class="btn" @click="$router.push('/hospital/training-management')">培训管理</button>
      </div>
      
      <div class="category-card">
        <h3>分类5 - 家长论坛管理</h3>
        <p>家长论坛（共限一个论坛，医师可以看家长的留言，也可以用空闲时间根据家长的留言，给予家长解答）</p>
        <button class="btn" @click="$router.push('/hospital/forum-management')">论坛管理</button>
      </div>
      
      <div class="category-card">
        <h3>分类6 - 门诊预约</h3>
        <p>门诊预约，专家可以根据预约的提示进行预约</p>
        <button class="btn" @click="$router.push('/hospital/appointment-management')">预约处理</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hospital-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.hospital-container h1 {
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