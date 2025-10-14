<template>
  <div class="objective-configuration">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>目标配置</span>
          <div>
            <el-button type="primary" :icon="Check" @click="saveConfiguration">保存配置</el-button>
            <el-button type="success" :icon="Refresh" @click="resetConfiguration">重置</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>优化目标设置</span>
            </template>
            
            <el-form :model="objectives" label-width="120px">
              <el-form-item label="活性">
                <el-switch v-model="objectives.activity.enabled" />
                <div class="objective-details" v-if="objectives.activity.enabled">
                  <el-input-number 
                    v-model="objectives.activity.weight" 
                    :min="0" 
                    :max="1" 
                    :step="0.1" 
                    :precision="2"
                    size="small"
                  />
                  <span class="weight-label">权重</span>
                </div>
              </el-form-item>
              
              <el-form-item label="药物相似性">
                <el-switch v-model="objectives.drugLikeness.enabled" />
                <div class="objective-details" v-if="objectives.drugLikeness.enabled">
                  <el-input-number 
                    v-model="objectives.drugLikeness.weight" 
                    :min="0" 
                    :max="1" 
                    :step="0.1" 
                    :precision="2"
                    size="small"
                  />
                  <span class="weight-label">权重</span>
                </div>
              </el-form-item>
              
              <el-form-item label="毒性">
                <el-switch v-model="objectives.toxicity.enabled" />
                <div class="objective-details" v-if="objectives.toxicity.enabled">
                  <el-input-number 
                    v-model="objectives.toxicity.weight" 
                    :min="0" 
                    :max="1" 
                    :step="0.1" 
                    :precision="2"
                    size="small"
                  />
                  <span class="weight-label">权重</span>
                </div>
              </el-form-item>
              
              <el-form-item label="合成可行性">
                <el-switch v-model="objectives.synthesizability.enabled" />
                <div class="objective-details" v-if="objectives.synthesizability.enabled">
                  <el-input-number 
                    v-model="objectives.synthesizability.weight" 
                    :min="0" 
                    :max="1" 
                    :step="0.1" 
                    :precision="2"
                    size="small"
                  />
                  <span class="weight-label">权重</span>
                </div>
              </el-form-item>
              
              <el-form-item label="代谢稳定性">
                <el-switch v-model="objectives.metabolicStability.enabled" />
                <div class="objective-details" v-if="objectives.metabolicStability.enabled">
                  <el-input-number 
                    v-model="objectives.metabolicStability.weight" 
                    :min="0" 
                    :max="1" 
                    :step="0.1" 
                    :precision="2"
                    size="small"
                  />
                  <span class="weight-label">权重</span>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>权重分配</span>
            </template>
            
            <div class="weight-distribution">
              <div class="weight-summary">
                <div class="total-weight">总权重: {{ totalWeight.toFixed(2) }}</div>
                <el-progress 
                  :percentage="totalWeight * 100" 
                  :status="totalWeight === 1 ? 'success' : 'exception'"
                  :show-text="false"
                />
                <div class="weight-hint" :class="{ valid: totalWeight === 1, invalid: totalWeight !== 1 }">
                  {{ totalWeight === 1 ? '权重分配合理' : '权重总和必须为1' }}
                </div>
              </div>
              
              <div class="weight-chart">
                <div 
                  v-for="objective in enabledObjectives" 
                  :key="objective.name"
                  class="weight-item"
                >
                  <div class="weight-label">{{ objective.label }}</div>
                  <div class="weight-bar">
                    <div 
                      class="weight-fill" 
                      :style="{ width: (objective.weight * 100) + '%' }"
                    ></div>
                  </div>
                  <div class="weight-value">{{ (objective.weight * 100).toFixed(0) }}%</div>
                </div>
              </div>
            </div>
          </el-card>
          
          <el-card class="constraints-config">
            <template #header>
              <span>约束条件</span>
            </template>
            
            <el-form :model="constraints" label-width="100px">
              <el-form-item label="分子量范围">
                <el-input-number v-model="constraints.molecularWeight.min" :min="0" :max="1000" placeholder="最小值" />
                <span class="constraint-separator">-</span>
                <el-input-number v-model="constraints.molecularWeight.max" :min="0" :max="1000" placeholder="最大值" />
              </el-form-item>
              
              <el-form-item label="LogP范围">
                <el-input-number v-model="constraints.logP.min" :min="-10" :max="10" :step="0.1" :precision="2" placeholder="最小值" />
                <span class="constraint-separator">-</span>
                <el-input-number v-model="constraints.logP.max" :min="-10" :max="10" :step="0.1" :precision="2" placeholder="最大值" />
              </el-form-item>
              
              <el-form-item label="氢键供体">
                <el-input-number v-model="constraints.hbd.max" :min="0" :max="20" placeholder="最大值" />
              </el-form-item>
              
              <el-form-item label="氢键受体">
                <el-input-number v-model="constraints.hba.max" :min="0" :max="20" placeholder="最大值" />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Refresh } from '@element-plus/icons-vue'

