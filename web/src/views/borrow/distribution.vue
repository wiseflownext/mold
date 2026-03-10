<template>
  <div class="borrow-distribution">
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="12">
        <el-card>
          <template #header>按位置分布</template>
          <el-table :data="byLocationList" v-loading="loading" stripe style="width:100%">
            <el-table-column prop="location" label="位置" />
            <el-table-column prop="count" label="数量" width="100" align="right" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>按客户分布</template>
          <el-table :data="byCustomerList" v-loading="loading" stripe style="width:100%">
            <el-table-column prop="customer" label="客户" />
            <el-table-column prop="count" label="数量" width="100" align="right" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>在用模具明细</template>
      <el-table :data="detailList" v-loading="loading" stripe style="width:100%">
        <el-table-column label="模具编号" width="140">
          <template #default="{ row }">{{ row.mold?.moldNo || row.moldNo || '-' }}</template>
        </el-table-column>
        <el-table-column prop="workshop" label="车间" width="100" />
        <el-table-column prop="machine" label="机台" width="100" />
        <el-table-column prop="customer" label="客户" min-width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getBorrowDistribution } from '@/api/mold'

const loading = ref(false)
const data = ref<any>({})

const byLocationList = computed(() => {
  const d = data.value?.byLocation
  if (!d || typeof d !== 'object') return []
  return Object.entries(d).map(([location, count]) => ({ location, count }))
})

const byCustomerList = computed(() => {
  const d = data.value?.byCustomer
  if (!d || typeof d !== 'object') return []
  return Object.entries(d).map(([customer, count]) => ({ customer, count }))
})

const detailList = computed(() => {
  const list = data.value?.list || data.value?.details || []
  return Array.isArray(list) ? list : []
})

async function fetchData() {
  loading.value = true
  try {
    const res: any = await getBorrowDistribution()
    data.value = res || {}
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
