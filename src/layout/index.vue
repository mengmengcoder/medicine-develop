<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-left">
        <div class="logo">
          <el-icon size="24" color="#409eff">
            <Histogram />
          </el-icon>
          <span class="logo-text">药物研发平台</span>
        </div>
      </div>
      
      <div class="header-right">
        <el-space>
          <el-button circle @click="toggleTheme">
            <el-icon>
              <Sunny v-if="!isDark" />
              <Moon v-else />
            </el-icon>
          </el-button>
          
          <el-dropdown @command="handleUserCommand">
            <el-button circle>
              <el-icon>
                <User />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-space>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="layout-main">
      <!-- 侧边栏 -->
      <aside class="layout-sidebar">
        <el-menu
          :default-active="$route.path"
          router
          unique-opened
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          
          <el-sub-menu index="/virtual-screening">
            <template #title>
              <el-icon><Search /></el-icon>
              <span>虚拟筛选</span>
            </template>
            <el-menu-item index="/virtual-screening/compound-library">化合物库</el-menu-item>
            <el-menu-item index="/virtual-screening/screening-config">筛选配置</el-menu-item>
            <el-menu-item index="/virtual-screening/task-monitor">任务监控</el-menu-item>
            <el-menu-item index="/virtual-screening/result-analysis">结果分析</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/molecule-generation">
            <template #title>
              <el-icon><MagicStick /></el-icon>
              <span>分子生成</span>
            </template>
            <el-menu-item index="/molecule-generation/model-management">模型管理</el-menu-item>
            <el-menu-item index="/molecule-generation/generation-task">生成任务</el-menu-item>
            <el-menu-item index="/molecule-generation/result-display">结果展示</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/multi-objective-optimization">
            <template #title>
              <el-icon><Aim /></el-icon>
              <span>多目标优化</span>
            </template>
            <el-menu-item index="/multi-objective-optimization/objective-config">目标配置</el-menu-item>
            <el-menu-item index="/multi-objective-optimization/algorithm-selection">算法选择</el-menu-item>
            <el-menu-item index="/multi-objective-optimization/optimization-monitor">优化监控</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <!-- 内容区域 -->
      <section class="layout-content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    router.push('/login')
  }
}
</script>

<style scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.logo-text {
  background: linear-gradient(135deg, #409eff, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>