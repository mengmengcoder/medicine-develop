// 通用类型定义

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export interface SearchParams {
  keyword?: string
  filters?: Record<string, any>
}

// 化合物相关类型
export interface Compound {
  id: string
  name: string
  smiles: string
  molecularWeight: number
  formula?: string
  status: 'screened' | 'unscreened'
  properties?: Record<string, string | number>
  createdAt?: Date
  updatedAt?: Date
}

// 虚拟筛选相关类型
export interface ScreeningTask {
  id: string
  name: string
  description?: string
  algorithm: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  startTime?: Date
  endTime?: Date
  duration: number
  compoundCount: number
  parameters: Record<string, any>
  results?: ScreeningResult[]
  logs: TaskLog[]
}

export interface ScreeningResult {
  id: string
  compoundId: string
  compound: Compound
  score: number
  rank: number
  properties: Record<string, number>
  bindingPose?: string
}

export interface TaskLog {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  details?: any
}

// 分子生成相关类型
export interface GenerationModel {
  id: string
  name: string
  type: 'vae' | 'gan' | 'transformer' | 'diffusion'
  description: string
  version: string
  status: 'active' | 'inactive' | 'training'
  accuracy?: number
  trainingData?: string
  parameters: Record<string, any>
}

export interface GenerationTask {
  id: string
  name: string
  modelId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime?: Date
  endTime?: Date
  targetProperties: Record<string, number>
  generatedMolecules: GeneratedMolecule[]
  parameters: Record<string, any>
}

export interface GeneratedMolecule {
  id: string
  smiles: string
  score: number
  properties: Record<string, number>
  similarity?: number
  novelty?: number
  validity: boolean
}

// 多目标优化相关类型
export interface OptimizationObjective {
  id: string
  name: string
  type: 'maximize' | 'minimize'
  weight: number
  targetValue?: number
  currentValue?: number
}

export interface OptimizationTask {
  id: string
  name: string
  description?: string
  algorithm: 'nsga2' | 'mopso' | 'moead' | 'spea2'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  objectives: OptimizationObjective[]
  population: OptimizationSolution[]
  paretoFront: OptimizationSolution[]
  generations: number
  maxGenerations: number
  parameters: Record<string, any>
}

export interface OptimizationSolution {
  id: string
  smiles: string
  objectives: Record<string, number>
  rank: number
  crowdingDistance: number
  generation: number
}

// 图表数据类型
export interface ChartData {
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap'
  title: string
  xAxis?: {
    name: string
    data: (string | number)[]
  }
  yAxis?: {
    name: string
    data?: (string | number)[]
  }
  series: ChartSeries[]
  options?: Record<string, any>
}

export interface ChartSeries {
  name: string
  type: string
  data: (number | [number, number] | { name: string; value: number })[]
  color?: string
}

// 用户和权限类型
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'researcher' | 'viewer'
  permissions: string[]
  profile?: UserProfile
}

export interface UserProfile {
  firstName: string
  lastName: string
  organization?: string
  department?: string
  avatar?: string
}

// 系统配置类型
export interface SystemConfig {
  maxConcurrentTasks: number
  defaultTimeout: number
  storageQuota: number
  enabledFeatures: string[]
  apiEndpoints: Record<string, string>
}

// 文件上传类型
export interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  progress: number
  url?: string
  error?: string
}

// 导出类型
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'sdf' | 'mol'
  fields: string[]
  filters?: Record<string, any>
  filename?: string
}