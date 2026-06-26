<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="$t('vip.importVipLevel')"
    :style="{ width: '600px' }"
    :closable="false"
    :mask-closable="false"
  >
    <div class="vip-import-modal">
      <n-alert type="info" class="mb-4">
        <template #header>{{ $t('vip.importInstructions') }}</template>
        <div>
          <p>{{ $t('vip.importStep1') }}</p>
          <p>{{ $t('vip.importStep2') }}</p>
          <p>{{ $t('vip.importStep3') }}</p>
          <p>{{ $t('vip.importStep4') }}</p>
        </div>
      </n-alert>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item :label="$t('vip.selectFile')" path="file">
          <n-upload
            ref="uploadRef"
            :file-list="fileList"
            :max="1"
            :show-file-list="true"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="handleBeforeUpload"
            accept=".xlsx,.xls,.csv"
          >
            <n-upload-dragger>
              <div style="margin-bottom: 12px">
                <n-icon size="48" :depth="3">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                    />
                  </svg>
                </n-icon>
              </div>
              <n-text style="font-size: 16px">
                {{ $t('vip.uploadFileHint') }}
              </n-text>
              <n-p depth="3" style="margin: 8px 0 0 0">
                {{ $t('vip.uploadExcelCsvHint') }}
              </n-p>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>

        <n-form-item :label="$t('vip.importMode')" path="importMode">
          <n-radio-group v-model:value="formData.importMode">
            <n-space direction="vertical">
              <n-radio value="append">
                <div>
                  <div>{{ $t('vip.appendMode') }}</div>
                  <div class="text-sm text-gray-500">
                    {{ $t('vip.appendModeDesc') }}
                  </div>
                </div>
              </n-radio>
              <n-radio value="overwrite">
                <div>
                  <div>{{ $t('vip.overwriteMode') }}</div>
                  <div class="text-sm text-gray-500">
                    {{ $t('vip.overwriteModeDesc') }}
                  </div>
                </div>
              </n-radio>
              <n-radio value="update">
                <div>
                  <div>{{ $t('vip.updateMode') }}</div>
                  <div class="text-sm text-gray-500">
                    {{ $t('vip.updateModeDesc') }}
                  </div>
                </div>
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="$t('vip.errorHandling')" path="errorHandling">
          <n-select
            v-model:value="formData.errorHandling"
            :options="errorHandlingOptions"
            :placeholder="$t('vip.selectErrorHandling')"
          />
        </n-form-item>
      </n-form>

      <n-divider />

      <div class="mb-4">
        <n-text strong>{{ $t('vip.templateDownload') }}</n-text>
        <n-p depth="3" class="mt-2">
          {{ $t('vip.templateDownloadHint') }}
        </n-p>
        <n-button type="primary" ghost @click="handleDownloadTemplate">
          {{ $t('vip.downloadExcelTemplate') }}
        </n-button>
      </div>

      <n-divider />

      <!-- 预览区域 -->
      <div v-if="previewData.length > 0" class="preview-section">
        <n-text strong>{{ $t('vip.dataPreview') }}</n-text>
        <n-p depth="3" class="mt-2">
          {{ $t('vip.previewDetected', [previewData.length]) }}
        </n-p>

        <n-data-table
          :columns="previewColumns"
          :data="previewData"
          :pagination="{ pageSize: 5 }"
          :max-height="200"
          class="mt-4"
        />
      </div>
    </div>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
        <n-button
          type="primary"
          :loading="submitLoading"
          :disabled="!formData.file"
          @click="handleSubmit"
        >
          {{ $t('vip.startImport') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed } from 'vue';
import type {
  FormInst,
  FormRules,
  UploadFileInfo,
  DataTableColumns,
} from 'naive-ui';
import {
  NModal,
  NForm,
  NFormItem,
  NAlert,
  NUpload,
  NUploadDragger,
  NRadioGroup,
  NRadio,
  NSelect,
  NButton,
  NSpace,
  NText,
  NP,
  NIcon,
  NDivider,
  NDataTable,
  useMessage,
} from 'naive-ui';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();

const formRef = ref<FormInst>();
const uploadRef = ref();
const submitLoading = ref(false);
const fileList = ref<UploadFileInfo[]>([]);
const previewData = ref<any[]>([]);

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

const formData = reactive({
  file: null as File | null,
  importMode: 'append' as 'append' | 'overwrite' | 'update',
  errorHandling: 'skip' as 'skip' | 'stop' | 'log',
});

const errorHandlingOptions = computed(() => [
  { label: $t('vip.skipErrorRows'), value: 'skip' },
  { label: $t('vip.stopOnError'), value: 'stop' },
  { label: $t('vip.logErrorsContinue'), value: 'log' },
]);

const previewColumns = computed<DataTableColumns<any>>(() => [
  { title: $t('vip.previewColLevel'), key: 'level', width: 80 },
  { title: $t('vip.previewColName'), key: 'name', width: 120 },
  { title: $t('vip.previewColColor'), key: 'color', width: 100 },
  { title: $t('vip.previewColCurrency'), key: 'currency', width: 80 },
  { title: $t('vip.previewColUpgradeBonus'), key: 'upgradeBonus', width: 100 },
  { title: $t('vip.previewColMonthlyRebate'), key: 'monthlyRebate', width: 80 },
  { title: $t('vip.previewColStatus'), key: 'isActive', width: 80 },
]);

const rules = computed<FormRules>(() => ({
  file: [
    { required: true, message: $t('vip.selectImportFile'), trigger: 'change' },
  ],
  importMode: [
    { required: true, message: $t('vip.selectImportMode'), trigger: 'change' },
  ],
  errorHandling: [
    {
      required: true,
      message: $t('vip.selectErrorHandlingRequired'),
      trigger: 'change',
    },
  ],
}));

const handleBeforeUpload = (data: { file: UploadFileInfo }) => {
  const file = data.file.file;
  if (!file) return false;

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];

  if (!allowedTypes.includes(file.type)) {
    message.error($t('vip.excelCsvOnly'));
    return false;
  }

  if (file.size > 10 * 1024 * 1024) {
    message.error($t('vip.fileSizeLimit'));
    return false;
  }

  return false;
};

