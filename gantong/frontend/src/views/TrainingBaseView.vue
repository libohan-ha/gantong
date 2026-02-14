<script setup lang="ts">
import { ref, computed } from 'vue'

// 简化的训练项目接口
interface TrainingItem {
  id: number
  title: string           // 训练标题
  target: string          // 训练目标
  equipment: string       // 训练道具
  content: string         // 训练内容
  category: string        // 训练类别（触觉、前庭觉、本体觉等）
}

// 训练数据
const trainingData = ref<TrainingItem[]>([
  // 触觉训练
  { id: 1, title: '抓豆子', target: '触觉', equipment: '豆子、冷热水、两个盒', content: '豆子放在其中一个盒里，让孩子把豆子从热水盒抓到冷水盒，这样交替进行。', category: '触觉' },
  { id: 2, title: '风力转转', target: '触觉', equipment: '吹风、固体胶、白纸', content: '白纸撕成小纸条贴在手臂上，用吹风吹，让孩子保护纸条不能掉。感知风力大小、冷暖等', category: '触觉' },
  { id: 3, title: '指压板', target: '触觉', equipment: '指压板、跳绳、书', content: '指压板上走动、跳跃（单脚跳、双脚跳）、跳绳、手托物品平衡练习', category: '触觉' },
  { id: 4, title: '触摸绘本', target: '触觉', equipment: '触摸类绘本', content: '对绘本进行触摸，感知粗糙、光滑、柔软、扎手等', category: '触觉' },
  { id: 5, title: '触摸球', target: '触觉', equipment: '触摸球', content: '触摸球进行全身按摩，触摸敏感度', category: '触觉' },
  { id: 6, title: '水中探宝', target: '触觉', equipment: '水、各种小玩具、眼罩', content: '把小玩具藏进水里，让孩子戴上眼罩摸出并说出是什么', category: '触觉' },
  { id: 7, title: '松紧带', target: '触觉', equipment: '松紧带或浴巾、瑜伽带', content: '把松紧带按住下层，孩子摔倒。浴巾、孩子躺浴巾上滚动，家长将孩子裹起来', category: '触觉' },
  { id: 8, title: '触碰游戏', target: '触觉', equipment: '眼罩', content: '两个孩子或者家长和孩子轮流戴上眼罩，口令：请您（戴眼罩的人）拍打对方手臂也可以是（大腿、背部等等身体各个部位）三下（五下，数量自己定）', category: '触觉' },
  { id: 9, title: '情商类绘本', target: '触觉', equipment: '情商类绘本', content: '推荐《生气汤》《太急的担心》《我的情绪小怪兽》《我生气了》《小鸟爸爸生龙林》《跟坏情绪说再见》等等。阅读情商绘本，学会情绪管理', category: '触觉' },
  
  // 前庭觉训练
  { id: 10, title: '荡秋千', target: '前庭觉', equipment: '浴巾或者小被单，玩偶娃娃若干，篮子', content: '两个家长将孩子放在被单里，然后荡秋千，孩子则去抓娃娃。延伸训练：抓娃娃投掷到篮子', category: '前庭觉' },
  { id: 11, title: '趴地推球', target: '前庭觉', equipment: '软垫、B寸皮球一个', content: '孩子趴在软垫上，垫子离墙30-50公分只有肚子着地，头上肢小腿及脚都抬起来，手心往外，两手互相相对，然后把拇指指向墙壁，待弹回后，再连续推50到100次，每天练习10分钟左右。', category: '前庭觉' },
  { id: 12, title: '手推车走路', target: '前庭觉', equipment: '无', content: '家长抓住孩子的腿，让孩子用手走路', category: '前庭觉' },
  { id: 13, title: '直线行走', target: '前庭觉平衡', equipment: '勺子、乒乓球', content: '双手用力于托球，抬高放胸前进行直线行走', category: '前庭觉' },
  { id: 14, title: '头顶杂耍', target: '前庭觉', equipment: '叠叠杯或其它不易碎物品', content: '头顶物品进行行走，可以脚下加指压板。', category: '前庭觉' },
  { id: 15, title: '大铁锤', target: '前庭觉', equipment: '大篮子', content: '将孩子装进大篮子里左右甩动，也可以架住孩子的腰腹窝进行甩动', category: '前庭觉' },
  { id: 16, title: '飞机飞', target: '前庭觉', equipment: '无', content: '家长平静沙发或床上，小腿弯曲，将孩子手放在小腿上，前后晃动，像飞机一样', category: '前庭觉' },
  { id: 17, title: '摇摇船', target: '前庭觉', equipment: '无', content: '家长和孩子相对，脚靠脚，然后轮流往后倒，像划船一样', category: '前庭觉' },
  
  // 本体觉训练
  { id: 45, title: '跨栏', target: '本体觉', equipment: '跨栏', content: '孩子跳过跨栏，可以进行搬运物品，做线段孩子可以跨越。', category: '本体觉' },
  { id: 46, title: '花式跳绳', target: '本体觉', equipment: '跳绳', content: '家长和孩子一起跳绳。也可以两个人舞动绳子，孩子跳', category: '本体觉' },
  { id: 47, title: '不倒森林', target: '本体觉、团队合作', equipment: '棍子', content: '三个或以上孩子围成圈圈，喊口令一二三，抓，然后同时每个人去抓自己右边的人的棍子', category: '本体觉' },
  { id: 49, title: '青蛙跳', target: '本体觉', equipment: '无', content: '双手背在身后，蹲下，跳起。要求孩子不能站起来，必须跳起来。', category: '本体觉' },
  { id: 51, title: '前后左右跳', target: '本体觉', equipment: '四根长棍子', content: '将棍子摆成方形，然后孩子站中间，从四个方向跳跃，每次都要跳回中点再跳跃', category: '本体觉' },
  { id: 52, title: '拍球', target: '本体觉', equipment: '球、若干障碍物', content: '拍球过障碍物。3岁学习去接球，4-5岁学习拍球，5-6岁学习拍球过障碍。', category: '本体觉' },
  
  // 听觉训练
  { id: 48, title: '点点点', target: '听觉', equipment: '各种颜色小圆片若干', content: '家长说出几个圆片颜色，比如，一个红色，两个黄色，三个蓝色等让孩子根据顺序排列出来', category: '听觉' },
  { id: 96, title: '萝卜蹲', target: '听觉注意力', equipment: '无', content: '游戏需要三人以上完成，每个人分别取名一种彩色萝卜，然后开始萝卜蹲的游戏。几段：红萝卜蹲，红萝卜蹲，红萝卜蹲完黄萝卜蹲。黄萝卜继续，以此类推', category: '听觉' },
  { id: 102, title: '数字拍拍拍', target: '反应力', equipment: '无', content: '家长规定一个数字，当你拿到这个数字的时候，孩子就拍手。也可以是其他动作，自己定。', category: '听觉' },
  
  // 协调性训练
  { id: 53, title: '跳圈', target: '本体觉', equipment: '大圆、沙包', content: '大圆双脚跳，小圆单脚跳，沙包按顺序放圈里，遇到有沙包的圈就要跳过', category: '协调性' },
  { id: 54, title: '交换抛接球', target: '本体觉', equipment: '球', content: '两人一组，互相抛接球', category: '协调性' },
  { id: 65, title: '跳绳', target: '本体觉、协调能力', equipment: '跳绳', content: '低龄段学习跳绳的分解步骤，6岁以上完成连续跳绳', category: '协调性' },
  { id: 66, title: '袋鼠跳', target: '本体觉，跳跃能力', equipment: '跳袋', content: '孩子下半身装进跳袋里学袋鼠跳。', category: '协调性' },
  
  // 精细动作训练
  { id: 55, title: '粘贴画', target: '手指精细能力', equipment: '剪刀、胶棒', content: '剪出形状，然后跳到另外一张纸上，贴出主题。', category: '精细动作' },
  { id: 75, title: '夹豆子', target: '精细能力，手眼协调', equipment: '两种颜色球子或者豆子', content: '将两种颜色球子或豆子分别夹出来', category: '精细动作' },
  { id: 83, title: '翻书页', target: '手指精细能力', equipment: '比较厚的书', content: '孩子快速翻书。升级版，边翻书家长边问问题，比如：3+2等于几，回答正确继续翻书。', category: '精细动作' },
  
  // 注意力训练
  { id: 73, title: '找宝藏', target: '注意力训练', equipment: '玩具若干或者其他物品', content: '将玩具放进袋子里，让孩子根据家长提示找出相应的物品。先说摸的什么才能拿出来看', category: '注意力' },
  { id: 74, title: '踩踩踩', target: '注意力，反应力训练', equipment: '无', content: '孩子用脚来踩家长的手，家长也可以用手去轻轻拍打孩子的脚，让孩子躲闪', category: '注意力' },
  { id: 80, title: '看动作做动作', target: '注意力，反应力', equipment: '卡片若干张，什么都可以', content: '看到动物的卡片就拍手，看到植物的卡片就拍照（动作可以自己定）速度由慢到快', category: '注意力' },
  
  // 思维训练
  { id: 34, title: '对对碰', target: '思维训练', equipment: '扑克牌或者其他卡牌', content: '准备3组共计6张扑克牌，然后把扑克牌扣下，让孩子找出相同的两张，一次只能翻两张牌。如果是不问的两张牌，那么要放回原位并扣下。根据年龄增加的细数。初玩不用扣牌。', category: '思维训练' },
  { id: 79, title: '扑克牌加减法', target: '思维能力，识数能力', equipment: '扑克牌', content: '两张扑克牌，让孩子数数合起来是几，4岁以下5以内，4-5岁10以内，6岁可以20以内。', category: '思维训练' },
  { id: 139, title: '棋类游戏', target: '空间感、思维力', equipment: '棋类', content: '根据规则玩各种棋类', category: '思维训练' },
  { id: 154, title: '有趣的五子棋', target: '思维训练', equipment: '国棋', content: '把五颗棋子横竖地连成线的为赢', category: '思维训练' },
  
  // 记忆力训练
  { id: 91, title: '火车就要开', target: '反应力，记忆力', equipment: '无', content: '需要3个人以上，每个人设置一个地点，第一个人说：我们的火车就要开。其他人问：往哪开。第一个人说：北京开。然后代表北京的孩子继续说，以此类推。', category: '记忆力' },
  { id: 99, title: '扑克数字记忆', target: '记忆力', equipment: '扑克牌', content: '五张牌摆一排记忆20秒，然后扣下，让孩子按顺序说出表。低龄宝宝刚开始玩2、3张牌', category: '记忆力' },
  { id: 101, title: '语言技能', target: '记忆力', equipment: '无', content: '家长说：今天我到超市买了一个苹果。孩子：今天我到超市买了一个苹果，一个梨子。后面接：今天我到超市买了一个苹果，一个梨子，一个香蕉。以此类推。后面重复前面全部的话', category: '记忆力' },
  { id: 105, title: '颜色记忆', target: '记忆力', equipment: '五颜六色的玩具', content: '给孩子一个玩具，记忆20秒，然后跳起来让孩子把这个玩具有什么颜色背出来。', category: '记忆力' },
  
  // 平衡感训练
  { id: 118, title: '平衡台跳跃', target: '平衡力、下肢发展', equipment: '平衡台一个或者十个', content: '从平衡台上跳上跳下，保持平衡。也可以将5个平衡台摆成一排，孩子依次跳过', category: '平衡感' },
  { id: 124, title: '杂技表演', target: '平衡力、自控力', equipment: '书或者玩具', content: '用头、胳膊肘同时顶书，进行直线行走', category: '平衡感' },
  { id: 177, title: '平衡车', target: '平衡力、本体觉', equipment: '平衡车', content: '平衡车后退行进，保持身体平衡。', category: '平衡感' },
  
  // 视觉训练
  { id: 192, title: '舒尔特表', target: '视觉广度，专注力', equipment: '舒尔特表', content: '根据年龄完成舒尔特表（3*3、4*4、5*5、6*6。。。）快速完成，时间越短越好。', category: '视觉训练' },
  { id: 193, title: '颜色配对', target: '观察力，专注力', equipment: '四色板', content: '根据题单找出正确的颜色', category: '视觉训练' },
  { id: 260, title: '图形划消', target: '观察力，视觉分辨力', equipment: '自制图形划消题单', content: '根据提示用"\"划掉三角形。用时越短越好', category: '视觉训练' }
])

