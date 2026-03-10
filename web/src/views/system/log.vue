<template>
  <div>
    <el-card class="filter-card">
      <el-form :model="filter" inline>
        <el-form-item label="操作时间">
          <el-date-picker v-model="filter.dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width:240px" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="filter.operator" placeholder="搜索" clearable style="width:150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:12px">
      <el-table :data="list" stripe style="width:100%">
        <el-table-column prop="createdAt" label="操作时间" width="170" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="actionType" label="操作类型" width="100" />
        <el-table-column prop="content" label="操作内容" min-width="200" />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const list = ref<any[]>([])
const filter = reactive({ dateRange: [] as string[], operator: '' })

function search() {}
function resetFilter() { Object.assign(filter, { dateRange: [], operator: '' }) }
</script>

<style scoped>
.filter-card :deep(.el-form-item) { margin-bottom: 8px; }
</style>
