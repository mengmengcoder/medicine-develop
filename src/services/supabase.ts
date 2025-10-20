import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('缺少Supabase环境变量配置')
}

// 创建Supabase客户端
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 认证服务
export const authService = {
  // 登录
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  // 注册
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`
      }
    })
  },

  // 登出
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  // 获取当前用户
  getCurrentUser: async () => {
    return await supabase.auth.getUser()
  },

  // 监听认证状态变化
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // 重置密码
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
  },

  // 更新密码
  updatePassword: async (newPassword: string) => {
    return await supabase.auth.updateUser({
      password: newPassword
    })
  },

  supabase // 暴露原始客户端
}

// 数据库服务
export const dbService = {
  // 查询数据
  query: async <T>(table: string, options?: { where?: any; limit?: number; order?: any }) => {
    let query = supabase.from(table).select('*')
    
    if (options?.where) {
      query = query.match(options.where)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true })
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as T[]
  },

  // 插入数据
  insert: async <T>(table: string, data: any) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    
    if (error) throw error
    return result as T[]
  },

  // 更新数据
  update: async <T>(table: string, data: any, where: any) => {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .match(where)
      .select()
    
    if (error) throw error
    return result as T[]
  },

  // 删除数据
  delete: async (table: string, where: any) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .match(where)
    
    if (error) throw error
  }
}

export default supabase