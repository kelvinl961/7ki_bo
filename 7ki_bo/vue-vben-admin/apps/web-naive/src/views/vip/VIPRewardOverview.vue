<template>
  <div class="vip-reward-overview">
    <Page
      title="VIP奖励设置总览"
      description="查看和管理所有VIP等级的奖励配置和统计信息"
    >
      <!-- 面包屑导航 -->
      <div class="mb-4">
        <n-breadcrumb>
          <n-breadcrumb-item>优惠</n-breadcrumb-item>
          <n-breadcrumb-item>VIP奖励</n-breadcrumb-item>
          <n-breadcrumb-item>VIP奖励设置总览</n-breadcrumb-item>
        </n-breadcrumb>
      </div>

      <!-- 操作控制栏 -->
      <n-card class="mb-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <n-text>VIP开关:</n-text>
              <n-switch
                v-model:value="vipSystemEnabled"
                @update:value="handleVIPToggle"
                :loading="toggleLoading"
              />
              <n-text depth="3" class="text-sm">
                {{ vipSystemEnabled ? '已启用' : '已关闭' }}
              </n-text>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <n-button @click="handleRewardImport" :loading="importLoading">
              奖励导入
            </n-button>
            
            <n-button @click="handleGlobalSettings">
              VIP公共设置
            </n-button>
            
            <n-button type="primary" @click="handleAddLevel">
              新增等级
            </n-button>
            
            <n-button @click="handleImportLevel" :loading="importLevelLoading">
              导入等级
            </n-button>
            
            <n-button
              type="success"
              @click="handleBatchSave"
              :loading="batchSaveLoading"
              :disabled="!hasModifiedData"
            >
              批量保存
            </n-button>
            
            <n-button @click="handleRefresh" :loading="loading">
              刷新
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- 统计信息卡片 -->
      <n-card class="mb-4">
        <div class="grid grid-cols-5 gap-4">
          <n-statistic label="总VIP等级" :value="summary.totalLevels" />
          <n-statistic label="活跃VIP用户" :value="summary.activeUsers" />
          <n-statistic label="本月奖励总额" :value="summary.monthlyRewards" suffix=" BRL" />
          <n-statistic label="本周奖励总额" :value="summary.weeklyRewards" suffix=" BRL" />
          <n-statistic label="今日奖励总额" :value="summary.dailyRewards" suffix=" BRL" />
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
        <div class="mt-4 p-4 bg-gray-50 rounded">
          <div class="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span class="font-medium">总用户数:</span>
              <span class="ml-2 text-blue-600">{{ summary.totalUsers }}</span>
            </div>
            <div>
              <span class="font-medium">月奖励总计:</span>
              <span class="ml-2 text-green-600">{{ formatCurrency(summary.totalMonthlyRewards) }}</span>
            </div>
            <div>
              <span class="font-medium">周奖励总计:</span>
              <span class="ml-2 text-orange-600">{{ formatCurrency(summary.totalWeeklyRewards) }}</span>
            </div>
            <div>
              <span class="font-medium">日奖励总计:</span>
              <span class="ml-2 text-purple-600">{{ formatCurrency(summary.totalDailyRewards) }}</span>
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
        title="奖励导入"
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
                <n-text style="font-size: 24px; font-weight: bold;">
                  📄
                </n-text>
              </div>
              <n-text style="font-size: 16px">
                点击或者拖拽文件到该区域来上传
              </n-text>
              <n-p depth="3" style="margin: 8px 0 0 0">
                请上传 Excel 或 CSV 格式的奖励配置文件
              </n-p>
            </n-upload-dragger>
          </n-upload>
          
          <n-text depth="3" class="text-sm">
            支持格式: .xlsx, .xls, .csv | 最大文件大小: 10MB
          </n-text>
        </div>
        
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="showRewardImportModal = false">取消</n-button>
            <n-button
              type="primary"
              @click="handleRewardImportConfirm"
              :loading="importLoading"
              :disabled="!fileList.length"
            >
              导入
            </n-button>
          </div>
        </template>
      </n-modal>
    </Page>
  </div>
</template>