// 当前选中的类别
const selectedCategory = ref<string>('全部')
// 搜索关键词
const searchKeyword = ref<string>('')
// 当前页码
const currentPage = ref<number>(1)
// 每页显示数量
const pageSize = ref<number>(12)
// 详情弹窗显示状态
const showDetailModal = ref<boolean>(false)
// 当前查看的训练项目
const currentTrainingItem = ref<TrainingItem | null>(null)

// 训练类别列表
const categories = computed(() => {
  const uniqueCategories = [...new Set(trainingData.value.map(item => item.category))]
  return ['全部', ...uniqueCategories]
})

// 过滤后的训练数据
const filteredTrainingData = computed(() => {
  return trainingData.value.filter(item => {
    const categoryMatch = selectedCategory.value === '全部' || item.category === selectedCategory.value
    const keywordMatch = searchKeyword.value === '' || 
      item.title.includes(searchKeyword.value) ||
      item.target.includes(searchKeyword.value) ||
      item.equipment.includes(searchKeyword.value) ||
      item.content.includes(searchKeyword.value)
    
    return categoryMatch && keywordMatch
  })
})

// 分页后的训练数据
const paginatedTrainingData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTrainingData.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredTrainingData.value.length / pageSize.value)
})

// 类别颜色映射
const categoryColors: { [key: string]: string } = {
  '触觉': '#ff9800',
  '前庭觉': '#2196f3',
  '本体觉': '#4caf50',
  '听觉': '#9c27b0',
  '协调性': '#ff5722',
  '精细动作': '#795548',
  '注意力': '#f44336',
  '思维训练': '#607d8b',
  '记忆力': '#e91e63',
  '平衡感': '#00bcd4',
  '视觉训练': '#ffeb3b'
}

