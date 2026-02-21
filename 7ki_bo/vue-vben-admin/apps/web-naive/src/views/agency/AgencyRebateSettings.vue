<template>
  <Page>
    <n-card>
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="validBet" tab="有效投注返水设置">
          <div class="rebate-settings-container">
            <!-- 搜索区 -->
            <div class="mb-4">
              <n-card size="small">
                <n-form inline :show-label="false">
                  <n-form-item>
                    <n-input
                      v-model:value="searchForm.gameCategory"
                      placeholder="搜索游戏分类"
                      clearable
                      style="width: 200px"
                    />
                  </n-form-item>
                  <n-form-item>
                    <n-select
                      v-model:value="searchForm.isActive"
                      placeholder="状态"
                      clearable
                      style="width: 120px"
                      :options="statusOptions"
                    />
                  </n-form-item>
                  <n-form-item>
                    <n-button type="primary" @click="handleSearch">
                      <template #icon>
                        <n-icon><SearchOutline /></n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button
                      @click="handleResetSearch"
                      style="margin-left: 8px"
                    >
                      重置
                    </n-button>
                  </n-form-item>
                </n-form>
              </n-card>
            </div>

            <!-- 统计信息 -->
            <div class="mb-4">
              <n-card size="small">
                <div class="grid grid-cols-4 gap-4">
                  <n-statistic
                    label="总配置数"
                    :value="statistics.totalConfigs"
                  />
                  <n-statistic
                    label="游戏分类"
                    :value="statistics.totalGameCategories"
                  />
                  <n-statistic
                    label="平均返水率"
                    :value="`${statistics.averageRebateRate}%`"
                  />
                  <n-statistic
                    label="最后更新"
                    :value="formatDate(statistics.lastUpdated)"
                  />
                </div>
              </n-card>
            </div>

            <!-- 🚀 NEW: SmartDataGrid Component -->
            <SmartDataGrid
              :data="tableData"
              :columns="columns"
              :loading="loading"
              :pagination="paginationReactive"
              selectable
              :selected-keys="selectedRowKeys"
              row-key="id"
              @update:selected-keys="selectedRowKeys = $event"
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
              @refresh="handleRefresh"
              @row-click="handleRowClick"
              :scroll-x="1200"
              size="small"
              striped
            >
              <template #actionBar="{ selectedCount, selectedRows }">
                <n-card :bordered="false" class="rounded-16px shadow-sm">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <!-- 主要操作按钮 -->
                      <div class="flex gap-2">
                        <n-button type="primary" @click="handleCreate">
                          新增返水规则
                        </n-button>
                        <n-button
                          type="success"
                          @click="handleDownloadTemplate"
                        >
                          下载模板
                        </n-button>
                        <n-button type="info" @click="handleImportExcel">
                          Excel导入
                        </n-button>
                      </div>

                      <!-- 选择信息 -->
                      <div class="text-sm text-gray-600">
                        已选择 {{ selectedCount }} 条数据，共
                        {{ paginationReactive.total }} 条
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <!-- 批量操作 -->
                      <n-button
                        v-if="selectedCount > 0"
                        type="warning"
                        size="small"
                        @click="handleBatchModify(selectedRows)"
                      >
                        批量修改 ({{ selectedCount }})
                      </n-button>

                      <!-- 选择控制 -->
                      <n-button size="small" @click="clearSelection"
                        >清空选择</n-button
                      >
                      <n-button size="small" @click="selectAll">全选</n-button>
                    </div>
                  </div>
                </n-card>
              </template>
            </SmartDataGrid>
          </div>
        </n-tab-pane>

        <n-tab-pane name="netProfit" tab="净盈利返水设置">
          <div class="rebate-settings-container">
            <!-- 搜索区 -->
            <div class="mb-4">
              <n-card size="small">
                <n-form inline :show-label="false">
                  <n-form-item>
                    <n-input
                      v-model:value="searchForm.gameCategory"
                      placeholder="搜索游戏分类"
                      clearable
                      style="width: 200px"
                    />
                  </n-form-item>
                  <n-form-item>
                    <n-select
                      v-model:value="searchForm.isActive"
                      placeholder="状态"
                      clearable
                      style="width: 120px"
                      :options="statusOptions"
                    />
                  </n-form-item>
                  <n-form-item>
                    <n-button type="primary" @click="handleSearch">
                      <template #icon>
                        <n-icon><SearchOutline /></n-icon>
                      </template>
                      搜索
                    </n-button>
                    <n-button
                      @click="handleResetSearch"
                      style="margin-left: 8px"
                    >
                      重置
                    </n-button>
                  </n-form-item>
                </n-form>
              </n-card>
            </div>

            <!-- 统计信息 -->
            <div class="mb-4">
              <n-card size="small">
                <div class="grid grid-cols-4 gap-4">
                  <n-statistic
                    label="总配置数"
                    :value="statistics.totalConfigs"
                  />
                  <n-statistic
                    label="游戏分类"
                    :value="statistics.totalGameCategories"
                  />
                  <n-statistic
                    label="平均返水率"
                    :value="`${statistics.averageRebateRate}%`"
                  />
                  <n-statistic
                    label="最后更新"
                    :value="formatDate(statistics.lastUpdated)"
                  />
                </div>
              </n-card>
            </div>

            <!-- 🚀 NEW: SmartDataGrid Component -->
            <SmartDataGrid
              :data="tableData"
              :columns="columns"
              :loading="loading"
              :pagination="paginationReactive"
              selectable
              :selected-keys="selectedRowKeys"
              row-key="id"
              @update:selected-keys="selectedRowKeys = $event"
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
              @refresh="handleRefresh"
              @row-click="handleRowClick"
              :scroll-x="1200"
              size="small"
              striped
            >
              <template #actionBar="{ selectedCount, selectedRows }">
                <n-card :bordered="false" class="rounded-16px shadow-sm">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <!-- 主要操作按钮 -->
                      <div class="flex gap-2">
                        <n-button type="primary" @click="handleCreate">
                          新增返水规则
                        </n-button>
                        <n-button
                          type="success"
                          @click="handleDownloadTemplate"
                        >
                          下载模板
                        </n-button>
                        <n-button type="info" @click="handleImportExcel">
                          Excel导入
                        </n-button>
                      </div>

                      <!-- 选择信息 -->
                      <div class="text-sm text-gray-600">
                        已选择 {{ selectedCount }} 条数据，共
                        {{ paginationReactive.total }} 条
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <!-- 批量操作 -->
                      <n-button
                        v-if="selectedCount > 0"
                        type="warning"
                        size="small"
                        @click="handleBatchModify(selectedRows)"
                      >
                        批量修改 ({{ selectedCount }})
                      </n-button>

                      <!-- 选择控制 -->
                      <n-button size="small" @click="clearSelection"
                        >清空选择</n-button
                      >
                      <n-button size="small" @click="selectAll">全选</n-button>
                    </div>
                  </div>
                </n-card>
              </template>
            </SmartDataGrid>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 新增/编辑弹窗 -->
    <n-modal
      v-model:show="showEditModal"
      preset="dialog"
      :title="editMode === 'create' ? '新增返水规则' : '编辑返水规则'"
      style="width: 600px"
      :mask-closable="false"
      @after-leave="handleEditModalClose"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="130px"
        class="mt-4"
      >
        <n-form-item label="游戏分类" path="gameCategory">
          <n-select
            v-model:value="formData.gameCategory"
            placeholder="请选择游戏分类"
            :options="gameCategoryOptions"
            filterable
            tag
          />
        </n-form-item>
        <n-form-item label="序号" path="sortOrder">
          <n-input
            :value="formData.sortOrder"
            readonly
            placeholder="自动生成"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="有效人数门槛" path="validUserThreshold">
          <n-input-number
            v-model:value="formData.validUserThreshold"
            placeholder="请输入有效人数门槛（0表示不限制）"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="有效投注门槛(万)" path="validBetThreshold">
          <n-input-number
            v-model:value="formData.validBetThreshold"
            placeholder="请输入有效投注门槛（单位：万）"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="每万投注返金额" path="rebateAmountPer10k">
          <n-input-number
            v-model:value="formData.rebateAmountPer10k"
            placeholder="请输入每万投注返金额"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="返佣比例" path="rebatePercentage">
          <n-input
            :value="rebatePercentage"
            readonly
            placeholder="自动计算"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="状态" path="isActive">
          <n-switch
            v-model:value="formData.isActive"
            :checked-value="true"
            :unchecked-value="false"
          />
        </n-form-item>
        <n-form-item label="备注" path="remarks">
          <n-input
            v-model:value="formData.remarks"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave" :loading="saving">
            {{ editMode === 'create' ? '创建' : '更新' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量修改弹窗 -->
    <n-modal
      v-model:show="showBatchModal"
      preset="dialog"
      title="批量修改返水规则"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="batchFormRef"
        :model="batchFormData"
        :rules="batchFormRules"
        label-placement="left"
        label-width="130px"
        class="mt-4"
      >
        <n-form-item label="有效人数门槛" path="validUserThreshold">
          <n-input-number
            v-model:value="batchFormData.validUserThreshold"
            placeholder="请输入有效人数门槛（留空表示不修改）"
            :min="0"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="有效投注门槛(万)" path="validBetThreshold">
          <n-input-number
            v-model:value="batchFormData.validBetThreshold"
            placeholder="请输入有效投注门槛（留空表示不修改）"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="每万投注返金额" path="rebateAmountPer10k">
          <n-input-number
            v-model:value="batchFormData.rebateAmountPer10k"
            placeholder="请输入每万投注返金额（留空表示不修改）"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="状态" path="isActive">
          <n-select
            v-model:value="batchFormData.isActive"
            placeholder="请选择状态（留空表示不修改）"
            clearable
            :options="statusOptions"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" @click="handleBatchSave" :loading="saving">
            批量更新
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Excel导入弹窗 -->
    <n-modal
      v-model:show="showImportModal"
      preset="dialog"
      title="Excel导入返水规则"
      style="width: 600px"
      :mask-closable="false"
    >
      <div class="import-content">
        <n-alert type="info" class="mb-4">
          <p>请先下载模板文件，按照模板格式填写数据后再上传。</p>
          <p>支持的文件格式：.xlsx, .xls</p>
        </n-alert>

        <n-upload
          ref="uploadRef"
          v-model:file-list="importFileList"
          :max="1"
          :on-before-upload="handleBeforeUpload"
          :on-remove="handleRemoveFile"
          accept=".xlsx,.xls"
          :show-file-list="true"
        >
          <n-upload-dragger>
            <div style="margin-bottom: 12px">
              <n-icon size="48" :depth="3">
                <CloudUploadOutline />
              </n-icon>
            </div>
            <n-text style="font-size: 16px"
              >点击或者拖动文件到该区域来上传</n-text
            >
            <n-p depth="3" style="margin: 8px 0 0 0">
              请选择Excel文件进行批量导入
            </n-p>
          </n-upload-dragger>
        </n-upload>
      </div>
      <template #action>
        <n-space>
          <n-button @click="showImportModal = false">取消</n-button>
          <n-button
            type="primary"
            @click="handleImportSave"
            :loading="importing"
          >
            开始导入
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  h,
  watch,
  defineAsyncComponent,
} from 'vue';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const SmartDataGrid = defineAsyncComponent(
  () => import('../../components/smart/SmartDataGrid/index.vue'),
);
import { Page } from '@vben/common-ui';
import {
  NCard,
  NTabs,
  NTabPane,
  NButton,
  NSpace,
  NIcon,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NModal,
  NStatistic,
  NAlert,
  NUpload,
  NUploadDragger,
  NText,
  NP,
  NTag,
  NPopconfirm,
  NTooltip,
  useMessage,
  useDialog,
  type DataTableColumns,
  type DataTableRowKey,
  type FormInst,
  type FormRules,
  type UploadFileInfo,
  type UploadInst,
} from 'naive-ui';

// Icons
import { CloudUploadOutline, SearchOutline } from '@vicons/ionicons5';

// API
import {
  getRebateSettings,
  createRebateSetting,
  updateRebateSetting,
  deleteRebateSetting,
  batchUpdateRebateSettings,
  downloadRebateTemplate,
  batchImportRebateSettings,
  getRebateStatistics,
  getGameCategories,
  type RebateConfig,
  type RebateSettingsQuery,
} from '#/api/agency/rebate-settings';

// Types
interface SearchForm {
  gameCategory: string;
  isActive: boolean | null;
}

interface FormData {
  gameCategory: string;
  sortOrder: number;
  validUserThreshold: number;
  validBetThreshold: number;
  rebateAmountPer10k: number;
  remarks: string;
  isActive: boolean;
}

interface BatchFormData {
  validUserThreshold: number | null;
  validBetThreshold: number | null;
  rebateAmountPer10k: number | null;
  isActive: boolean | null;
}

interface Statistics {
  totalConfigs: number;
  totalGameCategories: number;
  averageRebateRate: number;
  lastUpdated: string;
}

// 组件状态
const message = useMessage();

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const importing = ref(false);
const activeTab = ref<'validBet' | 'netProfit'>('validBet');
const showEditModal = ref(false);
const showBatchModal = ref(false);
const showImportModal = ref(false);
const editMode = ref<'create' | 'edit'>('create');
const selectedRowKeys = ref<DataTableRowKey[]>([]);
const tableData = ref<RebateConfig[]>([]);
const gameCategoryOptions = ref<{ label: string; value: string }[]>([]);
const importFileList = ref<UploadFileInfo[]>([]);

// 表单引用
const formRef = ref<FormInst | null>(null);
const batchFormRef = ref<FormInst | null>(null);
const uploadRef = ref<UploadInst | null>(null);
const tableRef = ref();

// 搜索表单
const searchForm = reactive<SearchForm>({
  gameCategory: '',
  isActive: null,
});

// 编辑表单数据
const formData = reactive<FormData>({
  gameCategory: '',
  sortOrder: 0, // Will be auto-generated by backend
  validUserThreshold: 1,
  validBetThreshold: 1,
  rebateAmountPer10k: 1,
  remarks: '',
  isActive: true,
});

// 批量修改表单数据
const batchFormData = reactive<BatchFormData>({
  validUserThreshold: null,
  validBetThreshold: null,
  rebateAmountPer10k: null,
  isActive: null,
});

// 统计数据
const statistics = reactive<Statistics>({
  totalConfigs: 0,
  totalGameCategories: 0,
  averageRebateRate: 0,
  lastUpdated: '',
});

// 分页配置 (simplified for SmartDataGrid)
const paginationReactive = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 选项配置
const statusOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false },
] as const;

