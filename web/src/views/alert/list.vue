<template>
  <div class="alert-list">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="模具编号">
          <el-input v-model="filter.moldNo" placeholder="搜索" clearable style="width:140px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="告警类型">
          <el-select v-model="filter.type" placeholder="全部" clearable style="width:140px">
            <el-option label="寿命预警" value="life_warning" />
            <el-option label="保养到期" value="maintenance_due" />
            <el-option label="使用异常" value="usage_abnormal" />
            <el-option label="鉴定到期" value="inspection_due" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部" clearable style="width:100px">
            <el-option label="未处理" value="未处理" />
            <el-option label="已处理" value="已处理" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="mold.moldNo" label="模具编号" width="130">
          <template #default="{ row }">{{ row.mold?.moldNo }}</template>
        </el-table-column>
        <el-table-column prop="type" label="告警类型" width="120">
          <template #default="{ row }">{{ typeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="message" label="告警内容" min-width="180" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === '已处理' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="handledAt" label="处理时间" width="170">
          <template #default="{ row }">{{ formatDate(row.handledAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === '未处理'" size="small" type="primary" @click="handleRow(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @change="fetchList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAlerts, handleAlert } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filter = reactive({ moldNo: '', type: '', status: '' })

const typeMap: Record<string, string> = {
  life_warning: '寿命预警',
  maintenance_due: '保养到期',
  usage_abnormal: '使用异常',
  inspection_due: '鉴定到期',
}

function typeLabel(t: string) { return typeMap[t] || t }
function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, pageSize: pageSize.value }
    if (filter.moldNo) params.moldNo = filter.moldNo
    if (filter.type) params.type = filter.type
    if (filter.status) params.status = filter.status
    const res: any = await getAlerts(params)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchList() }
function resetFilter() { filter.moldNo = ''; filter.type = ''; filter.status = ''; search() }

async function handleRow(row: any) {
  await handleAlert(row.id)
  ElMessage.success('已处理')
  fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
