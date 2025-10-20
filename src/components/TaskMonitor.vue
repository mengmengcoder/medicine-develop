<template>
  <div class="task-monitor">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-statistic title="总任务数" :value="taskStats.total" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="运行中" :value="taskStats.running" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="已完成" :value="taskStats.completed" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="失败" :value="taskStats.failed" />
      </el-col>
    </el-row>

    <el-table :data="tasks" style="width: 100%">
      <el-table-column prop="name" label="任务名称" />
      <el-table-column prop="type" label="任务类型">
        <template #default="scope">
          <el-tag :type="getTaskType(scope.row.type)">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="viewTask(scope.row)">查看</el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="cancelTask(scope.row)"
            :disabled="scope.row.status !== 'running'"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { dbService } from '@/services/supabase'

interface Task {
  id: string
  name: string
  type: 'generation' | 'optimization' | 'screening'
  status: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
}

const tasks = ref<Task[]>([])

const taskStats = computed(() => {
  const total = tasks.value.length
  const running = tasks.value.filter(t => t.status === 'running').length
  const completed = tasks.value.filter(t => t.status === 'completed').length
  const failed = tasks.value.filter(t => t.status === 'failed').length
  
  return { total, running, completed, failed }
})

const getTaskType = (type: string) => {
  const types = {
    generation: 'primary',
    optimization: 'warning',
    screening: 'success'
  }
  return types[type as keyof typeof types] || 'info'
}

const getStatusType = (status: string) => {
  const types = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return types[status as keyof typeof types] || 'info'
}

const loadTasks = async () => {
  try {
    // 加载分子生成任务
    const generationTasks = await dbService.query<any>('molecule_generation_tasks', {
      select: 'id, name, status, created_at',
      orderBy: { column: 'created_at', ascending: false }
    })
    
    // 加载优化任务
    const optimizationTasks = await dbService.query<any>('multi_objective_optimization_tasks', {
      select: 'id, name, status, created_at',
      orderBy: { column: 'created_at', ascending: false }
    })
    
    // 加载筛选任务
    const screeningTasks = await dbService.query<any>('virtual_screening_tasks', {
      select: 'id, name, status, created_at',
      orderBy: { column: 'created_at', ascending: false }
    })
    
    // 合并所有任务
    tasks.value = [
      ...generationTasks.map((t: any) => ({ ...t, type: 'generation' })),
      ...optimizationTasks.map((t: any) => ({ ...t, type: 'optimization' })),
      ...screeningTasks.map((t: any) => ({ ...t, type: 'screening' }))
    ]
  } catch (error) {
    ElMessage.error('加载任务失败: ' + (error as Error).message)
  }
}

const viewTask = (task: Task) => {
  ElMessage.info(`查看任务: ${task.name}`)
  // 这里可以跳转到任务详情页面
}

const cancelTask = async (task: Task) => {
  try {
    let tableName = ''
    switch (task.type) {
      case 'generation':
        tableName = 'molecule_generation_tasks'
        break
      case 'optimization':
        tableName = 'multi_objective_optimization_tasks'
        break
      case 'screening':
        tableName = 'virtual_screening_tasks'
        break
    }
    
    await dbService.update(tableName, { status: 'failed' }, { id: task.id })
    ElMessage.success('任务已取消')
    loadTasks()
  } catch (error) {
    ElMessage.error('取消任务失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>