import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface GenerativeModel {
  id: string
  name: string
  type: 'VAE' | 'GAN' | 'Transformer' | 'RL'
  status: 'active' | 'inactive' | 'training'
  accuracy: number
  description: string
  createdAt: string
}

export interface GenerationTask {
  id: string
  name: string
  modelId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  targetProperties: Record<string, any>
  generatedCount: number
  createdAt: string
  results?: GeneratedMolecule[]
}

export interface GeneratedMolecule {
  id: string
  smiles: string
  properties: Record<string, number>
  score: number
  validity: boolean
}

export const useMoleculeGenerationStore = defineStore('moleculeGeneration', () => {
  // 状态
  const models = ref<GenerativeModel[]>([])
  const generationTasks = ref<GenerationTask[]>([])
  const generatedMolecules = ref<GeneratedMolecule[]>([])
  const currentTask = ref<GenerationTask | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const activeModels = computed(() => 
    models.value.filter(m => m.status === 'active')
  )
  const completedTasks = computed(() => 
    generationTasks.value.filter(t => t.status === 'completed')
  )
  const totalGenerated = computed(() => 
    generatedMolecules.value.length
  )
  const validMolecules = computed(() => 
    generatedMolecules.value.filter(m => m.validity).length
  )

  // 方法
  const addModel = (model: Omit<GenerativeModel, 'id' | 'createdAt'>) => {
    const newModel: GenerativeModel = {
      ...model,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    models.value.push(newModel)
    return newModel
  }

  const updateModel = (modelId: string, updates: Partial<GenerativeModel>) => {
    const index = models.value.findIndex(m => m.id === modelId)
    if (index !== -1) {
      models.value[index] = { ...models.value[index], ...updates }
    }
  }

  const deleteModel = (modelId: string) => {
    const index = models.value.findIndex(m => m.id === modelId)
    if (index !== -1) {
      models.value.splice(index, 1)
    }
  }

  const createGenerationTask = (taskConfig: Omit<GenerationTask, 'id' | 'createdAt' | 'status' | 'progress'>) => {
    const task: GenerationTask = {
      ...taskConfig,
      id: Date.now().toString(),
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    }
    generationTasks.value.push(task)
    return task
  }

  const updateTask = (taskId: string, updates: Partial<GenerationTask>) => {
    const index = generationTasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      generationTasks.value[index] = { ...generationTasks.value[index], ...updates }
    }
  }

  const addGeneratedMolecules = (molecules: GeneratedMolecule[]) => {
    generatedMolecules.value.push(...molecules)
  }

  const clearGeneratedMolecules = () => {
    generatedMolecules.value = []
  }

  return {
    models,
    generationTasks,
    generatedMolecules,
    currentTask,
    isLoading,
    activeModels,
    completedTasks,
    totalGenerated,
    validMolecules,
    addModel,
    updateModel,
    deleteModel,
    createGenerationTask,
    updateTask,
    addGeneratedMolecules,
    clearGeneratedMolecules
  }
})