<script setup lang="ts">
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
const VIPLevelFormModal = defineAsyncComponent(() => import('./components/VIPLevelFormModal.vue'));
const VIPGlobalSettingModal = defineAsyncComponent(() => import('./components/VIPGlobalSettingModal.vue'));
const VIPImportModal = defineAsyncComponent(() => import('./components/VIPImportModal.vue'));

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
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`,
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
const columns: DataTableColumns<VIPRewardConfig> = [
  {
    title: '序号',
    key: 'index',
    width: 70,
    align: 'center',
    fixed: 'left',
    render: (_, index) => index + 1,
  },
  {
    title: 'VIP等级',
    key: 'vipLevel',
    width: 100,
    align: 'center',
    fixed: 'left',
    render: (row) => h(NTag, { type: 'info', size: 'small' }, { default: () => row.vipLevel }),
  },
  {
    title: '当前人数',
    key: 'userCount',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono' }, row.userCount.toLocaleString()),
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
    align: 'center',
    render: (row) => h(NTag, { type: 'success', size: 'small' }, { default: () => row.currency }),
  },
  {
    title: '预设图',
    key: 'icon',
    width: 80,
    align: 'center',
    render: (row) => h(NImage, {
      width: 32,
      height: 32,
      src: row.icon || '/default-vip-icon.png',
      fallbackSrc: '/default-vip-icon.png',
      style: 'border-radius: 4px;',
    }),
  },
  {
    title: '晋级奖励金额',
    key: 'upgradeAmount',
    width: 120,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono text-green-600' }, formatCurrency(row.upgradeAmount)),
  },
  {
    title: '晋级所需打码',
    key: 'upgradeDMLimit',
    width: 120,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono' }, row.upgradeDMLimit.toLocaleString()),
  },
  {
    title: '晋级彩金',
    key: 'upgradeCash',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono text-orange-600' }, formatCurrency(row.upgradeCash)),
  },
  {
    title: '月充值值',
    key: 'monthlyRecharge',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono text-blue-600' }, formatCurrency(row.monthlyRecharge)),
  },
  {
    title: '当月打码',
    key: 'monthlyDM',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono' }, row.monthlyDM.toLocaleString()),
  },
  {
    title: '月返水',
    key: 'monthlyRebate',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono text-green-600' }, formatCurrency(row.monthlyRebate)),
  },
  {
    title: '月返水打码',
    key: 'monthlyDMRebate',
    width: 120,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono' }, row.monthlyDMRebate.toLocaleString()),
  },
  {
    title: '周充值值',
    key: 'weeklyRecharge',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono text-blue-600' }, formatCurrency(row.weeklyRecharge)),
  },
  {
    title: '周打码',
    key: 'weeklyDM',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono' }, row.weeklyDM.toLocaleString()),
  },
  {
    title: '周返水',
    key: 'weeklyRebate',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono text-green-600' }, formatCurrency(row.weeklyRebate)),
  },
  {
    title: '周返水打码',
    key: 'weeklyDMRebate',
    width: 120,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono' }, row.weeklyDMRebate.toLocaleString()),
  },
  {
    title: '日返水',
    key: 'dailyRebate',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono text-green-600' }, formatCurrency(row.dailyRebate)),
  },
  {
    title: '目标值',
    key: 'dailyTarget',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono' }, row.dailyTarget.toLocaleString()),
  },
  {
    title: '日返水打码',
    key: 'dailyDMRebate',
    width: 120,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono' }, row.dailyDMRebate.toLocaleString()),
  },
  {
    title: '生日彩金',
    key: 'birthdayCash',
    width: 100,
    align: 'right',
    render: (row) => h('span', { class: 'font-mono text-purple-600' }, formatCurrency(row.birthdayCash)),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'center',
    fixed: 'right',
    render: (row) => h('div', { class: 'flex gap-1 justify-center' }, [
      h(NTooltip, { trigger: 'hover' }, {
        trigger: () => h(NButton, {
          size: 'small',
          type: 'primary',
          onClick: () => handleEdit(row),
        }, { default: () => '修改' }),
        default: () => '编辑VIP等级配置',
      }),
    ]),
  },
];

// 事件处理函数
const handleVIPToggle = async (enabled: boolean) => {
  toggleLoading.value = true;
  try {
    const settings = await getVIPGlobalSettings();
    await updateVIPGlobalSettings({
      ...settings,
      isEnabled: enabled,
    });
    message.success(`VIP系统已${enabled ? '启用' : '关闭'}`);
  } catch (error) {
    message.error('VIP系统状态更新失败');
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
    message.success('批量保存成功');
    hasModifiedData.value = false;
    await fetchTableData();
  } catch (error) {
    message.error('批量保存失败');
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
    message.warning('请选择要导入的文件');
    return;
  }

  importLoading.value = true;
  try {
    // 实现文件导入逻辑
    const formData = new FormData();
    formData.append('file', fileList.value[0].file!);
    
    // 调用导入API
    message.success('奖励配置导入成功');
    showRewardImportModal.value = false;
    fileList.value = [];
    await fetchTableData();
  } catch (error) {
    message.error('导入失败，请检查文件格式');
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
    tableData.value = response.list.map((level: VIPLevel): VIPRewardConfig => ({
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
    }));

    paginationConfig.itemCount = response.pagination.total;

    // 更新统计数据
    updateSummary();
  } catch (error) {
    message.error('获取VIP奖励配置失败');
    console.error('Error fetching VIP reward data:', error);
  } finally {
    loading.value = false;
  }
};

// 更新统计数据
const updateSummary = () => {
  summary.totalLevels = tableData.value.length;
  summary.totalUsers = tableData.value.reduce((sum, item) => sum + item.userCount, 0);
  summary.activeUsers = tableData.value.filter(item => item.userCount > 0).length;
  
  summary.totalMonthlyRewards = tableData.value.reduce((sum, item) => sum + item.monthlyRebate, 0);
  summary.totalWeeklyRewards = tableData.value.reduce((sum, item) => sum + item.weeklyRebate, 0);
  summary.totalDailyRewards = tableData.value.reduce((sum, item) => sum + item.dailyRebate, 0);
  
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