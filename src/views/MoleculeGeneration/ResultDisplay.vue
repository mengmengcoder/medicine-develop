<template>
  <div class="result-display">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>结果展示</span>
          <div>
            <el-button type="primary" :icon="Filter" @click="filterResults">筛选</el-button>
            <el-button type="success" :icon="Download" @click="exportResults">导出</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-statistic title="生成总数" :value="stats.totalGenerated" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="有效分子" :value="stats.validMolecules" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="新颖分子" :value="stats.novelMolecules" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均相似度" :value="stats.avgSimilarity" :precision="2" />
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" class="molecules-grid">
      <el-col :span="6" v-for="molecule in molecules" :key="molecule.id">
        <el-card class="molecule-card">
          <template #header>
            <div class="molecule-header">
              <span>{{ molecule.name }}</span>
              <el-tag :type="getScoreTag(molecule.score)">{{ molecule.score.toFixed(2) }}</el-tag>
            </div>
          </template>
          
          <div class="molecule-content">
            <div class="smiles">{{ molecule.smiles }}</div>
            <div class="properties">
              <div>分子量: {{ molecule.molecularWeight }}</div>
              <div>LogP: {{ molecule.logP }}</div>
              <div>TPSA: {{ molecule.tpsa }}</div>
            </div>
          </div>
          
          <template #footer>
            <div class="molecule-actions">
              <el-button size="small" @click="viewDetails(molecule)">详情</el-button>
              <el-button size="small" type="primary" @click="view3D(molecule)">3D</el-button>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[12, 24, 48, 96]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Filter, Download } from '@element-plus/icons-vue'

const stats = ref({
  totalGenerated: 1560,
  validMolecules: 1482,
  novelMolecules: 1234,
  avgSimilarity: 0.78
})

const molecules = ref([
  {
    id: 1,
    name: 'CMP001',
    smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
    score: 0.85,
    molecularWeight: 206.28,
    logP: 2.34,
    tpsa: 37.3
  },
  {
    id: 2,
    name: 'CMP002',
    smiles: 'CC1=CC=C(C=C1)C(=O)NC2=CC=CC=C2',
    score: 0.78,
    molecularWeight: 211.26,
    logP: 3.12,
    tpsa: 29.1
  },
  {
    id: 3,
    name: 'CMP003',
    smiles: 'O=C(NC1=CC=CC=C1)C2=CC=CC=C2',
    score: 0.92,
    molecularWeight: 197.23,
    logP: 2.89,
    tpsa: 41.5
  },
  {
    id: 4,
    name: 'CMP004',
    smiles: 'CC1CCCCC1C(=O)NC2=CC=CC=C2',
    score: 0.67,
    molecularWeight: 189.25,
    logP: 1.98,
    tpsa: 38.2
  }
])

const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(1560)

const getScoreTag = (score: number) => {
  if (score >= 0.9) return 'success'
  if (score >= 0.7) return 'primary'
  if (score >= 0.5) return 'warning'
  return 'danger'
}

const filterResults = () => {
  ElMessage.info('打开筛选对话框')
}

const exportResults = () => {
  ElMessage.success('结果导出中...')
}

const viewDetails = (molecule: any) => {
  ElMessage.info(`查看分子详情: ${molecule.name}`)
}

const view3D = (molecule: any) => {
  ElMessage.info(`3D查看分子: ${molecule.name}`)
}
</script>

<style scoped>
.result-display {
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

.molecules-grid {
  margin-bottom: 20px;
}

.molecule-card {
  margin-bottom: 20px;
}

.molecule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.molecule-content {
  text-align: center;
}

.smiles {
  font-family: monospace;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 12px;
}

.properties {
  font-size: 12px;
  color: #666;
}

.properties div {
  margin-bottom: 4px;
}

.molecule-actions {
  display: flex;
  justify-content: space-around;
}

.pagination {
  text-align: right;
}
</style>