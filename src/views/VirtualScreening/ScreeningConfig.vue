<template>
  <div class="screening-config">
    <div class="page-header">
      <h2>筛选配置</h2>
      <p>配置虚拟筛选参数和算法，创建筛选任务</p>
    </div>

    <div class="config-container">
      <!-- 基本配置 -->
      <div class="content-card">
        <div class="card-header">
          <h3 class="card-title">基本配置</h3>
        </div>
        <el-form :model="config" label-width="120px" class="config-form">
          <el-form-item label="任务名称">
            <el-input v-model="config.name" placeholder="请输入任务名称" />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input
              v-model="config.description"
              type="textarea"
              :rows="3"
              placeholder="请输入任务描述"
            />
          </el-form-item>
          
          <el-form-item label="化合物数量">
            <el-input-number
              v-model="config.compoundCount"
              :min="1"
              :max="1000"
              style="width: 200px"
            />
            <span class="form-tip">当前化合物库共有化合物</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 算法选择 -->
      <div class="content-card">
        <div class="card-header">
          <h3 class="card-title">筛选算法</h3>
        </div>
        <div class="algorithm-grid">
          <div
            v-for="algorithm in algorithms"
            :key="algorithm.id"
            class="algorithm-card"
            :class="{ active: config.algorithm === algorithm.id }"
            @click="selectAlgorithm(algorithm.id)"
          >
            <div class="algorithm-icon">
              <el-icon size="32">
                <component :is="algorithm.icon" />
              </el-icon>
            </div>
            <div class="algorithm-content">
              <h4>{{ algorithm.name }}</h4>
              <p>{{ algorithm.description }}</p>
              <div class="algorithm-tags">
                <el-tag size="small" v-for="tag in algorithm.tags" :key="tag">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <el-button @click="resetConfig">重置配置</el-button>
        <el-button @click="saveConfig">保存配置</el-button>
        <el-button type="primary" @click="startScreening" :disabled="!canStart">
          <el-icon><VideoPlay /></el-icon>
          开始筛选
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'

const router = useRouter()

// 配置数据
const config = reactive({
  name: '',
  description: '',
  algorithm: 'molecular_docking',
  compoundCount: 100,
  parallelism: 4,
  maxResults: 100,
  saveIntermediateResults: false,
  parameters: {} as Record<string, any>
})

// 算法定义
const algorithms = ref([
  {
    id: 'molecular_docking',
    name: '分子对接',
    description: '通过分子对接预测化合物与靶点的结合模式和亲和力',
    icon: 'Connection',
    tags: ['结构导向', '精确度高', '计算密集']
  },
  {
    id: 'pharmacophore_matching',
    name: '药效团匹配',
    description: '基于药效团模型筛选具有特定药理特征的化合物',
    icon: 'Coordinate',
    tags: ['特征导向', '快速筛选', '广泛适用']
  },
  {
    id: 'similarity_search',
    name: '相似性搜索',
    description: '基于分子指纹和相似性度量寻找与参考化合物结构相似的分子',
    icon: 'Compass',
    tags: ['相似性导向', '高效快速', '易于理解']
  },
  {
    id: 'ml_prediction',
    name: '机器学习预测',
    description: '使用训练好的机器学习模型预测化合物的生物活性',
    icon: 'Cpu',
    tags: ['AI驱动', '预测准确', '数据依赖']
  }
])

// 计算属性
const canStart = computed(() => 
  config.name && config.algorithm && config.compoundCount > 0
)

onMounted(() => {
  initializeConfig()
})

const initializeConfig = () => {
  config.name = `筛选任务_${new Date().toLocaleString('zh-CN').replace(/[\/\s:]/g, '')}`
  config.compoundCount = 100
}

const selectAlgorithm = (algorithmId: string) => {
  config.algorithm = algorithmId
}

const resetConfig = () => {
  Object.assign(config, {
    name: '',
    description: '',
    algorithm: 'molecular_docking',
    compoundCount: 100,
    parallelism: 4,
    maxResults: 100,
    saveIntermediateResults: false,
    parameters: {}
  })
}

const saveConfig = () => {
  ElMessage.success('配置已保存')
}

const startScreening = () => {
  if (!canStart.value) {
    ElMessage.warning('请完善配置信息')
    return
  }
  
  ElMessage.success('筛选任务已启动')
  router.push('/virtual-screening/task-monitor')
}
</script>

<style scoped>
.screening-config {
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

.config-container {
  max-width: 1200px;
}

.content-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
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

.config-form {
  padding: 20px;
}

.form-tip {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.algorithm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding: 20px;
}

.algorithm-card {
  display: flex;
  padding: 16px;
  border: 2px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.algorithm-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.algorithm-card.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.algorithm-icon {
  margin-right: 16px;
  color: var(--el-color-primary);
}

.algorithm-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.algorithm-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.algorithm-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
}
</style>