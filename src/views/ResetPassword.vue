<template>
  <div class="reset-password-container">
    <div class="reset-password-form">
      <h2>重置密码</h2>
      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-width="100px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="resetForm.email" placeholder="请输入注册邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleReset">
            发送重置链接
          </el-button>
          <el-button @click="$router.push('/login')">返回登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const resetFormRef = ref()
const loading = ref(false)

const resetForm = ref({
  email: ''
})

const resetRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleReset = async () => {
  if (!resetFormRef.value) return
  
  try {
    await resetFormRef.value.validate()
    loading.value = true
    
    // 调用Supabase重置密码功能
    const { error } = await authStore.supabase.auth.resetPasswordForEmail(
      resetForm.value.email,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    )
    
    if (error) throw error
    
    ElMessage.success('重置链接已发送到您的邮箱，请查收')
    resetForm.value.email = ''
  } catch (error: any) {
    ElMessage.error(error.message || '发送重置链接失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.reset-password-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.reset-password-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>