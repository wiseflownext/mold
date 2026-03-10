<template>
  <div class="alert-rule">
    <el-card>
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="type" label="规则类型" width="140">
          <template #default="{ row }">{{ typeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="threshold" label="阈值" min-width="200">
          <template #default="{ row }">{{ row.threshold }}</template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="handleEnabledChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editVisible" title="编辑规则" width="420px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="规则类型">
          <el-input v-model="editForm.type" disabled />
        </el-form-item>
        <el-form-item label="阈值">
          <el-input v-model="editForm.threshold" type="textarea" :rows="3" placeholder="JSON格式" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="editForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAlertRules, updateAlertRule } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const editVisible = ref(false)
const saving = ref(false)

const editForm = reactive({ id: 0, type: '', threshold: '', enabled: true })

const typeMap: Record<string, string> = {
  life_warning: '寿命预警',
  maintenance_due: '保养到期',
  usage_abnormal: '使用异常',
  inspection_due: '鉴定到期',
}

function typeLabel(t: string) { return typeMap[t] || t }

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getAlertRules()
    list.value = Array.isArray(res) ? res : []
  } finally {
    loading.value = false
  }
}

function openEdit(row: any) {
  editForm.id = row.id
  editForm.type = row.type
  editForm.threshold = row.threshold
  editForm.enabled = row.enabled
  editVisible.value = true
}

async function handleEnabledChange(row: any) {
  try {
    await updateAlertRule(row.id, { enabled: row.enabled })
    ElMessage.success('已更新')
  } catch {
    row.enabled = !row.enabled
  }
}

async function saveEdit() {
  try {
    JSON.parse(editForm.threshold)
  } catch {
    ElMessage.warning('阈值需为有效的JSON格式')
    return
  }
  saving.value = true
  try {
    await updateAlertRule(editForm.id, { threshold: editForm.threshold, enabled: editForm.enabled })
    ElMessage.success('已保存')
    editVisible.value = false
    fetchList()
  } finally {
    saving.value = false
  }
}

onMounted(fetchList)
</script>