// 表单验证规则
const formRules: FormRules = {
  gameCategory: [
    { required: true, message: '请选择游戏分类', trigger: 'change' },
  ],
  // sortOrder is auto-generated, no validation needed
  validUserThreshold: [
    {
      type: 'number',
      min: 0,
      message: '有效人数门槛不能小于0',
      trigger: 'blur',
    },
  ],
  validBetThreshold: [
    {
      type: 'number',
      min: 0,
      message: '有效投注门槛不能小于0',
      trigger: 'blur',
    },
  ],
  rebateAmountPer10k: [
    {
      type: 'number',
      min: 0,
      message: '每万投注返金额不能小于0',
      trigger: 'blur',
    },
  ],
};

const batchFormRules: FormRules = {
  validUserThreshold: [
    {
      type: 'number',
      min: 0,
      message: '有效人数门槛不能小于0',
      trigger: 'blur',
    },
  ],
  validBetThreshold: [
    {
      type: 'number',
      min: 0,
      message: '有效投注门槛不能小于0',
      trigger: 'blur',
    },
  ],
  rebateAmountPer10k: [
    {
      type: 'number',
      min: 0,
      message: '每万投注返金额不能小于0',
      trigger: 'blur',
    },
  ],
};

// 计算返佣比例
const rebatePercentage = computed(() => {
  if (formData.rebateAmountPer10k > 0) {
    const percentage = (formData.rebateAmountPer10k / 10000) * 100;
    return `${percentage.toFixed(4)}%`;
  }
  return '0%';
});

