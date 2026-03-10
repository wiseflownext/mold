<template>
  <div class="repair-order">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="模具编号">
          <el-input v-model="filter.moldNo" placeholder="搜索" clearable style="width:140px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部" clearable style="width:120px">
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
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
        <el-table-column label="模具编号" width="140">
          <template #default="{ row }">{{ row.mold?.moldNo || '-' }}</template>
        </el-table-column>
        <el-table-column prop="description" label="问题描述" min-width="160" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报修人" width="100">
          <template #default="{ row }">{{ row.reporter?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="处理人" width="100">
          <template #default="{ row }">{{ row.handler?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="cost" label="费用" width="90" align="right" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="completedAt" label="完成时间" width="170">
          <template #default="{ row }">{{ formatTime(row.completedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          </template>
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

    <el-dialog v-model="editVisible" title="编辑工单" width="500px" @close="resetEditForm">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="状态">
          <el-select v-model="editForm.status" style="width:100%">
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人">
          <el-select v-model="editForm.handlerId" placeholder="选择处理人" clearable filterable style="width:100%">
            <el-option v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理描述">
          <el-input v-model="editForm.handleDesc" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="费用">
          <el-input-number v-model="editForm.cost" :min="0" :precision="2" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="editLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRepairOrders, updateRepairOrder, getUsers } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filter = reactive({ moldNo: '', status: '' })

const userOptions = ref<any[]>([])
const editVisible = ref(false)
const editLoading = ref(false)
const editId = ref<number>(0)
const editForm = reactive({ status: '', handlerId: undefined as number | undefined, handleDesc: '', cost: 0 })

function statusTag(s: string) {
  const m: Record<string, string> = { '待处理': 'danger', '处理中': 'warning', '已完成': 'success' }
  return m[s] || ''
}

function formatTime(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, pageSize: pageSize.value }
    if (filter.moldNo) params.moldNo = filter.moldNo
    if (filter.status) params.status = filter.status
    const res: any = await getRepairOrders(params)
    list.value = res.list || []
    total.value = res.total ?? 0
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchList() }
function resetFilter() { filter.moldNo = ''; filter.status = ''; search() }

function openEdit(row: any) {
  editId.value = row.id
  editForm.status = row.status || ''
  editForm.handlerId = row.handler?.id
  editForm.handleDesc = row.handleDesc || ''
  editForm.cost = row.cost ?? 0
  editVisible.value = true
}

function resetEditForm() {
  editId.value = 0
  editForm.status = ''
  editForm.handlerId = undefined
  editForm.handleDesc = ''
  editForm.cost = 0
}

async function submitEdit() {
  editLoading.value = true
  try {
    await updateRepairOrder(editId.value, {
      status: editForm.status,
      handlerId: editForm.handlerId,
      handleDesc: editForm.handleDesc,
      cost: editForm.cost,
    })
    ElMessage.success('保存成功')
    editVisible.value = false
    fetchList()
  } finally {
    editLoading.value = false
  }
}

onMounted(async () => {
  const res: any = await getUsers({ pageSize: 9999 })
  userOptions.value = Array.isArray(res) ? res : (res?.list || [])
  fetchList()
})
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
