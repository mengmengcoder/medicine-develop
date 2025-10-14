import { request } from './api'
import type { 
  Compound, 
  ScreeningTask, 
  ScreeningResult,
  PaginationParams,
  SearchParams 
} from '@/types'

export const virtualScreeningService = {
  // 化合物库管理
  getCompounds(params: PaginationParams & SearchParams) {
    return request.get<{
      list: Compound[]
      total: number
    }>('/compounds', params)
  },

  getCompound(id: string) {
    return request.get<Compound>(`/compounds/${id}`)
  },

  createCompound(data: Partial<Compound>) {
    return request.post<Compound>('/compounds', data)
  },

  updateCompound(id: string, data: Partial<Compound>) {
    return request.put<Compound>(`/compounds/${id}`, data)
  },

  deleteCompound(id: string) {
    return request.delete(`/compounds/${id}`)
  },

  importCompounds(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData()
    formData.append('file', file)
    return request.upload<{
      imported: number
      failed: number
      compounds: Compound[]
    }>('/compounds/import', formData, onProgress)
  },

  exportCompounds(ids: string[], format: 'csv' | 'sdf' | 'xlsx' = 'csv') {
    return request.post<Blob>('/compounds/export', { ids, format }, {
      responseType: 'blob'
    })
  },

  // 筛选任务管理
  getTasks(params: PaginationParams & SearchParams) {
    return request.get<{
      list: ScreeningTask[]
      total: number
    }>('/screening/tasks', params)
  },

  getTask(id: string) {
    return request.get<ScreeningTask>(`/screening/tasks/${id}`)
  },

  createTask(data: Partial<ScreeningTask>) {
    return request.post<ScreeningTask>('/screening/tasks', data)
  },

  updateTask(id: string, data: Partial<ScreeningTask>) {
    return request.put<ScreeningTask>(`/screening/tasks/${id}`, data)
  },

  deleteTask(id: string) {
    return request.delete(`/screening/tasks/${id}`)
  },

  startTask(id: string) {
    return request.post(`/screening/tasks/${id}/start`)
  },

  pauseTask(id: string) {
    return request.post(`/screening/tasks/${id}/pause`)
  },

  resumeTask(id: string) {
    return request.post(`/screening/tasks/${id}/resume`)
  },

  stopTask(id: string) {
    return request.post(`/screening/tasks/${id}/stop`)
  },

  // 筛选结果
  getTaskResults(taskId: string, params: PaginationParams & SearchParams) {
    return request.get<{
      list: ScreeningResult[]
      total: number
      statistics: {
        totalCompounds: number
        activeCompounds: number
        averageScore: number
        bestScore: number
      }
    }>(`/screening/tasks/${taskId}/results`, params)
  },

  exportTaskResults(taskId: string, format: 'csv' | 'xlsx' | 'sdf' = 'csv') {
    return request.post<Blob>(`/screening/tasks/${taskId}/results/export`, { format }, {
      responseType: 'blob'
    })
  },

  // 算法和模型
  getAlgorithms() {
    return request.get<Array<{
      id: string
      name: string
      description: string
      type: string
      parameters: Array<{
        key: string
        label: string
        type: string
        required: boolean
        default?: any
        options?: Array<{ label: string; value: any }>
      }>
    }>>('/screening/algorithms')
  },

  getTargetProteins() {
    return request.get<Array<{
      id: string
      name: string
      pdbId?: string
      description: string
      bindingSite?: {
        x: number
        y: number
        z: number
        radius: number
      }
    }>>('/screening/targets')
  },

  // 实时监控
  getTaskStatus(taskId: string) {
    return request.get<{
      status: string
      progress: number
      processedCompounds: number
      totalCompounds: number
      estimatedTimeRemaining: number
      currentStep: string
    }>(`/screening/tasks/${taskId}/status`)
  },

  getTaskLogs(taskId: string, params: { level?: string; limit?: number }) {
    return request.get<Array<{
      timestamp: string
      level: string
      message: string
      details?: any
    }>>(`/screening/tasks/${taskId}/logs`, params)
  }
}