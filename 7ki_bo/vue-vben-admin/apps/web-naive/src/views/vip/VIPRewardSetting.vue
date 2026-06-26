<template>
  <div class="vip-reward-setting">
    <Page :title="$t('vip.rewardSettingTitle')" :description="$t('vip.rewardSettingDescription')">
      <!-- 操作栏 -->
      <n-card class="mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <n-button type="primary" @click="handleApplyToAllCurrencies"
              >{{ $t('vip.applyToAllCurrencies') }}</n-button
            >
            <div class="flex items-center gap-2">
              <n-text>{{ $t('vip.vipSwitch') }}</n-text>
              <n-switch
                v-model:value="vipEnabled"
                @update:value="handleVipToggle"
              />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <n-button @click="handleDetails">{{ $t('common.detail') }}</n-button>
            <n-button type="primary" @click="openGlobalSettingModal"
              >{{ $t('vip.globalSettings') }}</n-button
            >
            <n-button type="primary" @click="openLevelModal">{{ $t('vip.addLevel') }}</n-button>
            <n-button type="primary" @click="handleImportCorrection"
              >{{ $t('vip.importCorrection') }}</n-button
            >
            <n-button type="error" @click="handleBatchModify"
              >{{ $t('vip.batchModify') }}</n-button
            >
          </div>
        </div>
      </n-card>

      <!-- VIP奖励设置表格 -->
      <n-card>
        <div class="mb-4 rounded border border-blue-200 bg-blue-50 p-3">
          <n-text type="info" class="text-sm">
            💡 {{ $t('vip.tableReadonlyHint') }}
          </n-text>
        </div>
        <n-data-table
          ref="tableRef"
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :scroll-x="1800"
          striped
          size="small"
          class="vip-rewards-table"
        />
      </n-card>

      <!-- 新增/编辑等级弹窗 -->
      <VIPLevelFormModal
        v-model:show="showLevelModal"
        :editing-item="editingItem"
        @success="handleLevelSuccess"
      />

      <!-- 公共设置弹窗 -->
      <VIPGlobalSettingModal
        v-model:show="showGlobalSettingModal"
        @success="handleGlobalSettingSuccess"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, onMounted, h, computed } from 'vue';
