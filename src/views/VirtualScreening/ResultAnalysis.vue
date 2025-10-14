<template>
  <div class="result-analysis">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>结果分析</span>
          <el-button type="primary" :icon="Refresh" @click="refreshData">刷新数据</el-button>
        </div>
      </template>
      
      <el-row :gutter="20" class="analysis-overview">
        <el-col :span="6">
          <el-statistic title="筛选结果总数" :value="statistics.totalResults" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="高活性化合物" :value="statistics.highActivity" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="药物相似性评分" :value="statistics.drugLikeness" :precision="2" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均对接得分" :value="statistics.avgDockingScore" :precision="2" />
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>活性分布图</span>
          </template>
          <div ref="activityChart" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>分子量分布</span>
          </template>
          <div ref="molecularWeightChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="results-table">
      <template #header>
        <div class="card-header">
          <span>筛选结果详情</span>
          <div>
            <el-button type="success" :icon="Download" @click="exportResults">导出结果</el-button>
            <el-button type="primary" :icon="View" @click="viewMolecule">3D查看</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="resultsData" style="width: 100%" stripe>
        <el-table-column prop="compoundId" label="化合物ID" width="120" />
        <el-table-column prop="smiles" label="SMILES" width="200" show-overflow-tooltip />
        <el-table-column prop="dockingScore" label="对接得分" width="120" sortable />
        <el-table-column prop="activity" label="活性预测" width="120" sortable />
        <el-table-column prop="drugLikeness" label="药物相似性" width="120" sortable />
        <el-table-column prop="molecularWeight" label="分子量" width="120" sortable />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="view3D(scope.row)">3D</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, View } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 数据定义
const statistics = ref({
  totalResults: 1234,
  highActivity: 89,
  drugLikeness: 0.78,
  avgDockingScore: -8.5
})

const resultsData = ref([
  {
    compoundId: 'CMP001',
    smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
    dockingScore: -9.2,
    activity: 0.85,
    drugLikeness: 0.92,
    molecularWeight: 206.28
  },
  {
    compoundId: 'CMP002', 
    smiles: 'CC1=CC=C(C=C1)C(=O)NC2=CC=CC=C2',
    dockingScore: -8.7,
    activity: 0.78,
    drugLikeness: 0.88,
    molecularWeight: 211.26
  }
])

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(1234)

// 图表引用
const activityChart = ref()
const molecularWeightChart = ref()

// 方法
const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const exportResults = () => {  
  ElMessage.success('结果导出中...')
}

const viewMolecule = () => {
  ElMessage.info('打开3D分子查看器...')
}

const viewDetails = (row: any) => {
  ElMessage.info(`查看化合物 ${row.compoundId} 详情`)
}

const view3D = (row: any) => {
  ElMessage.info(`3D查看化合物 ${row.compoundId}`)
}

const initCharts = () => {
  nextTick(() => {
    // 活性分布图
    const activityChartInstance = echarts.init(activityChart.value)
    activityChartInstance.setOption({
      title: { text: '活性分布' },
      xAxis: { type: 'category', data: ['0-0.2', '0.2-0.4', '0.4-0.6', '0.6-0.8', '0.8-1.0'] },
      yAxis: { type: 'value' },
      series: [{
        data: [45, 123, 234, 345, 487],
        type: 'bar',
        itemStyle: { color: '#409EFF' }
      }]
    })

    // 分子量分布图
    const molecularWeightChartInstance = echarts.init(molecularWeightChart.value)
    molecularWeightChartInstance.setOption({
      title: { text: '分子量分布' },
      xAxis: { type: 'category', data: ['<200', '200-300', '300-400', '400-500', '>500'] },
      yAxis: { type: 'value' },
      series: [{
        data: [156, 432, 543, 234, 89],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#67C23A' }
      }]
    })
  })
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.result-analysis {
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

.analysis-overview {
  margin-bottom: 20px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.results-table {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>