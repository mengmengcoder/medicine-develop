# 多属性协同优化与全流程智能药物研发平台

## 项目简介

基于Vue 3 + TypeScript的现代化药物研发平台，集成虚拟筛选、分子生成和多目标优化三大核心功能模块。

## 🚀 核心功能

### 1. 虚拟筛选模块
- 化合物库管理（支持SDF、MOL、SMILES格式）
- 多种筛选算法（分子对接、药效团匹配、相似性搜索、机器学习预测）
- 实时任务监控和结果分析
- 分子结构3D可视化

### 2. 分子生成模块
- 深度学习生成模型（VAE、GAN、Transformer、Diffusion）
- 基于目标属性的分子生成
- 生成质量评估（有效性、新颖性、相似性）

### 3. 多目标优化模块
- 多种优化算法（NSGA-II、MOPSO、MOEA/D、SPEA2）
- 帕累托前沿可视化
- 实时优化过程监控

## 🛠️ 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **UI**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **可视化**: ECharts + 3Dmol.js
- **HTTP**: Axios

## 🔧 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

```
src/
├── components/     # 通用组件
├── views/         # 页面视图
├── stores/        # 状态管理
├── services/      # API服务
├── utils/         # 工具函数
└── types/         # 类型定义
```

## 🌐 访问地址

- 开发环境: http://localhost:5173
- 生产环境: 根据部署配置

## 📝 开发规范

- 遵循Vue 3 Composition API
- 使用TypeScript进行类型约束
- 组件化开发，提高代码复用性
- 统一的代码格式化和ESLint规范