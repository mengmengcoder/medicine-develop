// 调试工具函数
export const debugAuth = {
  // 检查Supabase配置
  checkConfig: () => {
    const config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
      currentOrigin: window.location.origin,
      isProduction: import.meta.env.PROD
    }
    
    console.log('🔧 Supabase配置检查:', config)
    return config
  },
  
  // 测试注册功能
  testRegistration: async (email: string, password: string) => {
    try {
      console.log('🧪 开始注册测试...')
      
      const { supabase } = await import('@/services/supabase')
      
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      })
      
      console.log('📧 注册响应:', result)
      
      if (result.error) {
        console.error('❌ 注册失败:', result.error)
        return { success: false, error: result.error }
      }
      
      console.log('✅ 注册请求成功')
      return { success: true, data: result.data }
    } catch (error) {
      console.error('💥 注册测试异常:', error)
      return { success: false, error }
    }
  },
  
  // 检查认证状态
  checkAuthState: async () => {
    try {
      const { supabase } = await import('@/services/supabase')
      const session = await supabase.auth.getSession()
      const user = await supabase.auth.getUser()
      
      console.log('🔐 当前认证状态:', {
        hasSession: !!session.data.session,
        hasUser: !!user.data.user,
        session: session.data.session,
        user: user.data.user
      })
      
      return { session: session.data, user: user.data }
    } catch (error) {
      console.error('💥 认证状态检查失败:', error)
      return { error }
    }
  }
}

// 开发环境调试工具
if (import.meta.env.DEV) {
  // 将调试工具挂载到window对象，方便在浏览器控制台使用
  (window as any).debugAuth = debugAuth
  console.log('🔧 认证调试工具已启用，使用 debugAuth 进行测试')
}

export default debugAuth