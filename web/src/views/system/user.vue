<template>
  <div>
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="姓名">
          <el-input v-model="filter.name" placeholder="搜索" clearable style="width:150px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filter.roleId" placeholder="全部" clearable style="width:120px">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="openAdd">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机" width="130" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">{{ row.role?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="420px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" :disabled="isEdit" placeholder="用户名" />
        </el-form-item>
        <el-form-item :label="isEdit ? '密码(选填)' : '密码'" :required="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="留空则不修改" show-password />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="form.phone" placeholder="手机号" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="form.roleId" placeholder="选择角色" style="width:100%">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const roles = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)

const filter = reactive({ name: '', roleId: undefined as number | undefined })
const form = reactive({ username: '', password: '', name: '', phone: '', roleId: undefined as number | undefined, status: 'enabled' })

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, pageSize: pageSize.value }
    if (filter.name) params.name = filter.name
    if (filter.roleId) params.roleId = filter.roleId
    const res: any = await getUsers(params)
    list.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchList() }
function resetFilter() { Object.assign(filter, { name: '', roleId: undefined }); search() }

function openAdd() {
  isEdit.value = false
  editId.value = null
  Object.assign(form, { username: '', password: '', name: '', phone: '', roleId: undefined, status: 'enabled' })
  dialogVisible.value = true
}

function openEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, { username: row.username, password: '', name: row.name, phone: row.phone || '', roleId: row.roleId, status: row.status || 'enabled' })
  dialogVisible.value = true
}

async function submitForm() {
  if (!form.username?.trim()) { ElMessage.warning('请输入用户名'); return }
  if (!form.name?.trim()) { ElMessage.warning('请输入姓名'); return }
  if (!form.roleId) { ElMessage.warning('请选择角色'); return }
  if (!isEdit.value && !form.password?.trim()) { ElMessage.warning('请输入密码'); return }
  try {
    const data: any = { username: form.username.trim(), name: form.name.trim(), phone: form.phone?.trim() || '', roleId: form.roleId, status: form.status }
    if (form.password?.trim()) data.password = form.password.trim()
    if (isEdit.value && editId.value) {
      await updateUser(editId.value, data)
      ElMessage.success('已更新')
    } else {
      await createUser(data)
      ElMessage.success('已新增')
    }
    dialogVisible.value = false
    fetchList()
  } catch (_) {}
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除用户 ${row.username}？`, '提示', { type: 'warning' })
  await deleteUser(row.id)
  ElMessage.success('已删除')
  fetchList()
}

onMounted(async () => {
  const res: any = await getRoles()
  roles.value = Array.isArray(res) ? res : []
  fetchList()
})
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
