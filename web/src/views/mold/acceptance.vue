<template>
  <div class="mold-acceptance">
    <el-card style="max-width:560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="模具" required>
          <el-select v-model="form.moldId" filterable placeholder="搜索选择模具" style="width:100%">
            <el-option v-for="m in moldOptions" :key="m.id" :label="m.moldNo" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="验收日期" required>
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="验收结果" required>
          <el-radio-group v-model="form.result">
            <el-radio value="验收合格">合格</el-radio>
            <el-radio value="验收不合格">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验收人" required>
          <el-input v-model="form.inspector" placeholder="输入验收人" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="选填" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit" :loading="submitting">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMoldList, createInspection } from '@/api/mold'

const moldOptions = ref<any[]>([])
const submitting = ref(false)

const form = reactive({
  moldId: undefined as number | undefined,
  date: '',
  result: '验收合格' as '验收合格' | '验收不合格',
  inspector: '',
  remark: '',
})

async function loadMolds() {
  const res: any = await getMoldList({ pageSize: 9999 })
  moldOptions.value = res.list || []
}

function resetForm() {
  form.moldId = undefined
  form.date = ''
  form.result = '验收合格'
  form.inspector = ''
  form.remark = ''
}

async function submit() {
  if (!form.moldId || !form.date || !form.inspector) {
    ElMessage.warning('请填写必填项')
    return
  }
  submitting.value = true
  try {
    await createInspection({
      moldId: form.moldId,
      date: form.date,
      result: form.result,
      inspector: form.inspector,
      remark: form.remark || undefined,
    })
    ElMessage.success('验收提交成功')
    resetForm()
  } finally {
    submitting.value = false
  }
}

onMounted(loadMolds)
</script>
