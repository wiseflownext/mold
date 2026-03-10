<template>
  <div class="repair-stats">
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">总工单数</div>
            <div class="stat-value">{{ stats.total ?? 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">本月工单</div>
            <div class="stat-value">{{ stats.monthCount ?? 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">本月费用</div>
            <div class="stat-value">{{ stats.monthCost ?? 0 }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>按状态分布</template>
      <el-table :data="byStatusList" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="count" label="数量" width="120" align="right" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getRepairStats } from '@/api/mold'

const loading = ref(false)
const stats = ref<any>({})

const byStatusList = computed(() => {
  const s = stats.value?.byStatus
  if (!s || typeof s !== 'object') return []
  return Object.entries(s).map(([status, count]) => ({ status, count }))
})

async function fetchStats() {
  loading.value = true
  try {
    const res: any = await getRepairStats()
    stats.value = res || {}
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
</script>

<style scoped>
.stat-item { text-align: center; }
.stat-label { font-size: 14px; color: #666; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: 600; }
</style>
