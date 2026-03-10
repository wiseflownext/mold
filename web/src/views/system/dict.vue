<template>
  <div class="dict-layout">
    <el-card class="left-card">
      <template #header>字典类型</template>
      <el-menu :default-active="activeCode" @select="handleSelect">
        <el-menu-item v-for="t in dictTypes" :key="t.code" :index="t.code">
          {{ t.name || t.code }}
        </el-menu-item>
      </el-menu>
    </el-card>
    <el-card class="right-card">
      <template #header>{{ activeCode ? (currentType?.name || activeCode) + ' - 字典项' : '请选择左侧类型' }}</template>
      <el-table v-if="activeCode" :data="currentItems" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="label" label="标签" width="150" />
        <el-table-column prop="value" label="值" width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
      </el-table>
      <el-empty v-else description="请选择字典类型" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getDict } from '@/api/mold'

const loading = ref(false)
const dictData = ref<any>({})
const activeCode = ref('')

const dictTypes = computed(() => {
  const d = dictData.value
  if (Array.isArray(d)) return d
  if (d?.types) return d.types
  if (typeof d === 'object' && d !== null) {
    return Object.keys(d).map(code => ({ code, name: code }))
  }
  return []
})

const currentType = computed(() => dictTypes.value.find((t: any) => t.code === activeCode.value))

const currentItems = computed(() => {
  if (!activeCode.value) return []
  const d = dictData.value
  if (d?.items?.[activeCode.value]) return d.items[activeCode.value]
  if (Array.isArray(d?.[activeCode.value])) return d[activeCode.value]
  if (d?.types) {
    const t = d.types.find((x: any) => x.code === activeCode.value)
    return t?.items || []
  }
  return []
})

function handleSelect(code: string) {
  activeCode.value = code
}

async function fetchDict() {
  loading.value = true
  try {
    const res: any = await getDict('')
    dictData.value = res || {}
    if (dictTypes.value.length && !activeCode.value) {
      activeCode.value = dictTypes.value[0].code
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchDict)
</script>

<style scoped>
.dict-layout { display: flex; gap: 16px; }
.left-card { width: 220px; flex-shrink: 0; }
.right-card { flex: 1; min-width: 0; }
</style>
