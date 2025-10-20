<template>
  <div class="user-management">
    <el-button type="primary" @click="showAddDialog = true">添加用户</el-button>
    
    <el-table :data="users" style="width: 100%" class="mt-4">
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="role" label="角色">
        <template #default="scope">
          <el-tag :type="getRoleType(scope.row.role)">
            {{ scope.row.role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUser(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingUser ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.role">
            <el-option label="管理员" value="admin" />
            <el-option label="研究员" value="researcher" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dbService } from '@/services/supabase'

interface User {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'researcher' | 'viewer'
  created_at: string
}

const users = ref<User[]>([])
const showAddDialog = ref(false)
const editingUser = ref<User | null>(null)
const userForm = ref({
  email: '',
  name: '',
  role: 'researcher' as const
})

const getRoleType = (role: string) => {
  const types = {
    admin: 'danger',
    researcher: 'warning',
    viewer: 'info'
  }
  return types[role as keyof typeof types] || 'info'
}

const loadUsers = async () => {
  try {
    const data = await dbService.query<User>('users', {
      orderBy: { column: 'created_at', ascending: false }
    })
    users.value = data
  } catch (error) {
    ElMessage.error('加载用户失败: ' + (error as Error).message)
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  userForm.value = {
    email: user.email,
    name: user.name || '',
    role: user.role
  }
  showAddDialog.value = true
}

const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm('确定删除该用户吗？', '提示', {
      type: 'warning'
    })
    
    await dbService.delete('users', { id: user.id })
    ElMessage.success('用户删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除用户失败: ' + (error as Error).message)
    }
  }
}

const saveUser = async () => {
  try {
    if (editingUser.value) {
      await dbService.update('users', userForm.value, { id: editingUser.value.id })
      ElMessage.success('用户更新成功')
    } else {
      await dbService.insert('users', userForm.value)
      ElMessage.success('用户添加成功')
    }
    
    showAddDialog.value = false
    editingUser.value = null
    userForm.value = { email: '', name: '', role: 'researcher' }
    loadUsers()
  } catch (error) {
    ElMessage.error('保存用户失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>