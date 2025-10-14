<template>
  <div class="algorithm-selection">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>算法选择</span>
          <div>
            <el-button type="primary" :icon="Check" @click="applyAlgorithm">应用算法</el-button>
            <el-button type="success" :icon="Refresh" @click="resetSelection">重置</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>多目标优化算法</span>
            </template>
            
            <div class="algorithm-cards">
              <div 
                v-for="algorithm in algorithms" 
                :key="algorithm.value"
                class="algorithm-card"
                :class="{ active: selectedAlgorithm === algorithm.value }"
                @click="selectedAlgorithm = algorithm.value"
              >
                <div class="card-radio">
                  <el-radio :model-value="selectedAlgorithm" :label="algorithm.value" />
                </div>
                <div class="card-content">
                  <div class="algorithm-name">{{ algorithm.name }}</div>
                  <div class="algorithm-desc">{{ algorithm.desc }}</div>
                  <div class="algorithm-features">
                    <el-tag v-for="feature in algorithm.features" :key="feature" size="small">
                      {{ feature }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>算法参数配置</span>
            </template>
            
            <el-form :model="algorithmParams" label-width="100px">
              <el-form-item label="种群大小">
                <el-input-number v-model="algorithmParams.populationSize" :min="10" :max="1000" />
              </el-form-item>
              
              <el-form-item label="迭代次数">
                <el-input-number v-model="algorithmParams.iterations" :min="10" :max="10000" />
              </el-form-item>
              
              <el-form-item label="交叉概率">
                <el-input-number v-model="algorithmParams.crossoverRate" :min="0" :max="1" :step="0.1" :precision="2" />
              </el-form-item>
              
              <el-form-item label="变异概率">
                <el-input-number v-model="algorithmParams.mutationRate" :min="0" :max="1" :step="0.1" :precision="2" />
              </el-form-item>
              
              <el-form-item label="存档大小">
                <el-input-number v-model="algorithmParams.archiveSize" :min="10" :max="500" />
              </el-form-item>
            </el-form>
          </el-card>
          
          <el-card class="algorithm-comparison">
            <template #header>
              <span>算法性能比较</span>
            </template>
            
            <el-table :data="algorithmComparison" stripe>
              <el-table-column prop="algorithm" label="算法" width="100" />
              <el-table-column prop="convergence" label="收敛速度" width="100">
                <template #default="scope">
                  <el-rate v-model="scope.row.convergence" disabled show-score />
                </template>
              </el-table-column>
              <el-table-column prop="diversity" label="多样性" width="100">
                <template #default="scope">
                  <el-rate v-model="scope.row.diversity" disabled show-score />
                </template>
              </el-table-column>
              <el-table-column prop="complexity" label="复杂度" width="100">
                <template #default="scope">
                  <el-rate v-model="scope.row.complexity" disabled show-score />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Refresh } from '@element-plus/icons-vue'

const selectedAlgorithm = ref('nsga2')

const algorithms = ref([
  {
    value: 'nsga2',
    name: 'NSGA-II',
    desc: '非支配排序遗传算法 II',
    features: ['快速非支配排序', '拥挤度计算']
  },
  {
    value: 'mopso',
    name: 'MOPSO',
    desc: '多目标粒子群优化',
    features: ['粒子群优化', '外部存档']
  },
  {
    value: 'moead',
    name: 'MOEA/D',
    desc: '基于分解的多目标进化算法',
    features: ['分解策略', '邻域搜索']
  },
  {
    value: 'spea2',
    name: 'SPEA2',
    desc: '强度帕累托进化算法 2',
    features: ['强度值计算', '环境选择']
  }
])

const algorithmParams = ref({
  populationSize: 100,
  iterations: 1000,
  crossoverRate: 0.8,
  mutationRate: 0.1,
  archiveSize: 100
})

const algorithmComparison = ref([
  { algorithm: 'NSGA-II', convergence: 4, diversity: 4, complexity: 3 },
  { algorithm: 'MOPSO', convergence: 5, diversity: 3, complexity: 2 },
  { algorithm: 'MOEA/D', convergence: 3, diversity: 5, complexity: 4 },
  { algorithm: 'SPEA2', convergence: 4, diversity: 4, complexity: 4 }
])

const applyAlgorithm = () => {
  ElMessage.success(`已应用 ${selectedAlgorithm.value.toUpperCase()} 算法`)
}

const resetSelection = () => {
  selectedAlgorithm.value = 'nsga2'
  algorithmParams.value = {
    populationSize: 100,
    iterations: 1000,
    crossoverRate: 0.8,
    mutationRate: 0.1,
    archiveSize: 100
  }
  ElMessage.info('算法选择已重置')
}
</script>

<style scoped>
.algorithm-selection {
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

.algorithm-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.algorithm-card {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.algorithm-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.algorithm-card.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.card-radio {
  margin-right: 12px;
  margin-top: 2px;
}

.card-content {
  flex: 1;
}

.algorithm-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.algorithm-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.4;
}

.algorithm-features {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.algorithm-comparison {
  margin-top: 20px;
}
</style>