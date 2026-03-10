<template>
  <div class="maintenance-plan">
    <el-card>
      <el-table :data="list" v-loading="loading" :row-class-name="rowClassName" stripe style="width:100%">
        <el-table-column prop="moldNo" label="模具编号" width="140" />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="status" label="状态" width="90" />
        <el-table-column prop="maintenanceCycle" label="保养周期(天)" width="120" align="right" />
        <el-table-column prop="nextMaintenanceDate" label="下次保养日期" width="130">
          <template #default="{ row }">{{ formatDate(row.nextMaintenanceDate) }}</template>
        </el-table-column>
        <el-table-column prop="location" label="位置" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMaintenancePlan } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('zh-CN')
}

function rowClassName({ row }: { row: any }) {
  const d = row.nextMaintenanceDate ? new Date(row.nextMaintenanceDate) : null
  if (!d) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  const diff = (t.getTime() - today.getTime()) / (24 * 3600 * 1000)
  if (diff < 0) return 'row-expired'
  if (diff <= 7) return 'row-due-soon'
  return ''
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getMaintenancePlan()
    list.value = Array.isArray(res) ? res : (res?.list || [])
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
:deep(.row-expired) { background-color: #fef0f0 !important; }
:deep(.row-due-soon) { background-color: #fdf6ec !important; }
</style>
