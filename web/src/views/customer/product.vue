<template>
  <div class="product-list">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="客户">
          <el-select v-model="filter.customerId" placeholder="全部" clearable filterable style="width:160px">
            <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="filter.name" placeholder="搜索" clearable style="width:160px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="openDialog()">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="name" label="产品名" width="160" />
        <el-table-column prop="model" label="型号" width="120" />
        <el-table-column prop="partNo" label="零件号" width="120" />
        <el-table-column label="所属客户" width="140">
          <template #default="{ row }">{{ row.customer?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑产品' : '新增产品'" width="500" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择" filterable style="width:100%">
            <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" />
        </el-form-item>
        <el-form-item label="零件号" prop="partNo">
          <el-input v-model="form.partNo" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getCustomers, getProducts, createProduct, updateProduct, deleteProduct } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const customers = ref<any[]>([])
const dialogVisible = ref(false)
const editId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const filter = reactive({ customerId: undefined as number | undefined, name: '' })

const form = reactive({
  customerId: undefined as number | undefined,
  name: '', model: '', partNo: '',
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  name: [{ required: true, message: '请输入产品名', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (filter.customerId) params.customerId = filter.customerId
    if (filter.name) params.name = filter.name
    const res: any = await getProducts(params)
    list.value = Array.isArray(res) ? res : (res?.list || [])
  } finally {
    loading.value = false
  }
}

async function fetchCustomers() {
  const res: any = await getCustomers()
  customers.value = Array.isArray(res) ? res : (res?.list || [])
}

function search() { fetchList() }
function resetFilter() { filter.customerId = undefined; filter.name = ''; fetchList() }

function openDialog(row?: any) {
  editId.value = row ? row.id : null
  if (row) {
    form.customerId = row.customerId ?? row.customer?.id
    form.name = row.name || ''
    form.model = row.model || ''
    form.partNo = row.partNo || ''
  }
  dialogVisible.value = true
}

function resetForm() {
  form.customerId = undefined
  form.name = ''
  form.model = ''
  form.partNo = ''
  editId.value = null
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editId.value) {
      await updateProduct(editId.value, form)
      ElMessage.success('已更新')
    } else {
      await createProduct(form)
      ElMessage.success('已新增')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除产品 ${row.name}？`, '提示', { type: 'warning' })
  await deleteProduct(row.id)
  ElMessage.success('已删除')
  fetchList()
}

onMounted(() => {
  fetchCustomers()
  fetchList()
})
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