// 当前编辑的记录
const currentRecord = ref<RebateConfig | null>(null);

// 表格列配置
const columns: DataTableColumns<RebateConfig> = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: '序号',
    key: 'sortOrder',
    width: 80,
    sorter: true,
  },
  {
    title: '游戏分类',
    key: 'gameCategory',
    width: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '有效人数门槛',
    key: 'validUserThreshold',
    width: 120,
    render: (row) => {
      return row.validUserThreshold === 0
        ? '不限制'
        : `${row.validUserThreshold}人`;
    },
  },
  {
    title: '有效投注门槛',
    key: 'validBetThreshold',
    width: 120,
    render: (row) => {
      return `${row.validBetThreshold}万`;
    },
  },
  {
    title: '每万投注返金额',
    key: 'rebateAmountPer10k',
    width: 150,
    render: (row) => {
      const percentage = (row.rebateAmountPer10k / 10000) * 100;
      return `${row.rebateAmountPer10k} (${percentage.toFixed(4)}%)`;
    },
  },
  {
    title: '状态',
    key: 'isActive',
    width: 80,
    render: (row) => {
      return h(
        NTag,
        { type: row.isActive ? 'success' : 'error' },
        { default: () => (row.isActive ? '启用' : '禁用') },
      );
    },
  },
  {
    title: '备注',
    key: 'remarks',
    width: 150,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 180,
    render: (row) => {
      return formatDate(row.updatedAt);
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) => {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NTooltip,
              { trigger: 'hover' },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'primary',
                      quaternary: true,
                      onClick: () => handleEdit(row),
                    },
                    { default: () => '编辑' },
                  ),
                default: () => '编辑',
              },
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleDelete(row.id!),
              },
              {
                trigger: () =>
                  h(
                    NTooltip,
                    { trigger: 'hover' },
                    {
                      trigger: () =>
                        h(
                          NButton,
                          {
                            size: 'small',
                            type: 'error',
                            quaternary: true,
                          },
                          { default: () => '删除' },
                        ),
                      default: () => '删除',
                    },
                  ),
                default: () => '确认删除此返水规则吗？',
              },
            ),
          ],
        },
      );
    },
  },
];

