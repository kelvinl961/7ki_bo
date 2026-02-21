<template>
  <div class="vip-reward-setting">
    <Page
      title="VIP设置"
      description="管理VIP等级奖励设置"
    >
      <!-- 操作栏 -->
      <n-card class="mb-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-4">
            <n-button type="primary" @click="handleApplyToAllCurrencies">应用到所有币种</n-button>
            <div class="flex items-center gap-2">
              <n-text>VIP开关</n-text>
              <n-switch v-model:value="vipEnabled" @update:value="handleVipToggle" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <n-button @click="handleDetails">详情</n-button>
            <n-button type="primary" @click="openGlobalSettingModal">VIP公共设置</n-button>
            <n-button type="primary" @click="openLevelModal">新增等级</n-button>
            <n-button type="primary" @click="handleImportCorrection">导入修正</n-button>
            <n-button type="error" @click="handleBatchModify">批量修改</n-button>
          </div>
        </div>
      </n-card>

      <!-- VIP奖励设置表格 -->
      <n-card>
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <n-text type="info" class="text-sm">
            💡 提示：表格中的数值为只读显示，如需修改请点击右侧"修改"按钮进入编辑弹窗
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
import { ref, onMounted, h } from 'vue';
import { useMessage, useDialog, NButton, NCard, NDataTable, NText, NSwitch } from 'naive-ui';
import { Page } from '@vben/common-ui';
import { getVIPLevels, updateVIPLevel, getVIPGlobalSettings, updateVIPGlobalSettings } from '../../api/vip';
// ✅ PERFORMANCE FIX: Lazy load modal components - they only load when modals are opened
import { defineAsyncComponent } from 'vue';
const VIPLevelFormModal = defineAsyncComponent(() => import('./components/VIPLevelFormModal.vue'));
const VIPGlobalSettingModal = defineAsyncComponent(() => import('./components/VIPGlobalSettingModal.vue'));

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
const columns = [
  {
    title: '等级名称',
    key: 'level',
    width: 120,
    
  },
  {
    title: '当前人数',
    key: 'currentMemberCount',
    width: 100,
    render(row: VIPLevelExtended) {
      return h(NText, { type: 'info' }, { default: () => row.currentMemberCount || 0 });
    }
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
    render(row: VIPLevelExtended) {
      return h(NText, null, { default: () => row.currency || 'BRL' });
    }
  },
  {
    title: '预览图',
    key: 'preview',
    width: 80,
    render(row: VIPLevelExtended) {
      return h('div', { 
        class: 'w-12 h-12 rounded-full relative overflow-hidden border-2 border-yellow-400 shadow-lg',
        style: { 
          backgroundColor: row.color || '#e91e63',
          background: `linear-gradient(135deg, ${row.color || '#e91e63'}, ${row.color || '#e91e63'}dd)`
        }
      }, [
        // Gradient background
        h('div', { 
          class: 'absolute inset-0 rounded-full',
          style: { 
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%)`
          }
        }),
        // Icon image (if exists)
        row.icon ? h('img', {
          src: row.icon,
          class: 'absolute inset-1 w-10 h-10 object-contain rounded-full',
          style: { 
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            zIndex: 10
          },
          onError: (e: Event) => {
            // Hide image if it fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }
        }) : null,
        // Shine effect
        h('div', {
          class: 'absolute inset-0 rounded-full',
          style: {
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
            pointerEvents: 'none'
          }
        })
      ]);
    }
  },
  {
    title: '晋级要求',
    key: 'upgrade-requirements',
    children: [
      {
        title: '晋级需再充值',
        key: 'requiredDeposit',
        width: 120,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.requiredDeposit || 0).toLocaleString() });
        }
      },
      {
        title: '晋级需再打码',
        key: 'requiredBet',
        width: 120,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.requiredBet || 0).toLocaleString() });
        }
      }
    ]
  },
  {
    title: '晋级奖金',
    key: 'upgradeBonus',
    width: 100,
    render(row: VIPLevelExtended) {
      return h(NText, { type: 'info' }, { default: () => (row.upgradeBonus || 0).toLocaleString() });
    }
  },
  {
    title: '月俸禄',
    key: 'monthly-rewards',
    children: [
      {
        title: '当月充值',
        key: 'monthlyDepositRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.monthlyDepositRequirement || 0).toLocaleString() });
        }
      },
      {
        title: '当月打码',
        key: 'monthlyBetRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.monthlyBetRequirement || 0).toLocaleString() });
        }
      },
      {
        title: '月俸禄',
        key: 'monthlyRebate',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.monthlyRebate || 0).toLocaleString() });
        }
      },
      {
        title: '月累计封顶',
        key: 'monthlyLimit',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.monthlyLimit || 0).toLocaleString() });
        }
      }
    ]
  },
  {
    title: '周俸禄',
    key: 'weekly-rewards',
    children: [
      {
        title: '当周充值',
        key: 'weeklyDepositRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.weeklyDepositRequirement || 0).toLocaleString() });
        }
      },
      {
        title: '当周打码',
        key: 'weeklyBetRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.weeklyBetRequirement || 0).toLocaleString() });
        }
      },
      {
        title: '周俸禄',
        key: 'weeklyTaskValue',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.weeklyTaskValue || 0).toLocaleString() });
        }
      },
      {
        title: '周累计封顶',
        key: 'weeklyLimit',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.weeklyLimit || 0).toLocaleString() });
        }
      }
    ]
  },
  {
    title: '日俸禄',
    key: 'daily-rewards',
    children: [
      {
        title: '当日充值',
        key: 'dailyDepositRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.dailyDepositRequirement || 0).toLocaleString() });
        }
      },
      {
        title: '当日打码',
        key: 'dailyBetRequirement',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.dailyBetRequirement || 0).toLocaleString() });
        }
      },
      {
        title: '日俸禄',
        key: 'dailyTaskValue',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.dailyTaskValue || 0).toLocaleString() });
        }
      },
      {
        title: '日累计封顶',
        key: 'dailyLimit',
        width: 100,
        render(row: VIPLevelExtended) {
          return h(NText, { type: 'info' }, { default: () => (row.dailyLimit || 0).toLocaleString() });
        }
      }
    ]
  },
  {
    title: '生日礼金',
    key: 'birthdayBonus',
    width: 100,
    render(row: VIPLevelExtended) {
      return h(NText, { type: 'info' }, { default: () => (row.birthdayBonus || 0).toLocaleString() });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right' as const,
    render(row: VIPLevelExtended) {
      return h(NButton, { 
        size: 'small', 
        type: 'primary', 
        onClick: () => openEditLevel(row) 
      }, { default: () => '修改' });
    }
  }
];

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
      isAccessChecked: accessStore.isAccessChecked
    });
  } catch (authError) {
    console.warn('⚠️ Could not check auth store:', authError);
  }
  
  try {
    console.log('🔄 About to call getVIPLevels API...');
    const res = await getVIPLevels({
      pageSize: 100, // 获取所有VIP等级
      sortBy: 'level',
      sortOrder: 'asc'
    });
    
    console.log('✅ VIP Levels API response:', res);
    console.log('📊 Response type:', typeof res);
    console.log('📊 Response keys:', res ? Object.keys(res) : 'undefined');
    console.log('📊 Full response object:', JSON.stringify(res, null, 2));
    
    // 为每个VIP等级添加默认的奖励字段
    if (res && res.list && Array.isArray(res.list)) {
      console.log(` Found ${res.list.length} VIP levels`);
      tableData.value = res.list.map(level => ({
        ...level,
        monthlyDepositRequirement: (level as any).monthlyDepositRequirement || 0,
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
      stack: (error as any).stack
    });
    
    // Check if it's an authentication error
    if ((error as any).response?.status === 401) {
      console.error('🔐 Authentication failed - user not logged in or token expired');
      message.error('请先登录或重新登录');
    } else if ((error as any).response?.status === 403) {
      console.error('🚫 Access denied - insufficient permissions');
      message.error('权限不足，需要管理员权限');
    } else {
      message.error('获取VIP等级失败');
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
    message.success(`VIP系统已${enabled ? '开启' : '关闭'}`);
  } catch (error) {
    console.error('VIP开关切换失败:', error);
    message.error('VIP开关切换失败');
    // 恢复原状态
    vipEnabled.value = !enabled;
  }
}

// 操作按钮处理函数
function handleApplyToAllCurrencies() {
  dialog.info({
    title: '应用到所有币种',
    content: '此功能将当前设置应用到所有币种的VIP等级，确定继续吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      message.info('功能开发中...');
    }
  });
}

function handleDetails() {
  message.info('详情功能开发中...');
}

function handleImportCorrection() {
  message.info('导入修正功能开发中...');
}

function handleBatchModify() {
  message.info('批量修改功能开发中...');
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