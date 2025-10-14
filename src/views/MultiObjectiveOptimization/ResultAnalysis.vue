<template>
  <div class="result-analysis">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>结果分析</span>
          <div>
            <el-button type="primary" :icon="DataAnalysis" @click="analyzeResults">分析</el-button>
            <el-button type="success" :icon="Download" @click="exportResults">导出</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20" class="analysis-overview">
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>最优解统计</span>
            </template>
            <div class="stat-item">
              <div>非支配解数量: 23</div>
              <div>多样性指标: 0.85</div>
              <div>收敛性指标: 0.92</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>目标函数值</span>
            </template>
            <div class="stat-item">
              <div>活性得分范围: 0.65-0.92</div>
              <div>毒性得分范围: 0.12-0.45</div>
              <div>合成难度: 0.23-0.78</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>性能指标</span>
            </template>
            <div class="stat-item">
              <div>超体积: 0.78</div>
              <div>间距指标: 0.65</div>
              <div>世代距离: 0.12</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="solutions-table">
      <template #header>
        <span>帕累托最优解</span>
      </template>
      
      <el-table :data="solutions" stripe style="width: 100%">
        <el-table-column prop="id" label="解ID" width="80" />
        <el-table-column prop="smiles" label="SMILES" width="200" show-overflow-tooltip />
        <el-table-column prop="activity" label="活性得分" width="100" sortable />
        <el-table-column prop="toxicity" label="毒性得分" width="100" sortable />
        <el-table-column prop="synthesizability" label="合成难度" width="100" sortable />
        <el-table-column prop="drugLikeness" label="药物相似性" width="100" sortable />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="viewSolution(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="selectSolution(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { DataAnalysis, Download } from '@element-plus/icons-vue'

const solutions = ref([
  {
    id: 1,
    smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
    activity: 0.92,
    toxicity: 0.15,
    synthesizability: 0.23,
    drugLikeness: 0.88
  },
  {
    id: 2,
    smiles: 'CC1=CC=C(C=C1)C(=O)NC2=CC=CC=C2',
    activity: 0.85,
    toxicity: 0.12,
    synthesizability: 0.45,
    drugLikeness: 0.92
  }
])

const analyzeResults = () => {
  ElMessage.info('开始结果分析')
}

const exportResults = () => {
  ElMessage.success('结果导出中...')
}

const viewSolution = (solution: any) => {
  ElMessage.info(`查看解详情: ${solution.id}`)
}

const selectSolution = (solution: any) => {
  ElMessage.success(`选择解: ${solution.id}`)
}
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

.stat-item div {
  margin-bottom: 8px;
  font-size: 14px;
}

.solutions-table {
  margin-bottom: 20px;
}
</style>