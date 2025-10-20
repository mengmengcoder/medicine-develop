# Netlify 部署指南

## 1. 环境变量配置

在Netlify控制台中设置以下环境变量：

### 必需的环境变量
```
VITE_SUPABASE_URL=https://bfuevkijuwkqwzhoelpp.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdWV2a2lqdXdrcXd6aG9lbHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Nzg2OTgsImV4cCI6MjA3NjQ1NDY5OH0.ZnU3K5wcYtQONFgIf68yyNFjfd7ZUVNlNuOtJ4RQlU4
```

### 可选的环境变量
```
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ENABLE_DEV_TOOLS=false
```

## 2. 部署步骤

### 方法一：通过Git仓库自动部署
1. 将代码推送到GitHub/GitLab/Bitbucket
2. 登录 [Netlify](https://netlify.com)
3. 点击 "New site from Git"
4. 选择您的代码仓库
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 在 "Advanced build settings" 中添加环境变量
7. 点击 "Deploy site"

### 方法二：手动部署
1. 本地构建项目：
   ```bash
   npm run build
   ```
2. 将 `dist` 文件夹拖拽到 Netlify 的部署区域
3. 在站点设置中添加环境变量

## 3. 环境变量设置位置

在Netlify控制台中：
1. 进入您的站点
2. 点击 "Site settings"
3. 选择 "Environment variables"
4. 点击 "Add a variable"
5. 添加上述环境变量

## 4. 域名配置（可选）

1. 在站点设置中选择 "Domain management"
2. 添加自定义域名
3. 配置DNS记录

## 5. 功能分支部署

要为不同分支设置不同环境变量：
1. 在 "Environment variables" 页面
2. 点击 "Edit variables"
3. 为特定分支设置不同的变量值

## 6. 部署检查清单

- [ ] 环境变量已正确设置
- [ ] 构建命令成功执行
- [ ] SPA路由重定向配置正确
- [ ] 自定义域名（如需要）已配置
- [ ] HTTPS证书已自动生成

## 7. 故障排除

### 常见问题

1. **环境变量未生效**
   - 检查变量名是否正确（区分大小写）
   - 重新部署站点

2. **路由404错误**
   - 确保 `netlify.toml` 中的重定向规则正确
   - 检查SPA配置

3. **构建失败**
   - 检查Node.js版本兼容性
   - 查看构建日志中的具体错误

### 查看部署日志

在Netlify控制台的 "Deploys" 标签页可以查看详细的构建和部署日志。

## 8. 安全建议

- 不要将环境变量提交到代码仓库
- 使用Netlify的环境变量管理功能
- 定期更新Supabase密钥
- 启用自动HTTPS