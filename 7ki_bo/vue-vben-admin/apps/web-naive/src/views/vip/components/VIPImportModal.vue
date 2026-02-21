<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="导入VIP等级"
    :style="{ width: '600px' }"
    :closable="false"
    :mask-closable="false"
  >
    <div class="vip-import-modal">
      <n-alert type="info" class="mb-4">
        <template #header>导入说明</template>
        <div>
          <p>1. 支持Excel (.xlsx, .xls) 和CSV (.csv) 文件格式</p>
          <p>2. 文件大小不超过10MB</p>
          <p>3. 请确保文件包含必要的字段：等级、名称、颜色等</p>
          <p>4. 导入前请备份现有数据</p>
        </div>
      </n-alert>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="选择文件" path="file">
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
                点击或拖拽文件到此区域上传
              </n-text>
              <n-p depth="3" style="margin: 8px 0 0 0">
                支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式
              </n-p>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>

        <n-form-item label="导入模式" path="importMode">
          <n-radio-group v-model:value="formData.importMode">
            <n-space direction="vertical">
              <n-radio value="append">
                <div>
                  <div>追加模式</div>
                  <div class="text-sm text-gray-500">
                    在现有数据基础上添加新的VIP等级
                  </div>
                </div>
              </n-radio>
              <n-radio value="overwrite">
                <div>
                  <div>覆盖模式</div>
                  <div class="text-sm text-gray-500">
                    清空现有数据后导入新的VIP等级
                  </div>
                </div>
              </n-radio>
              <n-radio value="update">
                <div>
                  <div>更新模式</div>
                  <div class="text-sm text-gray-500">
                    根据等级编号更新现有VIP等级
                  </div>
                </div>
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="错误处理" path="errorHandling">
          <n-select
            v-model:value="formData.errorHandling"
            :options="errorHandlingOptions"
            placeholder="请选择错误处理方式"
          />
        </n-form-item>
      </n-form>

      <n-divider />

      <div class="mb-4">
        <n-text strong>模板下载</n-text>
        <n-p depth="3" class="mt-2">
          如果您是首次导入，建议先下载模板文件，按照模板格式填写数据后再导入。
        </n-p>
        <n-button type="primary" ghost @click="handleDownloadTemplate">
          下载Excel模板
        </n-button>
      </div>

      <n-divider />

      <!-- 预览区域 -->
      <div v-if="previewData.length > 0" class="preview-section">
        <n-text strong>数据预览</n-text>
        <n-p depth="3" class="mt-2">
          检测到 {{ previewData.length }} 条VIP等级数据，请确认后导入。
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
        <n-button @click="handleCancel">取消</n-button>
        <n-button
          type="primary"
          :loading="submitLoading"
          :disabled="!formData.file"
          @click="handleSubmit"
        >
          开始导入
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
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

// 响应式数据
const formRef = ref<FormInst>();
const uploadRef = ref();
const submitLoading = ref(false);
const fileList = ref<UploadFileInfo[]>([]);
const previewData = ref<any[]>([]);

// 计算属性
const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

// 表单数据
const formData = reactive({
  file: null as File | null,
  importMode: 'append' as 'append' | 'overwrite' | 'update',
  errorHandling: 'skip' as 'skip' | 'stop' | 'log',
});

// 选项配置
const errorHandlingOptions = [
  { label: '跳过错误行继续导入', value: 'skip' },
  { label: '遇到错误停止导入', value: 'stop' },
  { label: '记录错误但继续导入', value: 'log' },
];

// 预览表格列配置
const previewColumns: DataTableColumns<any> = [
  { title: '等级', key: 'level', width: 80 },
  { title: '名称', key: 'name', width: 120 },
  { title: '颜色', key: 'color', width: 100 },
  { title: '币种', key: 'currency', width: 80 },
  { title: '晋级奖金', key: 'upgradeBonus', width: 100 },
  { title: '月返水', key: 'monthlyRebate', width: 80 },
  { title: '状态', key: 'isActive', width: 80 },
];

// 表单验证规则
const rules: FormRules = {
  file: [{ required: true, message: '请选择要导入的文件', trigger: 'change' }],
  importMode: [
    { required: true, message: '请选择导入模式', trigger: 'change' },
  ],
  errorHandling: [
    { required: true, message: '请选择错误处理方式', trigger: 'change' },
  ],
};

// 文件处理
const handleBeforeUpload = (data: { file: UploadFileInfo }) => {
  const file = data.file.file;
  if (!file) return false;

  // 检查文件类型
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];

  if (!allowedTypes.includes(file.type)) {
    message.error('只支持Excel和CSV文件格式');
    return false;
  }

  // 检查文件大小 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    message.error('文件大小不能超过10MB');
    return false;
  }

  return false; // 阻止自动上传
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

// 文件预览
const handleFilePreview = async (file: File) => {
  try {
    // 这里应该调用实际的文件解析API
    // 模拟预览数据
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
    message.success('文件解析成功，请查看预览数据');
  } catch (error) {
    message.error('文件解析失败，请检查文件格式');
    console.error('File preview error:', error);
  }
};

// 下载模板
const handleDownloadTemplate = () => {
  // 创建模板数据
  const templateData = [
    [
      '等级',
      '名称',
      '颜色',
      '币种',
      '当月充值',
      '当月投注',
      '积分要求',
      '晋级奖金',
      '月返水',
      '周任务值',
      '日任务值',
      '提现额度',
      '提现次数',
      '客服优先级',
      '状态',
      '显示顺序',
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
      '否',
      '启用',
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
      '否',
      '启用',
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
      '是',
      '启用',
      3,
    ],
  ];

  // 创建CSV内容
  const csvContent = templateData.map((row) => row.join(',')).join('\n');

  // 创建并下载文件
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'VIP等级导入模板.csv';
  link.click();
  URL.revokeObjectURL(link.href);

  message.success('模板下载成功');
};

// 事件处理
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();

    if (!formData.file) {
      message.error('请选择要导入的文件');
      return;
    }

    submitLoading.value = true;

    // 这里应该调用实际的导入API
    // 模拟导入过程
    await new Promise((resolve) => setTimeout(resolve, 2000));

    message.success('VIP等级导入成功');
    emit('success');
    showModal.value = false;

    // 重置表单
    resetForm();
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message || 'VIP等级导入失败');
    } else {
      message.error('表单验证失败，请检查输入');
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

// 重置表单
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

/* 滚动条样式 */
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
