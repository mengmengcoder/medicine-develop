<template>
  <div class="user-avatar">
    <el-dropdown @command="handleCommand">
      <span class="user-info">
        <el-avatar :size="32" :src="userAvatar" class="avatar">
          {{ userInitials }}
        </el-avatar>
        <span class="user-name">{{ user?.name || user?.email }}</span>
        <el-icon><arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile">
            <el-icon><user /></el-icon>
            个人信息
          </el-dropdown-item>
          <el-dropdown-item command="settings" divided>
            <el-icon><setting /></el-icon>
            账户设置
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <el-icon><switch-button /></el-icon>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 个人信息对话框 -->
    <el-dialog
      v-model="showProfileDialog"
      title="个人信息"
      width="500px"
    >
      <el-form :model="profileForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-tag :type="getRoleType(profileForm.role)">
            {{ profileForm.role }}
          </el-tag>
        </el-form-item>
        <el-form-item label="注册时间">
          <span>{{ formatDate(profileForm.created_at) }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProfileDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Setting, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showProfileDialog = ref(false)
const profileForm = ref({
  name: '',
  email: '',
  role: '' as 'admin' | 'researcher' | 'viewer',
  created_at: ''
})

const user = computed(() => authStore.user)
const userAvatar = computed(() => null) // 可以集成Gravatar或其他头像服务
const userInitials = computed(() => {
  if (!user.value?.name) return user.value?.email?.charAt(0).toUpperCase() || 'U'
  return user.value.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
})

const getRoleType = (role: string) => {
  const types = {
    admin: 'danger',
    researcher: 'warning',
    viewer: 'info'
  }
  return types[role as keyof typeof types] || 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      showProfileDialog.value = true
      if (user.value) {
        profileForm.value = { ...user.value }
      }
      break
    case 'settings':
      ElMessage.info('账户设置功能开发中')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          type: 'warning'
        })
        await authStore.logout()
      } catch (error) {
        // 用户取消
      }
      break
  }
}

onMounted(() => {
  // 初始化用户信息
  if (user.value) {
    profileForm.value = { ...user.value }
  }
})
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--el-fill-color-light);
}

.avatar {
  background-color: var(--el-color-primary);
  color: white;
  font-weight: bold;
}

.user-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
}
</style>