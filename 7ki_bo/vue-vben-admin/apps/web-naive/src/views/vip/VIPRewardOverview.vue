<template>
  <div class="vip-reward-overview">
    <Page
      :title="$t('vip.overviewTitle')"
      :description="$t('vip.overviewDescription')"
    >
      <!-- 面包屑导航 -->
      <div class="mb-4">
        <n-breadcrumb>
          <n-breadcrumb-item>{{ $t('vip.promotions') }}</n-breadcrumb-item>
          <n-breadcrumb-item>{{ $t('vip.vipRewards') }}</n-breadcrumb-item>
          <n-breadcrumb-item>{{ $t('vip.overviewBreadcrumb') }}</n-breadcrumb-item>
        </n-breadcrumb>
      </div>

      <!-- 操作控制栏 -->
      <n-card class="mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <n-text>{{ $t('vip.vipSwitchColon') }}</n-text>
              <n-switch
                v-model:value="vipSystemEnabled"
                @update:value="handleVIPToggle"
                :loading="toggleLoading"
              />
              <n-text depth="3" class="text-sm">
                {{ vipSystemEnabled ? $t('vip.enabled') : $t('vip.closed') }}
              </n-text>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <n-button @click="handleRewardImport" :loading="importLoading">
              {{ $t('vip.rewardImport') }}
            </n-button>

            <n-button @click="handleGlobalSettings">
              {{ $t('vip.globalSettings') }}
            </n-button>

            <n-button type="primary" @click="handleAddLevel">
              {{ $t('vip.addLevel') }}
            </n-button>

            <n-button @click="handleImportLevel" :loading="importLevelLoading">
              {{ $t('vip.importLevel') }}
            </n-button>

            <n-button
              type="success"
              @click="handleBatchSave"
              :loading="batchSaveLoading"
              :disabled="!hasModifiedData"
            >
              {{ $t('vip.batchSave') }}
            </n-button>

            <n-button @click="handleRefresh" :loading="loading">
              {{ $t('common.refresh') }}
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- 统计信息卡片 -->
      <n-card class="mb-4">
        <div class="grid grid-cols-5 gap-4">
          <n-statistic
            :label="$t('vip.totalVipLevels')"
            :value="summary.totalLevels"
          />
          <n-statistic
            :label="$t('vip.activeVipUsers')"
            :value="summary.activeUsers"
          />
          <n-statistic
            :label="$t('vip.monthlyRewardTotal')"
            :value="summary.monthlyRewards"
            suffix=" BRL"
          />
          <n-statistic
            :label="$t('vip.weeklyRewardTotal')"
            :value="summary.weeklyRewards"
            suffix=" BRL"
          />
          <n-statistic
            :label="$t('vip.dailyRewardTotal')"
            :value="summary.dailyRewards"
            suffix=" BRL"
          />
        </div>
      </n-card>

      <!-- VIP奖励配置表格 -->
      <n-card>
        <div class="table-container">
          <n-data-table
            ref="tableRef"
            :columns="columns"
            :data="tableData"
            :loading="loading"
            :pagination="paginationConfig"
            :row-key="(row: VIPRewardConfig) => row.vipLevel"
            striped
            :scroll-x="2400"
            flex-height
            style="height: 600px"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>

        <!-- 表格底部汇总 -->
        <div class="mt-4 rounded bg-gray-50 p-4">
          <div class="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span class="font-medium">{{ $t('vip.totalUsers') }}</span>
              <span class="ml-2 text-blue-600">{{ summary.totalUsers }}</span>
            </div>
            <div>
              <span class="font-medium">{{ $t('vip.monthlyRewardSum') }}</span>
              <span class="ml-2 text-green-600">{{
                formatCurrency(summary.totalMonthlyRewards)
              }}</span>
            </div>
            <div>
              <span class="font-medium">{{ $t('vip.weeklyRewardSum') }}</span>
              <span class="ml-2 text-orange-600">{{
                formatCurrency(summary.totalWeeklyRewards)
              }}</span>
            </div>
            <div>
              <span class="font-medium">{{ $t('vip.dailyRewardSum') }}</span>
              <span class="ml-2 text-purple-600">{{
                formatCurrency(summary.totalDailyRewards)
              }}</span>
            </div>
          </div>
        </div>
      </n-card>

      <!-- 编辑VIP等级弹窗 -->
      <VIPLevelFormModal
        v-model:show="showEditModal"
        :editing-item="editingItem"
        @success="handleEditSuccess"
      />

      <!-- VIP公共设置弹窗 -->
      <VIPGlobalSettingModal
        v-model:show="showGlobalModal"
        @success="handleGlobalSuccess"
      />

      <!-- 导入VIP等级弹窗 -->
      <VIPImportModal
        v-model:show="showImportModal"
        @success="handleImportSuccess"
      />

      <!-- 奖励导入弹窗 -->
      <n-modal
        v-model:show="showRewardImportModal"
        :title="$t('vip.rewardImport')"
        preset="dialog"
        style="width: 600px"
      >
        <div class="space-y-4">
          <n-upload
            ref="uploadRef"
            :file-list="fileList"
            @update:file-list="handleFileListChange"
            accept=".xlsx,.xls,.csv"
            :max="1"
          >
            <n-upload-dragger>
              <div style="margin-bottom: 12px">
                <n-text style="font-size: 24px; font-weight: bold"> 📄 </n-text>
              </div>
              <n-text style="font-size: 16px">
                {{ $t('vip.uploadClickOrDrag') }}
              </n-text>
              <n-p depth="3" style="margin: 8px 0 0 0">
                {{ $t('vip.uploadRewardConfigHint') }}
              </n-p>
            </n-upload-dragger>
          </n-upload>

          <n-text depth="3" class="text-sm">
            {{ $t('vip.uploadFormatHint') }}
          </n-text>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="showRewardImportModal = false">{{ $t('common.cancel') }}</n-button>
            <n-button
              type="primary"
              @click="handleRewardImportConfirm"
              :loading="importLoading"
              :disabled="!fileList.length"
            >
              {{ $t('common.import') }}
            </n-button>
          </div>
        </template>
      </n-modal>
    </Page>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, onMounted, h } from 'vue';
