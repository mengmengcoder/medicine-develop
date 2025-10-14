<template>
  <div class="molecule-viewer">
    <div ref="viewerContainer" class="viewer-container" :style="containerStyle"></div>
    <div class="controls" v-if="showControls">
      <el-button-group>
        <el-button size="small" @click="resetView">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button size="small" @click="toggleStyle">
          <el-icon><View /></el-icon>
          样式
        </el-button>
        <el-button size="small" @click="toggleSpin">
          <el-icon><Refresh /></el-icon>
          {{ isSpinning ? '停止' : '旋转' }}
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'

interface Props {
  smiles: string
  width?: number
  height?: number
  showControls?: boolean
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 300,
  showControls: true,
  backgroundColor: 'white'
})

const viewerContainer = ref<HTMLElement>()
const currentStyle = ref('stick')
const isSpinning = ref(false)
let viewer: any = null
let spinInterval: number | null = null

const containerStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  border: '1px solid var(--el-border-color)',
  borderRadius: '4px',
  backgroundColor: props.backgroundColor
}))

onMounted(() => {
  initViewer()
})

watch(() => props.smiles, (newSmiles) => {
  if (newSmiles && viewer) {
    loadMolecule(newSmiles)
  }
})

onUnmounted(() => {
  if (spinInterval) {
    clearInterval(spinInterval)
  }
})

const initViewer = () => {
  // 这里原本应该使用 3Dmol.js，但为了避免依赖问题，我们创建一个模拟的分子查看器
  if (viewerContainer.value) {
    viewerContainer.value.innerHTML = `
      <div style="
        width: 100%; 
        height: 100%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        background: linear-gradient(45deg, #f0f9ff, #e0f2fe);
        color: #0369a1;
        font-size: 14px;
        text-align: center;
        flex-direction: column;
      ">
        <div style="font-size: 24px; margin-bottom: 8px;">🧬</div>
        <div>分子结构预览</div>
        <div style="font-size: 12px; margin-top: 4px; opacity: 0.7;">${props.smiles || '暂无SMILES数据'}</div>
      </div>
    `
  }
}

const loadMolecule = (smiles: string) => {
  // 模拟加载分子结构
  if (viewerContainer.value) {
    viewerContainer.value.innerHTML = `
      <div style="
        width: 100%; 
        height: 100%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        background: linear-gradient(45deg, #f0f9ff, #e0f2fe);
        color: #0369a1;
        font-size: 14px;
        text-align: center;
        flex-direction: column;
      ">
        <div style="font-size: 24px; margin-bottom: 8px;">🧬</div>
        <div>分子结构: ${currentStyle.value}</div>
        <div style="font-size: 12px; margin-top: 4px; opacity: 0.7;">${smiles}</div>
      </div>
    `
  }
}

const resetView = () => {
  if (props.smiles) {
    loadMolecule(props.smiles)
  }
}

const toggleStyle = () => {
  const styles = ['stick', 'sphere', 'cartoon', 'surface']
  const currentIndex = styles.indexOf(currentStyle.value)
  currentStyle.value = styles[(currentIndex + 1) % styles.length]
  
  if (props.smiles) {
    loadMolecule(props.smiles)
  }
}

const toggleSpin = () => {
  isSpinning.value = !isSpinning.value
  
  if (isSpinning.value) {
    spinInterval = setInterval(() => {
      // 模拟旋转效果
      if (viewerContainer.value) {
        const currentRotation = parseInt(viewerContainer.value.style.transform?.match(/rotate\((\d+)deg\)/)?.[1] || '0')
        viewerContainer.value.style.transform = `rotate(${currentRotation + 5}deg)`
      }
    }, 100)
  } else {
    if (spinInterval) {
      clearInterval(spinInterval)
      spinInterval = null
    }
    if (viewerContainer.value) {
      viewerContainer.value.style.transform = 'rotate(0deg)'
    }
  }
}
</script>

<style scoped>
.molecule-viewer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.viewer-container {
  position: relative;
  overflow: hidden;
}

.controls {
  display: flex;
  justify-content: center;
}
</style>