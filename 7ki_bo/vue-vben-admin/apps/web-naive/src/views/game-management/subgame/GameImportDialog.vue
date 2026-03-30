<template>
  <n-modal
    v-model:show="visible"
    :title="
      currentStep === 'upload'
        ? '导入游戏'
        : currentStep === 'preview'
          ? '预览导入数据'
          : '导入结果'
    "
    preset="dialog"
    :style="{ width: currentStep === 'upload' ? '600px' : '1000px' }"
    :closable="currentStep !== 'importing'"
    :mask-closable="currentStep !== 'importing'"
    @after-leave="resetDialog"
  >
    <!-- Step 1: File Upload -->
    <div v-if="currentStep === 'upload'" class="upload-step">
      <div class="mb-6">
        <n-alert type="info" :show-icon="false" class="mb-4">
          <div class="text-sm">
            <p class="mb-2">
              支持的文件格式：CSV (.csv) 推荐，Excel (.xlsx, .xls) 实验性支持
            </p>
            <p class="mb-2">文件要求：</p>
            <ul class="ml-4 list-inside list-disc space-y-1">
              <li>第一行为标题行</li>
              <li>
                必填列：Game Name (中文)、Game Name (英文)、游戏类型、GameID
              </li>
              <li>可选列：显示ID、Icon、备注</li>
              <li>支持大文件导入（无行数限制）</li>
              <li>大文件导入可能需要几分钟时间，请耐心等待</li>
              <li>Excel文件如果解析失败，请另存为CSV格式</li>
            </ul>
          </div>
        </n-alert>

        <div class="mb-4 flex gap-4">
          <n-button type="primary" ghost @click="downloadTemplate">
            <template #icon>
              <icon-download />
            </template>
            下载模板
          </n-button>
          <n-button type="info" ghost @click="debugFormValues">
            调试表单值
          </n-button>
        </div>
      </div>

      <n-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules">
        <n-form-item label="所属平台" path="platformId">
          <n-select
            v-model:value="uploadForm.platformId"
            placeholder="选择所属平台"
            :options="platformOptions"
            value-field="value"
            label-field="label"
            clearable
          />
        </n-form-item>

        <n-form-item label="游戏厂商" path="vendor">
          <n-input
            v-model:value="uploadForm.vendor"
            placeholder="请输入游戏厂商，如 PG Soft / CQ9 / JILI"
          />
        </n-form-item>

        <n-form-item label="默认币种" path="currency">
          <n-select
            v-model:value="uploadForm.currency"
            placeholder="选择默认币种"
            :options="currencyOptions"
          />
        </n-form-item>

        <n-form-item label="导入文件" path="file">
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
                <p class="upload-text">点击或拖拽文件到此区域上传</p>
                <p class="upload-hint">
                  支持 Excel (.xlsx, .xls) 和 CSV (.csv) 文件
                </p>
              </div>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>
      </n-form>
    </div>

    <!-- Step 2: Preview Data -->
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
              发现 {{ previewData.errors.length }} 个数据错误，请检查并修正：
            </p>
            <div class="max-h-32 overflow-y-auto">
              <div
                v-for="error in previewData.errors"
                :key="`${error.row}-${error.field}`"
                class="mb-1"
              >
                第{{ error.row }}行 {{ error.field }}：{{ error.message }}
              </div>
            </div>
          </div>
        </n-alert>

        <div class="mb-4 flex items-center justify-between">
          <div class="flex gap-4">
            <n-statistic label="总数据" :value="previewData.summary.total" />
            <n-statistic label="有效数据" :value="previewData.summary.valid" />
            <n-statistic
              label="错误数据"
              :value="previewData.summary.invalid"
            />
          </div>
          <div class="flex gap-2">
            <n-button @click="currentStep = 'upload'">返回上传</n-button>
            <n-button
              type="primary"
              :disabled="previewData.summary.valid === 0"
              @click="startImport"
            >
              开始导入 ({{ previewData.summary.valid }}条)
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

    <!-- Step 3: Importing -->
    <div v-else-if="currentStep === 'importing'" class="importing-step">
      <div class="py-8 text-center">
        <n-spin size="large" />
        <p class="mt-4 text-lg">正在导入数据，请稍候...</p>
        <p class="mt-2 text-sm text-gray-500">
          已处理 {{ importProgress.current }} /
          {{ importProgress.total }} 条数据
        </p>
        <p class="mt-2 text-sm text-orange-600">
          <strong
            >大文件导入可能需要几分钟时间，请耐心等待，不要关闭页面</strong
          >
        </p>
        <n-progress
          type="line"
          :percentage="importProgress.percentage"
          :show-indicator="false"
          class="mt-4"
        />
      </div>
    </div>

    <!-- Step 4: Results -->
    <div v-else-if="currentStep === 'results'" class="results-step">
      <div class="mb-4">
        <n-alert
          :type="importResults.summary.error > 0 ? 'warning' : 'success'"
          :show-icon="false"
          class="mb-4"
        >
          <div class="text-sm">
            <p class="mb-2">导入完成！</p>
            <div class="flex gap-6">
              <span>总计：{{ importResults.summary.total }}</span>
              <span class="text-green-600"
                >成功：{{ importResults.summary.success }}</span
              >
              <span class="text-red-600"
                >失败：{{ importResults.summary.error }}</span
              >
              <span class="text-orange-600"
                >跳过：{{ importResults.summary.skipped }}</span
              >
            </div>
          </div>
        </n-alert>

        <div class="mb-4 flex justify-end gap-2">
          <n-button @click="visible = false">关闭</n-button>
          <n-button type="primary" @click="handleImportComplete">
            确定
          </n-button>
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
        <n-button @click="visible = false">取消</n-button>
        <n-button
          type="primary"
          :loading="parsing"
          :disabled="!uploadForm.file || !uploadForm.platformId"
          @click="parseFileData"
        >
          解析文件
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
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
      message: '请选择所属平台',
      trigger: ['blur', 'change'],
      validator: (_, value) => {
        if (!value) {
          return new Error('请选择所属平台');
        }
        return true;
      },
    },
  ],
  vendor: [
    { required: true, message: '请输入游戏厂商', trigger: ['blur', 'change'] },
  ],
  currency: [
    {
      required: true,
      message: '请选择默认币种',
      trigger: ['blur', 'change'],
      validator: (_, value) => {
        if (!value) {
          return new Error('请选择默认币种');
        }
        return true;
      },
    },
  ],
  file: [
    {
      required: true,
      message: '请选择要导入的文件',
      trigger: ['blur', 'change'],
      validator: (_, value) => {
        if (!value) {
          return new Error('请选择要导入的文件');
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
  { title: '行号', key: 'no', width: 60 },
  { title: '游戏名称(中文)', key: 'gameNameCn', width: 150 },
  { title: '游戏名称(英文)', key: 'gameNameEn', width: 150 },
  { title: '游戏类型', key: 'gameType', width: 100 },
  { title: '游戏ID', key: 'gameId', width: 120 },
  { title: '显示ID', key: 'gameDisplayId', width: 100 },
  {
    title: '图标链接',
    key: 'iconUrl',
    width: 200,
    ellipsis: { tooltip: true },
  },
  { title: '备注', key: 'remark', width: 150, ellipsis: { tooltip: true } },
];

// Results table columns
const resultColumns: DataTableColumns<FileImportResult> = [
  { title: '行号', key: 'row', width: 60 },
  { title: '游戏ID', key: 'gameId', width: 120 },
  { title: '游戏名称', key: 'gameNameCn', width: 150 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      const statusMap = {
        success: { text: '成功', type: 'success' },
        error: { text: '失败', type: 'error' },
        skipped: { text: '跳过', type: 'warning' },
      };
      const status = statusMap[row.status] || { text: '未知', type: 'default' };
      return `${status.text}`;
    },
  },
  { title: '消息', key: 'message', width: 200, ellipsis: { tooltip: true } },
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
      content: '模板下载成功',
      duration: 2000,
    });
  } catch (error) {
    console.error('下载模板失败:', error);
    notification.error({
      content: '下载模板失败',
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
      throw new Error('请选择所属平台');
    }

    if (!uploadForm.currency) {
      throw new Error('请选择默认币种');
    }

    if (!uploadForm.file) {
      throw new Error('请选择要导入的文件');
    }

    parsing.value = true;

    console.log('开始解析文件:', uploadForm.file.name);
    console.log('文件类型:', uploadForm.file.type);
    console.log('文件大小:', uploadForm.file.size);

    // Parse file using client-side parser
    const rawData = await parseFile(uploadForm.file);
    console.log('解析后的原始数据:', rawData);

    if (!rawData || rawData.length === 0) {
      throw new Error('文件为空或无法解析');
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
      content: error?.message || '解析文件失败',
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
      content: error?.message || '导入失败',
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
