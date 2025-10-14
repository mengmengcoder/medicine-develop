<template>
  <div class="compound-library">
    <div class="page-header">
      <h2>化合物库管理</h2>
      <p>管理和维护化合物数据库，支持多种格式的化合物导入</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchText"
          placeholder="搜索化合物名称或SMILES..."
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="filterType" placeholder="筛选类型" style="width: 150px">
          <el-option label="全部" value="all" />
          <el-option label="已筛选" value="screened" />
          <el-option label="未筛选" value="unscreened" />
        </el-select>
      </div>
      
      <div class="toolbar-right">
        <el-upload
          :before-upload="handleUpload"
          accept=".sdf,.mol,.smiles,.csv"
          :show-file-list="false"
          :disabled="isUploading"
        >
          <el-button type="primary" :loading="isUploading">
            <el-icon><Upload /></el-icon>
            导入化合物
          </el-button>
        </el-upload>
        
        <el-button @click="exportCompounds" :disabled="selectedCompounds.length === 0">
          <el-icon><Download /></el-icon>
          导出选中
        </el-button>
        
        <el-button @click="clearLibrary" type="danger" plain>
          <el-icon><Delete /></el-icon>
          清空库
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总化合物数:</span>
        <span class="stat-value">{{ store.totalCompounds }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已筛选:</span>
        <span class="stat-value">{{ store.screenedCompounds }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已选中:</span>
        <span class="stat-value">{{ selectedCompounds.length }}</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="content-card">
      <DataTable
        ref="tableRef"
        :data="store.compoundLibrary"
        :columns="tableColumns"
        :loading="store.isLoading"
        :selectable="true"
        :search-text="searchText"
        :filter-fn="filterCompounds"
        @selection-change="handleSelectionChange"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <template #molecular-preview="{ row }">
          <MoleculeViewer
            :smiles="row.smiles"
            :width="120"
            :height="80"
            :show-controls="false"
          />
        </template>
        
        <template #properties="{ row }">
          <el-tag
            v-for="(value, key) in row.properties"
            :key="key"
            size="small"
            style="margin-right: 4px;"
          >
            {{ key }}: {{ value }}
          </el-tag>
        </template>
        
        <template #status="{ row }">
          <el-tag
            :type="row.status === 'screened' ? 'success' : 'info'"
            size="small"
          >
            {{ row.status === 'screened' ? '已筛选' : '未筛选' }}
          </el-tag>
        </template>
      </DataTable>
    </div>

    <!-- 化合物详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="化合物详情"
      width="800px"
      draggable
    >
      <div v-if="currentCompound" class="compound-detail">
        <div class="detail-grid">
          <div class="detail-left">
            <div class="detail-item">
              <label>化合物名称:</label>
              <span>{{ currentCompound.name }}</span>
            </div>
            <div class="detail-item">
              <label>SMILES:</label>
              <span class="smiles-text">{{ currentCompound.smiles }}</span>
            </div>
            <div class="detail-item">
              <label>分子量:</label>
              <span>{{ currentCompound.molecularWeight }}</span>
            </div>
            <div class="detail-item">
              <label>状态:</label>
              <el-tag :type="currentCompound.status === 'screened' ? 'success' : 'info'">
                {{ currentCompound.status === 'screened' ? '已筛选' : '未筛选' }}
              </el-tag>
            </div>
          </div>
          <div class="detail-right">
            <MoleculeViewer
              :smiles="currentCompound.smiles"
              :width="300"
              :height="200"
            />
          </div>
        </div>
        
        <div class="properties-section" v-if="currentCompound.properties">
          <h4>分子属性</h4>
          <div class="properties-grid">
            <div
              v-for="(value, key) in currentCompound.properties"
              :key="key"
              class="property-item"
            >
              <span class="property-key">{{ key }}:</span>
              <span class="property-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="startScreening">开始筛选</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useVirtualScreeningStore, type Compound } from '@/stores/virtualScreening'
import DataTable, { type TableColumn } from '@/components/DataTable.vue'
import MoleculeViewer from '@/components/MoleculeViewer.vue'

const router = useRouter()
const store = useVirtualScreeningStore()

const searchText = ref('')
const filterType = ref('all')
const selectedCompounds = ref<Compound[]>([])
const isUploading = ref(false)
const showDetailDialog = ref(false)
const currentCompound = ref<Compound | null>(null)
const tableRef = ref()

// 表格列配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 100 },
  { prop: 'name', label: '化合物名称', minWidth: 150 },
  { prop: 'smiles', label: 'SMILES', minWidth: 200, formatter: (row, col, value) => 
    value.length > 30 ? value.substring(0, 30) + '...' : value 
  },
  { prop: 'molecularWeight', label: '分子量', width: 120, sortable: true },
  { prop: 'molecular-preview', label: '结构预览', width: 140, slot: 'molecular-preview' },
  { prop: 'properties', label: '属性', width: 200, slot: 'properties' },
  { prop: 'status', label: '状态', width: 100, slot: 'status' }
]

// 过滤函数
const filterCompounds = (compound: Compound, searchText: string) => {
  const matchesSearch = compound.name.toLowerCase().includes(searchText.toLowerCase()) ||
                       compound.smiles.toLowerCase().includes(searchText.toLowerCase())
  
  const matchesFilter = filterType.value === 'all' || compound.status === filterType.value
  
  return matchesSearch && matchesFilter
}

onMounted(() => {
  // 初始化一些示例数据
  initSampleData()
})

const initSampleData = () => {
  if (store.compoundLibrary.length === 0) {
    const sampleCompounds: Compound[] = [
      {
        id: '1',
        name: 'Aspirin',
        smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
        molecularWeight: 180.16,
        status: 'screened',
        properties: {
          'LogP': '1.19',
          'TPSA': '63.6',
          'Rotatable Bonds': '3'
        }
      },
      {
        id: '2',
        name: 'Caffeine',
        smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
        molecularWeight: 194.19,
        status: 'unscreened',
        properties: {
          'LogP': '-0.07',
          'TPSA': '58.4',
          'Rotatable Bonds': '0'
        }
      },
      {
        id: '3',
        name: 'Ibuprofen',
        smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
        molecularWeight: 206.28,
        status: 'unscreened',
        properties: {
          'LogP': '3.97',
          'TPSA': '37.3',
          'Rotatable Bonds': '4'
        }
      }
    ]
    
    store.addCompounds(sampleCompounds)
  }
}

const handleUpload = (file: File) => {
  isUploading.value = true
  
  // 模拟文件上传和解析
  setTimeout(() => {
    const newCompounds: Compound[] = [
      {
        id: Date.now().toString(),
        name: `Compound_${Date.now()}`,
        smiles: 'CCO', // 示例SMILES
        molecularWeight: Math.random() * 500 + 100,
        status: 'unscreened',
        properties: {
          'LogP': (Math.random() * 5).toFixed(2),
          'TPSA': (Math.random() * 100).toFixed(1)
        }
      }
    ]
    
    store.addCompounds(newCompounds)
    isUploading.value = false
    ElMessage.success(`成功导入 ${newCompounds.length} 个化合物`)
  }, 2000)
  
  return false // 阻止默认上传
}

const exportCompounds = () => {
  if (selectedCompounds.value.length === 0) {
    ElMessage.warning('请先选择要导出的化合物')
    return
  }
  
  // 模拟导出
  ElMessage.success(`已导出 ${selectedCompounds.value.length} 个化合物`)
}

const clearLibrary = () => {
  ElMessageBox.confirm('确认清空整个化合物库？此操作不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.clearCompounds()
    ElMessage.success('化合物库已清空')
  })
}

const handleSelectionChange = (selection: Compound[]) => {
  selectedCompounds.value = selection
}

const handleView = (compound: Compound) => {
  currentCompound.value = compound
  showDetailDialog.value = true
}

const handleEdit = (compound: Compound) => {
  ElMessage.info('编辑功能开发中')
}

const handleDelete = (compound: Compound) => {
  ElMessageBox.confirm(`确认删除化合物 "${compound.name}"？`, '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = store.compoundLibrary.findIndex(c => c.id === compound.id)
    if (index !== -1) {
      store.compoundLibrary.splice(index, 1)
      ElMessage.success('化合物已删除')
    }
  })
}

const startScreening = () => {
  if (currentCompound.value) {
    router.push('/virtual-screening/screening-config')
    showDetailDialog.value = false
  }
}
</script>

<style scoped>
.compound-library {
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

.stats-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.stat-value {
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 16px;
}

.compound-detail {
  padding: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
}

.detail-item label {
  width: 120px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.smiles-text {
  font-family: 'Courier New', monospace;
  background: var(--el-fill-color-light);
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.properties-section h4 {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.property-key {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.property-value {
  color: var(--el-text-color-secondary);
}
</style>