import { Page } from '@vben/common-ui';
import {
  NCard,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NDataTable,
  NSwitch,
  NText,
  NStatistic,
  NModal,
  NUpload,
  NUploadDragger,
  NIcon,
  NP,
  NTag,
  NTooltip,
  NImage,
  useMessage,
  useDialog,
  type DataTableColumns,
  type UploadFileInfo,
} from 'naive-ui';

import {
  getVIPLevels,
  updateVIPLevel,
  deleteVIPLevel,
  getVIPGlobalSettings,
  updateVIPGlobalSettings,
  bulkUpdateVIPLevels,
  type VIPLevel,
  type VIPGlobalSetting,
} from '#/api/vip';

// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const VIPLevelFormModal = defineAsyncComponent(
  () => import('./components/VIPLevelFormModal.vue'),
);
const VIPGlobalSettingModal = defineAsyncComponent(
  () => import('./components/VIPGlobalSettingModal.vue'),
);
const VIPImportModal = defineAsyncComponent(
  () => import('./components/VIPImportModal.vue'),
);

// VIP奖励配置接口
interface VIPRewardConfig {
  vipLevel: string;
  userCount: number;
  currency: string;
  icon: string;
  upgradeAmount: number;
  upgradeDMLimit: number;
  upgradeCash: number;
  monthlyRecharge: number;
  monthlyDM: number;
  monthlyRebate: number;
  monthlyDMRebate: number;
  weeklyRecharge: number;
  weeklyDM: number;
  weeklyRebate: number;
  weeklyDMRebate: number;
  dailyRebate: number;
  dailyTarget: number;
  dailyDMRebate: number;
  birthdayCash: number;
}

const message = useMessage();
const dialog = useDialog();

// 响应式数据
const loading = ref(false);
const toggleLoading = ref(false);
const importLoading = ref(false);
const importLevelLoading = ref(false);
const batchSaveLoading = ref(false);
const vipSystemEnabled = ref(true);
const hasModifiedData = ref(false);

// 弹窗状态
const showEditModal = ref(false);
const showGlobalModal = ref(false);
const showImportModal = ref(false);
const showRewardImportModal = ref(false);
const editingItem = ref<VIPLevel | null>(null);

