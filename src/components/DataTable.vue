<template>
  <div class="data-table">
    <el-table
      ref="tableRef"
      :data="paginatedData"
      v-loading="loading"
      :height="height"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
        :reserve-selection="true"
      />
      
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :sortable="column.sortable"
        :formatter="column.formatter"
        :show-overflow-tooltip="true"
      >
        <template #default="scope" v-if="column.slot">
          <slot :name="column.slot" :row="scope.row" :column="column" :index="scope.$index" />
        </template>
      </el-table-column>
      
      <el-table-column
        v-if="showActions"
        label="操作"
        :width="actionWidth"
        fixed="right"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :index="scope.$index">
            <el-button size="small" type="primary" @click="$emit('view', scope.row)">
              查看
            </el-button>
            <el-button size="small" @click="$emit('edit', scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="$emit('delete', scope.row)">
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="filteredData.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface TableColumn {
  prop: string
  label: string
  width?: number
  minWidth?: number
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => string
  slot?: string
}

interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  height?: string | number
  selectable?: boolean
  showActions?: boolean
  actionWidth?: number
  showPagination?: boolean
  pageSize?: number
  pageSizes?: number[]
  searchText?: string
  filterFn?: (item: any, searchText: string) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 'auto',
  selectable: false,
  showActions: true,
  actionWidth: 200,
  showPagination: true,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  searchText: '',
  filterFn: (item: any, searchText: string) => {
    return JSON.stringify(item).toLowerCase().includes(searchText.toLowerCase())
  }
})

const emit = defineEmits(['selection-change', 'sort-change', 'view', 'edit', 'delete'])

const tableRef = ref()
const currentPage = ref(1)
const pageSize = ref(props.pageSize)
const sortField = ref('')
const sortOrder = ref('')

// 过滤后的数据
const filteredData = computed(() => {
  if (!props.searchText) return props.data
  
  return props.data.filter(item => 
    props.filterFn(item, props.searchText)
  )
})

// 排序后的数据
const sortedData = computed(() => {
  if (!sortField.value) return filteredData.value
  
  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]
    
    if (sortOrder.value === 'ascending') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
})

// 分页后的数据
const paginatedData = computed(() => {
  if (!props.showPagination) return sortedData.value
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})

// 监听搜索文本变化，重置到第一页
watch(() => props.searchText, () => {
  currentPage.value = 1
})

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSortChange = ({ prop, order }: { prop: string, order: string }) => {
  sortField.value = prop
  sortOrder.value = order
  emit('sort-change', { prop, order })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 暴露方法
defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => 
    tableRef.value?.toggleRowSelection(row, selected),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row)
})
</script>

<style scoped>
.data-table {
  background: var(--el-bg-color);
  border-radius: 6px;
  overflow: hidden;
}

.table-footer {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
}

:deep(.el-table__header) {
  background: var(--el-fill-color-lighter);
}

:deep(.el-table__row:hover) {
  background: var(--el-fill-color-light);
}
</style>