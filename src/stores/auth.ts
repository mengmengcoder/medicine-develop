import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService, dbService } from '@/services/supabase'
import { ElMessage } from 'element-plus'

interface User {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'researcher' | 'viewer'
  created_at: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // 登录
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true
      const { data, error } = await authService.signIn(email, password)
      
      if (error) throw error
      if (!data.user) throw new Error('登录失败')

      // 获取用户信息
      const userData = await dbService.query<User>('users', {
        where: { email: data.user.email }
      })

      if (userData.length === 0) {
        // 如果用户不存在于users表，自动创建
        const newUser = await dbService.insert<User>('users', {
          email: data.user.email!,
          name: data.user.email!.split('@')[0],
          role: 'researcher'
        })
        user.value = newUser[0]
      } else {
        user.value = userData[0]
      }

      isAuthenticated.value = true
      localStorage.setItem('access_token', data.session!.access_token)
      return data
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (email: string, password: string, metadata?: any) => {
    try {
      isLoading.value = true
      const { data, error } = await authService.signUp(email, password, metadata)
      
      if (error) {
        console.error('注册错误:', error)
        throw new Error(error.message || '注册失败')
      }

      // 如果注册成功且需要邮箱验证，创建用户记录
      if (data.user) {
        try {
          await dbService.insert<User>('users', {
            email: data.user.email!,
            name: metadata?.name || data.user.email!.split('@')[0],
            role: 'researcher'
          })
        } catch (dbError) {
          console.error('创建用户记录失败:', dbError)
          // 不抛出错误，因为认证已经成功
        }
      }

      return data
    } catch (error) {
      console.error('注册过程错误:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authService.signOut()
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('access_token')
      ElMessage.success('已退出登录')
    } catch (error) {
      throw error
    }
  }

  // 忘记密码
  const forgotPassword = async (email: string) => {
    try {
      const { error } = await authService.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  // 重置密码
  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await authService.supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      ElMessage.success('密码重置成功')
    } catch (error) {
      throw error
    }
  }

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const { data } = await authService.getCurrentUser()
      
      if (data.user) {
        // 获取用户信息
        const userData = await dbService.query<User>('users', {
          where: { email: data.user.email }
        })

        if (userData.length > 0) {
          user.value = userData[0]
          isAuthenticated.value = true
        }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      isAuthenticated.value = false
      user.value = null
    }
  }

  // 更新用户信息
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user.value) throw new Error('用户未登录')
      
      const updatedUser = await dbService.update<User>('users', updates, { id: user.value.id })
      user.value = updatedUser[0]
      ElMessage.success('个人信息更新成功')
    } catch (error) {
      throw error
    }
  }

  // 监听认证状态变化
  const setupAuthListener = () => {
    return authService.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN') {
        checkAuth()
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        isAuthenticated.value = false
        localStorage.removeItem('access_token')
      }
    })
  }

  // 初始化
  const init = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      await checkAuth()
    }
    setupAuthListener()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
    updateProfile,
    init
  }
})