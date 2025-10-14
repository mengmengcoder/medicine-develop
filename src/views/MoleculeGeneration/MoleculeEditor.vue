<template>
  <div class="molecule-editor">
    <el-card class="editor-card">
      <template #header>
        <div class="card-header">
          <span>分子编辑器</span>
          <div>
            <el-button type="primary" :icon="Plus" @click="addAtom">添加原子</el-button>
            <el-button type="success" :icon="Check" @click="validateMolecule">验证</el-button>
            <el-button type="warning" :icon="Refresh" @click="resetEditor">重置</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="16">
          <div class="editor-area">
            <div class="canvas-container">
              <div class="placeholder-canvas">
                <div class="canvas-content">
                  <el-icon size="48"><Edit /></el-icon>
                  <div>分子编辑画布</div>
                  <div class="hint">这里将显示3D分子编辑界面</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="properties-panel">
            <el-card>
              <template #header>
                <span>分子属性</span>
              </template>
              
              <el-form :model="molecule" label-width="100px">
                <el-form-item label="SMILES">
                  <el-input v-model="molecule.smiles" placeholder="输入SMILES表达式" />
                </el-form-item>
                <el-form-item label="分子式">
                  <el-input v-model="molecule.formula" readonly />
                </el-form-item>
                <el-form-item label="分子量">
                  <el-input v-model="molecule.molecularWeight" readonly />
                </el-form-item>
                <el-form-item label="LogP">
                  <el-input v-model="molecule.logP" readonly />
                </el-form-item>
                <el-form-item label="TPSA">
                  <el-input v-model="molecule.tpsa" readonly />
                </el-form-item>
              </el-form>
            </el-card>
            
            <el-card class="tools-panel">
              <template #header>
                <span>编辑工具</span>
              </template>
              
              <div class="tool-buttons">
                <el-button-group>
                  <el-button :icon="CirclePlus" @click="addBond">添加键</el-button>
                  <el-button :icon="Scissor" @click="cutBond">切断键</el-button>
                  <el-button :icon="Delete" @click="deleteAtom">删除原子</el-button>
                </el-button-group>
              </div>
              
              <div class="atom-palette">
                <div class="palette-title">原子调色板</div>
                <div class="atom-buttons">
                  <el-button v-for="atom in atoms" :key="atom" size="small" @click="selectAtom(atom)">
                    {{ atom }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Check, Refresh, Edit, CirclePlus, Scissor, Delete } from '@element-plus/icons-vue'

const molecule = ref({
  smiles: '',
  formula: 'C?H?O?N?',
  molecularWeight: '0.00',
  logP: '0.00',
  tpsa: '0.00'
})

const atoms = ref(['C', 'H', 'O', 'N', 'S', 'P', 'F', 'Cl', 'Br', 'I'])

const addAtom = () => {
  ElMessage.info('添加原子功能')
}

const validateMolecule = () => {
  ElMessage.info('验证分子结构')
}

const resetEditor = () => {
  molecule.value = {
    smiles: '',
    formula: 'C?H?O?N?',
    molecularWeight: '0.00',
    logP: '0.00',
    tpsa: '0.00'
  }
  ElMessage.success('编辑器已重置')
}

const addBond = () => {
  ElMessage.info('添加化学键')
}

const cutBond = () => {
  ElMessage.info('切断化学键')
}

const deleteAtom = () => {
  ElMessage.info('删除原子')
}

const selectAtom = (atom: string) => {
  ElMessage.info(`选择原子: ${atom}`)
}
</script>

<style scoped>
.molecule-editor {
  padding: 20px;
}

.editor-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-area {
  height: 600px;
}

.canvas-container {
  height: 100%;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-canvas {
  text-align: center;
  color: #999;
}

.canvas-content {
  padding: 40px;
}

.hint {
  font-size: 14px;
  margin-top: 10px;
}

.properties-panel {
  height: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tools-panel {
  flex: 1;
}

.tool-buttons {
  margin-bottom: 20px;
}

.atom-palette {
  margin-top: 20px;
}

.palette-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.atom-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
</style>