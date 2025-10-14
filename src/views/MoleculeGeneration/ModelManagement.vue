<template>
  <div class="model-management">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>模型管理</span>
          <div>
            <el-button type="primary" :icon="Plus" @click="addModel">添加模型</el-button>
            <el-button type="success" :icon="Upload" @click="importModel">导入模型</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="modelList" stripe style="width: 100%">
        <el-table-column prop="name" label="模型名称" width="200" />
        <el-table-column prop="type" label="模型类型" width="150">
          <template #default="scope">
            <el-tag :type="getModelTypeTag(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'">
              {{ scope.row.status === 'active' ? '已激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accuracy" label="准确率" width="120">
          <template #default="scope">
            {{ (scope.row.accuracy * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="editModel(scope.row)">编辑</el-button>
            <el-button size="small" type="primary" @click="testModel(scope.row)">测试</el-button>
            <el-button size="small" type="danger" @click="deleteModel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'

const modelList = ref([
  {
    id: 1,
    name: 'VAE分子生成模型',
    type: 'VAE',
    version: '1.0.0',
    status: 'active',
    accuracy: 0.85,
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: 'GAN分子生成模型',
    type: 'GAN',
    version: '1.2.0',
    status: 'active',
    accuracy: 0.78,
    createTime: '2024-01-20 14:20:00'
  },
  {
    id: 3,
    name: 'Transformer分子生成模型',
    type: 'Transformer',
    version: '2.0.0',
    status: 'inactive',
    accuracy: 0.92,
    createTime: '2024-02-01 09:15:00'
  }
])

const getModelTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'VAE': 'primary',
    'GAN': 'success',
    'Transformer': 'warning',
    'Diffusion': 'danger'
  }
  return typeMap[type] || 'info'
}

const addModel = () => {
  ElMessage.info('打开添加模型对话框')
}

const importModel = () => {
  ElMessage.info('打开模型导入对话框')
}

const editModel = (model: any) => {
  ElMessage.info(`编辑模型: ${model.name}`)
}

const testModel = (model: any) => {
  ElMessage.info(`测试模型: ${model.name}`)
}

const deleteModel = async (model: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模型 "${model.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success('模型删除成功')
  } catch {
    ElMessage.info('取消删除')
  }
}
</script>

<style scoped>
.model-management {
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