import {
  useMessage,
  useDialog,
  NButton,
  NCard,
  NDataTable,
  NText,
  NSwitch,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import {
  getVIPLevels,
  updateVIPLevel,
  getVIPGlobalSettings,
  updateVIPGlobalSettings,
} from '../../api/vip';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const VIPLevelFormModal = defineAsyncComponent(
  () => import('./components/VIPLevelFormModal.vue'),
);
const VIPGlobalSettingModal = defineAsyncComponent(
  () => import('./components/VIPGlobalSettingModal.vue'),
);

interface VIPLevelExtended {
  id: number;
  level: number;
  name: string;
  color: string;
  currency: string;
  currentMemberCount: number;
  requiredDeposit: number;
  requiredBet: number;
  upgradeBonus: number;
  monthlyRebate: number;
  dailyTaskValue: number;
  weeklyTaskValue: number;
  monthlyDepositRequirement?: number;
  monthlyBetRequirement?: number;
  monthlyLimit?: number;
  weeklyDepositRequirement?: number;
  weeklyBetRequirement?: number;
  weeklyLimit?: number;
  dailyDepositRequirement?: number;
  dailyBetRequirement?: number;
  dailyLimit?: number;
  birthdayBonus?: number;
  icon?: string;
  vipStyle?: string;
}

const message = useMessage();
const dialog = useDialog();
const tableRef = ref();
const showLevelModal = ref(false);
const showGlobalSettingModal = ref(false);
const editingItem = ref<any>(null);
const tableData = ref<VIPLevelExtended[]>([]);
const loading = ref(false);
const vipEnabled = ref(true);

// 字段更新处理 - 已移除，现在只能通过编辑弹窗修改

// 创建表格列配置
const columns = computed(() => [
  {
    title: $t('vip.levelName'),
    key: 'level',
    width: 120,
  },
  {
    title: $t('vip.currentMemberCount'),
    key: 'currentMemberCount',
    width: 100,
    render(row: VIPLevelExtended) {
      return h(
        NText,
        { type: 'info' },
        { default: () => row.currentMemberCount || 0 },
      );
    },
  },
  {
    title: $t('common.currency'),
    key: 'currency',
    width: 80,
    render(row: VIPLevelExtended) {
      return h(NText, null, { default: () => row.currency || 'BRL' });
    },
  },
  {
    title: $t('vip.previewImage'),
    key: 'preview',
    width: 80,
    render(row: VIPLevelExtended) {
      return h(
        'div',
        {
          class:
            'w-12 h-12 rounded-full relative overflow-hidden border-2 border-yellow-400 shadow-lg',
          style: {
            backgroundColor: row.color || '#e91e63',
            background: `linear-gradient(135deg, ${row.color || '#e91e63'}, ${row.color || '#e91e63'}dd)`,
          },
        },
        [
          // Gradient background
          h('div', {
            class: 'absolute inset-0 rounded-full',
            style: {
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%)`,
            },
          }),
          // Icon image (if exists)
          row.icon
            ? h('img', {
                src: row.icon,
                class: 'absolute inset-1 w-10 h-10 object-contain rounded-full',
                style: {
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                  zIndex: 10,
                },
                onError: (e: Event) => {
                  // Hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                },
              })
            : null,
          // Shine effect
          h('div', {
            class: 'absolute inset-0 rounded-full',
            style: {
              background:
                'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
              pointerEvents: 'none',
            },
          }),
        ],
      );
    },
  },
  {
    title: $t('vip.upgradeRequirements'),
    key: 'upgrade-requirements',
    children: [
      {
        title: $t('vip.requiredDeposit'),
        key: 'requiredDeposit',
        width: 120,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.requiredDeposit || 0).toLocaleString() },
          );
        },
      },
      {
        title: $t('vip.requiredBet'),
        key: 'requiredBet',
        width: 120,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.requiredBet || 0).toLocaleString() },
          );
        },
      },
    ],
  },
  {
    title: $t('vip.upgradeBonus'),
    key: 'upgradeBonus',
    width: 100,
    render(row: VIPLevelExtended) {
      return h(
        NText,
        { type: 'info' },
        { default: () => (row.upgradeBonus || 0).toLocaleString() },
      );
    },
  },
  {
    title: $t('vip.monthlySalary'),
    key: 'monthly-rewards',
    children: [
      {
        title: $t('vip.monthlyDeposit'),
        key: 'monthlyDepositRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            {
              default: () =>
                (row.monthlyDepositRequirement || 0).toLocaleString(),
            },
          );
        },
      },
      {
        title: $t('vip.monthlyBet'),
        key: 'monthlyBetRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            {
              default: () => (row.monthlyBetRequirement || 0).toLocaleString(),
            },
          );
        },
      },
      {
        title: $t('vip.monthlyRebate'),
        key: 'monthlyRebate',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.monthlyRebate || 0).toLocaleString() },
          );
        },
      },
      {
        title: $t('vip.monthlyLimit'),
        key: 'monthlyLimit',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.monthlyLimit || 0).toLocaleString() },
          );
        },
      },
    ],
  },
  {
    title: $t('vip.weeklySalary'),
    key: 'weekly-rewards',
    children: [
      {
        title: $t('vip.weeklyDeposit'),
        key: 'weeklyDepositRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            {
              default: () =>
                (row.weeklyDepositRequirement || 0).toLocaleString(),
            },
          );
        },
      },
      {
        title: $t('vip.weeklyBet'),
        key: 'weeklyBetRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.weeklyBetRequirement || 0).toLocaleString() },
          );
        },
      },
      {
        title: $t('vip.weeklyRebate'),
        key: 'weeklyTaskValue',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.weeklyTaskValue || 0).toLocaleString() },
          );
        },
      },
      {
        title: $t('vip.weeklyLimit'),
        key: 'weeklyLimit',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.weeklyLimit || 0).toLocaleString() },
          );
        },
      },
    ],
  },
  {
    title: $t('vip.dailySalary'),
    key: 'daily-rewards',
    children: [
      {
        title: $t('vip.dailyDeposit'),
        key: 'dailyDepositRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            {
              default: () =>
                (row.dailyDepositRequirement || 0).toLocaleString(),
            },
          );
        },
      },
      {
        title: $t('vip.dailyBet'),
        key: 'dailyBetRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.dailyBetRequirement || 0).toLocaleString() },
          );
        },
      },
      {
        title: $t('vip.dailyRebate'),
        key: 'dailyTaskValue',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.dailyTaskValue || 0).toLocaleString() },
          );
        },
      },
      {
        title: $t('vip.dailyLimit'),
        key: 'dailyLimit',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(
            NText,
            { type: 'info' },
            { default: () => (row.dailyLimit || 0).toLocaleString() },
          );
        },
      },
    ],
  },
  {
    title: $t('vip.birthdayBonus'),
    key: 'birthdayBonus',
    width: 100,
    render(row: VIPLevelExtended) {
      return h(
        NText,
        { type: 'info' },
        { default: () => (row.birthdayBonus || 0).toLocaleString() },
      );
    },
  },
  {
    title: $t('common.actions'),
    key: 'actions',
    width: 100,
    fixed: 'right' as const,
    render(row: VIPLevelExtended) {
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          onClick: () => openEditLevel(row),
        },
        { default: () => $t('common.modify') },
      );
    },
  },
]);

// 数据获取和处理函数
async function fetchTableData() {
  loading.value = true;
  console.log('🔄 Fetching VIP levels...');

  // Check authentication status
  try {
    // Import the auth store to check authentication status
    const { useAuthStore } = await import('#/store');
    const { useAccessStore } = await import('@vben/stores');

    const authStore = useAuthStore();
    const accessStore = useAccessStore();

    console.log('🔐 Auth store state:', {
      hasUserInfo: !!authStore.fetchUserInfo(),
      accessToken: accessStore.accessToken ? 'Present' : 'Missing',
      isAccessChecked: accessStore.isAccessChecked,
    });
  } catch (authError) {
    console.warn('⚠️ Could not check auth store:', authError);
  }

  try {
    console.log('🔄 About to call getVIPLevels API...');
    const res = await getVIPLevels({
      pageSize: 100, // 获取所有VIP等级
      sortBy: 'level',
      sortOrder: 'asc',
    });

    console.log('✅ VIP Levels API response:', res);
    console.log('📊 Response type:', typeof res);
    console.log('📊 Response keys:', res ? Object.keys(res) : 'undefined');
    console.log('📊 Full response object:', JSON.stringify(res, null, 2));

    // 为每个VIP等级添加默认的奖励字段
    if (res && res.list && Array.isArray(res.list)) {
      console.log(` Found ${res.list.length} VIP levels`);
      tableData.value = res.list.map((level) => ({
        ...level,
        monthlyDepositRequirement:
          (level as any).monthlyDepositRequirement || 0,
        monthlyBetRequirement: (level as any).monthlyBetRequirement || 0,
        monthlyLimit: (level as any).monthlyLimit || 0,
        weeklyDepositRequirement: (level as any).weeklyDepositRequirement || 0,
        weeklyBetRequirement: (level as any).weeklyBetRequirement || 0,
        weeklyLimit: (level as any).weeklyLimit || 0,
        dailyDepositRequirement: (level as any).dailyDepositRequirement || 0,
        dailyBetRequirement: (level as any).dailyBetRequirement || 0,
        dailyLimit: (level as any).dailyLimit || 0,
        birthdayBonus: (level as any).birthdayBonus || 0,
      }));
    } else {
      console.error('❌ Invalid response structure:', res);
      console.error('❌ Response list:', res?.list);
      tableData.value = [];
    }
  } catch (error) {
    console.error('❌ 获取VIP等级失败:', error);
    console.error('❌ Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack,
    });

    // Check if it's an authentication error
    if ((error as any).response?.status === 401) {
      console.error(
        '🔐 Authentication failed - user not logged in or token expired',
      );
      message.error($t('vip.pleaseLogin'));
    } else if ((error as any).response?.status === 403) {
      console.error('🚫 Access denied - insufficient permissions');
      message.error($t('vip.permissionDenied'));
    } else {
      message.error($t('vip.loadLevelsFailed'));
    }

    tableData.value = [];
  } finally {
    loading.value = false;
  }
}

// 加载VIP全局设置
async function loadVipSettings() {
  try {
    const settings = await getVIPGlobalSettings();
    console.log('VIP Global Settings API response:', settings);
    if (settings && typeof settings.isEnabled === 'boolean') {
      vipEnabled.value = settings.isEnabled;
    } else {
      console.error('Invalid VIP settings response:', settings);
      vipEnabled.value = false;
    }
  } catch (error) {
    console.error('获取VIP设置失败:', error);
    vipEnabled.value = false;
  }
}

// VIP开关切换
async function handleVipToggle(enabled: boolean) {
  try {
    await updateVIPGlobalSettings({ isEnabled: enabled });
    message.success(
      enabled ? $t('vip.systemEnabled') : $t('vip.systemDisabled'),
    );
  } catch (error) {
    console.error('VIP开关切换失败:', error);
    message.error($t('vip.systemToggleFailed'));
    // 恢复原状态
    vipEnabled.value = !enabled;
  }
}

// 操作按钮处理函数
function handleApplyToAllCurrencies() {
  dialog.info({
    title: $t('vip.applyToAllCurrencies'),
    content: $t('vip.applyToAllCurrenciesContent'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      message.info($t('vip.featureInDevelopment'));
    },
  });
}

function handleDetails() {
  message.info($t('vip.detailInDevelopment'));
}

function handleImportCorrection() {
  message.info($t('vip.importCorrectionInDevelopment'));
}

function handleBatchModify() {
  message.info($t('vip.batchModifyInDevelopment'));
}

function openLevelModal() {
  editingItem.value = null;
  showLevelModal.value = true;
}

function openEditLevel(row: any) {
  editingItem.value = row;
  showLevelModal.value = true;
}

function openGlobalSettingModal() {
  showGlobalSettingModal.value = true;
}

function handleLevelSuccess() {
  showLevelModal.value = false;
  fetchTableData();
}

function handleGlobalSettingSuccess() {
  showGlobalSettingModal.value = false;
  fetchTableData();
  loadVipSettings();
}

onMounted(() => {
  fetchTableData();
  loadVipSettings();
});
</script>

<style scoped>
.vip-reward-setting {
  height: 100%;
}

.vip-rewards-table :deep(.n-data-table-th) {
  background-color: #f8f9fa;
  font-weight: 600;
  text-align: center;
}

.vip-rewards-table :deep(.n-data-table-td) {
  text-align: center;
  padding: 8px 4px;
}

.vip-rewards-table :deep(.n-input-number) {
  width: 100%;
}

.vip-rewards-table :deep(.n-input-number .n-input__input-el) {
  text-align: center;
}

/* VIP等级图标样式 */
.vip-level-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
}

/* 表格头部分组样式 */
.vip-rewards-table :deep(.n-data-table-th--group) {
  background-color: #e3f2fd;
  font-weight: 700;
}

/* 表格行悬停效果 */
.vip-rewards-table :deep(.n-data-table-tr:hover) {
  background-color: #f5f5f5;
}

/* 输入框聚焦样式 */
.vip-rewards-table :deep(.n-input-number:focus-within) {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 紧凑型表格样式 */
.vip-rewards-table :deep(.n-data-table--small .n-data-table-td) {
  padding: 6px 4px;
}

/* 固定列样式 */
.vip-rewards-table :deep(.n-data-table-th--fixed-right),
.vip-rewards-table :deep(.n-data-table-td--fixed-right) {
  background-color: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}
</style>
