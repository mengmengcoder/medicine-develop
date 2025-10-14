<template>
  <div class="generation-task">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>生成任务</span>
          <div>
            <el-button type="primary" :icon="Plus" @click="createTask">创建任务</el-button>
            <el-button type="success" :icon="Refresh" @click="refreshTasks">刷新</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="taskList" stripe style="width: 100%">
        <el-table-column prop="id" label="任务ID" width="100" />
        <el-table-column prop="name" label="任务名称" width="200" />
        <el-table-column prop="modelName" label="使用模型" width="150" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="scope">
            <el-progress :percentage="scope.row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="generatedCount" label="已生成数量" width="120" />
        <el-table-column prop="targetCount" label="目标数量" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewTask(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="pauseTask(scope.row)" 
                       :disabled="scope.row.status !== 'running'">暂停</el-button>
            <el-button size="small" type="danger" @click="stopTask(scope.row)"
                       :disabled="scope.row.status === 'completed'">停止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

const taskList = ref([
  {
    id: 'T001',
    name: '抗病毒分子生成任务',
    modelName: 'VAE分子生成模型',
    status: 'running',
    progress: 65,
    generatedCount: 650,
    targetCount: 1000,
    createTime: '2024-02-15 09:30:00'
  },
  {
    id: 'T002',
    name: '抗癌分子生成任务',
    modelName: 'GAN分子生成模型',
    status: 'completed',
    progress: 100,
    generatedCount: 500,
    targetCount: 500,
    createTime: '2024-02-14 14:20:00'
  },
  {
    id: 'T003',
    name: '神经系统药物生成',
    modelName: 'Transformer分子生成模型',
    status: 'pending',
    progress: 0,
    generatedCount: 0,
    targetCount: 800,
    createTime: '2024-02-16 10:15:00'
  }
])

const getStatusTag = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'info',
    'running': 'primary',
    'completed': 'success',
    'failed': 'danger',
    'paused': 'warning'
  }
  return statusMap[status] || 'info'
}

const createTask = () => {
  ElMessage.info('打开创建任务对话框')
}

const refreshTasks = () => {
  ElMessage.success('任务列表已刷新')
}

const viewTask = (task: any) => {
  ElMessage.info(`查看任务详情: ${task.name}`)
}

const pauseTask = (task: any) => {
  ElMessage.info(`暂停任务: ${task.name}`)
}

const stopTask = (task: any) => {
  ElMessage.info(`停止任务: ${task.name}`)
}
</script>

<style scoped>
.generation-task {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>