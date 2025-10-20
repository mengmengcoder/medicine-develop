# Netlify部署故障排除指南

## 问题：注册功能在Netlify上失效

### 症状
- 点击注册按钮后无响应
- 没有错误提示信息
- 邮箱没有收到验证邮件

### 立即解决方案

#### 1. 检查Supabase重定向URL配置（最重要！）

登录 [Supabase控制台](https://supabase.com/dashboard)：

1. 进入项目 `bfuevkijuwkqwzhoelpp`
2. 点击 **Authentication** → **URL Configuration**
3. 在 **Site URL** 中添加您的Netlify域名：
   ```
   https://your-site-name.netlify.app
   ```
4. 在 **Redirect URLs** 中添加：
   ```
   https://your-site-name.netlify.app/login
   https://your-site-name.netlify.app/reset-password
   ```
5. 点击 **Save**

#### 2. 检查Netlify环境变量

在Netlify控制台：
1. 进入站点设置
2. 点击 **Environment variables**
3. 确认以下变量已设置：
   ```
   VITE_SUPABASE_URL=https://bfuevkijuwkqwzhoelpp.supabase.co
   VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdWV2a2lqdXdrcXd6aG9lbHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Nzg2OTgsImV4cCI6MjA3NjQ1NDY5OH0.ZnU3K5wcYtQONFgIf68yyNFjfd7ZUVNlNuOtJ4RQlU4
   ```

#### 3. 启用浏览器调试

在Netlify站点打开开发者工具（F12）：
1. 切换到 **Console** 标签
2. 尝试注册，查看错误信息
3. 切换到 **Network** 标签，查看注册请求

### 详细诊断步骤

#### 步骤1：检查前端配置
```javascript
// 在浏览器控制台运行以下代码检查配置
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Current origin:', window.location.origin)
```

#### 步骤2：测试Supabase连接
```javascript
// 在浏览器控制台测试注册功能
const testEmail = 'test@example.com'
const testPassword = 'test123456'

const { supabase } = await import('https://esm.sh/@supabase/supabase-js')
const client = supabase.createClient(
  'https://bfuevkijuwkqwzhoelpp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdWV2a2lqdXdrcXd6aG9lbHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Nzg2OTgsImV4cCI6MjA3NjQ1NDY5OH0.ZnU3K5wcYtQONFgIf68yyNFjfd7ZUVNlNuOtJ4RQlU4'
)

const result = await client.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: {
    emailRedirectTo: window.location.origin + '/login'
  }
})

console.log('测试结果:', result)
```

#### 步骤3：检查Supabase日志
1. 登录Supabase控制台
2. 进入 **Monitoring** → **Logs**
3. 查看认证相关的日志信息

### 常见错误及解决方案

#### 错误1: "Invalid redirect_to URL"
**原因**: Netlify域名未添加到Supabase的重定向URL列表
**解决**: 按照上面的步骤1配置重定向URL

#### 错误2: 注册请求返回400错误
**原因**: 请求参数不正确或Supabase配置问题
**解决**: 
- 检查邮箱格式是否正确
- 检查密码是否符合要求（至少6位）
- 确认Supabase项目状态正常

#### 错误3: 注册成功但无邮箱
**原因**: 
- Supabase邮箱服务配置问题
- 邮件被标记为垃圾邮件
- 邮箱服务限制
**解决**:
- 检查垃圾邮件文件夹
- 在Supabase控制台配置SMTP
- 使用不同的邮箱服务商测试

#### 错误4: CORS错误
**原因**: 域名未在Supabase CORS配置中
**解决**: 在Supabase控制台添加Netlify域名到CORS配置

### 预防措施

1. **开发环境配置**
   - 本地开发时使用 `http://localhost:3000`
   - 生产环境使用Netlify域名

2. **环境变量管理**
   - 使用不同的环境变量文件
   - 确保构建时使用正确的环境

3. **错误处理**
   - 完善前端错误提示
   - 添加详细的日志记录

### 紧急恢复方案

如果问题无法立即解决：

1. **临时禁用邮箱验证**
   - 在Supabase控制台关闭邮箱验证
   - 用户注册后直接登录

2. **使用第三方认证**
   - 配置Google/GitHub OAuth
   - 减少对邮箱验证的依赖

3. **回滚部署**
   - 恢复到之前正常工作的版本
   - 逐步排查问题

完成以上配置后，重新部署Netlify站点并测试注册功能。