// 获取类别颜色
const getCategoryColor = (category: string): string => {
  return categoryColors[category] || '#9e9e9e'
}

// 查看详情
const viewDetail = (item: TrainingItem) => {
  currentTrainingItem.value = item
  showDetailModal.value = true
}

// 关闭详情弹窗
const closeDetailModal = () => {
  showDetailModal.value = false
  currentTrainingItem.value = null
}

// 切换页码
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  selectedCategory.value = '全部'
  currentPage.value = 1
}

// 获取训练统计信息
const trainingStats = computed(() => {
  const total = trainingData.value.length
  const categoryStats = categories.value.slice(1).map(category => ({
    name: category,
    count: trainingData.value.filter(item => item.category === category).length,
    color: getCategoryColor(category)
  }))
  
  return {
    total,
    categories: categoryStats
  }
})
</script>

<template>
  <div class="training-base">
    <!-- 深色渐变英雄头部 -->
    <div class="hero-header">
      <div class="hero-deco hero-deco--1"></div>
      <div class="hero-deco hero-deco--2"></div>
      <div class="hero-deco hero-deco--3"></div>
      <div class="hero-badge">训练基地</div>
      <h1 class="hero-title">感统训练基地</h1>
      <p class="hero-subtitle">专业的感觉统合训练项目，帮助孩子全面发展</p>
      <div class="hero-chips">
        <div class="stat-chip">
          <span class="chip-num">{{ trainingStats.total }}</span>
          <span class="chip-label">训练项目</span>
        </div>
        <div class="stat-chip">
          <span class="chip-num">{{ categories.length - 1 }}</span>
          <span class="chip-label">训练类别</span>
        </div>
      </div>
    </div>

    <!-- 类别统计 -->
    <div class="category-stats">
      <div class="section-header">
        <h2 class="section-title">训练类别</h2>
        <div class="section-line"></div>
      </div>
      <div class="stats-grid">
        <div
          v-for="category in trainingStats.categories"
          :key="category.name"
          class="category-stat"
        >
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            {{ category.name.charAt(0) }}
          </div>
          <div class="category-info">
            <div class="category-name">{{ category.name }}</div>
            <div class="category-count">{{ category.count }} 项</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter-section">
      <div class="search-card">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索训练项目..."
            class="search-input"
          >
          <button @click="resetSearch" class="reset-btn">重置</button>
        </div>
      </div>

      <div class="filter-tabs">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category; currentPage = 1"
          :class="['filter-tab', { active: selectedCategory === category }]"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- 训练项目列表 -->
    <div class="training-grid">
      <div
        v-for="item in paginatedTrainingData"
        :key="item.id"
        class="training-card"
        @click="viewDetail(item)"
      >
        <div class="card-header">
          <div class="card-title">{{ item.title }}</div>
          <div
            class="card-category"
            :style="{ backgroundColor: getCategoryColor(item.category) }"
          >
            {{ item.category }}
          </div>
        </div>

        <div class="card-content">
          <div class="training-row">
            <div class="training-label">🎯 训练目标</div>
            <div class="training-value">{{ item.target }}</div>
          </div>
          <div class="training-row">
            <div class="training-label">🛠️ 训练道具</div>
            <div class="training-value">{{ item.equipment }}</div>
          </div>
          <div class="training-row">
            <div class="training-label">📝 训练内容</div>
            <div class="training-value content-preview">
              {{ item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content }}
            </div>
          </div>
        </div>

        <div class="card-footer">
          <span class="view-detail-link">查看详情 <span class="arrow">→</span></span>
        </div>
        <div class="card-bar" :style="{ backgroundColor: getCategoryColor(item.category) }"></div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="paginatedTrainingData.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">没有找到匹配的训练项目</div>
      <button @click="resetSearch" class="empty-reset-btn">重置搜索</button>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        上一页
      </button>
      <div class="pagination-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </div>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        下一页
      </button>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ currentTrainingItem?.title }}</h3>
          <button @click="closeDetailModal" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="detail-section">
            <div class="detail-item">
              <div class="detail-label">🎯 训练目标</div>
              <div class="detail-value">{{ currentTrainingItem?.target }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">🛠️ 训练道具</div>
              <div class="detail-value">{{ currentTrainingItem?.equipment }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">📝 训练内容</div>
              <div class="detail-value">{{ currentTrainingItem?.content }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">🏷️ 训练类别</div>
              <div
                class="detail-category"
                :style="{ backgroundColor: getCategoryColor(currentTrainingItem?.category || '') }"
              >
                {{ currentTrainingItem?.category }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailModal" class="modal-btn">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.training-base {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ===== 深色渐变英雄头部 ===== */
.hero-header {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #1e293b 0%, #334155 55%, #3b4a63 100%);
  border-radius: 18px;
  padding: 44px 40px 40px;
  margin-bottom: 36px;
}

.hero-deco {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  opacity: 0.07;
  pointer-events: none;
}
.hero-deco--1 { width: 260px; height: 260px; top: -80px; right: -60px; }
.hero-deco--2 { width: 140px; height: 140px; bottom: -40px; left: 60px; }
.hero-deco--3 { width: 90px; height: 90px; top: 30px; right: 200px; }

.hero-badge {
  display: inline-block;
  padding: 5px 16px;
  border-radius: 999px;
  background: rgba(129, 140, 248, 0.2);
  color: #a5b4fc;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  margin: 0 0 28px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.hero-chips {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 999px;
}

.chip-num {
  font-weight: 750;
  font-size: 1.05rem;
  color: #1e293b;
}

.chip-label {
  font-size: 0.85rem;
  color: #64748b;
}

/* ===== 类别统计 ===== */
.category-stats {
  margin-bottom: 36px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.section-line {
  width: 36px;
  height: 3px;
  border-radius: 2px;
  background: #818cf8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.category-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eef0f4;
  transition: transform 0.22s, box-shadow 0.22s;
}
.category-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.category-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 2px;
}

.category-count {
  font-size: 0.84rem;
  color: #94a3b8;
}

/* ===== 搜索和筛选 ===== */
.search-filter-section {
  margin-bottom: 32px;
}

.search-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input::placeholder { color: #94a3b8; }
.search-input:focus {
  outline: none;
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
}

.reset-btn {
  padding: 9px 20px;
  background: transparent;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.reset-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 20px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}
.filter-tab:hover {
  border-color: #818cf8;
  color: #818cf8;
}
.filter-tab.active {
  background: #818cf8;
  color: #fff;
  border-color: #818cf8;
}

/* ===== 训练项目网格 ===== */
.training-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.training-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef0f4;
  padding: 22px 22px 18px;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
  overflow: hidden;
}
.training-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
}

.card-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.25s;
}
.training-card:hover .card-bar {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.card-title {
  font-size: 1.08rem;
  font-weight: 650;
  color: #1e293b;
  min-width: 0;
}

.card-category {
  padding: 4px 14px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-content {
  margin-bottom: 14px;
}

.training-row {
  display: flex;
  margin-bottom: 10px;
  align-items: flex-start;
}

.training-label {
  font-weight: 500;
  color: #94a3b8;
  min-width: 80px;
  margin-right: 10px;
  font-size: 0.86rem;
}

.training-value {
  flex: 1;
  color: #334155;
  font-size: 0.9rem;
  line-height: 1.5;
}

.content-preview {
  color: #64748b;
}

.card-footer {
  text-align: right;
}

.view-detail-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #818cf8;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}
.view-detail-link:hover {
  color: #6366f1;
}
.view-detail-link .arrow {
  display: inline-block;
  transition: transform 0.25s;
  opacity: 0;
  transform: translateX(-6px);
}
.training-card:hover .view-detail-link .arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 72px 20px;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 24px;
}

.empty-reset-btn {
  padding: 10px 28px;
  background: #818cf8;
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background 0.2s;
}
.empty-reset-btn:hover {
  background: #6366f1;
}

/* ===== 分页 ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}

.pagination-btn {
  padding: 9px 22px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 500;
  color: #334155;
  transition: all 0.2s;
}
.pagination-btn:hover:not(:disabled) {
  border-color: #818cf8;
  color: #818cf8;
  background: rgba(129, 140, 248, 0.06);
}
.pagination-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.92rem;
  color: #94a3b8;
}

/* ===== 详情弹窗 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 92%;
  max-width: 600px;
  max-height: 82vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.14);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-size: 1.3rem;
  color: #64748b;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}
.close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.modal-body {
  padding: 24px;
}

.detail-item {
  margin-bottom: 22px;
}
.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.detail-value {
  color: #64748b;
  line-height: 1.65;
  font-size: 0.95rem;
}

.detail-category {
  display: inline-block;
  padding: 5px 16px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}

.modal-footer {
  padding: 18px 24px;
  border-top: 1px solid #f1f5f9;
  text-align: right;
}

.modal-btn {
  padding: 10px 28px;
  background: #818cf8;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background 0.2s;
}
.modal-btn:hover {
  background: #6366f1;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .training-base {
    padding: 16px;
  }
  .hero-header {
    padding: 32px 22px 28px;
  }
  .hero-title {
    font-size: 1.55rem;
  }
  .hero-chips {
    flex-direction: column;
    gap: 10px;
  }
  .stat-chip {
    align-self: flex-start;
  }
  .training-grid {
    grid-template-columns: 1fr;
  }
  .filter-tabs {
    justify-content: center;
  }
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>