// 表格数据
const tableData = ref<VIPRewardConfig[]>([]);
const tableRef = ref();

// 文件上传
const uploadRef = ref();
const fileList = ref<UploadFileInfo[]>([]);

// 分页配置
const paginationConfig = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  prefix: ({ itemCount }: { itemCount: number }) =>
    $t('vip.totalRecords', [itemCount]),
});

// 统计汇总数据
const summary = reactive({
  totalLevels: 0,
  activeUsers: 0,
  totalUsers: 0,
  monthlyRewards: 0,
  weeklyRewards: 0,
  dailyRewards: 0,
  totalMonthlyRewards: 0,
  totalWeeklyRewards: 0,
  totalDailyRewards: 0,
});

// 格式化货币
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(amount);
};

// 表格列配置 - 20列
const columns = computed<DataTableColumns<VIPRewardConfig>>(() => [
  {
    title: $t('vip.serialNo'),
    key: 'index',
    width: 70,
    align: 'center',
    fixed: 'left',
    render: (_, index) => index + 1,
  },
  {
    title: $t('vip.vipLevel'),
    key: 'vipLevel',
    width: 100,
    align: 'center',
    fixed: 'left',
    render: (row) =>
      h(NTag, { type: 'info', size: 'small' }, { default: () => row.vipLevel }),
  },
  {
    title: $t('vip.currentMemberCount'),
    key: 'userCount',
    width: 100,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-mono' }, row.userCount.toLocaleString()),
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    align: 'center',
    render: (row) =>
      h(
        NTag,
        { type: 'success', size: 'small' },
        { default: () => row.currency },
      ),
  },
  {
    title: $t('vip.presetImage'),
    key: 'icon',
    width: 80,
    align: 'center',
    render: (row) =>
      h(NImage, {
        width: 32,
        height: 32,
        src: row.icon || '/default-vip-icon.png',
        fallbackSrc: '/default-vip-icon.png',
        style: 'border-radius: 4px;',
      }),
  },
  {
    title: $t('vip.upgradeRewardAmount'),
    key: 'upgradeAmount',
    width: 120,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-mono text-green-600' },
        formatCurrency(row.upgradeAmount),
      ),
  },
  {
    title: $t('vip.upgradeRequiredBet'),
    key: 'upgradeDMLimit',
    width: 120,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-mono' }, row.upgradeDMLimit.toLocaleString()),
  },
  {
    title: $t('vip.upgradeCash'),
    key: 'upgradeCash',
    width: 100,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-mono text-orange-600' },
        formatCurrency(row.upgradeCash),
      ),
  },
  {
    title: $t('vip.monthlyRecharge'),
    key: 'monthlyRecharge',
    width: 100,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-mono text-blue-600' },
        formatCurrency(row.monthlyRecharge),
      ),
  },
  {
    title: $t('vip.monthlyDm'),
    key: 'monthlyDM',
    width: 100,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-mono' }, row.monthlyDM.toLocaleString()),
  },
  {
    title: $t('vip.previewColMonthlyRebate'),
    key: 'monthlyRebate',
    width: 100,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-mono text-green-600' },
        formatCurrency(row.monthlyRebate),
      ),
  },
  {
    title: $t('vip.monthlyDmRebate'),
    key: 'monthlyDMRebate',
    width: 120,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-mono' }, row.monthlyDMRebate.toLocaleString()),
  },
  {
    title: $t('vip.weeklyRecharge'),
    key: 'weeklyRecharge',
    width: 100,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-mono text-blue-600' },
        formatCurrency(row.weeklyRecharge),
      ),
  },
  {
    title: $t('vip.weeklyDm'),
    key: 'weeklyDM',
    width: 100,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-mono' }, row.weeklyDM.toLocaleString()),
  },
  {
    title: $t('vip.weeklyRebateWater'),
    key: 'weeklyRebate',
    width: 100,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-mono text-green-600' },
        formatCurrency(row.weeklyRebate),
      ),
  },
  {
    title: $t('vip.weeklyDmRebate'),
    key: 'weeklyDMRebate',
    width: 120,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-mono' }, row.weeklyDMRebate.toLocaleString()),
  },
  {
    title: $t('vip.dailyRebateWater'),
    key: 'dailyRebate',
    width: 100,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-mono text-green-600' },
        formatCurrency(row.dailyRebate),
      ),
  },
  {
    title: $t('vip.targetValue'),
    key: 'dailyTarget',
    width: 100,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-mono' }, row.dailyTarget.toLocaleString()),
  },
  {
    title: $t('vip.dailyDmRebate'),
    key: 'dailyDMRebate',
    width: 120,
    align: 'right',
    render: (row) =>
      h('span', { class: 'font-mono' }, row.dailyDMRebate.toLocaleString()),
  },
  {
    title: $t('vip.birthdayCash'),
    key: 'birthdayCash',
    width: 100,
    align: 'right',
    render: (row) =>
      h(
        'span',
        { class: 'font-mono text-purple-600' },
        formatCurrency(row.birthdayCash),
      ),
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 120,
    align: 'center',
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'flex gap-1 justify-center' }, [
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
                  onClick: () => handleEdit(row),
                },
                { default: () => $t('common.modify') },
              ),
            default: () => $t('vip.editLevelConfig'),
          },
        ),
      ]),
  },
]);

