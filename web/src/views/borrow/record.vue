<template>
  <div class="borrow-record">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="模具编号">
          <el-input v-model="filter.moldNo" placeholder="搜索" clearable style="width:140px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filter.type" placeholder="全部" clearable style="width:100px">
            <el-option label="领用" value="领用" />
            <el-option label="归还" value="归还" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker v-model="filter.dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width:240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column label="模具编号" width="140">
          <template #default="{ row }">{{ row.mold?.moldNo || '-' }}</template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column prop="workshop" label="车间" width="100" />
        <el-table-column prop="machine" label="机台" width="100" />
        <el-table-column label="操作人" width="100">
          <template #default="{ row }">{{ row.user?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @update:current-page="(v: number) => { page = v; fetchList() }"
        @update:page-size="(v: number) => { pageSize = v; page = 1; fetchList() }"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getBorrowRecords } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filter = reactive({ moldNo: '', type: '', dateRange: null as string[] | null })

function formatTime(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, pageSize: pageSize.value }
    if (filter.moldNo) params.moldNo = filter.moldNo
    if (filter.type) params.type = filter.type
    if (filter.dateRange?.length === 2) {
      params.dateFrom = filter.dateRange[0]
      params.dateTo = filter.dateRange[1]
    }
    const res: any = await getBorrowRecords(params)
    list.value = res.list || []
    total.value = res.total ?? 0
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchList() }
function resetFilter() { filter.moldNo = ''; filter.type = ''; filter.dateRange = null; search() }

onMounted(fetchList)
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
