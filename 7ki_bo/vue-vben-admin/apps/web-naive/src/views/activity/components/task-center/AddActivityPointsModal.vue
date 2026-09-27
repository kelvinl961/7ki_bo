<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="新增活跃度"
    :style="{ width: '640px', maxWidth: '96vw' }"
    :mask-closable="false"
    @after-leave="resetForm"
  >
    <n-form label-placement="left" label-width="120" :show-feedback="false">
      <n-form-item label="选择方式" required>
        <n-radio-group v-model:value="form.addMode">
          <n-radio value="multi">多条添加</n-radio>
          <n-radio value="batch">批量导入</n-radio>
        </n-radio-group>
      </n-form-item>

      <n-form-item label="账号类型">
        <n-radio-group v-model:value="form.accountType">
          <n-radio value="account">会员账号</n-radio>
          <n-radio value="userID">会员ID</n-radio>
        </n-radio-group>
      </n-form-item>

      <template v-if="form.addMode === 'multi'">
        <n-form-item label="">
          <n-input
            v-model:value="form.memberInput"
            type="textarea"
            :rows="4"
            :placeholder="
              form.accountType === 'account'
                ? '输入多条请用逗号拼接，最多支持200个会员账号'
                : '输入多条请用逗号拼接，最多支持200个会员ID'
            "
          />
        </n-form-item>

        <n-form-item label="新增活跃度" required>
          <n-input-number
            v-model:value="form.amount"
            :min="1"
            :max="999999999"
            :precision="0"
            placeholder="请输入活跃度，1-999,999,999正整数"
            style="width: 100%"
          />
        </n-form-item>
      </template>

      <n-form-item label="活跃度有效天数" required>
        <n-input-number
          v-model:value="form.validDays"
          :min="1"
          :max="31"
          :precision="0"
          placeholder="请输入有效天数，1-31天"
          style="width: 100%"
        />
      </n-form-item>

      <template v-if="form.addMode === 'batch'">
        <n-form-item label="批量上传" required>
          <n-upload
            :max="1"
            accept=".csv,.txt,.xlsx"
            :default-upload="false"
            @change="onFileChange"
          >
            <n-button type="primary">数据上传</n-button>
          </n-upload>
          <span v-if="fileName" class="ml-2 text-xs opacity-70">{{ fileName }}</span>
        </n-form-item>

        <div class="usage-box">
          <div class="font-medium mb-1">使用说明</div>
          <div>1. 建议每个文档会员数量为1,000,000以下，超出请批次上传</div>
          <div>2. 上传文档的大小不超过50M</div>
          <div>3. 每个会员单次增加活跃度1-999,999,999正整数</div>
          <div>
            4.
            <a class="template-link" href="#" @click.prevent="downloadTemplate"
              >模板下载</a
            >
          </div>
        </div>
      </template>

      <template v-if="form.addMode === 'multi'">
        <n-form-item label="前台备注">
          <n-input
            v-model:value="form.frontRemark"
            type="textarea"
            :rows="2"
            :maxlength="1000"
            show-count
            placeholder="请输入前台备注"
          />
        </n-form-item>
        <n-form-item label="后台备注">
          <n-input
            v-model:value="form.backRemark"
            type="textarea"
            :rows="2"
            :maxlength="1000"
            show-count
            placeholder="请输入后台备注"
          />
        </n-form-item>
      </template>
    </n-form>

    <template #footer>
      <div class="flex justify-center gap-3">
        <n-button @click="visible = false">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="submit"
          >确认</n-button
        >
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useMessage, type UploadFileInfo } from 'naive-ui';
import { taskCenterPeriodicApi } from '#/api/taskCenterPeriodic';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
  (e: 'done'): void;
}>();

const message = useMessage();
const submitting = ref(false);
const fileName = ref('');
const fileObj = ref<File | null>(null);

const visible = ref(props.show);
watch(
  () => props.show,
  (v) => {
    visible.value = v;
  },
);
watch(visible, (v) => emit('update:show', v));

const form = reactive({
  addMode: 'multi' as 'multi' | 'batch',
  accountType: 'account' as 'account' | 'userID',
  memberInput: '',
  amount: null as number | null,
  validDays: 1,
  frontRemark: '',
  backRemark: '',
});

function resetForm() {
  form.addMode = 'multi';
  form.accountType = 'account';
  form.memberInput = '';
  form.amount = null;
  form.validDays = 1;
  form.frontRemark = '';
  form.backRemark = '';
  fileName.value = '';
  fileObj.value = null;
}

function onFileChange(options: { fileList: UploadFileInfo[] }) {
  const f = options.fileList[0]?.file ?? null;
  fileObj.value = f as File | null;
  fileName.value = f?.name ?? '';
}

async function downloadTemplate() {
  try {
    const blob = await taskCenterPeriodicApi.downloadGrantTemplate(
      form.accountType,
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_points_grant_${form.accountType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e: any) {
    message.error(e?.message || '模板下载失败');
  }
}

async function submit() {
  if (!form.validDays || form.validDays < 1 || form.validDays > 31) {
    message.warning('请输入有效天数 1-31');
    return;
  }

  submitting.value = true;
  try {
    if (form.addMode === 'multi') {
      const identifiers = form.memberInput
        .split(/[,，;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 200);
      if (!identifiers.length) {
        message.warning('请输入会员账号或ID');
        return;
      }
      if (!form.amount || form.amount < 1) {
        message.warning('请输入活跃度数量');
        return;
      }
      const res: any = await taskCenterPeriodicApi.grantPoints({
        accountType: form.accountType,
        identifiers,
        amount: form.amount,
        validDays: form.validDays,
        frontRemark: form.frontRemark || null,
        backRemark: form.backRemark || null,
      });
      const data = res?.data ?? res;
      const ok = (data?.results || []).filter((r: any) => r.success).length;
      const fail = (data?.results || []).filter((r: any) => !r.success).length;
      message.success(`成功 ${ok}，失败 ${fail}`);
      if (ok > 0) {
        visible.value = false;
        emit('done');
      }
    } else {
      if (!fileObj.value) {
        message.warning('请上传数据文件');
        return;
      }
      const res: any = await taskCenterPeriodicApi.importGrantPoints({
        file: fileObj.value,
        accountType: form.accountType,
        validDays: form.validDays,
        frontRemark: form.frontRemark || null,
        backRemark: form.backRemark || null,
      });
      const data = res?.data ?? res;
      const ok = (data?.results || []).filter((r: any) => r.success).length;
      const fail = (data?.results || []).filter((r: any) => !r.success).length;
      message.success(`成功 ${ok}，失败 ${fail}`);
      if (ok > 0) {
        visible.value = false;
        emit('done');
      }
    }
  } catch (e: any) {
    message.error(e?.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.usage-box {
  margin: 8px 0 16px;
  padding: 12px 14px;
  background: #e8f3ff;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
}
.template-link {
  color: #2080f0;
  cursor: pointer;
}
</style>