// 事件处理函数
const handleVIPToggle = async (enabled: boolean) => {
  toggleLoading.value = true;
  try {
    const settings = await getVIPGlobalSettings();
    await updateVIPGlobalSettings({
      ...settings,
      isEnabled: enabled,
    });
    message.success(
      enabled ? $t('vip.systemEnabled') : $t('vip.systemDisabled'),
    );
  } catch (error) {
    message.error($t('vip.systemStatusUpdateFailed'));
    vipSystemEnabled.value = !enabled; // 回滚状态
    console.error('Error toggling VIP system:', error);
  } finally {
    toggleLoading.value = false;
  }
};

const handleRewardImport = () => {
  showRewardImportModal.value = true;
};

const handleGlobalSettings = () => {
  showGlobalModal.value = true;
};

const handleAddLevel = () => {
  editingItem.value = null;
  showEditModal.value = true;
};

const handleImportLevel = () => {
  showImportModal.value = true;
};

const handleBatchSave = async () => {
  batchSaveLoading.value = true;
  try {
    // 实现批量保存逻辑
    await bulkUpdateVIPLevels(tableData.value);
    message.success($t('vip.batchSaveSuccess'));
    hasModifiedData.value = false;
    await fetchTableData();
  } catch (error) {
    message.error($t('vip.batchSaveFailed'));
    console.error('Error batch saving:', error);
  } finally {
    batchSaveLoading.value = false;
  }
};

const handleRefresh = () => {
  fetchTableData();
};