const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  fileList.value = options.fileList;

  if (options.fileList.length > 0) {
    const file = options.fileList[0].file;
    if (file) {
      formData.file = file;
      handleFilePreview(file);
    }
  } else {
    formData.file = null;
    previewData.value = [];
  }
};

const handleFileRemove = () => {
  formData.file = null;
  previewData.value = [];
};

const handleFilePreview = async (_file: File) => {
  try {
    const mockPreviewData = [
      {
        level: 1,
        name: 'VIP1',
        color: '#FFD700',
        currency: 'USDT',
        upgradeBonus: 100,
        monthlyRebate: 1.0,
        isActive: true,
      },
      {
        level: 2,
        name: 'VIP2',
        color: '#FFA500',
        currency: 'USDT',
        upgradeBonus: 200,
        monthlyRebate: 1.5,
        isActive: true,
      },
      {
        level: 3,
        name: 'VIP3',
        color: '#FF8C00',
        currency: 'USDT',
        upgradeBonus: 300,
        monthlyRebate: 2.0,
        isActive: true,
      },
    ];

    previewData.value = mockPreviewData;
    message.success($t('vip.fileParseSuccess'));
  } catch (error) {
    message.error($t('vip.fileParseFailed'));
    console.error('File preview error:', error);
  }
};

const handleDownloadTemplate = () => {
  const templateData = [
    [
      $t('vip.previewColLevel'),
      $t('vip.previewColName'),
      $t('vip.previewColColor'),
      $t('vip.previewColCurrency'),
      $t('vip.monthlyDeposit'),
      $t('vip.templateColMonthlyBet'),
      $t('vip.templateColPointsRequirement'),
      $t('vip.previewColUpgradeBonus'),
      $t('vip.previewColMonthlyRebate'),
      $t('vip.templateColWeeklyTaskValue'),
      $t('vip.templateColDailyTaskValue'),
      $t('vip.templateColWithdrawalLimit'),
      $t('vip.templateColWithdrawalTimes'),
      $t('vip.templateColCustomerServicePriority'),
      $t('vip.previewColStatus'),
      $t('vip.displayOrder'),
    ],
    [
      1,
      'VIP1',
      '#FFD700',
      'USDT',
      1000,
      5000,
      100,
      100,
      1.0,
      50,
      10,
      10000,
      3,
      $t('vip.templateValueNo'),
      $t('vip.templateValueEnabled'),
      1,
    ],
    [
      2,
      'VIP2',
      '#FFA500',
      'USDT',
      5000,
      20000,
      500,
      200,
      1.5,
      100,
      20,
      20000,
      5,
      $t('vip.templateValueNo'),
      $t('vip.templateValueEnabled'),
      2,
    ],
    [
      3,
      'VIP3',
      '#FF8C00',
      'USDT',
      10000,
      50000,
      1000,
      300,
      2.0,
      150,
      30,
      50000,
      10,
      $t('vip.templateValueYes'),
      $t('vip.templateValueEnabled'),
      3,
    ],
  ];

  const csvContent = templateData.map((row) => row.join(',')).join('\n');

  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = $t('vip.importTemplateFilename');
  link.click();
  URL.revokeObjectURL(link.href);

  message.success($t('vip.templateDownloadSuccess'));
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    if (!formData.file) {
      message.error($t('vip.selectImportFile'));
      return;
    }

    submitLoading.value = true;

    await new Promise((resolve) => setTimeout(resolve, 2000));

    message.success($t('vip.importSuccess'));
    emit('success');
    showModal.value = false;

    resetForm();
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message || $t('vip.importFailed'));
    } else {
      message.error($t('vip.formValidationFailed'));
    }
    console.error('Error importing VIP levels:', error);
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  formRef.value?.restoreValidation();
  formData.file = null;
  formData.importMode = 'append';
  formData.errorHandling = 'skip';
  fileList.value = [];
  previewData.value = [];
};
</script>

<style scoped>
.vip-import-modal {
  max-height: 70vh;
  overflow-y: auto;
}

.preview-section {
  margin-top: 16px;
}

:deep(.n-upload) {
  width: 100%;
}

:deep(.n-upload-dragger) {
  padding: 40px 20px;
}

:deep(.n-radio .n-radio__label) {
  padding-left: 8px;
}

:deep(.n-data-table) {
  max-height: 200px;
}

.vip-import-modal::-webkit-scrollbar {
  width: 6px;
}

.vip-import-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.vip-import-modal::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.vip-import-modal::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
