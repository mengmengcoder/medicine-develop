export interface Database {
  public: {
    Tables: {
      // 用户表
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'admin' | 'researcher' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: 'admin' | 'researcher' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'admin' | 'researcher' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }

      // 分子生成任务表
      molecule_generation_tasks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: 'pending' | 'running' | 'completed' | 'failed'
          parameters: Record<string, any>
          results: Record<string, any> | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          parameters: Record<string, any>
          results?: Record<string, any> | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          parameters?: Record<string, any>
          results?: Record<string, any> | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }

      // 多目标优化任务表
      multi_objective_optimization_tasks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: 'pending' | 'running' | 'completed' | 'failed'
          objectives: Record<string, any>
          constraints: Record<string, any> | null
          algorithm: string
          results: Record<string, any> | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          objectives: Record<string, any>
          constraints?: Record<string, any> | null
          algorithm: string
          results?: Record<string, any> | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          objectives?: Record<string, any>
          constraints?: Record<string, any> | null
          algorithm?: string
          results?: Record<string, any> | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }

      // 虚拟筛选任务表
      virtual_screening_tasks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: 'pending' | 'running' | 'completed' | 'failed'
          compound_library: string
          target_protein: string
          screening_parameters: Record<string, any>
          results: Record<string, any> | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          compound_library: string
          target_protein: string
          screening_parameters: Record<string, any>
          results?: Record<string, any> | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          compound_library?: string
          target_protein?: string
          screening_parameters?: Record<string, any>
          results?: Record<string, any> | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }

      // 分子数据表
      molecules: {
        Row: {
          id: string
          task_id: string
          smiles: string
          properties: Record<string, any>
          structure_data: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          smiles: string
          properties: Record<string, any>
          structure_data?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          smiles?: string
          properties?: Record<string, any>
          structure_data?: string | null
          created_at?: string
        }
      }

      // 模型管理表
      models: {
        Row: {
          id: string
          name: string
          type: 'generation' | 'optimization' | 'screening'
          version: string
          description: string | null
          parameters: Record<string, any>
          file_path: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'generation' | 'optimization' | 'screening'
          version: string
          description?: string | null
          parameters: Record<string, any>
          file_path: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'generation' | 'optimization' | 'screening'
          version?: string
          description?: string | null
          parameters?: Record<string, any>
          file_path?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      // 获取用户任务统计
      get_user_task_stats: {
        Args: { user_id: string }
        Returns: {
          total_tasks: number
          completed_tasks: number
          running_tasks: number
          failed_tasks: number
        }[]
      }

      // 搜索分子
      search_molecules: {
        Args: { 
          query: string
          limit_param?: number
          offset_param?: number
        }
        Returns: {
          id: string
          smiles: string
          properties: Record<string, any>
          task_name: string
        }[]
      }
    }

    Enums: {
      task_status: 'pending' | 'running' | 'completed' | 'failed'
      user_role: 'admin' | 'researcher' | 'viewer'
      model_type: 'generation' | 'optimization' | 'screening'
    }
  }
}