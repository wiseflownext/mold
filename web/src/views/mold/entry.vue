<template>
  <el-card>
    <template #header>新增模具</template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width:600px">
      <el-form-item label="模具编号" prop="moldNo">
        <el-input v-model="form.moldNo" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" style="width:100%">
          <el-option label="模压" value="模压" />
          <el-option label="口型" value="口型" />
          <el-option label="接角" value="接角" />
        </el-select>
      </el-form-item>
      <el-form-item label="设计寿命">
        <el-input-number v-model="form.designLife" :min="0" :step="10000" style="width:60%" />
        <el-select v-model="form.lifeUnit" style="width:35%;margin-left:5%">
          <el-option label="米" value="米" />
          <el-option label="次" value="次" />
        </el-select>
      </el-form-item>
      <el-form-item label="保养周期(天)">
        <el-input-number v-model="form.maintenanceCycle" :min="0" />
      </el-form-item>
      <el-form-item label="鉴定周期(天)">
        <el-input-number v-model="form.inspectionCycle" :min="0" />
      </el-form-item>
      <el-form-item label="关联产品">
        <el-select v-model="form.productIds" multiple filterable style="width:100%">
          <el-option v-for="p in products" :key="p.id" :label="`${p.customer?.name} - ${p.name} (${p.partNo || ''})`" :value="p.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">创建</el-button>
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { createMold, getProducts } from '@/api/mold'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const products = ref<any[]>([])

const form = reactive({
  moldNo: '',
  type: '模压',
  designLife: undefined as number | undefined,
  lifeUnit: '米',
  maintenanceCycle: undefined as number | undefined,
  inspectionCycle: undefined as number | undefined,
  productIds: [] as number[],
})

const rules = {
  moldNo: [{ required: true, message: '请输入模具编号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    await createMold(form)
    ElMessage.success('创建成功')
    router.push('/mold/list')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const res: any = await getProducts()
  products.value = Array.isArray(res) ? res : []
})
</script>
