<template>
  <div class="lifecycle-monitor">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="类型">
          <el-select v-model="filter.type" placeholder="全部" clearable style="width:100px">
            <el-option label="模压" value="模压" />
            <el-option label="口型" value="口型" />
            <el-option label="接角" value="接角" />
          </el-select>
        </el-form-item>
        <el-form-item label="寿命范围">
          <el-slider v-model="lifeRange" range :min="0" :max="150" :marks="{ 0: '0%', 50: '50%', 80: '80%', 100: '100%', 150: '超期' }" style="width:280px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="moldNo" label="模具编号" width="140" />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="status" label="状态" width="90" />
        <el-table-column prop="totalUsage" label="累计使用" width="100" align="right">
          <template #default="{ row }">{{ row.totalUsage }}{{ row.lifeUnit || '' }}</template>
        </el-table-column>
        <el-table-column prop="designLife" label="设计寿命" width="100" align="right">
          <template #default="{ row }">{{ row.designLife ? `${row.designLife}${row.lifeUnit || ''}` : '-' }}</template>
        </el-table-column>
        <el-table-column label="寿命率" width="160">
          <template #default="{ row }">
            <template v-if="row.lifeRate !== null">
              <el-progress :percentage="Math.min(row.lifeRate, 100)" :color="lifeColor(row.lifeRate)" :stroke-width="14" :text-inside="true">
                <span style="font-size:11px">{{ row.lifeRate }}%</span>
              </el-progress>
            </template>
            <span v-else style="color:#999">-</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getMoldList } from '@/api/mold'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const lifeRange = ref<[number, number]>([0, 150])

const filter = reactive({ type: '' })

function lifeColor(rate: number) {
  if (rate > 100) return '#F5222D'
  if (rate >= 90) return '#FA541C'
  if (rate >= 80) return '#FAAD14'
  if (rate >= 50) return '#1677FF'
  return '#52C41A'
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, pageSize: pageSize.value }
    if (filter.type) params.type = filter.type
    if (lifeRange.value[0] > 0 || lifeRange.value[1] < 150) {
      params.lifeRateMin = lifeRange.value[0]
      params.lifeRateMax = lifeRange.value[1]
    }
    const res: any = await getMoldList(params)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchList() }
function resetFilter() { filter.type = ''; lifeRange.value = [0, 150]; search() }

onMounted(fetchList)
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
