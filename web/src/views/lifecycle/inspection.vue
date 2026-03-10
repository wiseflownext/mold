<template>
  <div class="lifecycle-inspection">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="模具编号">
          <el-input v-model="filter.moldNo" placeholder="搜索" clearable style="width:140px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="鉴定结果">
          <el-select v-model="filter.result" placeholder="全部" clearable style="width:120px">
            <el-option label="合格" value="合格" />
            <el-option label="不合格" value="不合格" />
            <el-option label="调整周期" value="调整周期" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="dialogVisible = true">新增鉴定</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="mold.moldNo" label="模具编号" width="130">
          <template #default="{ row }">{{ row.mold?.moldNo }}</template>
        </el-table-column>
        <el-table-column prop="date" label="鉴定日期" width="110">
          <template #default="{ row }">{{ formatDate(row.date) }}</template>
        </el-table-column>
        <el-table-column prop="result" label="鉴定结果" width="100" />
        <el-table-column prop="newCycleValue" label="新周期" width="90" align="right">
          <template #default="{ row }">{{ row.newCycleValue ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="nextDate" label="下次鉴定" width="110">
          <template #default="{ row }">{{ formatDate(row.nextDate) }}</template>
        </el-table-column>
        <el-table-column prop="inspector" label="鉴定人" width="100" />
        <el-table-column prop="user.name" label="录入人" width="100">
          <template #default="{ row }">{{ row.user?.name }}</template>
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

    <el-dialog v-model="dialogVisible" title="新增鉴定" width="480px" @close="resetForm">
      <el-form :model="form" label-width="100px">
        <el-form-item label="模具" required>
          <el-select v-model="form.moldId" filterable placeholder="选择模具" style="width:100%">
            <el-option v-for="m in moldOptions" :key="m.id" :label="m.moldNo" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="鉴定日期" required>
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="鉴定结果" required>
          <el-select v-model="form.result" placeholder="选择" style="width:100%">
            <el-option label="合格" value="合格" />
            <el-option label="不合格" value="不合格" />
            <el-option label="调整周期" value="调整周期" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.result === '调整周期'" label="新周期" required>
          <el-input-number v-model="form.newCycleValue" :min="0" placeholder="新周期值" style="width:100%" />
        </el-form-item>
        <el-form-item label="下次鉴定">
          <el-date-picker v-model="form.nextDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="鉴定人" required>
          <el-input v-model="form.inspector" placeholder="输入鉴定人" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMoldList, getInspections, createInspection } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const moldOptions = ref<any[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)

const filter = reactive({ moldNo: '', result: '' })
const form = reactive({
  moldId: undefined as number | undefined,
  date: '',
  result: '',
  newCycleValue: undefined as number | undefined,
  nextDate: '',
  inspector: '',
})

function formatDate(d: string | Date | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, pageSize: pageSize.value }
    if (filter.moldNo) params.moldNo = filter.moldNo
    if (filter.result) params.result = filter.result
    const res: any = await getInspections(params)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchList() }
function resetFilter() { filter.moldNo = ''; filter.result = ''; search() }

async function loadMolds() {
  const res: any = await getMoldList({ pageSize: 9999 })
  moldOptions.value = res.list || []
}

function resetForm() {
  form.moldId = undefined
  form.date = ''
  form.result = ''
  form.newCycleValue = undefined
  form.nextDate = ''
  form.inspector = ''
}

async function submit() {
  if (!form.moldId || !form.date || !form.result || !form.inspector) {
    ElMessage.warning('请填写必填项')
    return
  }
  if (form.result === '调整周期' && form.newCycleValue == null) {
    ElMessage.warning('调整周期时需填写新周期')
    return
  }
  submitting.value = true
  try {
    await createInspection({
      moldId: form.moldId,
      date: form.date,
      result: form.result,
      newCycleValue: form.result === '调整周期' ? form.newCycleValue : undefined,
      nextDate: form.nextDate || undefined,
      inspector: form.inspector,
    })
    ElMessage.success('已提交')
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadMolds()
  fetchList()
})
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
