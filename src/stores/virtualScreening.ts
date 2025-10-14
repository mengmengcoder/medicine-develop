import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Compound {
  id: string
  name: string
  smiles: string
  molecularWeight: number
  status: 'screened' | 'unscreened'
  properties?: Record<string, any>
}

export interface ScreeningTask {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  compoundCount: number
  algorithm: string
  createdAt: string
  completedAt?: string
  results?: any[]
}

export const useVirtualScreeningStore = defineStore('virtualScreening', () => {
  // 状态
  const compoundLibrary = ref<Compound[]>([])
  const screeningTasks = ref<ScreeningTask[]>([])
  const currentTask = ref<ScreeningTask | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const totalCompounds = computed(() => compoundLibrary.value.length)
  const screenedCompounds = computed(() => 
    compoundLibrary.value.filter(c => c.status === 'screened').length
  )
  const completedTasks = computed(() => 
    screeningTasks.value.filter(task => task.status === 'completed')
  )
  const runningTasks = computed(() => 
    screeningTasks.value.filter(task => task.status === 'running')
  )

  // 方法
  const addCompound = (compound: Compound) => {
    compoundLibrary.value.push(compound)
  }

  const addCompounds = (compounds: Compound[]) => {
    compoundLibrary.value.push(...compounds)
  }

  const createScreeningTask = (taskConfig: Partial<ScreeningTask>) => {
    const task: ScreeningTask = {
      id: Date.now().toString(),
      name: taskConfig.name || '筛选任务',
      status: 'pending',
      progress: 0,
      compoundCount: taskConfig.compoundCount || 0,
      algorithm: taskConfig.algorithm || 'molecular_docking',
      createdAt: new Date().toISOString(),
      ...taskConfig
    }
    screeningTasks.value.push(task)
    return task
  }

  const updateTask = (taskId: string, updates: Partial<ScreeningTask>) => {
    const index = screeningTasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      screeningTasks.value[index] = { ...screeningTasks.value[index], ...updates }
    }
  }

  const deleteTask = (taskId: string) => {
    const index = screeningTasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      screeningTasks.value.splice(index, 1)
    }
  }

  const clearCompounds = () => {
    compoundLibrary.value = []
  }

  return {
    compoundLibrary,
    screeningTasks,
    currentTask,
    isLoading,
    totalCompounds,
    screenedCompounds,
    completedTasks,
    runningTasks,
    addCompound,
    addCompounds,
    createScreeningTask,
    updateTask,
    deleteTask,
    clearCompounds
  }
})