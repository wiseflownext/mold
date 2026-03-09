<template>
  <div class="mold-list">
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="模具编号">
          <el-input v-model="filter.moldNo" placeholder="模糊搜索" clearable style="width:150px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filter.type" placeholder="全部" clearable style="width:100px">
            <el-option label="模压" value="模压" />
            <el-option label="口型" value="口型" />
            <el-option label="接角" value="接角" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部" clearable multiple collapse-tags style="width:180px">
            <el-option v-for="s in statusList" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置">
          <el-select v-model="filter.location" placeholder="全部" clearable style="width:120px">
            <el-option label="仓库" value="仓库" />
            <el-option label="挤出车间" value="挤出车间" />
            <el-option label="模压车间" value="模压车间" />
            <el-option label="接角车间" value="接角车间" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="filter.customerId" placeholder="全部" clearable filterable style="width:120px">
            <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名">
          <el-input v-model="filter.productName" placeholder="模糊搜索" clearable style="width:120px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="零件号">
          <el-input v-model="filter.partNo" placeholder="模糊搜索" clearable style="width:120px" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="寿命使用率">
          <el-select v-model="filter.lifeRange" placeholder="全部" clearable style="width:130px">
            <el-option label="0-50%" value="0,50" />
            <el-option label="50-80%" value="50,80" />
            <el-option label="80-100%" value="80,100" />
            <el-option label="超期" value="100,999" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>模具台账 ({{ total }})</span>
          <el-button type="primary" size="small" @click="$router.push('/mold/entry')">新增模具</el-button>
        </div>
      </template>
      <el-table :data="list" v-loading="loading" stripe @sort-change="handleSort" style="width:100%">
        <el-table-column prop="moldNo" label="模具编号" width="160" fixed>
          <template #default="{ row }">
            <el-link type="primary" @click="$router.push(`/mold/detail/${row.id}`)">{{ row.moldNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="70" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="100" />
        <el-table-column label="客户/产品" min-width="160">
          <template #default="{ row }">
            <span v-if="row.moldProducts?.length">
              {{ row.moldProducts[0]?.product?.customer?.name }} - {{ row.moldProducts[0]?.product?.name }}
              <el-tag v-if="row.moldProducts.length > 1" size="small" type="info">+{{ row.moldProducts.length - 1 }}</el-tag>
            </span>
            <span v-else style="color:#999">-</span>
          </template>
        </el-table-column>
        <el-table-column label="设计寿命" width="100" align="right">
          <template #default="{ row }">{{ row.designLife ? `${row.designLife}${row.lifeUnit}` : '-' }}</template>
        </el-table-column>
        <el-table-column label="累计使用" width="100" align="right">
          <template #default="{ row }">{{ row.totalUsage }}{{ row.lifeUnit }}</template>
        </el-table-column>
        <el-table-column label="使用率" width="120" sortable="custom" prop="lifeRate">
          <template #default="{ row }">
            <template v-if="row.lifeRate !== null">
              <el-progress :percentage="Math.min(row.lifeRate, 100)" :color="lifeColor(row.lifeRate)" :stroke-width="14" :text-inside="true">
                <span style="font-size:11px">{{ row.lifeRate }}%</span>
              </el-progress>
            </template>
            <span v-else style="color:#999">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="nextMaintenanceDate" label="下次保养" width="110">
          <template #default="{ row }">{{ formatDate(row.nextMaintenanceDate) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="$router.push(`/mold/detail/${row.id}`)">详情</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getMoldList, deleteMold, getCustomers } from '@/api/mold'

const statusList = ['在库', '在用', '保养中', '维修中', '封存', '待鉴定', '待验收', '报废']

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const customers = ref<any[]>([])

const filter = reactive({
  moldNo: '', type: '', status: [] as string[], location: '',
  customerId: undefined as number | undefined,
  productName: '', partNo: '', lifeRange: '',
})

let sortBy = ''
let sortOrder: 'asc' | 'desc' = 'desc'

function statusType(s: string) {
  const m: Record<string, string> = { '在库': 'success', '在用': '', '保养中': 'warning', '维修中': 'danger', '封存': 'info', '待鉴定': 'warning', '待验收': '', '报废': 'info' }
  return m[s] || ''
}

function lifeColor(rate: number) {
  if (rate > 100) return '#F5222D'
  if (rate >= 90) return '#FA541C'
  if (rate >= 80) return '#FAAD14'
  if (rate >= 50) return '#1677FF'
  return '#52C41A'
}

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, pageSize: pageSize.value }
    if (filter.moldNo) params.moldNo = filter.moldNo
    if (filter.type) params.type = filter.type
    if (filter.status.length) params.status = filter.status.join(',')
    if (filter.location) params.location = filter.location
    if (filter.customerId) params.customerId = filter.customerId
    if (filter.productName) params.productName = filter.productName
    if (filter.partNo) params.partNo = filter.partNo
    if (filter.lifeRange) {
      const [min, max] = filter.lifeRange.split(',')
      params.lifeRateMin = min
      params.lifeRateMax = max
    }
    if (sortBy) { params.sortBy = sortBy; params.sortOrder = sortOrder }
    const res: any = await getMoldList(params)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchList() }
function resetFilter() {
  Object.assign(filter, { moldNo: '', type: '', status: [], location: '', customerId: undefined, productName: '', partNo: '', lifeRange: '' })
  search()
}

function handleSort({ prop, order }: any) {
  sortBy = prop || ''
  sortOrder = order === 'ascending' ? 'asc' : 'desc'
  fetchList()
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除模具 ${row.moldNo}？`, '提示', { type: 'warning' })
  await deleteMold(row.id)
  ElMessage.success('已删除')
  fetchList()
}

onMounted(async () => {
  const res: any = await getCustomers()
  customers.value = Array.isArray(res) ? res : []
  fetchList()
})
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
