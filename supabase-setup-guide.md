# Supabase 数据库设置指南

## 数据库创建步骤

### 1. 登录 Supabase 控制台
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目 `bfuevkijuwkqwzhoelpp`

### 2. 执行 SQL 脚本
1. 进入 **SQL Editor** 页面
2. 复制 `supabase-schema.sql` 文件内容
3. 点击 **Run** 执行整个脚本

### 3. 验证表结构创建
执行完成后，检查以下表是否创建成功：
- ✅ `users` - 用户表
- ✅ `molecule_generation_tasks` - 分子生成任务表
- ✅ `multi_objective_optimization_tasks` - 多目标优化任务表
- ✅ `virtual_screening_tasks` - 虚拟筛选任务表
- ✅ `molecules` - 分子数据表
- ✅ `models` - 模型管理表
- ✅ `task_logs` - 任务日志表
- ✅ `files` - 文件存储表

### 4. 配置认证设置
1. 进入 **Authentication** → **Settings**
2. 配置以下设置：
   - **Site URL**: 您的应用域名
   - **Enable email confirmations**: 根据需求启用
   - **JWT Expiry**: 设置合适的过期时间

### 5. 配置存储桶（可选）
如果需要文件上传功能：
1. 进入 **Storage** → **Buckets**
2. 创建以下存储桶：
   - `molecules` - 分子结构文件
   - `models` - AI模型文件
   - `uploads` - 用户上传文件

## 数据库架构说明

### 核心表关系
```
users (1) ←→ (N) molecule_generation_tasks (1) ←→ (N) molecules
                ↆ
                (N) multi_objective_optimization_tasks
                ↆ
                (N) virtual_screening_tasks
```

### 表字段说明

#### 1. 用户表 (users)
- `id`: 用户唯一标识 (UUID)
- `email`: 邮箱地址（唯一）
- `name`: 用户姓名
- `role`: 用户角色 (admin/researcher/viewer)

#### 2. 任务表通用字段
- `status`: 任务状态 (pending/running/completed/failed)
- `parameters`: 任务参数 (JSON格式)
- `results`: 任务结果 (JSON格式)

#### 3. 分子表 (molecules)
- `smiles`: 分子SMILES表示
- `properties`: 分子属性 (分子量、LogP等)
- `structure_data`: 3D结构数据

## 安全配置

### 行级安全 (RLS)
所有表都已启用RLS，策略包括：
- 用户只能查看和操作自己的数据
- 管理员可以查看所有数据
- 防止越权访问

### 索引优化
为常用查询字段创建了索引：
- 用户邮箱、角色
- 任务状态、用户ID
- 分子SMILES搜索

## 测试数据

脚本已插入示例数据：
- 3个测试用户（admin/researcher/viewer）
- 3个AI模型（生成/优化/筛选）

## 后续步骤

### 1. 验证连接
使用前端应用测试数据库连接：
```bash
npm run dev
```

### 2. 监控性能
在Supabase控制台监控：
- 查询性能
- 存储使用情况
- 并发连接数

### 3. 备份策略
设置定期数据库备份：
- 进入 **Settings** → **Backups**
- 配置自动备份计划

## 故障排除

### 常见问题

1. **表创建失败**
   - 检查SQL语法错误
   - 确认有足够的权限

2. **RLS策略不生效**
   - 验证认证配置
   - 检查JWT令牌格式

3. **查询性能慢**
   - 使用Explain分析查询计划
   - 考虑添加更多索引

### 技术支持
- [Supabase 文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- 项目 README 文件