const objectives = ref({
  activity: { enabled: true, weight: 0.4, label: '活性' },
  drugLikeness: { enabled: true, weight: 0.3, label: '药物相似性' },
  toxicity: { enabled: true, weight: 0.2, label: '毒性' },
  synthesizability: { enabled: false, weight: 0.1, label: '合成可行性' },
  metabolicStability: { enabled: false, weight: 0.0, label: '代谢稳定性' }
})

const constraints = ref({
  molecularWeight: { min: 200, max: 500 },
  logP: { min: -2, max: 5 },
  hbd: { max: 5 },
  hba: { max: 10 }
})

const enabledObjectives = computed(() => {
  return Object.values(objectives.value).filter(obj => obj.enabled)
})

const totalWeight = computed(() => {
  return enabledObjectives.value.reduce((sum, obj) => sum + obj.weight, 0)
})

const saveConfiguration = () => {
  if (totalWeight.value !== 1) {
    ElMessage.error('权重总和必须为1，请调整权重分配')
    return
  }
  
  ElMessage.success('配置已保存')
}

const resetConfiguration = () => {
  objectives.value = {
    activity: { enabled: true, weight: 0.4, label: '活性' },
    drugLikeness: { enabled: true, weight: 0.3, label: '药物相似性' },
    toxicity: { enabled: true, weight: 0.2, label: '毒性' },
    synthesizability: { enabled: false, weight: 0.1, label: '合成可行性' },
    metabolicStability: { enabled: false, weight: 0.0, label: '代谢稳定性' }
  }
  
  constraints.value = {
    molecularWeight: { min: 200, max: 500 },
    logP: { min: -2, max: 5 },
    hbd: { max: 5 },
    hba: { max: 10 }
  }
  
  ElMessage.info('配置已重置为默认值')
}
</script>

<style scoped>
.objective-configuration {
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

.objective-details {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.weight-label {
  font-size: 12px;
  color: #666;
  min-width: 40px;
}

.weight-distribution {
  padding: 10px;
}

.weight-summary {
  margin-bottom: 20px;
}

.total-weight {
  font-weight: 600;
  margin-bottom: 8px;
}

.weight-hint {
  font-size: 12px;
  margin-top: 8px;
}

.weight-hint.valid {
  color: #67c23a;
}

.weight-hint.invalid {
  color: #f56c6c;
}

.weight-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weight-item .weight-label {
  min-width: 80px;
  font-size: 12px;
  color: #303133;
}

.weight-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.weight-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s ease;
}

.weight-value {
  min-width: 40px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.constraints-config {
  margin-top: 20px;
}

.constraint-separator {
  margin: 0 8px;
  color: #909399;
}

.el-form-item {
  margin-bottom: 16px;
}
</style>