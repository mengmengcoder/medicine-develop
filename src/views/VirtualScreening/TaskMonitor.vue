<template>
  <div class="task-monitor">
    <div class="page-header">
      <h2>任务监控</h2>
      <p>实时监控虚拟筛选任务的执行状态和进度</p>
    </div>

    <!-- 任务概览 -->
    <div class="overview-cards">
      <div class="overview-card">
        <div class="card-icon running">
          <el-icon><Loading /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ runningTasks }}</div>
          <div class="card-label">运行中</div>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="card-icon completed">
          <el-icon><Check /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ completedTasks }}</div>
          <div class="card-label">已完成</div>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="card-icon failed">
          <el-icon><Close /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ failedTasks }}</div>
          <div class="card-label">失败</div>
        </div>
      </div>
      
      <div class="overview-card">
        <div class="card-icon total">
          <el-icon><DataBoard /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-value">{{ totalTasks }}</div>
          <div class="card-label">总任务数</div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">任务列表</h3>
        <div class="header-actions">
          <el-button @click="refreshTasks" :loading="isRefreshing">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="createNewTask">
            <el-icon><Plus /></el-icon>
            新建任务
          </el-button>
        </div>
      </div>
      
      <el-table :data="tasks" v-loading="isLoading" class="task-table">
        <el-table-column prop="id" label="任务ID" width="120" />
        <el-table-column prop="name" label="任务名称" min-width="200" />
        <el-table-column prop="algorithm" label="算法" width="150">
          <template #default="{ row }">
            <el-tag size="small">{{ getAlgorithmName(row.algorithm) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="200">
          <template #default="{ row }">
            <div class="progress-container">
              <el-progress
                :percentage="row.progress"
                :status="row.status === 'failed' ? 'exception' : undefined"
                :stroke-width="8"
              />
              <span class="progress-text">{{ row.progress }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="viewTaskDetail(row)"
            >
              详情
            </el-button>
            <el-button
              v-if="row.status === 'running'"
              size="small"
              type="warning"
              @click="pauseTask(row)"
            >
              暂停
            </el-button>
            <el-button
              v-if="row.status === 'paused'"
              size="small"
              type="success"
              @click="resumeTask(row)"
            >
              继续
            </el-button>
            <el-button
              v-if="['running', 'paused'].includes(row.status)"
              size="small"
              type="danger"
              @click="stopTask(row)"
            >
              停止
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              size="small"
              type="primary"
              @click="viewResults(row)"
            >
              查看结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="任务详情"
      width="800px"
      draggable
    >
      <div v-if="currentTask" class="task-detail">
        <div class="detail-grid">
          <div class="detail-item">
            <label>任务ID:</label>
            <span>{{ currentTask.id }}</span>
          </div>
          <div class="detail-item">
            <label>任务名称:</label>
            <span>{{ currentTask.name }}</span>
          </div>
          <div class="detail-item">
            <label>算法:</label>
            <span>{{ getAlgorithmName(currentTask.algorithm) }}</span>
          </div>
          <div class="detail-item">
            <label>状态:</label>
            <el-tag :type="getStatusType(currentTask.status)">
              {{ getStatusText(currentTask.status) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <label>进度:</label>
            <el-progress :percentage="currentTask.progress" />
          </div>
          <div class="detail-item">
            <label>开始时间:</label>
            <span>{{ formatTime(currentTask.startTime) }}</span>
          </div>
          <div class="detail-item">
            <label>耗时:</label>
            <span>{{ formatDuration(currentTask.duration) }}</span>
          </div>
          <div class="detail-item">
            <label>化合物数量:</label>
            <span>{{ currentTask.compoundCount }}</span>
          </div>
        </div>
        
        <div class="log-section">
          <h4>执行日志</h4>
          <div class="log-container">
            <div
              v-for="log in currentTask.logs"
              :key="log.id"
              class="log-item"
              :class="log.level"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Loading, Check, Close, DataBoard, Refresh, Plus
} from '@element-plus/icons-vue'

const router = useRouter()

interface Task {
  id: string
  name: string
  algorithm: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  startTime: Date
  duration: number
  compoundCount: number
  logs: Array<{
    id: string
    timestamp: Date
    level: 'info' | 'warning' | 'error'
    message: string
  }>
}

const tasks = ref<Task[]>([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const showDetailDialog = ref(false)
const currentTask = ref<Task | null>(null)
let refreshTimer: NodeJS.Timeout | null = null

// 计算属性
const runningTasks = computed(() => 
  tasks.value.filter(t => t.status === 'running').length
)

const completedTasks = computed(() => 
  tasks.value.filter(t => t.status === 'completed').length
)

const failedTasks = computed(() => 
  tasks.value.filter(t => t.status === 'failed').length
)

const totalTasks = computed(() => tasks.value.length)

onMounted(() => {
  loadTasks()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

const loadTasks = () => {
  isLoading.value = true
  
  // 模拟加载任务数据 - 更真实的状态分布
  setTimeout(() => {
    tasks.value = [
      {
        id: 'task_001',
        name: '分子对接筛选_20241014',
        algorithm: 'molecular_docking',
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 86400000),
        duration: 7200,
        compoundCount: 1500,
        logs: [
          {
            id: 'log_001',
            timestamp: new Date(Date.now() - 86400000),
            level: 'info',
            message: '任务开始执行'
          },
          {
            id: 'log_002',
            timestamp: new Date(Date.now() - 82800000),
            level: 'info',
            message: '已处理 500 个化合物'
          },
          {
            id: 'log_003',
            timestamp: new Date(Date.now() - 79200000),
            level: 'info',
            message: '任务完成，共筛选出 23 个候选化合物'
          }
        ]
      },
      {
        id: 'task_002',
        name: '相似性搜索_20241013',
        algorithm: 'similarity_search',
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 172800000),
        duration: 1800,
        compoundCount: 800,
        logs: []
      },
      {
        id: 'task_003',
        name: '药效团匹配_20241012',
        algorithm: 'pharmacophore_matching',
        status: 'failed',
        progress: 45,
        startTime: new Date(Date.now() - 259200000),
        duration: 5400,
        compoundCount: 1200,
        logs: [
          {
            id: 'log_001',
            timestamp: new Date(Date.now() - 259200000),
            level: 'info',
            message: '任务开始执行'
          },
          {
            id: 'log_002',
            timestamp: new Date(Date.now() - 255600000),
            level: 'error',
            message: '数据库连接失败，任务中止'
          }
        ]
      },
      {
        id: 'task_004',
        name: '机器学习预测_20241015',
        algorithm: 'ml_prediction',
        status: 'paused',
        progress: 30,
        startTime: new Date(Date.now() - 7200000),
        duration: 2160,
        compoundCount: 2000,
        logs: [
          {
            id: 'log_001',
            timestamp: new Date(Date.now() - 7200000),
            level: 'info',
            message: '任务开始执行'
          },
          {
            id: 'log_002',
            timestamp: new Date(Date.now() - 3600000),
            level: 'warning',
            message: '用户手动暂停任务'
          }
        ]
      }
    ]
    isLoading.value = false
  }, 1000)
}

const refreshTasks = () => {
  isRefreshing.value = true
  setTimeout(() => {
    // 模拟更新进度
    tasks.value.forEach(task => {
      if (task.status === 'running' && task.progress < 100) {
        task.progress = Math.min(100, task.progress + Math.random() * 10)
        task.duration += 60
        
        if (task.progress >= 100) {
          task.status = 'completed'
        }
      }
    })
    isRefreshing.value = false
  }, 500)
}

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    refreshTasks()
  }, 5000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const createNewTask = () => {
  router.push('/virtual-screening/screening-config')
}

const viewTaskDetail = (task: Task) => {
  currentTask.value = task
  showDetailDialog.value = true
}

const pauseTask = (task: Task) => {
  task.status = 'paused'
  ElMessage.success('任务已暂停')
}

const resumeTask = (task: Task) => {
  task.status = 'running'
  ElMessage.success('任务已恢复')
}

const stopTask = (task: Task) => {
  ElMessageBox.confirm('确认停止该任务？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    task.status = 'failed'
    task.progress = 0
    ElMessage.success('任务已停止')
  })
}

const viewResults = (task: Task) => {
  router.push(`/virtual-screening/result-analysis?taskId=${task.id}`)
}

const getAlgorithmName = (algorithm: string) => {
  const names: Record<string, string> = {
    'molecular_docking': '分子对接',
    'pharmacophore_matching': '药效团匹配',
    'similarity_search': '相似性搜索',
    'ml_prediction': '机器学习预测'
  }
  return names[algorithm] || algorithm
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    'running': 'primary',
    'completed': 'success',
    'failed': 'danger',
    'paused': 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'running': '运行中',
    'completed': '已完成',
    'failed': '失败',
    'paused': '已暂停'
  }
  return texts[status] || status
}

const formatTime = (time: Date) => {
  return time.toLocaleString('zh-CN')
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}
</script>

<style scoped>
.task-monitor {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.page-header p {
  color: var(--el-text-color-secondary);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.card-icon.running {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.card-icon.completed {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}

.card-icon.failed {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

.card-icon.total {
  background: var(--el-color-info-light-8);
  color: var(--el-color-info);
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.card-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.content-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-lighter);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.task-table {
  width: 100%;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 35px;
}

.task-detail {
  padding: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-item label {
  width: 120px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.log-section h4 {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
  background: var(--el-fill-color-lighter);
}

.log-item {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-time {
  color: var(--el-text-color-secondary);
  min-width: 150px;
}

.log-level {
  min-width: 60px;
  font-weight: 600;
}

.log-level.info {
  color: var(--el-color-info);
}

.log-level.warning {
  color: var(--el-color-warning);
}

.log-level.error {
  color: var(--el-color-danger);
}

.log-message {
  color: var(--el-text-color-primary);
}
</style>