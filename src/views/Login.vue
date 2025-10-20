<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>药物研发平台</h2>
        <p>多属性协同优化与全流程智能药物研发</p>
      </div>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="email">
              <el-input
                v-model="loginForm.email"
                placeholder="请输入邮箱"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
              <el-link type="primary" class="forgot-password" @click="showForgotPassword = true">
                忘记密码？
              </el-link>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-button"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="login-form"
            @keyup.enter="handleRegister"
          >
            <el-form-item prop="name">
              <el-input
                v-model="registerForm.name"
                placeholder="请输入姓名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
                size="large"
                :prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码（至少6位）"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="registerLoading"
                class="login-button"
                @click="handleRegister"
              >
                {{ registerLoading ? '注册中...' : '注册' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="showForgotPassword"
      title="重置密码"
      width="400px"
    >
      <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef">
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="forgotForm.email" placeholder="请输入注册邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForgotPassword = false">取消</el-button>
        <el-button type="primary" @click="handleForgotPassword">发送重置邮件</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const forgotFormRef = ref<FormInstance>()
const loading = ref(false)
const registerLoading = ref(false)
const showForgotPassword = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const forgotForm = reactive({
  email: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const registerRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true
        await authStore.login(loginForm.email, loginForm.password)
        ElMessage.success('登录成功')
        router.push('/dashboard')
      }
    })
  } catch (error) {
    ElMessage.error((error as Error).message)
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate(async (valid) => {
      if (valid) {
        registerLoading.value = true
        const result = await authStore.register(registerForm.email, registerForm.password, {
          name: registerForm.name
        })
        
        // 检查注册结果
        if (result?.user) {
          if (result.user.identities && result.user.identities.length === 0) {
            // 用户已存在
            ElMessage.warning('该邮箱已被注册，请直接登录')
            activeTab.value = 'login'
          } else if (result.user.confirmed_at) {
            // 邮箱已验证，直接跳转
            ElMessage.success('注册成功！正在跳转...')
            await authStore.login(registerForm.email, registerForm.password)
            router.push('/dashboard')
          } else {
            // 需要邮箱验证
            ElMessage.success('注册成功！请检查邮箱验证邮件')
            activeTab.value = 'login'
          }
        } else {
          ElMessage.success('注册请求已发送，请检查邮箱')
        }
        
        // 清空注册表单
        Object.assign(registerForm, {
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
      }
    })
  } catch (error: any) {
    console.error('注册错误详情:', error)
    
    // 更详细的错误提示
    if (error.message?.includes('User already registered')) {
      ElMessage.error('该邮箱已被注册，请直接登录或使用其他邮箱')
    } else if (error.message?.includes('Invalid email')) {
      ElMessage.error('邮箱格式不正确，请检查后重试')
    } else if (error.message?.includes('Password should be at least')) {
      ElMessage.error('密码强度不足，请使用更复杂的密码')
    } else if (error.message?.includes('Email rate limit')) {
      ElMessage.error('发送邮件过于频繁，请稍后再试')
    } else {
      ElMessage.error(error.message || '注册失败，请检查网络连接后重试')
    }
  } finally {
    registerLoading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!forgotFormRef.value) return
  
  try {
    await forgotFormRef.value.validate(async (valid) => {
      if (valid) {
        await authStore.forgotPassword(forgotForm.email)
        ElMessage.success('重置密码邮件已发送，请检查邮箱')
        showForgotPassword.value = false
        
        // 清空表单
        forgotForm.email = ''
      }
    })
  } catch (error) {
    ElMessage.error((error as Error).message)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;  
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #409EFF;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}
</style>