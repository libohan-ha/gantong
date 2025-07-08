<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header>
      <div class="header-content">
        <div class="logo">
          <h1>慧悦-学院</h1>
        </div>
        <nav>
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/hospital">医院端</RouterLink>
          <RouterLink to="/parent">家长端</RouterLink>
          <RouterLink to="/school">校园端</RouterLink>
        </nav>
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
