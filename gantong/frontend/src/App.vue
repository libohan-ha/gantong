<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initAuth()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  }
}
</script>

<template>
  <div class="app">
    <header>
      <div class="header-content">
        <div class="logo">
          <h1>感统学院</h1>
        </div>
        <nav>
          <RouterLink to="/">首页</RouterLink>
          <RouterLink v-if="authStore.userRole === 'SUPER_ADMIN'" to="/admin">管理控制台</RouterLink>
          <RouterLink v-if="authStore.userRole === 'SUPER_ADMIN' || authStore.userRole === 'DOCTOR'" to="/hospital">医院端</RouterLink>
          <RouterLink v-if="authStore.userRole === 'PARENT'" to="/parent">家长端</RouterLink>
          <RouterLink v-if="authStore.userRole === 'SUPER_ADMIN' || authStore.userRole === 'PARENT' || authStore.userRole === 'SCHOOL_ADMIN'" to="/school">校园端</RouterLink>
          <RouterLink v-if="authStore.userRole === 'SUPER_ADMIN' || authStore.userRole === 'DOCTOR'" to="/doctor/profile">我的资料</RouterLink>
        </nav>

        <div class="user-section">
          <div v-if="authStore.isAuthenticated" class="user-info">
            <el-dropdown @command="handleUserCommand">
              <span class="user-name">
                {{ authStore.user?.email || authStore.user?.phone }}
                <el-icon class="el-icon--right">
                  <ArrowDown />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-else class="login-section">
            <RouterLink to="/login" class="login-btn">登录</RouterLink>
          </div>
        </div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.logo h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

nav {
  display: flex;
  gap: 2rem;
}

nav a {
  color: #2c3e50;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
}

nav a:hover {
  background: #f0f8ff;
  color: #42b883;
}

nav a.router-link-exact-active {
  background: #42b883;
  color: white;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.user-name:hover {
  background: #f0f8ff;
  color: #42b883;
}

.login-btn {
  color: #2c3e50;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #42b883;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #42b883;
  color: white;
}

main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (max-width: 1200px) {
  .header-content {
    padding: 1rem 1rem;
  }

  main {
    padding: 2rem 1rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  nav {
    justify-content: center;
  }

  nav a {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  main {
    padding: 1rem 0.5rem;
  }
}
</style>
