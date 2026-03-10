<template>
  <div class="maintenance-record">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="模具编号">
          <el-input v-model="filter.moldNo" placeholder="搜索" clearable style="width:140px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker v-model="filter.dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width:240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="showAdd">新增保养记录</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column label="模具编号" width="140">
          <template #default="{ row }">{{ row.mold?.moldNo || '-' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="保养日期" width="120" />
        <el-table-column prop="content" label="保养内容" min-width="160" />
        <el-table-column prop="cost" label="费用" width="100" align="right" />
        <el-table-column label="操作人" width="100">
          <template #default="{ row }">{{ row.user?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
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

    <el-dialog v-model="addVisible" title="新增保养记录" width="480px" @close="resetAddForm">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="模具" required>
          <el-select v-model="addForm.moldId" placeholder="选择模具" filterable style="width:100%">
            <el-option v-for="m in moldOptions" :key="m.id" :label="m.moldNo" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="保养日期" required>
          <el-date-picker v-model="addForm.date" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="保养内容" required>
          <el-input v-model="addForm.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="费用">
          <el-input-number v-model="addForm.cost" :min="0" :precision="2" style="width:100%" />
        </el-form-item>
        <el-form-item label="下次保养日期">
          <el-date-picker v-model="addForm.nextDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd" :loading="addLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMaintenanceRecords, createMaintenance, getMoldList } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const moldOptions = ref<any[]>([])

const filter = reactive({ moldNo: '', dateRange: null as string[] | null })

const addVisible = ref(false)
const addLoading = ref(false)
const addForm = reactive({ moldId: undefined as number | undefined, date: '', content: '', cost: 0, nextDate: '' })

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, pageSize: pageSize.value }
    if (filter.moldNo) params.moldNo = filter.moldNo
    if (filter.dateRange?.length === 2) {
      params.dateFrom = filter.dateRange[0]
      params.dateTo = filter.dateRange[1]
    }
    const res: any = await getMaintenanceRecords(params)
    list.value = res.list || []
    total.value = res.total ?? 0
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchList() }
function resetFilter() { filter.moldNo = ''; filter.dateRange = null; search() }

function showAdd() {
  addVisible.value = true
}

function resetAddForm() {
  addForm.moldId = undefined
  addForm.date = ''
  addForm.content = ''
  addForm.cost = 0
  addForm.nextDate = ''
}

async function submitAdd() {
  if (!addForm.moldId || !addForm.date || !addForm.content) {
    ElMessage.warning('请填写模具、日期、保养内容')
    return
  }
  addLoading.value = true
  try {
    await createMaintenance({
      moldId: addForm.moldId,
      date: addForm.date,
      content: addForm.content,
      cost: addForm.cost,
      nextMaintenanceDate: addForm.nextDate || undefined,
    })
    ElMessage.success('新增成功')
    addVisible.value = false
    fetchList()
  } finally {
    addLoading.value = false
  }
}

onMounted(async () => {
  const res: any = await getMoldList({ pageSize: 9999 })
  moldOptions.value = res.list || []
  fetchList()
})
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
