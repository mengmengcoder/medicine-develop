#!/usr/bin/env node

const { createServer } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const {
  CallRequest,
  ListResourcesRequest,
  ListToolsRequest,
  ReadResourceRequest,
} = require('@modelcontextprotocol/sdk/types.js')

// Supabase客户端配置
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase环境变量未配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

class DrugDiscoveryMCPServer {
  constructor() {
    this.server = createServer({
      name: 'drug-discovery-mcp',
      version: '1.0.0',
    }, {
      capabilities: {
        resources: {},
        tools: {
          listTools: {},
          callTool: {},
        },
      },
    })

    this.setupHandlers()
  }

  setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequest, async () => ({
      tools: [
        {
          name: 'create_molecule_generation_task',
          description: '创建分子生成任务',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: '任务名称' },
              description: { type: 'string', description: '任务描述' },
              parameters: { type: 'object', description: '生成参数' }
            },
            required: ['name', 'parameters']
          }
        },
        {
          name: 'create_optimization_task',
          description: '创建多目标优化任务',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: '任务名称' },
              objectives: { type: 'object', description: '优化目标' },
              algorithm: { type: 'string', description: '优化算法' }
            },
            required: ['name', 'objectives', 'algorithm']
          }
        },
        {
          name: 'create_screening_task',
          description: '创建虚拟筛选任务',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: '任务名称' },
              compound_library: { type: 'string', description: '化合物库' },
              target_protein: { type: 'string', description: '靶点蛋白' }
            },
            required: ['name', 'compound_library', 'target_protein']
          }
        },
        {
          name: 'get_task_status',
          description: '获取任务状态',
          inputSchema: {
            type: 'object',
            properties: {
              task_id: { type: 'string', description: '任务ID' },
              task_type: { type: 'string', description: '任务类型' }
            },
            required: ['task_id', 'task_type']
          }
        },
        {
          name: 'search_molecules',
          description: '搜索分子数据',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: '搜索查询' },
              limit: { type: 'number', description: '结果数量限制' }
            },
            required: ['query']
          }
        },
        {
          name: 'generate_vue_component',
          description: '生成Vue组件代码',
          inputSchema: {
            type: 'object',
            properties: {
              component_name: { type: 'string', description: '组件名称' },
              component_type: { type: 'string', description: '组件类型' },
              features: { type: 'array', description: '功能特性' }
            },
            required: ['component_name', 'component_type']
          }
        }
      ]
    }))

    // 处理工具调用
    this.server.setRequestHandler(CallRequest, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'create_molecule_generation_task':
            return await this.createMoleculeGenerationTask(args)
          case 'create_optimization_task':
            return await this.createOptimizationTask(args)
          case 'create_screening_task':
            return await this.createScreeningTask(args)
          case 'get_task_status':
            return await this.getTaskStatus(args)
          case 'search_molecules':
            return await this.searchMolecules(args)
          case 'generate_vue_component':
            return await this.generateVueComponent(args)
          default:
            throw new Error(`未知工具: ${name}`)
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `错误: ${error.message}`
          }],
          isError: true
        }
      }
    })
  }

  // 创建分子生成任务
  async createMoleculeGenerationTask(args) {
    const { name, description, parameters } = args
    
    const { data, error } = await supabase
      .from('molecule_generation_tasks')
      .insert({
        name,
        description: description || '',
        parameters,
        status: 'pending',
        user_id: 'system' // 系统用户
      })
      .select()

    if (error) throw error

    return {
      content: [{
        type: 'text',
        text: `分子生成任务创建成功，任务ID: ${data[0].id}`
      }]
    }
  }

  // 创建优化任务
  async createOptimizationTask(args) {
    const { name, objectives, algorithm } = args
    
    const { data, error } = await supabase
      .from('multi_objective_optimization_tasks')
      .insert({
        name,
        objectives,
        algorithm,
        status: 'pending',
        user_id: 'system'
      })
      .select()

    if (error) throw error

    return {
      content: [{
        type: 'text',
        text: `多目标优化任务创建成功，任务ID: ${data[0].id}`
      }]
    }
  }

  // 创建筛选任务
  async createScreeningTask(args) {
    const { name, compound_library, target_protein } = args
    
    const { data, error } = await supabase
      .from('virtual_screening_tasks')
      .insert({
        name,
        compound_library,
        target_protein,
        status: 'pending',
        user_id: 'system'
      })
      .select()

    if (error) throw error

    return {
      content: [{
        type: 'text',
        text: `虚拟筛选任务创建成功，任务ID: ${data[0].id}`
      }]
    }
  }

  // 获取任务状态
  async getTaskStatus(args) {
    const { task_id, task_type } = args
    
    let tableName
    switch (task_type) {
      case 'molecule_generation':
        tableName = 'molecule_generation_tasks'
        break
      case 'optimization':
        tableName = 'multi_objective_optimization_tasks'
        break
      case 'screening':
        tableName = 'virtual_screening_tasks'
        break
      default:
        throw new Error(`未知任务类型: ${task_type}`)
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', task_id)
      .single()

    if (error) throw error

    return {
      content: [{
        type: 'text',
        text: `任务状态: ${data.status}, 创建时间: ${data.created_at}`
      }]
    }
  }

  // 搜索分子
  async searchMolecules(args) {
    const { query, limit = 10 } = args
    
    const { data, error } = await supabase
      .from('molecules')
      .select('*')
      .ilike('smiles', `%${query}%`)
      .limit(limit)

    if (error) throw error

    return {
      content: [{
        type: 'text',
        text: `找到 ${data.length} 个分子:\n${data.map(m => `- ${m.smiles}`).join('\n')}`
      }]
    }
  }

  // 生成Vue组件代码
  async generateVueComponent(args) {
    const { component_name, component_type, features = [] } = args
    
    let template = ''
    
    switch (component_type) {
      case 'data_table':
        template = this.generateDataTableComponent(component_name, features)
        break
      case 'molecule_viewer':
        template = this.generateMoleculeViewerComponent(component_name, features)
        break
      case 'task_monitor':
        template = this.generateTaskMonitorComponent(component_name, features)
        break
      default:
        template = this.generateBasicComponent(component_name, features)
    }

    return {
      content: [{
        type: 'text',
        text: `生成的Vue组件代码:\n\`\`\`vue\n${template}\n\`\`\``
      }]
    }
  }

  generateDataTableComponent(name, features) {
    return `<template>
  <div class="${name.toLowerCase()}">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="created_at" label="创建时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="handleView(scope.row)">查看</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface TableItem {
  id: string
  name: string
  status: string
  created_at: string
}

const tableData = ref<TableItem[]>([])

onMounted(() => {
  loadData()
})

const loadData = async () => {
  // 加载数据逻辑
}

const handleView = (row: TableItem) => {
  console.log('查看:', row)
}

const handleDelete = (row: TableItem) => {
  console.log('删除:', row)
}
</script>

<style scoped>
.${name.toLowerCase()} {
  padding: 20px;
}
</style>`
  }

  generateMoleculeViewerComponent(name, features) {
    return `<template>
  <div class="${name.toLowerCase()}">
    <div class="viewer-container">
      <div id="molecule-viewer"></div>
    </div>
    <div class="properties-panel">
      <h3>分子属性</h3>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="SMILES">{{ moleculeData.smiles }}</el-descriptions-item>
        <el-descriptions-item label="分子量">{{ moleculeData.molecular_weight }}</el-descriptions-item>
        <el-descriptions-item label="LogP">{{ moleculeData.logp }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MoleculeData {
  smiles: string
  molecular_weight: number
  logp: number
}

const moleculeData = ref<MoleculeData>({
  smiles: '',
  molecular_weight: 0,
  logp: 0
})

onMounted(() => {
  initViewer()
})

const initViewer = () => {
  // 初始化3D分子查看器
}

const loadMolecule = (smiles: string) => {
  moleculeData.value.smiles = smiles
  // 加载分子数据
}
</script>

<style scoped>
.${name.toLowerCase()} {
  display: flex;
  height: 400px;
}

.viewer-container {
  flex: 1;
  border: 1px solid #ddd;
}

.properties-panel {
  width: 300px;
  padding: 20px;
  border-left: 1px solid #ddd;
}
</style>`
  }

  generateTaskMonitorComponent(name, features) {
    return `<template>
  <div class="${name.toLowerCase()}">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务监控</span>
          <el-button type="primary" @click="refresh">刷新</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="运行中" name="running">
          <task-list :tasks="runningTasks" />
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <task-list :tasks="completedTasks" />
        </el-tab-pane>
        <el-tab-pane label="失败" name="failed">
          <task-list :tasks="failedTasks" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TaskList from './TaskList.vue'

interface Task {
  id: string
  name: string
  status: string
  progress: number
  created_at: string
}

const activeTab = ref('running')
const runningTasks = ref<Task[]>([])
const completedTasks = ref<Task[]>([])
const failedTasks = ref<Task[]>([])

onMounted(() => {
  loadTasks()
})

const loadTasks = async () => {
  // 加载任务数据
}

const refresh = () => {
  loadTasks()
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>`
  }

  generateBasicComponent(name, features) {
    return `<template>
  <div class="${name.toLowerCase()}">
    <h2>${name} 组件</h2>
    <p>这是一个基本的Vue 3组件模板</p>
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
.${name.toLowerCase()} {
  padding: 20px;
}
</style>`
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Drug Discovery MCP服务器已启动')
  }
}

// 启动服务器
const server = new DrugDiscoveryMCPServer()
server.run().catch(console.error)