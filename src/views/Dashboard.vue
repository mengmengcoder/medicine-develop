<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>仪表盘</h1>
      <p>欢迎使用多属性协同优化与全流程智能药物研发平台</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon virtual-screening">
          <el-icon size="32"><Search /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ virtualScreeningStore.totalCompounds }}</div>
          <div class="stat-label">化合物总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon molecule-generation">
          <el-icon size="32"><MagicStick /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ moleculeGenerationStore.totalGenerated }}</div>
          <div class="stat-label">生成分子数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon optimization">
          <el-icon size="32"><Aim /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ optimizationStore.completedTasks.length }}</div>
          <div class="stat-label">优化任务</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success">
          <el-icon size="32"><SuccessFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ successRate }}%</div>
          <div class="stat-label">成功率</div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">快速操作</h3>
      </div>
      <div class="quick-actions">
        <el-button type="primary" size="large" @click="navigateTo('/virtual-screening/compound-library')">
          <el-icon><Upload /></el-icon>
          导入化合物库
        </el-button>
        <el-button type="success" size="large" @click="navigateTo('/molecule-generation/generation-task')">
          <el-icon><Lightning /></el-icon>
          开始分子生成
        </el-button>
        <el-button type="warning" size="large" @click="navigateTo('/multi-objective-optimization/objective-config')">
          <el-icon><Setting /></el-icon>
          配置优化目标
        </el-button>
      </div>
    </div>

    <!-- 最近任务 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">最近任务</h3>
        <el-button text @click="viewAllTasks">查看全部</el-button>
      </div>
      <div class="recent-tasks">
        <div v-for="task in recentTasks" :key="task.id" class="task-item">
          <div class="task-icon">
            <el-icon>
              <Search v-if="task.type === 'screening'" />
              <MagicStick v-else-if="task.type === 'generation'" />
              <Aim v-else />
            </el-icon>
          </div>
          <div class="task-content">
            <div class="task-name">{{ task.name }}</div>
            <div class="task-time">{{ formatTime(task.createdAt) }}</div>
          </div>
          <div class="task-status">
            <el-tag 
              :type="getStatusType(task.status)"
              size="small"
            >
              {{ getStatusText(task.status) }}
            </el-tag>
          </div>
        </div>
        <div v-if="recentTasks.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无最近任务</div>
        </div>
      </div>
    </div>

    <!-- 系统状态 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">系统状态</h3>
      </div>
      <div class="system-status">
        <div class="status-item">
          <div class="status-label">虚拟筛选服务</div>
          <div class="status-indicator running">
            <div class="indicator-dot"></div>
            运行中
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">分子生成服务</div>
          <div class="status-indicator running">
            <div class="indicator-dot"></div>
            运行中
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">优化计算服务</div>
          <div class="status-indicator running">
            <div class="indicator-dot"></div>
            运行中
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">数据库连接</div>
          <div class="status-indicator running">
            <div class="indicator-dot"></div>
            正常
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVirtualScreeningStore } from '@/stores/virtualScreening'
import { useMoleculeGenerationStore } from '@/stores/moleculeGeneration'
import { useMultiObjectiveOptimizationStore } from '@/stores/multiObjectiveOptimization'

const router = useRouter()
const virtualScreeningStore = useVirtualScreeningStore()
const moleculeGenerationStore = useMoleculeGenerationStore()
const optimizationStore = useMultiObjectiveOptimizationStore()

// 计算成功率
const successRate = computed(() => {
  const totalTasks = virtualScreeningStore.screeningTasks.length + 
                    moleculeGenerationStore.generationTasks.length + 
                    optimizationStore.optimizationTasks.length
  
  const completedTasks = virtualScreeningStore.completedTasks.length + 
                        moleculeGenerationStore.completedTasks.length + 
                        optimizationStore.completedTasks.length
  
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
})

// 最近任务
const recentTasks = computed(() => {
  const tasks = [
    ...virtualScreeningStore.screeningTasks.map(t => ({ ...t, type: 'screening' })),
    ...moleculeGenerationStore.generationTasks.map(t => ({ ...t, type: 'generation' })),
    ...optimizationStore.optimizationTasks.map(t => ({ ...t, type: 'optimization' }))
  ]
  
  return tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

const navigateTo = (path: string) => {
  router.push(path)
}

const viewAllTasks = () => {
  // 可以导航到任务管理页面
  console.log('查看全部任务')
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'running': return 'primary'
    case 'failed': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '等待中'
    case 'running': return '运行中'
    case 'completed': return '已完成'
    case 'failed': return '失败'
    default: return '未知'
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.page-header p {
  color: var(--el-text-color-secondary);
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.virtual-screening {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.molecule-generation {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.optimization {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.quick-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.recent-tasks {
  max-height: 300px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.task-item:last-child {
  border-bottom: none;
}

.task-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
}

.task-content {
  flex: 1;
}

.task-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.task-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.system-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.status-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.running {
  color: var(--el-color-success);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>