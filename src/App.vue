<template>
  <div id="app" :class="{ 'dark': isDark }">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCommonStore } from '@/stores/common'

const commonStore = useCommonStore()
const isDark = ref(false)

// 主题切换逻辑
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

// 暴露给全局使用
defineExpose({
  toggleTheme
})
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  overflow: hidden;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}
</style>