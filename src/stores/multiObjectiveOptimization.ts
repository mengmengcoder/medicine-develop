import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface OptimizationObjective {
  id: string
  name: string
  type: 'maximize' | 'minimize'
  weight: number
  target?: number
  description: string
}

export interface OptimizationTask {
  id: string
  name: string
  objectives: OptimizationObjective[]
  algorithm: 'GA' | 'PSO' | 'NSGA-II' | 'Bayesian'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  generation: number
  maxGenerations: number
  populationSize: number
  createdAt: string
  results?: OptimizationResult[]
}

export interface OptimizationResult {
  id: string
  smiles: string
  objectives: Record<string, number>
  fitness: number
  rank: number
  generation: number
}

export const useMultiObjectiveOptimizationStore = defineStore('multiObjectiveOptimization', () => {
  // 状态
  const objectives = ref<OptimizationObjective[]>([])
  const optimizationTasks = ref<OptimizationTask[]>([])
  const optimizationResults = ref<OptimizationResult[]>([])
  const currentTask = ref<OptimizationTask | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const completedTasks = computed(() => 
    optimizationTasks.value.filter(t => t.status === 'completed')
  )
  const runningTasks = computed(() => 
    optimizationTasks.value.filter(t => t.status === 'running')
  )
  const paretoFront = computed(() => 
    optimizationResults.value.filter(r => r.rank === 1)
  )

  // 方法
  const addObjective = (objective: Omit<OptimizationObjective, 'id'>) => {
    const newObjective: OptimizationObjective = {
      ...objective,
      id: Date.now().toString()
    }
    objectives.value.push(newObjective)
    return newObjective
  }

  const updateObjective = (objectiveId: string, updates: Partial<OptimizationObjective>) => {
    const index = objectives.value.findIndex(o => o.id === objectiveId)
    if (index !== -1) {
      objectives.value[index] = { ...objectives.value[index], ...updates }
    }
  }

  const deleteObjective = (objectiveId: string) => {
    const index = objectives.value.findIndex(o => o.id === objectiveId)
    if (index !== -1) {
      objectives.value.splice(index, 1)
    }
  }

  const createOptimizationTask = (taskConfig: Omit<OptimizationTask, 'id' | 'createdAt' | 'status' | 'progress' | 'generation'>) => {
    const task: OptimizationTask = {
      ...taskConfig,
      id: Date.now().toString(),
      status: 'pending',
      progress: 0,
      generation: 0,
      createdAt: new Date().toISOString()
    }
    optimizationTasks.value.push(task)
    return task
  }

  const updateTask = (taskId: string, updates: Partial<OptimizationTask>) => {
    const index = optimizationTasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      optimizationTasks.value[index] = { ...optimizationTasks.value[index], ...updates }
    }
  }

  const addOptimizationResults = (results: OptimizationResult[]) => {
    optimizationResults.value.push(...results)
  }

  const clearResults = () => {
    optimizationResults.value = []
  }

  const getTaskResults = (taskId: string) => {
    return optimizationResults.value.filter(r => 
      optimizationTasks.value.find(t => t.id === taskId)?.results?.some(tr => tr.id === r.id)
    )
  }

  return {
    objectives,
    optimizationTasks,
    optimizationResults,
    currentTask,
    isLoading,
    completedTasks,
    runningTasks,
    paretoFront,
    addObjective,
    updateObjective,
    deleteObjective,
    createOptimizationTask,
    updateTask,
    addOptimizationResults,
    clearResults,
    getTaskResults
  }
})