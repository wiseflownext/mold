<template>
  <div v-loading="loading">
    <el-page-header @back="$router.back()" style="margin-bottom:16px">
      <template #content>
        <span style="font-size:18px;font-weight:bold">{{ mold?.moldNo }}</span>
        <el-tag :type="statusType(mold?.status)" style="margin-left:12px">{{ mold?.status }}</el-tag>
      </template>
    </el-page-header>

    <el-row :gutter="16" v-if="mold">
      <el-col :span="16">
        <el-card>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="模具编号">{{ mold.moldNo }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ mold.type }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusType(mold.status)" size="small">{{ mold.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="所在位置">{{ mold.location }}</el-descriptions-item>
            <el-descriptions-item label="寿命单位">{{ mold.lifeUnit }}</el-descriptions-item>
            <el-descriptions-item label="首次使用">{{ formatDate(mold.firstUseDate) }}</el-descriptions-item>
            <el-descriptions-item label="设计寿命">{{ mold.designLife ?? '-' }} {{ mold.lifeUnit }}</el-descriptions-item>
            <el-descriptions-item label="累计使用">{{ mold.totalUsage }} {{ mold.lifeUnit }}</el-descriptions-item>
            <el-descriptions-item label="使用率">
              <el-progress v-if="mold.lifeRate !== null" :percentage="Math.min(mold.lifeRate, 100)" :color="lifeColor(mold.lifeRate)" style="width:160px" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="保养周期">{{ mold.maintenanceCycle ? `${mold.maintenanceCycle}天` : '-' }}</el-descriptions-item>
            <el-descriptions-item label="下次保养">{{ formatDate(mold.nextMaintenanceDate) }}</el-descriptions-item>
            <el-descriptions-item label="下次鉴定">{{ formatDate(mold.nextInspectionDate) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card style="margin-top:16px">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="关联产品" name="products">
              <el-table :data="mold.moldProducts" size="small">
                <el-table-column label="客户" prop="product.customer.name" />
                <el-table-column label="车型" prop="product.model" />
                <el-table-column label="产品名" prop="product.name" />
                <el-table-column label="零件号" prop="product.partNo" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="使用记录" name="usage">
              <el-table :data="mold.usageRecords" size="small">
                <el-table-column label="日期" width="110">
                  <template #default="{ row }">{{ formatDate(row.useDate) }}</template>
                </el-table-column>
                <el-table-column label="用量" prop="amount" width="100" />
                <el-table-column label="产品" width="150">
                  <template #default="{ row }">{{ row.product?.name || '-' }}</template>
                </el-table-column>
                <el-table-column label="操作人" width="80">
                  <template #default="{ row }">{{ row.user?.name }}</template>
                </el-table-column>
                <el-table-column label="备注" prop="remark" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="领用记录" name="borrow">
              <el-table :data="mold.borrowRecords" size="small">
                <el-table-column label="类型" width="70">
                  <template #default="{ row }">
                    <el-tag :type="row.type === '领用' ? '' : 'success'" size="small">{{ row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="时间" width="160">
                  <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
                </el-table-column>
                <el-table-column label="操作人" width="80">
                  <template #default="{ row }">{{ row.user?.name }}</template>
                </el-table-column>
                <el-table-column label="车间" prop="workshop" />
                <el-table-column label="机台" prop="machine" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="保养记录" name="maintenance">
              <el-table :data="mold.maintenanceRecords" size="small">
                <el-table-column label="日期" width="110">
                  <template #default="{ row }">{{ formatDate(row.date) }}</template>
                </el-table-column>
                <el-table-column label="内容" prop="content" />
                <el-table-column label="执行人" width="80">
                  <template #default="{ row }">{{ row.user?.name }}</template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="维修记录" name="repair">
              <el-table :data="mold.repairOrders" size="small">
                <el-table-column label="时间" width="160">
                  <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
                </el-table-column>
                <el-table-column label="问题" prop="description" min-width="150" />
                <el-table-column label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '已完成' ? 'success' : row.status === '处理中' ? '' : 'warning'" size="small">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="提报人" width="80">
                  <template #default="{ row }">{{ row.reporter?.name }}</template>
                </el-table-column>
                <el-table-column label="费用" width="80" prop="cost" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="鉴定记录" name="inspection">
              <el-table :data="mold.inspections" size="small">
                <el-table-column label="日期" width="110">
                  <template #default="{ row }">{{ formatDate(row.date) }}</template>
                </el-table-column>
                <el-table-column label="结果" width="100" prop="result" />
                <el-table-column label="新周期值" width="100" prop="newCycleValue" />
                <el-table-column label="下次鉴定" width="110">
                  <template #default="{ row }">{{ formatDate(row.nextDate) }}</template>
                </el-table-column>
                <el-table-column label="鉴定人" prop="inspector" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="状态变更" name="statusChange">
              <el-table :data="mold.statusChanges" size="small">
                <el-table-column label="时间" width="160">
                  <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
                </el-table-column>
                <el-table-column label="变更" width="160">
                  <template #default="{ row }">{{ row.fromStatus }} → {{ row.toStatus }}</template>
                </el-table-column>
                <el-table-column label="原因" prop="reason" />
                <el-table-column label="操作人" width="80">
                  <template #default="{ row }">{{ row.user?.name }}</template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>验收信息</template>
          <template v-if="mold.acceptance">
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="结果">{{ mold.acceptance.result }}</el-descriptions-item>
              <el-descriptions-item label="设计寿命">{{ mold.acceptance.designLife }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ mold.acceptance.remark || '-' }}</el-descriptions-item>
            </el-descriptions>
          </template>
          <el-empty v-else description="暂无验收信息" :image-size="60" />
        </el-card>

        <el-card style="margin-top:16px">
          <template #header>照片记录</template>
          <div v-if="mold.photos?.length" style="display:flex;flex-wrap:wrap;gap:8px">
            <el-image v-for="p in mold.photos" :key="p.id" :src="p.file?.url" style="width:80px;height:80px;border-radius:4px" fit="cover" :preview-src-list="mold.photos.map((x:any) => x.file?.url)" />
          </div>
          <el-empty v-else description="暂无照片" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMoldDetail } from '@/api/mold'

const route = useRoute()
const loading = ref(true)
const mold = ref<any>(null)
const activeTab = ref('products')

function statusType(s: string) {
  const m: Record<string, string> = { '在库': 'success', '在用': '', '保养中': 'warning', '维修中': 'danger', '封存': 'info', '待鉴定': 'warning', '报废': 'info' }
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
  return d ? new Date(d).toLocaleDateString('zh-CN') : '-'
}

function formatDateTime(d: string | null) {
  return d ? new Date(d).toLocaleString('zh-CN') : '-'
}

onMounted(async () => {
  const id = Number(route.params.id)
  mold.value = await getMoldDetail(id)
  loading.value = false
})
</script>
