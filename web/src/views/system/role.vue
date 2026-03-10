<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>角色列表</span>
          <el-button type="primary" size="small" @click="openAdd">新增角色</el-button>
        </div>
      </template>
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column prop="appMode" label="APP模式" width="100">
          <template #default="{ row }">{{ row.appMode === 'worker' ? '工人' : '管理员' }}</template>
        </el-table-column>
        <el-table-column prop="permissions" label="权限" min-width="200">
          <template #default="{ row }">
            <span class="perm-text">{{ row.permissions || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="编码" required>
          <el-input v-model="form.code" :disabled="isEdit" placeholder="如 admin" />
        </el-form-item>
        <el-form-item label="APP模式" required>
          <el-select v-model="form.appMode" placeholder="选择" style="width:100%">
            <el-option label="工人" value="worker" />
            <el-option label="管理员" value="manager" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限">
          <el-input v-model="form.permissions" type="textarea" :rows="4" placeholder="权限配置" />
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
import { ElMessage } from 'element-plus'
import { getRoles, createRole, updateRole } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const form = reactive({ name: '', code: '', appMode: 'worker', permissions: '' })

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getRoles()
    list.value = Array.isArray(res) ? res : []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  isEdit.value = false
  editId.value = null
  Object.assign(form, { name: '', code: '', appMode: 'worker', permissions: '' })
  dialogVisible.value = true
}

function openEdit(row: any) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, { name: row.name, code: row.code, appMode: row.appMode || 'worker', permissions: row.permissions || '' })
  dialogVisible.value = true
}

async function submitForm() {
  if (!form.name?.trim()) { ElMessage.warning('请输入名称'); return }
  if (!form.code?.trim()) { ElMessage.warning('请输入编码'); return }
  try {
    const data = { name: form.name.trim(), code: form.code.trim(), appMode: form.appMode, permissions: form.permissions?.trim() || '' }
    if (isEdit.value && editId.value) {
      await updateRole(editId.value, data)
      ElMessage.success('已更新')
    } else {
      await createRole(data)
      ElMessage.success('已新增')
    }
    dialogVisible.value = false
    fetchList()
  } catch (_) {}
}

onMounted(fetchList)
</script>

<style scoped>
.perm-text { font-size: 12px; word-break: break-all; }
</style>
