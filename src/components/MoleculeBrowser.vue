<template>
  <div class="molecule-browser">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="12">
        <el-input
          v-model="searchQuery"
          placeholder="搜索分子 (SMILES或属性)"
          clearable
          @input="searchMolecules"
        >
          <template #append>
            <el-button @click="searchMolecules">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :span="12">
        <el-select v-model="selectedTask" placeholder="筛选任务" clearable @change="filterByTask">
          <el-option
            v-for="task in tasks"
            :key="task.id"
            :label="task.name"
            :value="task.id"
          />
        </el-select>
      </el-col>
    </el-row>

    <el-table :data="molecules" style="width: 100%">
      <el-table-column prop="smiles" label="SMILES" width="300">
        <template #default="scope">
          <el-tooltip :content="scope.row.smiles" placement="top">
            <span class="smiles-text">{{ truncateSmiles(scope.row.smiles) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="molecular_weight" label="分子量" width="100" />
      <el-table-column prop="logp" label="LogP" width="80" />
      <el-table-column prop="hbd" label="HBD" width="60" />
      <el-table-column prop="hba" label="HBA" width="60" />
      <el-table-column prop="rotatable_bonds" label="可旋转键" width="100" />
      <el-table-column prop="task_name" label="来源任务" />
      <el-table-column prop="created_at" label="创建时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="viewMolecule(scope.row)">查看</el-button>
          <el-button size="small" @click="downloadMolecule(scope.row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="totalMolecules"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { dbService } from '@/services/supabase'

interface Molecule {
  id: string
  smiles: string
  molecular_weight: number
  logp: number
  hbd: number
  hba: number
  rotatable_bonds: number
  task_name: string
  created_at: string
}

interface Task {
  id: string
  name: string
}

const molecules = ref<Molecule[]>([])
const tasks = ref<Task[]>([])
const searchQuery = ref('')
const selectedTask = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalMolecules = ref(0)

const truncateSmiles = (smiles: string) => {
  return smiles.length > 50 ? smiles.substring(0, 50) + '...' : smiles
}

const loadMolecules = async () => {
  try {
    let queryOptions: any = {
      select: 'id, smiles, properties, created_at, molecule_generation_tasks(name)',
      orderBy: { column: 'created_at', ascending: false },
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    }

    if (selectedTask.value) {
      queryOptions.where = { task_id: selectedTask.value }
    }

    const data = await dbService.query<any>('molecules', queryOptions)
    
    molecules.value = data.map((item: any) => ({
      id: item.id,
      smiles: item.smiles,
      molecular_weight: item.properties?.molecular_weight || 0,
      logp: item.properties?.logp || 0,
      hbd: item.properties?.hbd || 0,
      hba: item.properties?.hba || 0,
      rotatable_bonds: item.properties?.rotatable_bonds || 0,
      task_name: item.molecule_generation_tasks?.name || '未知任务',
      created_at: item.created_at
    }))

    // 获取总数量
    const countResult = await dbService.query<any>('molecules', {
      select: 'count'
    })
    totalMolecules.value = countResult.length > 0 ? parseInt(countResult[0].count) : 0
  } catch (error) {
    ElMessage.error('加载分子数据失败: ' + (error as Error).message)
  }
}

const loadTasks = async () => {
  try {
    const data = await dbService.query<Task>('molecule_generation_tasks', {
      select: 'id, name',
      orderBy: { column: 'created_at', ascending: false }
    })
    tasks.value = data
  } catch (error) {
    ElMessage.error('加载任务列表失败: ' + (error as Error).message)
  }
}

const searchMolecules = async () => {
  if (!searchQuery.value) {
    loadMolecules()
    return
  }

  try {
    // 使用Supabase的全文搜索功能
    const { data, error } = await dbService.supabase
      .rpc('search_molecules', {
        query: searchQuery.value,
        limit_param: pageSize.value,
        offset_param: (currentPage.value - 1) * pageSize.value
      })

    if (error) throw error

    molecules.value = data.map((item: any) => ({
      id: item.id,
      smiles: item.smiles,
      molecular_weight: item.properties?.molecular_weight || 0,
      logp: item.properties?.logp || 0,
      hbd: item.properties?.hbd || 0,
      hba: item.properties?.hba || 0,
      rotatable_bonds: item.properties?.rotatable_bonds || 0,
      task_name: item.task_name,
      created_at: item.created_at
    }))
  } catch (error) {
    ElMessage.error('搜索分子失败: ' + (error as Error).message)
  }
}

const filterByTask = () => {
  currentPage.value = 1
  loadMolecules()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadMolecules()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadMolecules()
}

const viewMolecule = (molecule: Molecule) => {
  ElMessage.info(`查看分子: ${molecule.smiles}`)
  // 这里可以打开分子查看器
}

const downloadMolecule = (molecule: Molecule) => {
  const content = `SMILES: ${molecule.smiles}\n分子量: ${molecule.molecular_weight}\nLogP: ${molecule.logp}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `molecule_${molecule.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadMolecules()
  loadTasks()
})
</script>

<style scoped>
.smiles-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>