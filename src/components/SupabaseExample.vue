<template>
  <div class="supabase-example">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Supabase集成示例</span>
          <el-button type="primary" @click="testConnection">测试连接</el-button>
        </div>
      </template>

      <el-alert
        v-if="connectionStatus"
        :title="connectionStatus"
        :type="connectionStatus === '连接成功' ? 'success' : 'error'"
        show-icon
        class="mb-4"
      />

      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户管理" name="users">
          <user-management />
        </el-tab-pane>
        <el-tab-pane label="任务监控" name="tasks">
          <task-monitor />
        </el-tab-pane>
        <el-tab-pane label="分子数据" name="molecules">
          <molecule-browser />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { supabase } from '@/services/supabase'
import UserManagement from './UserManagement.vue'
import TaskMonitor from './TaskMonitor.vue'
import MoleculeBrowser from './MoleculeBrowser.vue'

const activeTab = ref('users')
const connectionStatus = ref('')

const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').single()
    
    if (error) throw error
    
    connectionStatus.value = '连接成功'
    ElMessage.success('Supabase连接测试成功')
  } catch (error) {
    connectionStatus.value = '连接失败'
    ElMessage.error('Supabase连接测试失败: ' + (error as Error).message)
  }
}
</script>

<style scoped>
.supabase-example {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>