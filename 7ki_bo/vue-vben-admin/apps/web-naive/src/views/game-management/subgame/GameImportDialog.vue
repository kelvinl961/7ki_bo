<template>
  <n-modal
    v-model:show="visible"
    :title="
      currentStep === 'upload'
        ? $t('game.importDialog.title')
        : currentStep === 'preview'
          ? $t('game.importDialog.previewTitle')
          : $t('game.importDialog.resultTitle')
    "
    preset="dialog"
    :style="{ width: currentStep === 'upload' ? '600px' : '1000px' }"
    :closable="currentStep !== 'importing'"
    :mask-closable="currentStep !== 'importing'"
    @after-leave="resetDialog"
  >
    <div v-if="currentStep === 'upload'" class="upload-step">
      <div class="mb-6">
        <n-alert type="info" :show-icon="false" class="mb-4">
          <div class="text-sm">
            <p>{{ $t('game.importDialog.importHint') }}</p>
          </div>
        </n-alert>

        <div class="mb-4 flex gap-4">
          <n-button type="primary" ghost @click="downloadTemplate">
            <template #icon>
              <icon-download />
            </template>
            {{ $t('game.importDialog.downloadTemplate') }}
          </n-button>
        </div>
      </div>

      <n-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules">
        <n-form-item :label="$t('game.subgame.selectBelongPlatform')" path="platformId">
          <n-select
            v-model:value="uploadForm.platformId"
            :placeholder="$t('game.subgame.selectBelongPlatform')"
            :options="platformOptions"
            value-field="value"
            label-field="label"
            clearable
          />
        </n-form-item>

        <n-form-item :label="$t('game.subgame.vendor')" path="vendor">
          <n-input
            v-model:value="uploadForm.vendor"
            :placeholder="$t('game.subgame.enterVendor')"
          />
        </n-form-item>

        <n-form-item :label="$t('game.subgame.selectCurrency')" path="currency">
          <n-select
            v-model:value="uploadForm.currency"
            :placeholder="$t('game.subgame.selectCurrency')"
            :options="currencyOptions"
          />
        </n-form-item>

        <n-form-item :label="$t('game.importDialog.uploadFile')" path="file">
          <n-upload
            ref="uploadRef"
            :max="1"
            :show-file-list="true"
            :file-list="fileList"
            accept=".xlsx,.xls,.csv"
            @change="handleFileChange"
            @remove="handleFileRemove"
            :custom-request="() => {}"
          >
            <n-upload-dragger>
              <div class="upload-area">
                <div class="upload-icon">
                  <icon-upload />
                </div>
                <p class="upload-text">{{ $t('game.importDialog.uploadFile') }}</p>
                <p class="upload-hint">{{ $t('game.importDialog.importHint') }}</p>
              </div>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>
      </n-form>
    </div>

    <div v-else-if="currentStep === 'preview'" class="preview-step">
      <div class="mb-4">
        <n-alert
          v-if="previewData.errors.length > 0"
          type="warning"
          :show-icon="false"
          class="mb-4"
        >
          <div class="text-sm">
            <p class="mb-2">
              {{ $t('game.importDialog.errorsFound', [previewData.errors.length]) }}
            </p>
            <div class="max-h-32 overflow-y-auto">
              <div
                v-for="error in previewData.errors"
                :key="`${error.row}-${error.field}`"
                class="mb-1"
              >
                {{ $t('game.importDialog.rowFieldError', [error.row, error.field, error.message]) }}
              </div>
            </div>
          </div>
        </n-alert>

        <div class="mb-4 flex items-center justify-between">
          <div class="flex gap-4">
            <n-statistic :label="$t('game.importDialog.totalData')" :value="previewData.summary.total" />
            <n-statistic :label="$t('game.importDialog.validData')" :value="previewData.summary.valid" />
            <n-statistic
              :label="$t('game.importDialog.errorData')"
              :value="previewData.summary.invalid"
            />
          </div>
          <div class="flex gap-2">
            <n-button @click="currentStep = 'upload'">{{ $t('game.importDialog.backToUpload') }}</n-button>
            <n-button
              type="primary"
              :disabled="previewData.summary.valid === 0"
              @click="startImport"
            >
              {{ $t('game.importDialog.startImport', [previewData.summary.valid]) }}
            </n-button>
          </div>
        </div>
      </div>

      <n-data-table
        :columns="previewColumns"
        :data="previewData.games"
        :pagination="{ pageSize: 50 }"
        :scroll-x="1200"
        size="small"
        :row-class-name="getRowClassName"
      />
    </div>

    <div v-else-if="currentStep === 'importing'" class="importing-step">
      <div class="py-8 text-center">
        <n-spin size="large" />
        <p class="mt-4 text-lg">{{ $t('game.importDialog.importing') }}</p>
        <p class="mt-2 text-sm text-gray-500">
          {{ $t('game.importDialog.processedProgress', [importProgress.current, importProgress.total]) }}
        </p>
        <p class="mt-2 text-sm text-orange-600">
          <strong>{{ $t('game.importDialog.largeFileWarning') }}</strong>
        </p>
        <n-progress
          type="line"
          :percentage="importProgress.percentage"
          :show-indicator="false"
          class="mt-4"
        />
      </div>
    </div>

    <div v-else-if="currentStep === 'results'" class="results-step">
      <div class="mb-4">
        <n-alert
          :type="importResults.summary.error > 0 ? 'warning' : 'success'"
          :show-icon="false"
          class="mb-4"
        >
          <div class="text-sm">
            <p class="mb-2">{{ $t('game.importDialog.importDone') }}</p>
            <div class="flex gap-6">
              <span>{{ $t('game.importDialog.total') }}: {{ importResults.summary.total }}</span>
              <span class="text-green-600"
                >{{ $t('game.importDialog.success') }}: {{ importResults.summary.success }}</span
              >
              <span class="text-red-600"
                >{{ $t('game.importDialog.failed') }}: {{ importResults.summary.error }}</span
              >
              <span class="text-orange-600"
                >{{ $t('game.importDialog.skipped') }}: {{ importResults.summary.skipped }}</span
              >
            </div>
          </div>
        </n-alert>

        <div class="mb-4 flex justify-end gap-2">
          <n-button @click="visible = false">{{ $t('common.close') }}</n-button>
          <n-button type="primary" @click="handleImportComplete">{{ $t('common.confirm') }}</n-button>
        </div>
      </div>

      <n-data-table
        :columns="resultColumns"
        :data="importResults.results"
        :pagination="{ pageSize: 50 }"
        :scroll-x="1000"
        size="small"
        :row-class-name="getResultRowClassName"
      />
    </div>

    <template #action>
      <div v-if="currentStep === 'upload'" class="flex justify-end gap-2">
        <n-button @click="visible = false">{{ $t('common.cancel') }}</n-button>
        <n-button
          type="primary"
          :loading="parsing"
          :disabled="!uploadForm.file || !uploadForm.platformId"
          @click="parseFileData"
        >{{ $t('game.importDialog.parseFile') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { $t } from '@vben/locales';

import { computed, reactive, ref, watch } from 'vue';
import type {
  DataTableColumns,
  FormInst,
  FormRules,
  UploadFileInfo,
} from 'naive-ui';
import {
  NAlert,
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NProgress,
  NSelect,
  NSpin,
  NStatistic,
  NUpload,
  NUploadDragger,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
import {
  type ImportGameData,
  type ImportPreviewData,
  type FileImportResponse,
  type FileImportResult,
  importGamesFromFileApi,
} from '#/api/game/subgame';
import {
  parseFile,
  validateGameData,
  downloadTemplate as downloadTemplateUtil,
} from '#/utils/fileParser';

// Icons (you may need to import these from your icon library)
const IconDownload = () => '📥';
const IconUpload = () => '📤';

interface Props {
  visible: boolean;
  platformOptions: Array<{ label: string; value: number }>;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Reactive data
const currentStep = ref<'upload' | 'preview' | 'importing' | 'results'>(
  'upload',
);
const parsing = ref(false);
const importing = ref(false);
const uploadFormRef = ref<FormInst | null>(null);
const uploadRef = ref();
const fileList = ref<UploadFileInfo[]>([]);

// Form data
const uploadForm = reactive({
  platformId: undefined as number | undefined,
  vendor: '' as string,
  currency: 'BRL' as string,
  file: null as File | null,
});

// Preview and results data
const previewData = ref<ImportPreviewData>({
  games: [],
  errors: [],
  summary: { total: 0, valid: 0, invalid: 0 },
});

const importResults = ref<FileImportResponse>({
  results: [],
  summary: { total: 0, success: 0, error: 0, skipped: 0 },
});

const importProgress = ref({
  current: 0,
  total: 0,
  percentage: 0,
});

// Options
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

// Form rules
const uploadRules: FormRules = {
  platformId: [
    {
      required: true,
      message: $t('game.platformExtra.selectPlatformRequired'),
      trigger: ['blur', 'change'],
      validator: (_, value) => {
        if (!value) {
          return new Error($t('game.importDialog.selectPlatformRequired'));
        }
        return true;
      },
    },
  ],
  vendor: [
    { required: true, message: $t('game.subgame.enterVendor'), trigger: ['blur', 'change'] },
  ],
  currency: [
    {
      required: true,
      message: $t('game.importDialog.selectDefaultCurrency'),
      trigger: ['blur', 'change'],
      validator: (_, value) => {
        if (!value) {
          return new Error($t('game.importDialog.selectDefaultCurrency'));
        }
        return true;
      },
    },
  ],
  file: [
    {
      required: true,
      message: $t('game.importDialog.selectFileRequired'),
      trigger: ['blur', 'change'],
      validator: (_, value) => {
        if (!value) {
          return new Error($t('game.importDialog.selectFileRequired'));
        }
        return true;
      },
    },
  ],
};

// Computed
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

// Preview table columns
const previewColumns: DataTableColumns<ImportGameData> = [
  { title: $t('game.importDialog.rowNo'), key: 'no', width: 60 },
  { title: $t('game.subgame.gameNameZh'), key: 'gameNameCn', width: 150 },
  { title: $t('game.subgame.gameNameEn'), key: 'gameNameEn', width: 150 },
  { title: $t('game.subgame.gameType'), key: 'gameType', width: 100 },
  { title: $t('game.subgame.gameId'), key: 'gameId', width: 120 },
  { title: $t('game.subgame.displayId'), key: 'gameDisplayId', width: 100 },
  {
    title: $t('game.importDialog.iconUrl'),
    key: 'iconUrl',
    width: 200,
    ellipsis: { tooltip: true },
  },
  { title: $t('common.remark'), key: 'remark', width: 150, ellipsis: { tooltip: true } },
];

// Results table columns
const resultColumns: DataTableColumns<FileImportResult> = [
  { title: $t('game.importDialog.rowNo'), key: 'row', width: 60 },
  { title: $t('game.subgame.gameId'), key: 'gameId', width: 120 },
  { title: $t('game.subgame.gameNameZh'), key: 'gameNameCn', width: 150 },
  {
    title: $t('common.status'),
    key: 'status',
    width: 80,
    render(row) {
      const statusMap = {
        success: { text: $t('game.importDialog.statusSuccess'), type: 'success' },
        error: { text: $t('game.importDialog.statusFailed'), type: 'error' },
        skipped: { text: $t('game.importDialog.statusSkipped'), type: 'warning' },
      };
      const status = statusMap[row.status] || { text: $t('game.importDialog.statusUnknown'), type: 'default' };
      return `${status.text}`;
    },
  },
  { title: $t('game.importDialog.message'), key: 'message', width: 200, ellipsis: { tooltip: true } },
];

// Methods
const resetDialog = () => {
  currentStep.value = 'upload';
  uploadForm.platformId = undefined;
  uploadForm.currency = 'BRL';
  uploadForm.file = null;
  fileList.value = [];
  previewData.value = {
    games: [],
    errors: [],
    summary: { total: 0, valid: 0, invalid: 0 },
  };
  importResults.value = {
    results: [],
    summary: { total: 0, success: 0, error: 0, skipped: 0 },
  };
  importProgress.value = { current: 0, total: 0, percentage: 0 };
  parsing.value = false;
  importing.value = false;

  // Clear form validation
  if (uploadFormRef.value) {
    uploadFormRef.value.restoreValidation();
  }
};

const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  fileList.value = options.fileList;
  if (options.fileList.length > 0) {
    uploadForm.file = options.fileList[0].file as File;
  } else {
    uploadForm.file = null;
  }

  // Clear file validation error when file is selected
  if (uploadFormRef.value && uploadForm.file) {
    uploadFormRef.value.restoreValidation();
  }
};

const handleFileRemove = () => {
  fileList.value = [];
  uploadForm.file = null;
};

const downloadTemplate = () => {
  try {
    downloadTemplateUtil();
    notification.success({
      content: $t('game.importDialog.templateDownloadSuccess'),
      duration: 2000,
    });
  } catch (error) {
    console.error('下载模板失败:', error);
    notification.error({
      content: $t('game.importDialog.templateDownloadFailed'),
      duration: 3000,
    });
  }
};

const debugFormValues = () => {
  console.log('=== Form Debug Info ===');
  console.log('uploadForm:', uploadForm);
  console.log('platformOptions:', props.platformOptions);
  console.log('fileList:', fileList.value);
  console.log('uploadFormRef:', uploadFormRef.value);

  if (uploadFormRef.value) {
    uploadFormRef.value.validate((errors) => {
      console.log('Form validation errors:', errors);
    });
  }
};

const parseFileData = async () => {
  if (!uploadFormRef.value) return;

  try {
    // Manual validation instead of using form validation
    console.log('Current form values:', {
      platformId: uploadForm.platformId,
      currency: uploadForm.currency,
      file: uploadForm.file?.name,
    });

    if (!uploadForm.platformId) {
      throw new Error($t('game.importDialog.selectPlatformRequired'));
    }

    if (!uploadForm.currency) {
      throw new Error($t('game.importDialog.selectDefaultCurrency'));
    }

    if (!uploadForm.file) {
      throw new Error($t('game.importDialog.selectFileRequired'));
    }

    parsing.value = true;

    console.log('开始解析文件:', uploadForm.file.name);
    console.log('文件类型:', uploadForm.file.type);
    console.log('文件大小:', uploadForm.file.size);

    // Parse file using client-side parser
    const rawData = await parseFile(uploadForm.file);
    console.log('解析后的原始数据:', rawData);

    if (!rawData || rawData.length === 0) {
      throw new Error($t('game.importDialog.fileEmpty'));
    }

    const validationResult = validateGameData(rawData);
    console.log('验证结果:', validationResult);

    previewData.value = {
      games: validationResult.games,
      errors: validationResult.errors,
      summary: {
        total: validationResult.games.length,
        valid:
          validationResult.games.length -
          validationResult.errors.filter((e) => e.row > 1).length,
        invalid: validationResult.errors.filter((e) => e.row > 1).length,
      },
    };

    currentStep.value = 'preview';
  } catch (error: any) {
    console.error('解析文件失败:', error);
    notification.error({
      content: error?.message || $t('game.importDialog.parseFailed'),
      duration: 3000,
    });
  } finally {
    parsing.value = false;
  }
};

const startImport = async () => {
  currentStep.value = 'importing';
  importing.value = true;

  try {
    const validGames = previewData.value.games.filter((_, index) => {
      return !previewData.value.errors.some((error) => error.row === index + 2);
    });

    importProgress.value = {
      current: 0,
      total: validGames.length,
      percentage: 0,
    };

    // Simulate progress updates (slower for large files)
    const progressInterval = setInterval(() => {
      if (importProgress.value.current < importProgress.value.total) {
        importProgress.value.current++;
        importProgress.value.percentage = Math.round(
          (importProgress.value.current / importProgress.value.total) * 100,
        );
      }
    }, 500); // Slower progress updates for large files

    // Call the real import API with no timeout
    const response = await importGamesFromFileApi({
      games: validGames.map((game) => ({
        gameId: game.gameId,
        gameNameCn: game.gameNameCn,
        gameNameEn: game.gameNameEn,
        gameType: game.gameType,
        gameDisplayId: game.gameDisplayId?.trim() || undefined,
        iconUrl: game.iconUrl,
        remark: game.remark,
      })),
      platformId: uploadForm.platformId!,
      currency: uploadForm.currency,
      vendor: uploadForm.vendor,
    });

    clearInterval(progressInterval);
    importResults.value = response;
    currentStep.value = 'results';
  } catch (error: any) {
    console.error('导入失败:', error);
    notification.error({
      content: error?.message || $t('game.importDialog.importFailed'),
      duration: 3000,
    });
    currentStep.value = 'preview';
  } finally {
    importing.value = false;
  }
};

const handleImportComplete = () => {
  emit('success');
  visible.value = false;
};

const getRowClassName = (row: ImportGameData, index: number) => {
  const hasError = previewData.value.errors.some(
    (error) => error.row === index + 2,
  );
  return hasError ? 'error-row' : '';
};

const getResultRowClassName = (row: FileImportResult) => {
  return `result-row-${row.status}`;
};

// Watch for platform selection to clear validation
watch(
  () => uploadForm.platformId,
  (newVal) => {
    if (newVal && uploadFormRef.value) {
      uploadFormRef.value.restoreValidation();
    }
  },
);

// Watch for currency selection to clear validation
watch(
  () => uploadForm.currency,
  (newVal) => {
    if (newVal && uploadFormRef.value) {
      uploadFormRef.value.restoreValidation();
    }
  },
);
</script>

<style scoped>
.upload-area {
  padding: 40px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.upload-text {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.upload-hint {
  font-size: 14px;
  color: #666;
}

:deep(.error-row) {
  background-color: #fef2f2;
}

:deep(.result-row-success) {
  background-color: #f0f9ff;
}

:deep(.result-row-error) {
  background-color: #fef2f2;
}

:deep(.result-row-skipped) {
  background-color: #fffbeb;
}

.list-disc {
  list-style-type: disc;
}

.list-inside {
  list-style-position: inside;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}
</style>
