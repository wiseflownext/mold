<template>
  <div class="report-page">
    <el-row :gutter="16">
      <el-col :span="24">
        <el-card>
          <template #header>模具总览</template>
          <el-statistic title="模具总数" :value="report.moldTotal ?? 0" />
          <el-table v-if="report.byStatus?.length" :data="report.byStatus" style="margin-top:16px" stripe>
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="count" label="数量" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card>
          <template #header>按类型分布</template>
          <el-table v-if="report.byType?.length" :data="report.byType" stripe>
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="count" label="数量" width="100" />
          </el-table>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>本月数据</template>
          <div class="stat-row">
            <el-statistic title="使用记录" :value="report.monthUsage ?? 0" />
            <el-statistic title="维修工单" :value="report.monthRepair ?? 0" />
            <el-statistic title="保养记录" :value="report.monthMaint ?? 0" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <el-card>
          <template #header>本月费用</template>
          <div class="stat-row">
            <el-statistic title="维修费(元)" :value="report.repairCost ?? 0" />
            <el-statistic title="保养费(元)" :value="report.maintCost ?? 0" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getReport } from '@/api/mold'

const report = reactive<Record<string, any>>({
  moldTotal: 0, byStatus: [], byType: [],
  monthUsage: 0, monthRepair: 0, monthMaint: 0,
  repairCost: 0, maintCost: 0,
})

async function fetchReport() {
  try {
    const res: any = await getReport()
    Object.assign(report, res)
  } catch (_) {}
}

onMounted(fetchReport)
</script>

<style scoped>
.report-page { padding: 0; }
.stat-row { display: flex; gap: 32px; flex-wrap: wrap; }
</style>
