<template>
  <div v-loading="loading">
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in summaryCards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card>
          <template #header>寿命状态分布</template>
          <div class="bar-chart">
            <div v-for="bar in lifeBars" :key="bar.label" class="bar-row">
              <span class="bar-label">{{ bar.label }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: bar.percent + '%', background: bar.color }"></div>
              </div>
              <span class="bar-count">{{ bar.value }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>客户模具分布</template>
          <div class="bar-chart">
            <div v-for="c in stats?.customerMoldCount || []" :key="c.name" class="bar-row">
              <span class="bar-label">{{ c.name }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: customerPercent(c.count) + '%', background: '#1677FF' }"></div>
              </div>
              <span class="bar-count">{{ c.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>未处理告警</span>
              <el-tag type="danger" size="small">{{ stats?.alertCount || 0 }}</el-tag>
            </div>
          </template>
          <el-empty v-if="!stats?.alertCount" description="暂无告警" :image-size="60" />
          <div v-else style="color:#F5222D;font-size:24px;text-align:center;padding:20px">
            {{ stats.alertCount }} 条待处理
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>本月维修</template>
          <div style="font-size:36px;text-align:center;padding:20px;color:#FA541C">
            {{ stats?.repairCount || 0 }} <span style="font-size:14px;color:#999">次</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>本月保养完成</template>
          <div style="font-size:36px;text-align:center;padding:20px;color:#52C41A">
            {{ stats?.maintenanceDone || 0 }} <span style="font-size:14px;color:#999">次</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getMoldStats } from '@/api/mold'

const loading = ref(true)
const stats = ref<any>(null)

const summaryCards = computed(() => [
  { label: '模具总数', value: stats.value?.total ?? '-', color: '#333' },
  { label: '在用数', value: stats.value?.inUse ?? '-', color: '#1677FF' },
  { label: '在用率', value: stats.value?.useRate !== undefined ? stats.value.useRate + '%' : '-', color: '#52C41A' },
  { label: '在库数', value: stats.value?.inStock ?? '-', color: '#8C8C8C' },
])

const lifeBars = computed(() => {
  const d = stats.value?.lifeDistribution
  if (!d) return []
  const max = Math.max(d.low, d.mid, d.high, d.critical, d.over, 1)
  return [
    { label: '0-50%', value: d.low, color: '#52C41A', percent: (d.low / max) * 100 },
    { label: '50-80%', value: d.mid, color: '#1677FF', percent: (d.mid / max) * 100 },
    { label: '80-90%', value: d.high, color: '#FAAD14', percent: (d.high / max) * 100 },
    { label: '90-100%', value: d.critical, color: '#FA541C', percent: (d.critical / max) * 100 },
    { label: '超期', value: d.over, color: '#F5222D', percent: (d.over / max) * 100 },
  ]
})

function customerPercent(count: number) {
  const max = Math.max(...(stats.value?.customerMoldCount?.map((c: any) => c.count) || [1]))
  return (count / max) * 100
}

onMounted(async () => {
  stats.value = await getMoldStats()
  loading.value = false
})
</script>

<style scoped>
.stat-card { text-align: center; }
.stat-value { font-size: 32px; font-weight: bold; }
.stat-label { font-size: 14px; color: #999; margin-top: 4px; }
.bar-chart { padding: 8px 0; }
.bar-row { display: flex; align-items: center; margin-bottom: 12px; }
.bar-label { width: 70px; font-size: 13px; color: #666; text-align: right; margin-right: 12px; }
.bar-track { flex: 1; height: 20px; background: #f5f5f5; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.bar-count { width: 40px; text-align: right; font-size: 13px; color: #333; margin-left: 8px; }
</style>
