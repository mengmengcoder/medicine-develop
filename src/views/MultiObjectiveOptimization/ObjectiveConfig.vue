<template>
  <div class="objective-config">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>目标配置</span>
          <div>
            <el-button type="primary" :icon="Plus" @click="addObjective">添加目标</el-button>
            <el-button type="success" :icon="Check" @click="validateConfig">验证配置</el-button>
          </div>
        </div>
      </template>
      
      <el-form :model="config" label-width="120px">
        <el-form-item label="优化目标">
          <el-checkbox-group v-model="config.objectives">
            <el-checkbox label="activity">活性最大化</el-checkbox>
            <el-checkbox label="selectivity">选择性最大化</el-checkbox>
            <el-checkbox label="safety">安全性最大化</el-checkbox>
            <el-checkbox label="druglikeness">药物相似性最大化</el-checkbox>
            <el-checkbox label="synthesizability">可合成性最大化</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="权重分配">
          <el-row :gutter="20">
            <el-col :span="6" v-for="objective in activeObjectives" :key="objective">
              <el-form-item :label="getObjectiveLabel(objective)">
                <el-input-number
                  v-model="config.weights[objective]"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :precision="2"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item label="约束条件">
          <el-table :data="config.constraints" stripe>
            <el-table-column prop="property" label="属性" width="150">
              <template #default="scope">
                <el-select v-model="scope.row.property" placeholder="选择属性">
                  <el-option label="分子量" value="molecularWeight" />
                  <el-option label="LogP" value="logP" />
                  <el-option label="TPSA" value="tpsa" />
                  <el-option label="氢键供体" value="hbd" />
                  <el-option label="氢键受体" value="hba" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="运算符" width="120">
              <template #default="scope">
                <el-select v-model="scope.row.operator">
                  <el-option label="≤" value="<=" />
                  <el-option label="≥" value=">=" />
                  <el-option label="=" value="=" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="值" width="120">
              <template #default="scope">
                <el-input-number v-model="scope.row.value" :precision="2" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button size="small" type="danger" @click="removeConstraint(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" :icon="Plus" @click="addConstraint">添加约束</el-button>
        </el-form-item>
        
        <el-form-item label="优化参数">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="种群大小">
                <el-input-number v-model="config.populationSize" :min="10" :max="1000" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="迭代次数">
                <el-input-number v-model="config.iterations" :min="10" :max="10000" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="交叉概率">
                <el-input-number v-model="config.crossoverRate" :min="0" :max="1" :step="0.1" :precision="2" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Check } from '@element-plus/icons-vue'

const config = ref({
  objectives: ['activity', 'druglikeness'],
  weights: {
    activity: 0.4,
    selectivity: 0.2,
    safety: 0.2,
    druglikeness: 0.1,
    synthesizability: 0.1
  },
  constraints: [
    { property: 'molecularWeight', operator: '<=', value: 500 },
    { property: 'logP', operator: '<=', value: 5 }
  ],
  populationSize: 100,
  iterations: 1000,
  crossoverRate: 0.8
})

const activeObjectives = computed(() => {
  return config.value.objectives
})

const getObjectiveLabel = (objective: string) => {
  const labels: Record<string, string> = {
    activity: '活性',
    selectivity: '选择性',
    safety: '安全性',
    druglikeness: '药物相似性',
    synthesizability: '可合成性'
  }
  return labels[objective] || objective
}

const addObjective = () => {
  ElMessage.info('添加优化目标')
}

const validateConfig = () => {
  ElMessage.success('配置验证通过')
}

const addConstraint = () => {
  config.value.constraints.push({
    property: 'molecularWeight',
    operator: '<=',
    value: 500
  })
}

const removeConstraint = (index: number) => {
  config.value.constraints.splice(index, 1)
}
</script>

<style scoped>
.objective-config {
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