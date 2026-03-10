<template>
  <div class="customer-list">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="名称">
          <el-input v-model="filter.name" placeholder="搜索" clearable style="width:180px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="openDialog()">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="pagedList" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="name" label="名称" width="140" />
        <el-table-column prop="shortName" label="简称" width="100" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="filteredList.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑客户' : '新增客户'" width="500" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="简称" prop="shortName">
          <el-input v-model="form.shortName" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const page = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const editId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const filter = reactive({ name: '' })

const form = reactive({
  name: '', shortName: '', contact: '', phone: '', address: '',
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

const filteredList = computed(() => {
  let arr = list.value
  if (filter.name) {
    const kw = filter.name.toLowerCase()
    arr = arr.filter((c: any) => (c.name || '').toLowerCase().includes(kw) || (c.shortName || '').toLowerCase().includes(kw))
  }
  return arr
})

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getCustomers()
    list.value = Array.isArray(res) ? res : (res?.list || [])
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1 }
function resetFilter() { filter.name = ''; page.value = 1 }

function openDialog(row?: any) {
  editId.value = row ? row.id : null
  if (row) {
    form.name = row.name || ''
    form.shortName = row.shortName || ''
    form.contact = row.contact || ''
    form.phone = row.phone || ''
    form.address = row.address || ''
  }
  dialogVisible.value = true
}

function resetForm() {
  form.name = ''
  form.shortName = ''
  form.contact = ''
  form.phone = ''
  form.address = ''
  editId.value = null
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editId.value) {
      await updateCustomer(editId.value, form)
      ElMessage.success('已更新')
    } else {
      await createCustomer(form)
      ElMessage.success('已新增')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除客户 ${row.name}？`, '提示', { type: 'warning' })
  await deleteCustomer(row.id)
  ElMessage.success('已删除')
  fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