const handleEdit = (row: VIPRewardConfig) => {
  // 转换为VIPLevel格式
  editingItem.value = {
    id: 0, // 临时ID
    level: parseInt(row.vipLevel.replace('VIP', '')),
    name: row.vipLevel,
    color: '#1890ff',
    icon: row.icon,
    requiredDeposit: row.monthlyRecharge,
    requiredBet: row.upgradeDMLimit,
    requiredPoints: 0,
    upgradeBonus: row.upgradeAmount,
    currency: row.currency,
    monthlyRebate: row.monthlyRebate,
    weeklyTaskValue: row.weeklyRecharge,
    dailyTaskValue: row.dailyRebate,
    withdrawalLimit: 0,
    withdrawalTimes: 0,
    customerServicePriority: false,
    isActive: true,
    displayOrder: 0,
    currentMemberCount: row.userCount,
    totalRewards: 0,
    totalUpgrades: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as VIPLevel;
  showEditModal.value = true;
};

const handlePageChange = (page: number) => {
  paginationConfig.page = page;
  fetchTableData();
};

const handlePageSizeChange = (pageSize: number) => {
  paginationConfig.pageSize = pageSize;
  paginationConfig.page = 1;
  fetchTableData();
};

const handleFileListChange = (files: UploadFileInfo[]) => {
  fileList.value = files;
};

const handleRewardImportConfirm = async () => {
  if (!fileList.value.length) {
    message.warning($t('vip.selectImportFile'));
    return;
  }

  importLoading.value = true;
  try {
    // 实现文件导入逻辑
    const formData = new FormData();
    formData.append('file', fileList.value[0].file!);

    // 调用导入API
    message.success($t('vip.rewardImportSuccess'));
    showRewardImportModal.value = false;
    fileList.value = [];
    await fetchTableData();
  } catch (error) {
    message.error($t('vip.importFailedCheckFormat'));
    console.error('Error importing rewards:', error);
  } finally {
    importLoading.value = false;
  }
};

// 成功回调函数
const handleEditSuccess = () => {
  showEditModal.value = false;
  fetchTableData();
};

const handleGlobalSuccess = () => {
  showGlobalModal.value = false;
  fetchTableData();
};

const handleImportSuccess = () => {
  showImportModal.value = false;
  fetchTableData();
};

// 获取表格数据
const fetchTableData = async () => {
  loading.value = true;
  try {
    const response = await getVIPLevels({
      page: paginationConfig.page,
      pageSize: paginationConfig.pageSize,
    });

    // 转换VIPLevel数据为VIPRewardConfig格式
    tableData.value = response.list.map(
      (level: VIPLevel): VIPRewardConfig => ({
        vipLevel: `VIP${level.level}`,
        userCount: level.currentMemberCount || 0,
        currency: level.currency || 'BRL',
        icon: level.icon || '/default-vip-icon.png',
        upgradeAmount: level.upgradeBonus || 0,
        upgradeDMLimit: level.requiredBet || 0,
        upgradeCash: level.upgradeBonus * 0.1 || 0, // 示例计算
        monthlyRecharge: level.requiredDeposit || 0,
        monthlyDM: level.requiredBet || 0,
        monthlyRebate: level.monthlyRebate || 0,
        monthlyDMRebate: level.requiredBet * 0.8 || 0, // 示例计算
        weeklyRecharge: level.weeklyTaskValue || 0,
        weeklyDM: level.requiredBet * 0.25 || 0, // 示例计算
        weeklyRebate: level.monthlyRebate * 0.25 || 0, // 示例计算
        weeklyDMRebate: level.requiredBet * 0.2 || 0, // 示例计算
        dailyRebate: level.dailyTaskValue || 0,
        dailyTarget: level.requiredBet * 0.03 || 0, // 示例计算
        dailyDMRebate: level.requiredBet * 0.03 || 0, // 示例计算
        birthdayCash: level.upgradeBonus * 0.5 || 0, // 示例计算
      }),
    );

    paginationConfig.itemCount = response.pagination.total;

    // 更新统计数据
    updateSummary();
  } catch (error) {
    message.error($t('vip.loadRewardConfigFailed'));
    console.error('Error fetching VIP reward data:', error);
  } finally {
    loading.value = false;
  }
};

// 更新统计数据
const updateSummary = () => {
  summary.totalLevels = tableData.value.length;
  summary.totalUsers = tableData.value.reduce(
    (sum, item) => sum + item.userCount,
    0,
  );
  summary.activeUsers = tableData.value.filter(
    (item) => item.userCount > 0,
  ).length;

  summary.totalMonthlyRewards = tableData.value.reduce(
    (sum, item) => sum + item.monthlyRebate,
    0,
  );
  summary.totalWeeklyRewards = tableData.value.reduce(
    (sum, item) => sum + item.weeklyRebate,
    0,
  );
  summary.totalDailyRewards = tableData.value.reduce(
    (sum, item) => sum + item.dailyRebate,
    0,
  );

  summary.monthlyRewards = summary.totalMonthlyRewards;
  summary.weeklyRewards = summary.totalWeeklyRewards;
  summary.dailyRewards = summary.totalDailyRewards;
};

// 生命周期
onMounted(async () => {
  await fetchTableData();

  // 获取VIP系统状态
  try {
    const settings = await getVIPGlobalSettings();
    vipSystemEnabled.value = settings.isEnabled;
  } catch (error) {
    console.error('Error fetching VIP settings:', error);
  }
});
</script>

<style scoped>
.vip-reward-overview {
  .table-container {
    min-height: 600px;
  }

  .font-mono {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }
}
</style>
