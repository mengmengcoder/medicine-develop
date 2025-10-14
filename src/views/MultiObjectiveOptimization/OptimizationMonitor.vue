<template>
  <div class="optimization-monitor">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>优化监控</span>
          <div>
            <el-button type="primary" :icon="Refresh" @click="refreshData">刷新</el-button>
            <el-button type="success" :icon="VideoPlay" @click="startOptimization">开始优化</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-statistic title="迭代次数" :value="stats.iterations" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="种群大小" :value="stats.populationSize" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="帕累托解数" :value="stats.paretoSolutions" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="运行时间" :value="stats.runningTime" suffix="秒" />
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>帕累托前沿</span>
          </template>
          <div class="chart-container">帕累托前沿可视化图表</div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>收敛曲线</span>
          </template>
          <div class="chart-container">收敛曲线图表</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, VideoPlay } from '@element-plus/icons-vue'

const stats = ref({
  iterations: 156,
  populationSize: 100,
  paretoSolutions: 23,
  runningTime: 342
})

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const startOptimization = () => {
  ElMessage.info('开始多目标优化过程')
}
</script>

<style scoped>
.optimization-monitor {
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

.stats-row {
  margin-bottom: 20px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  color: #999;
}
</style>