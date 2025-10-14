import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  // 状态
  const theme = ref<'light' | 'dark'>('light')
  const isLoading = ref(false)
  const userInfo = ref({
    id: '',
    name: '研发用户',
    email: '',
    role: 'researcher'
  })

  // 设置主题
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // 设置用户信息
  const setUserInfo = (info: any) => {
    userInfo.value = { ...userInfo.value, ...info }
  }

  // 初始化
  const init = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      theme.value = savedTheme
    }
  }

  return {
    theme,
    isLoading,
    userInfo,
    setTheme,
    setLoading,
    setUserInfo,
    init
  }
})