# 药物研发平台 MCP 配置指南

## 概述

本文档介绍如何在CodeBuddy平台上配置药物研发平台的MCP（Model Context Protocol）服务器。

## 配置步骤

### 1. 安装依赖

```bash
# 安装项目依赖
npm install

# 安装MCP服务器依赖
cd mcp-server
npm install
```

### 2. 环境变量配置

确保以下环境变量已正确设置：

- `VITE_SUPABASE_URL`: Supabase项目URL
- `VITE_SUPABASE_KEY`: Supabase匿名密钥
- `SUPABASE_URL`: MCP服务器使用的Supabase URL
- `SUPABASE_KEY`: MCP服务器使用的Supabase密钥

### 3. MCP服务器配置

将 `mcp-config.json` 文件放置在CodeBuddy的MCP配置目录中。

### 4. 启动MCP服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## MCP工具功能

### 可用工具

1. **create_molecule_generation_task** - 创建分子生成任务
2. **create_optimization_task** - 创建多目标优化任务  
3. **create_screening_task** - 创建虚拟筛选任务
4. **get_task_status** - 获取任务状态
5. **search_molecules** - 搜索分子数据
6. **generate_vue_component** - 生成Vue组件代码

### 工具使用示例

```json
{
  "name": "create_molecule_generation_task",
  "arguments": {
    "name": "新型抗癌药物生成",
    "description": "基于深度学习的分子生成",
    "parameters": {
      "model": "GPT-Mol",
      "num_samples": 1000,
      "temperature": 0.8
    }
  }
}
```

## 项目结构

```
medicine-develop/
├── src/
│   ├── services/
│   │   └── supabase.ts          # Supabase客户端配置
│   ├── types/
│   │   └── supabase.ts          # 数据库类型定义
│   └── types/env.d.ts           # 环境变量类型定义
├── mcp-config.json              # MCP服务器配置
├── mcp-server.js               # MCP服务器实现
├── mcp-package.json            # MCP服务器依赖配置
└── README-mcp.md               # 本文档
```

## Supabase集成

### 数据库表结构

1. **users** - 用户管理
2. **molecule_generation_tasks** - 分子生成任务
3. **multi_objective_optimization_tasks** - 多目标优化任务
4. **virtual_screening_tasks** - 虚拟筛选任务
5. **molecules** - 分子数据
6. **models** - 模型管理

### 认证集成

项目使用Supabase进行用户认证和管理，支持：
- 用户注册/登录
- 角色权限管理（admin/researcher/viewer）
- JWT令牌认证

## 开发说明

### 技术栈

- **前端**: Vue 3 + TypeScript + Element Plus
- **后端服务**: Supabase (PostgreSQL + 实时订阅)
- **3D可视化**: 3Dmol.js
- **构建工具**: Vite

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 故障排除

### 常见问题

1. **Supabase连接失败**
   - 检查环境变量配置
   - 验证Supabase项目状态

2. **TypeScript类型错误**
   - 运行 `npm run build` 检查类型
   - 更新类型定义文件

3. **MCP服务器无法启动**
   - 检查Node.js版本（需要>=18.0.0）
   - 验证依赖安装完整性

### 获取帮助

如有问题，请检查：
- 控制台错误信息
- Supabase项目日志
- MCP服务器日志

## 许可证

MIT License