// 格式化日期
const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params: RebateSettingsQuery = {
      type: activeTab.value,
      page: paginationReactive.page,
      pageSize: paginationReactive.pageSize,
    };

    if (searchForm.gameCategory) {
      params.gameCategory = searchForm.gameCategory;
    }

    console.log('Loading rebate settings with params:', params);
    const response = await getRebateSettings(params);
    console.log('Rebate settings response:', response);

    if (response && response.data) {
      console.log('First record in response:', response.data[0]);
      tableData.value = response.data || [];
      paginationReactive.total = response.pagination?.total || 0;
    } else {
      // 提供一些示例数据作为后备
      tableData.value = [
        {
          id: '1',
          gameCategory: 'slot',
          sortOrder: 1,
          validUserThreshold: 10,
          validBetThreshold: 100,
          rebateAmountPer10k: 50,
          remarks: '示例配置',
          type: activeTab.value,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      paginationReactive.total = 1;
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
    // 提供示例数据作为后备
    tableData.value = [
      {
        id: '1',
        gameCategory: 'slot',
        sortOrder: 1,
        validUserThreshold: 10,
        validBetThreshold: 100,
        rebateAmountPer10k: 50,
        remarks: '示例配置',
        type: activeTab.value,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    paginationReactive.total = 1;
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStatistics = async () => {
  try {
    console.log('Loading statistics for type:', activeTab.value);
    const stats = await getRebateStatistics(activeTab.value);
    console.log('Statistics response:', stats);
    if (stats) {
      Object.assign(statistics, stats);
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    // 提供默认统计数据
    Object.assign(statistics, {
      totalConfigs: 1,
      totalGameCategories: 7,
      averageRebateRate: 0.5,
      lastUpdated: new Date().toISOString(),
    });
  }
};

// 加载游戏分类选项
const loadGameCategories = async () => {
  // 先设置默认的游戏分类选项
  const defaultCategories = [
    { value: 'slot', label: '电子游戏', description: 'Electronic slot games' },
    { value: 'live', label: '真人娱乐', description: 'Live dealer games' },
    { value: 'card', label: '棋牌游戏', description: 'Card and board games' },
    { value: 'lottery', label: '彩票游戏', description: 'Lottery games' },
    { value: 'sports', label: '体育投注', description: 'Sports betting' },
    { value: 'fishing', label: '捕鱼游戏', description: 'Fishing games' },
    { value: 'esports', label: '电竞游戏', description: 'Esports betting' },
  ];

  // 设置默认选项
  gameCategoryOptions.value = defaultCategories;
  console.log('Default game categories set:', gameCategoryOptions.value);

  try {
    console.log('Loading game categories from API...');
    const categories = await getGameCategories();
    console.log('Game categories API response:', categories);

    if (categories && categories.length > 0) {
      gameCategoryOptions.value = categories;
      console.log(
        'Updated game categories from API:',
        gameCategoryOptions.value,
      );
    } else {
      console.log('API returned empty categories, keeping defaults');
    }
  } catch (error) {
    console.error('加载游戏分类失败:', error);
    console.log('Keeping default game categories due to API error');
  }
};

// 事件处理
const handleCreate = () => {
  editMode.value = 'create';
  resetFormData();
  showEditModal.value = true;
};

const handleEdit = (record: RebateConfig) => {
  editMode.value = 'edit';
  currentRecord.value = record;

  console.log('Editing record:', record);

  // Convert Decimal values to numbers for form inputs
  const formValues = {
    gameCategory: record.gameCategory,
    sortOrder: record.sortOrder, // Keep existing sortOrder for editing
    validUserThreshold: Number(record.validUserThreshold),
    validBetThreshold: Number(record.validBetThreshold),
    rebateAmountPer10k: Number(record.rebateAmountPer10k),
    remarks: record.remarks || '',
    isActive: record.isActive !== undefined ? record.isActive : true,
  };

  console.log('Form values to set:', formValues);

  Object.assign(formData, formValues);
  console.log('Form data after assignment:', formData);
  showEditModal.value = true;
};

const handleDelete = async (id: string) => {
  try {
    await deleteRebateSetting(id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
    message.error('删除失败');
  }
};

const handleBatchModify = (selectedRows?: RebateConfig[]) => {
  const rowsToModify =
    selectedRows ||
    tableData.value.filter((item) => selectedRowKeys.value.includes(item.id!));

  if (rowsToModify.length === 0) {
    message.warning('请先选择要修改的记录');
    return;
  }

  console.log('Batch modifying rows:', rowsToModify);
  resetBatchFormData();
  showBatchModal.value = true;
};

const handleImportExcel = () => {
  importFileList.value = [];
  showImportModal.value = true;
};

const handleDownloadTemplate = async () => {
  try {
    const blob = await downloadRebateTemplate(activeTab.value);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `返水规则模板_${activeTab.value === 'validBet' ? '有效投注' : '净盈利'}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载模板失败:', error);
    message.error('下载模板失败');
  }
};

const handleRefresh = () => {
  loadData();
  loadStatistics();
};

const handleSearch = () => {
  paginationReactive.page = 1;
  loadData();
};

const handleResetSearch = () => {
  searchForm.gameCategory = '';
  searchForm.isActive = null;
  paginationReactive.page = 1;
  loadData();
};

const handleSelectionChange = (keys: DataTableRowKey[]) => {
  selectedRowKeys.value = keys;
};

const handlePageChange = (page: number) => {
  paginationReactive.page = page;
  loadData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  loadData();
};

// SmartDataGrid event handlers
const handleRowClick = (rebate: RebateConfig) => {
  console.log('Rebate config row clicked:', rebate);
  // Optional: Auto-open edit modal on row click
  handleEdit(rebate);
};

const clearSelection = () => {
  selectedRowKeys.value = [];
  message.success('已清空选择');
};

const selectAll = () => {
  selectedRowKeys.value = tableData.value.map((rebate) => rebate.id!);
  message.success('已全选');
};

const handleSave = async () => {
  if (!formRef.value) return;

  try {
    console.log('Form data before validation:', formData);
    console.log('Form ref:', formRef.value);

    await formRef.value.validate();
    console.log('Validation passed');

    saving.value = true;

    const data = {
      gameCategory: formData.gameCategory,
      validUserThreshold: formData.validUserThreshold,
      validBetThreshold: formData.validBetThreshold,
      rebateAmountPer10k: formData.rebateAmountPer10k,
      remarks: formData.remarks,
      isActive: formData.isActive,
      type: activeTab.value,
    };

    console.log('Data to save:', data);

    if (editMode.value === 'create') {
      await createRebateSetting(data);
      message.success('创建成功');
    } else {
      // Include sortOrder for updates
      const updateData = {
        ...data,
        sortOrder: formData.sortOrder,
      };
      await updateRebateSetting(currentRecord.value!.id!, updateData);
      message.success('更新成功');
    }

    showEditModal.value = false;
    loadData();
    loadStatistics();
  } catch (error) {
    console.error('保存失败:', error);
    console.error('Error details:', error);
    message.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const handleBatchSave = async () => {
  if (!batchFormRef.value) return;

  try {
    await batchFormRef.value.validate();
    saving.value = true;

    // 过滤掉null值
    const updates = Object.entries(batchFormData)
      .filter(([_, value]) => value !== null)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as any);

    if (Object.keys(updates).length === 0) {
      message.warning('请至少选择一个要修改的字段');
      return;
    }

    await batchUpdateRebateSettings({
      ids: selectedRowKeys.value as string[],
      updates,
    });

    message.success('批量更新成功');
    showBatchModal.value = false;
    selectedRowKeys.value = [];
    loadData();
    loadStatistics();
  } catch (error) {
    console.error('批量更新失败:', error);
    message.error('批量更新失败');
  } finally {
    saving.value = false;
  }
};

const handleBeforeUpload = (options: { file: UploadFileInfo }) => {
  const { file } = options;

  if (!file.file) {
    message.error('无效的文件');
    return false;
  }

  const isExcel =
    file.file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.file.type === 'application/vnd.ms-excel';

  if (!isExcel) {
    message.error('只支持Excel文件格式');
    return false;
  }

  const isLt10M = file.file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('文件大小不能超过10MB');
    return false;
  }

  return true;
};

const handleRemoveFile = () => {
  importFileList.value = [];
};

const handleImportSave = async () => {
  if (importFileList.value.length === 0) {
    message.warning('请先选择要导入的文件');
    return;
  }

  const file = importFileList.value[0];
  if (!file.file) {
    message.error('无效的文件');
    return;
  }

  try {
    importing.value = true;

    const result = await batchImportRebateSettings({
      file: file.file,
      type: activeTab.value,
    });

    if (result.success > 0) {
      message.success(`导入成功: ${result.success}条记录`);
      if (result.failed > 0) {
        message.warning(`导入失败: ${result.failed}条记录`);
      }
      showImportModal.value = false;
      loadData();
      loadStatistics();
    } else {
      message.error('导入失败');
    }
  } catch (error) {
    console.error('导入失败:', error);
    message.error('导入失败');
  } finally {
    importing.value = false;
  }
};

const handleEditModalClose = () => {
  resetFormData();
  currentRecord.value = null;
};

const resetFormData = () => {
  Object.assign(formData, {
    gameCategory: '',
    sortOrder: 0, // Will be auto-generated by backend
    validUserThreshold: 1,
    validBetThreshold: 1,
    rebateAmountPer10k: 1,
    remarks: '',
    isActive: true,
  });
  console.log('Form data reset:', formData);
};

const resetBatchFormData = () => {
  Object.assign(batchFormData, {
    validUserThreshold: null,
    validBetThreshold: null,
    rebateAmountPer10k: null,
    isActive: null,
  });
};

// 监听Tab切换
watch(activeTab, () => {
  paginationReactive.page = 1;
  selectedRowKeys.value = [];
  loadData();
  loadStatistics();
});

// 监听表单数据变化
watch(
  formData,
  (newData) => {
    console.log('Form data changed:', newData);
  },
  { deep: true },
);

// 初始化
onMounted(async () => {
  console.log('Component mounted, loading data...');
  await loadGameCategories();
  await loadData();
  await loadStatistics();
});
</script>

<style scoped>
.rebate-settings-container {
  padding: 0;
}

.import-content {
  padding: 16px 0;
}

:deep(.n-data-table-th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

:deep(.n-data-table-td) {
  border-bottom: 1px solid #e9ecef;
}

:deep(.n-statistic-group) {
  gap: 24px;
}

:deep(.n-upload-dragger) {
  padding: 40px 20px;
}
</style>
