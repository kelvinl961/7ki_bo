<template>
  <Page>
    <n-card>
      <!-- Header Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <n-button type="primary" @click="openRulesModal">
          佣金设置
        </n-button>
      </div>

      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- 1. 待审核 -->
        <n-tab-pane name="pending" tab="待审核">
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <n-date-picker v-model:value="pendingFilters.startDate" type="date" placeholder="开始日期" style="width: 200px;" />
            <n-date-picker v-model:value="pendingFilters.endDate" type="date" placeholder="结束日期" style="width: 200px;" />
            <n-input v-model:value="pendingFilters.agentAccount" placeholder="代理账号" style="width: 200px;" clearable />
            <n-input v-model:value="pendingFilters.agentId" placeholder="代理ID" style="width: 200px;" clearable />
            <n-select v-model:value="pendingFilters.currency" placeholder="币种" style="width: 150px;" :options="currencyOptions" clearable />
            <n-button type="primary" @click="searchPending">搜索</n-button>
            <n-button @click="resetPendingFilters">重置</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px;">
            <n-button type="success" @click="batchApproveAll">全部通过</n-button>
            <n-button type="error" @click="batchRejectAll">全部拒绝</n-button>
            <n-button type="warning" :disabled="selectedPendingKeys.length === 0" @click="batchApprove">批量通过 ({{ selectedPendingKeys.length }})</n-button>
            <n-button type="error" :disabled="selectedPendingKeys.length === 0" @click="batchReject">批量拒绝 ({{ selectedPendingKeys.length }})</n-button>
          </div>

          <n-data-table
            :columns="pendingColumns"
            :data="pendingData"
            :loading="pendingLoading"
            :pagination="pendingPagination"
            :row-key="(row: any) => row.id"
            v-model:checked-row-keys="selectedPendingKeys"
            @update:page="(page) => { pendingPagination.page = page; fetchPendingData(); }"
            @update:page-size="(size) => { pendingPagination.pageSize = size; pendingPagination.page = 1; fetchPendingData(); }"
          />
        </n-tab-pane>

        <!-- 2. 待领取 -->
        <n-tab-pane name="ready" tab="待领取">
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <n-date-picker v-model:value="readyFilters.startDate" type="date" placeholder="开始日期" style="width: 200px;" />
            <n-date-picker v-model:value="readyFilters.endDate" type="date" placeholder="结束日期" style="width: 200px;" />
            <n-input v-model:value="readyFilters.agentAccount" placeholder="代理账号" style="width: 200px;" clearable />
            <n-button type="primary" @click="searchReady">搜索</n-button>
            <n-button @click="resetReadyFilters">重置</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px;">
            <n-button type="warning" :disabled="selectedReadyKeys.length === 0" @click="batchWithdraw">批量撤回 ({{ selectedReadyKeys.length }})</n-button>
          </div>

          <n-data-table
            :columns="readyColumns"
            :data="readyData"
            :loading="readyLoading"
            :pagination="readyPagination"
            :row-key="(row: any) => row.id"
            v-model:checked-row-keys="selectedReadyKeys"
            @update:page="(page) => { readyPagination.page = page; fetchReadyData(); }"
            @update:page-size="(size) => { readyPagination.pageSize = size; readyPagination.page = 1; fetchReadyData(); }"
          />
        </n-tab-pane>

        <!-- 3. 已撤回 -->
        <n-tab-pane name="withdrawn" tab="已撤回">
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <n-date-picker v-model:value="withdrawnFilters.startDate" type="date" placeholder="开始日期" style="width: 200px;" />
            <n-date-picker v-model:value="withdrawnFilters.endDate" type="date" placeholder="结束日期" style="width: 200px;" />
            <n-input v-model:value="withdrawnFilters.agentAccount" placeholder="代理账号" style="width: 200px;" clearable />
            <n-button type="primary" @click="searchWithdrawn">搜索</n-button>
            <n-button @click="resetWithdrawnFilters">重置</n-button>
          </div>

          <div style="display: flex; gap: 8px; margin-bottom: 16px;">
            <n-button type="success" :disabled="selectedWithdrawnKeys.length === 0" @click="batchApproveWithdrawn">批量通过 ({{ selectedWithdrawnKeys.length }})</n-button>
            <n-button type="error" :disabled="selectedWithdrawnKeys.length === 0" @click="batchRejectWithdrawn">批量拒绝 ({{ selectedWithdrawnKeys.length }})</n-button>
          </div>

          <n-data-table
            :columns="withdrawnColumns"
            :data="withdrawnData"
            :loading="withdrawnLoading"
            :pagination="withdrawnPagination"
            :row-key="(row: any) => row.id"
            v-model:checked-row-keys="selectedWithdrawnKeys"
            @update:page="(page) => { withdrawnPagination.page = page; fetchWithdrawnData(); }"
            @update:page-size="(size) => { withdrawnPagination.pageSize = size; withdrawnPagination.page = 1; fetchWithdrawnData(); }"
          />
        </n-tab-pane>

        <!-- 4. 已拒绝 -->
        <n-tab-pane name="rejected" tab="已拒绝">
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <n-date-picker v-model:value="rejectedFilters.startDate" type="date" placeholder="开始日期" style="width: 200px;" />
            <n-date-picker v-model:value="rejectedFilters.endDate" type="date" placeholder="结束日期" style="width: 200px;" />
            <n-input v-model:value="rejectedFilters.agentAccount" placeholder="代理账号" style="width: 200px;" clearable />
            <n-button type="primary" @click="searchRejected">搜索</n-button>
            <n-button @click="resetRejectedFilters">重置</n-button>
          </div>

          <n-data-table
            :columns="rejectedColumns"
            :data="rejectedData"
            :loading="rejectedLoading"
            :pagination="rejectedPagination"
            @update:page="(page) => { rejectedPagination.page = page; fetchRejectedData(); }"
            @update:page-size="(size) => { rejectedPagination.pageSize = size; rejectedPagination.page = 1; fetchRejectedData(); }"
          />
        </n-tab-pane>

        <!-- 5. 领取记录 -->
        <n-tab-pane name="claimed" tab="领取记录">
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <n-date-picker v-model:value="claimedFilters.startDate" type="date" placeholder="开始日期" style="width: 200px;" />
            <n-date-picker v-model:value="claimedFilters.endDate" type="date" placeholder="结束日期" style="width: 200px;" />
            <n-input v-model:value="claimedFilters.agentAccount" placeholder="代理账号" style="width: 200px;" clearable />
            <n-button type="primary" @click="searchClaimed">搜索</n-button>
            <n-button @click="resetClaimedFilters">重置</n-button>
          </div>

          <n-data-table
            :columns="claimedColumns"
            :data="claimedData"
            :loading="claimedLoading"
            :pagination="claimedPagination"
            @update:page="(page) => { claimedPagination.page = page; fetchClaimedData(); }"
            @update:page-size="(size) => { claimedPagination.pageSize = size; claimedPagination.page = 1; fetchClaimedData(); }"
          />
        </n-tab-pane>

        <!-- 6. 全部记录 -->
        <n-tab-pane name="all" tab="全部记录">
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <n-date-picker v-model:value="allFilters.startDate" type="date" placeholder="开始日期" style="width: 200px;" />
            <n-date-picker v-model:value="allFilters.endDate" type="date" placeholder="结束日期" style="width: 200px;" />
            <n-input v-model:value="allFilters.agentAccount" placeholder="代理账号" style="width: 200px;" clearable />
            <n-select v-model:value="allFilters.status" placeholder="状态" style="width: 150px;" :options="statusOptions" clearable />
            <n-button type="primary" @click="searchAll">搜索</n-button>
            <n-button @click="resetAllFilters">重置</n-button>
          </div>

          <n-data-table
            :columns="allColumns"
            :data="allData"
            :loading="allLoading"
            :pagination="allPagination"
            @update:page="(page) => { allPagination.page = page; fetchAllData(); }"
            @update:page-size="(size) => { allPagination.pageSize = size; allPagination.page = 1; fetchAllData(); }"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Commission Rules Modal -->
    <n-modal
      v-model:show="rulesModalVisible"
      preset="card"
      title="佣金人工审核规则"
      style="width: 600px;"
      :mask-closable="false"
    >
      <div style="margin-bottom: 24px;">
        <div v-for="currency in currencyList" :key="currency.code" style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <span style="min-width: 120px; color: #666;">{{ currency.name }}</span>
          <span style="min-width: 80px;">佣金金额≥</span>
          <n-input-number 
            v-model:value="(settingsForm as any)[currency.code]" 
            :min="0" 
            :precision="2" 
            style="flex: 1;" 
            placeholder="0.00" 
          />
        </div>
      </div>

      <div style="background: #f5f7fa; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
        <div style="font-weight: 500; margin-bottom: 8px;">佣金人工审核规则:</div>
        <div style="color: #666; line-height: 1.6;">
          1.若佣金结算之后的佣金超过设置的金额, 将被人工审核；<br/>
          2.0表示不限制。
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <n-button @click="rulesModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveSettings" :loading="settingsSaving">确认</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Approve Modal -->
    <n-modal
      v-model:show="approveModalVisible"
      preset="card"
      title="通过审核"
      style="width: 500px;"
      :mask-closable="false"
    >
      <n-form ref="approveFormRef" :model="approveForm" label-placement="left" label-width="100px">
        <n-form-item label="代理账号">
          <n-input :value="currentRecord?.agentAccount" disabled />
        </n-form-item>
        <n-form-item label="原始佣金">
          <n-input :value="formatCurrency(currentRecord?.commissionAmount)" disabled />
        </n-form-item>
        <n-form-item label="修改后佣金" required>
          <n-input-number v-model:value="approveForm.adjustedAmount" :min="0" :precision="2" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="approveForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <n-button @click="approveModalVisible = false">取消</n-button>
          <n-button type="primary" @click="confirmApprove" :loading="approving">确认通过</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Reject Modal -->
    <n-modal
      v-model:show="rejectModalVisible"
      preset="card"
      title="拒绝佣金"
      style="width: 500px;"
      :mask-closable="false"
    >
      <n-form ref="rejectFormRef" :model="rejectForm" label-placement="left" label-width="100px">
        <n-form-item label="代理账号">
          <n-input :value="currentRecord?.agentAccount" disabled />
        </n-form-item>
        <n-form-item label="佣金金额">
          <n-input :value="formatCurrency(currentRecord?.commissionAmount)" disabled />
        </n-form-item>
        <n-form-item label="拒绝原因" required>
          <n-input v-model:value="rejectForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <n-button @click="rejectModalVisible = false">取消</n-button>
          <n-button type="error" @click="confirmReject" :loading="rejecting">确认拒绝</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Remark Modal -->
    <n-modal
      v-model:show="remarkModalVisible"
      preset="card"
      title="添加备注"
      style="width: 500px;"
      :mask-closable="false"
    >
      <n-form ref="remarkFormRef" :model="remarkForm" label-placement="left" label-width="100px">
        <n-form-item label="备注内容" required>
          <n-input v-model:value="remarkForm.remark" type="textarea" :rows="4" placeholder="请输入备注内容" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <n-button @click="remarkModalVisible = false">取消</n-button>
          <n-button type="primary" @click="confirmRemark" :loading="remarkSaving">保存</n-button>
        </div>
      </template>
    </n-modal>
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, h } from 'vue';
import { Page } from '@vben/common-ui';
import {
  NCard,
  NTabs,
  NTabPane,
  NButton,
  NDataTable,
  NDatePicker,
  NInput,
  NSelect,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NTag,
  NPopconfirm,
  useMessage,
  useDialog,
  type DataTableColumns,
} from 'naive-ui';
import { requestClient } from '#/api/request';

const message = useMessage();
const dialog = useDialog();

// Active tab
const activeTab = ref('pending');

// Currency options
const currencyOptions = [
  { label: 'BRL', value: 'BRL' },
  { label: 'CNY', value: 'CNY' },
  { label: 'ZMW', value: 'ZMW' },
  { label: 'USDT', value: 'USDT' },
];

// Status options
const statusOptions = [
  { label: '待审核', value: 'PENDING' },
  { label: '待领取', value: 'READY' },
  { label: '已撤回', value: 'WITHDRAWN' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '已领取', value: 'CLAIMED' },
];

// Format currency
const formatCurrency = (amount: number, currency: string = 'BRL') => {
  if (amount === null || amount === undefined) return '0.00';
  return `${amount.toFixed(2)} ${currency}`;
};

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// ==================== 1. Commission Settings ====================
const settingsLoading = ref(false);
const settingsData = ref<any[]>([]);
const rulesModalVisible = ref(false);
const settingsSaving = ref(false);
const settingsForm = reactive({
  BRL: 0,
});

const currencyList = [
  { code: 'BRL', name: '巴西雷亚尔(BRL)' },
];

const fetchSettings = async () => {
  settingsLoading.value = true;
  try {
    const response = await requestClient.get('/commission-management/settings');
    console.log('Settings response:', response);
    
    if (response.success && response.data) {
      settingsData.value = response.data;
      // Update form with fetched values
      settingsData.value.forEach((item: any) => {
        if (item.currency === 'BRL') {
          settingsForm.BRL = item.threshold;
        }
      });
    } else {
      // Use default value
      settingsForm.BRL = 0;
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    message.error('加载设置失败');
    // Use default value
    settingsForm.BRL = 0;
  } finally {
    settingsLoading.value = false;
  }
};

const openRulesModal = () => {
  rulesModalVisible.value = true;
};

const saveSettings = async () => {
  settingsSaving.value = true;
  try {
    const response = await requestClient.post('/commission-management/settings', settingsForm);
    console.log('Save settings response:', response);
    
    if (response.success) {
      message.success('保存成功');
      rulesModalVisible.value = false;
      fetchSettings();
    } else {
      message.error(response.message || '保存失败');
    }
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    message.error(error.message || '保存失败');
  } finally {
    settingsSaving.value = false;
  }
};

// ==================== 2. Pending Approval ====================
const pendingLoading = ref(false);
const pendingData = ref<any[]>([]);
const selectedPendingKeys = ref<number[]>([]);
const pendingPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// Get today's start and end timestamps
const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    start: startOfDay,
    end: endOfDay.getTime()
  };
};

const todayRange = getTodayRange();

const pendingFilters = reactive({
  startDate: todayRange.start as number | null,
  endDate: todayRange.end as number | null,
  agentAccount: '',
  agentId: '',
  currency: null as string | null,
});

const currentRecord = ref<any>(null);
const approveModalVisible = ref(false);
const rejectModalVisible = ref(false);
const remarkModalVisible = ref(false);
const approving = ref(false);
const rejecting = ref(false);
const remarkSaving = ref(false);

const approveForm = reactive({
  adjustedAmount: 0,
  remark: '',
});

const rejectForm = reactive({
  reason: '',
});

const remarkForm = reactive({
  remark: '',
});

const pendingColumns: DataTableColumns<any> = [
  {
    type: 'selection',
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '结算日期',
    key: 'settlementDate',
    width: 160,
    render: (row) => formatDate(row.settlementDate),
  },
  {
    title: '代理ID',
    key: 'agentId',
    width: 100,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
    render: (row) => {
      return h(NButton, {
        text: true,
        type: 'primary',
        onClick: () => viewAgentDetail(row.agentId),
      }, { default: () => row.agentAccount });
    },
  },
  {
    title: '代理模式',
    key: 'agentMode',
    width: 100,
  },
  {
    title: '结算周期',
    key: 'settlementCycle',
    width: 100,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => {
      return h(NButton, {
        text: true,
        type: 'primary',
        onClick: () => viewCommissionDetail(row.id),
      }, { default: () => formatCurrency(row.commissionAmount, row.currency) });
    },
  },
  {
    title: '后台备注',
    key: 'remark',
    width: 150,
    ellipsis: {
      tooltip: true
    },
  },
  {
    title: '操作人',
    key: 'operator',
    width: 100,
  },
  {
    title: '操作时间',
    key: 'operatedAt',
    width: 160,
    render: (row) => formatDate(row.operatedAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) => {
      return h('div', { style: 'display: flex; gap: 8px;' }, [
        h(NButton, {
          size: 'small',
          type: 'success',
          onClick: () => handleApprove(row),
        }, { default: () => '通过' }),
        h(NButton, {
          size: 'small',
          type: 'error',
          onClick: () => handleReject(row),
        }, { default: () => '拒绝' }),
        h(NButton, {
          size: 'small',
          onClick: () => handleRemark(row),
        }, { default: () => '备注' }),
      ]);
    },
  },
];

const fetchPendingData = async () => {
  pendingLoading.value = true;
  try {
    const params = {
      page: pendingPagination.page,
      pageSize: pendingPagination.pageSize,
      status: 'PENDING',
      ...pendingFilters,
    };
    const response = await requestClient.get('/commission-management/records', { params });
    pendingData.value = response.data.list || [];
    pendingPagination.itemCount = response.data.total || 0;
  } catch (error) {
    console.error('Failed to fetch pending data:', error);
    message.error('获取数据失败');
  } finally {
    pendingLoading.value = false;
  }
};

const searchPending = () => {
  pendingPagination.page = 1;
  fetchPendingData();
};

const resetPendingFilters = () => {
  const range = getTodayRange();
  Object.assign(pendingFilters, {
    startDate: range.start,
    endDate: range.end,
    agentAccount: '',
    agentId: '',
    currency: null,
  });
  fetchPendingData();
};

const handleApprove = (record: any) => {
  currentRecord.value = record;
  approveForm.adjustedAmount = record.commissionAmount;
  approveForm.remark = '';
  approveModalVisible.value = true;
};

const confirmApprove = async () => {
  if (!currentRecord.value) return;
  approving.value = true;
  try {
    await requestClient.post(`/commission-management/records/${currentRecord.value.id}/approve`, approveForm);
    message.success('审核通过');
    approveModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to approve:', error);
    message.error('操作失败');
  } finally {
    approving.value = false;
  }
};

const handleReject = (record: any) => {
  currentRecord.value = record;
  rejectForm.reason = '';
  rejectModalVisible.value = true;
};

const confirmReject = async () => {
  if (!currentRecord.value || !rejectForm.reason) {
    message.warning('请输入拒绝原因');
    return;
  }
  rejecting.value = true;
  try {
    await requestClient.post(`/commission-management/records/${currentRecord.value.id}/reject`, rejectForm);
    message.success('已拒绝');
    rejectModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to reject:', error);
    message.error('操作失败');
  } finally {
    rejecting.value = false;
  }
};

const handleRemark = (record: any) => {
  currentRecord.value = record;
  remarkForm.remark = record.remark || '';
  remarkModalVisible.value = true;
};

const confirmRemark = async () => {
  if (!currentRecord.value) return;
  remarkSaving.value = true;
  try {
    await requestClient.post(`/commission-management/records/${currentRecord.value.id}/remark`, remarkForm);
    message.success('备注已保存');
    remarkModalVisible.value = false;
    fetchPendingData();
  } catch (error) {
    console.error('Failed to save remark:', error);
    message.error('保存失败');
  } finally {
    remarkSaving.value = false;
  }
};

const batchApprove = () => {
  dialog.warning({
    title: '批量通过',
    content: `确定要通过选中的 ${selectedPendingKeys.value.length} 条记录吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post('/commission-management/records/batch-approve', {
          ids: selectedPendingKeys.value,
        });
        message.success('批量通过成功');
        selectedPendingKeys.value = [];
        fetchPendingData();
      } catch (error) {
        console.error('Failed to batch approve:', error);
        message.error('批量操作失败');
      }
    },
  });
};

const batchReject = () => {
  dialog.warning({
    title: '批量拒绝',
    content: `确定要拒绝选中的 ${selectedPendingKeys.value.length} 条记录吗？此操作不可撤销！`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post('/commission-management/records/batch-reject', {
          ids: selectedPendingKeys.value,
        });
        message.success('批量拒绝成功');
        selectedPendingKeys.value = [];
        fetchPendingData();
      } catch (error) {
        console.error('Failed to batch reject:', error);
        message.error('批量操作失败');
      }
    },
  });
};

const batchApproveAll = () => {
  dialog.warning({
    title: '全部通过',
    content: '确定要通过当前待审核的所有记录吗？请谨慎操作！',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post('/commission-management/records/approve-all', pendingFilters);
        message.success('全部通过成功');
        fetchPendingData();
      } catch (error) {
        console.error('Failed to approve all:', error);
        message.error('操作失败');
      }
    },
  });
};

const batchRejectAll = () => {
  dialog.error({
    title: '全部拒绝',
    content: '确定要拒绝当前待审核的所有记录吗？此操作不可撤销，请谨慎操作！',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post('/commission-management/records/reject-all', pendingFilters);
        message.success('全部拒绝成功');
        fetchPendingData();
      } catch (error) {
        console.error('Failed to reject all:', error);
        message.error('操作失败');
      }
    },
  });
};

// ==================== 3. Ready to Claim ====================
const readyLoading = ref(false);
const readyData = ref<any[]>([]);
const selectedReadyKeys = ref<number[]>([]);
const readyPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const readyFilters = reactive({
  startDate: todayRange.start as number | null,
  endDate: todayRange.end as number | null,
  agentAccount: '',
});

const readyColumns: DataTableColumns<any> = [
  {
    type: 'selection',
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '结算日期',
    key: 'settlementDate',
    width: 160,
    render: (row) => formatDate(row.settlementDate),
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '操作时间',
    key: 'operatedAt',
    width: 160,
    render: (row) => formatDate(row.operatedAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) => {
      return h(NPopconfirm, {
        onPositiveClick: () => handleWithdraw(row.id),
      }, {
        default: () => '确定要撤回此佣金吗？',
        trigger: () => h(NButton, {
          size: 'small',
          type: 'warning',
        }, { default: () => '撤回' }),
      });
    },
  },
];

const fetchReadyData = async () => {
  readyLoading.value = true;
  try {
    const params = {
      page: readyPagination.page,
      pageSize: readyPagination.pageSize,
      status: 'READY',
      ...readyFilters,
    };
    const response = await requestClient.get('/commission-management/records', { params });
    readyData.value = response.data.list || [];
    readyPagination.itemCount = response.data.total || 0;
  } catch (error) {
    console.error('Failed to fetch ready data:', error);
    message.error('获取数据失败');
  } finally {
    readyLoading.value = false;
  }
};

const searchReady = () => {
  readyPagination.page = 1;
  fetchReadyData();
};

const resetReadyFilters = () => {
  const range = getTodayRange();
  Object.assign(readyFilters, {
    startDate: range.start,
    endDate: range.end,
    agentAccount: '',
  });
  fetchReadyData();
};

const handleWithdraw = async (id: number) => {
  try {
    await requestClient.post(`/commission-management/records/${id}/withdraw`);
    message.success('撤回成功');
    fetchReadyData();
  } catch (error) {
    console.error('Failed to withdraw:', error);
    message.error('撤回失败');
  }
};

const batchWithdraw = () => {
  dialog.warning({
    title: '批量撤回',
    content: `确定要撤回选中的 ${selectedReadyKeys.value.length} 条记录吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post('/commission-management/records/batch-withdraw', {
          ids: selectedReadyKeys.value,
        });
        message.success('批量撤回成功');
        selectedReadyKeys.value = [];
        fetchReadyData();
      } catch (error) {
        console.error('Failed to batch withdraw:', error);
        message.error('批量操作失败');
      }
    },
  });
};

// ==================== 4. Withdrawn ====================
const withdrawnLoading = ref(false);
const withdrawnData = ref<any[]>([]);
const selectedWithdrawnKeys = ref<number[]>([]);
const withdrawnPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const withdrawnFilters = reactive({
  startDate: todayRange.start as number | null,
  endDate: todayRange.end as number | null,
  agentAccount: '',
});

const withdrawnColumns: DataTableColumns<any> = [
  {
    type: 'selection',
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '撤回时间',
    key: 'withdrawnAt',
    width: 160,
    render: (row) => formatDate(row.withdrawnAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) => {
      return h('div', { style: 'display: flex; gap: 8px;' }, [
        h(NButton, {
          size: 'small',
          type: 'success',
          onClick: () => handleApproveWithdrawn(row),
        }, { default: () => '通过' }),
        h(NButton, {
          size: 'small',
          type: 'error',
          onClick: () => handleRejectWithdrawn(row),
        }, { default: () => '拒绝' }),
      ]);
    },
  },
];

const fetchWithdrawnData = async () => {
  withdrawnLoading.value = true;
  try {
    const params = {
      page: withdrawnPagination.page,
      pageSize: withdrawnPagination.pageSize,
      status: 'WITHDRAWN',
      ...withdrawnFilters,
    };
    const response = await requestClient.get('/commission-management/records', { params });
    withdrawnData.value = response.data.list || [];
    withdrawnPagination.itemCount = response.data.total || 0;
  } catch (error) {
    console.error('Failed to fetch withdrawn data:', error);
    message.error('获取数据失败');
  } finally {
    withdrawnLoading.value = false;
  }
};

const searchWithdrawn = () => {
  withdrawnPagination.page = 1;
  fetchWithdrawnData();
};

const resetWithdrawnFilters = () => {
  const range = getTodayRange();
  Object.assign(withdrawnFilters, {
    startDate: range.start,
    endDate: range.end,
    agentAccount: '',
  });
  fetchWithdrawnData();
};

const handleApproveWithdrawn = (record: any) => {
  currentRecord.value = record;
  approveForm.adjustedAmount = record.commissionAmount;
  approveForm.remark = '';
  approveModalVisible.value = true;
};

const handleRejectWithdrawn = (record: any) => {
  currentRecord.value = record;
  rejectForm.reason = '';
  rejectModalVisible.value = true;
};

const batchApproveWithdrawn = () => {
  dialog.warning({
    title: '批量通过',
    content: `确定要通过选中的 ${selectedWithdrawnKeys.value.length} 条记录吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post('/commission-management/records/batch-approve', {
          ids: selectedWithdrawnKeys.value,
        });
        message.success('批量通过成功');
        selectedWithdrawnKeys.value = [];
        fetchWithdrawnData();
      } catch (error) {
        console.error('Failed to batch approve:', error);
        message.error('批量操作失败');
      }
    },
  });
};

const batchRejectWithdrawn = () => {
  dialog.warning({
    title: '批量拒绝',
    content: `确定要拒绝选中的 ${selectedWithdrawnKeys.value.length} 条记录吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await requestClient.post('/commission-management/records/batch-reject', {
          ids: selectedWithdrawnKeys.value,
        });
        message.success('批量拒绝成功');
        selectedWithdrawnKeys.value = [];
        fetchWithdrawnData();
      } catch (error) {
        console.error('Failed to batch reject:', error);
        message.error('批量操作失败');
      }
    },
  });
};

// ==================== 5. Rejected ====================
const rejectedLoading = ref(false);
const rejectedData = ref<any[]>([]);
const rejectedPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const rejectedFilters = reactive({
  startDate: todayRange.start as number | null,
  endDate: todayRange.end as number | null,
  agentAccount: '',
});

const rejectedColumns: DataTableColumns<any> = [
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '拒绝原因',
    key: 'rejectReason',
    width: 200,
    ellipsis: {
      tooltip: true
    },
  },
  {
    title: '拒绝时间',
    key: 'rejectedAt',
    width: 160,
    render: (row) => formatDate(row.rejectedAt),
  },
];

const fetchRejectedData = async () => {
  rejectedLoading.value = true;
  try {
    const params = {
      page: rejectedPagination.page,
      pageSize: rejectedPagination.pageSize,
      status: 'REJECTED',
      ...rejectedFilters,
    };
    const response = await requestClient.get('/commission-management/records', { params });
    rejectedData.value = response.data.list || [];
    rejectedPagination.itemCount = response.data.total || 0;
  } catch (error) {
    console.error('Failed to fetch rejected data:', error);
    message.error('获取数据失败');
  } finally {
    rejectedLoading.value = false;
  }
};

const searchRejected = () => {
  rejectedPagination.page = 1;
  fetchRejectedData();
};

const resetRejectedFilters = () => {
  const range = getTodayRange();
  Object.assign(rejectedFilters, {
    startDate: range.start,
    endDate: range.end,
    agentAccount: '',
  });
  fetchRejectedData();
};

// ==================== 6. Claimed ====================
const claimedLoading = ref(false);
const claimedData = ref<any[]>([]);
const claimedPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const claimedFilters = reactive({
  startDate: todayRange.start as number | null,
  endDate: todayRange.end as number | null,
  agentAccount: '',
});

const claimedColumns: DataTableColumns<any> = [
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '领取时间',
    key: 'claimedAt',
    width: 160,
    render: (row) => formatDate(row.claimedAt),
  },
];

const fetchClaimedData = async () => {
  claimedLoading.value = true;
  try {
    const params = {
      page: claimedPagination.page,
      pageSize: claimedPagination.pageSize,
      status: 'CLAIMED',
      ...claimedFilters,
    };
    const response = await requestClient.get('/commission-management/records', { params });
    claimedData.value = response.data.list || [];
    claimedPagination.itemCount = response.data.total || 0;
  } catch (error) {
    console.error('Failed to fetch claimed data:', error);
    message.error('获取数据失败');
  } finally {
    claimedLoading.value = false;
  }
};

const searchClaimed = () => {
  claimedPagination.page = 1;
  fetchClaimedData();
};

const resetClaimedFilters = () => {
  const range = getTodayRange();
  Object.assign(claimedFilters, {
    startDate: range.start,
    endDate: range.end,
    agentAccount: '',
  });
  fetchClaimedData();
};

// ==================== 7. All Records ====================
const allLoading = ref(false);
const allData = ref<any[]>([]);
const allPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const allFilters = reactive({
  startDate: todayRange.start as number | null,
  endDate: todayRange.end as number | null,
  agentAccount: '',
  status: null as string | null,
});

const allColumns: DataTableColumns<any> = [
  {
    title: '币种',
    key: 'currency',
    width: 80,
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
  },
  {
    title: '代理账号',
    key: 'agentAccount',
    width: 120,
  },
  {
    title: '佣金',
    key: 'commissionAmount',
    width: 120,
    align: 'right',
    render: (row) => formatCurrency(row.commissionAmount, row.currency),
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, { type: any; text: string }> = {
        'PENDING': { type: 'warning', text: '待审核' },
        'PENDING_AUDIT': { type: 'warning', text: '待审核' },
        'READY': { type: 'info', text: '待领取' },
        'RELEASED': { type: 'info', text: '待领取' },
        'WITHDRAWN': { type: 'default', text: '已撤回' },
        'CANCELLED': { type: 'default', text: '已撤回' },
        'REJECTED': { type: 'error', text: '已拒绝' },
        'NOT_ELIGIBLE': { type: 'error', text: '已拒绝' },
        'CLAIMED': { type: 'success', text: '已领取' },
        'FAILED': { type: 'error', text: '失败' },
      };
      const status = statusMap[row.status] || { type: 'default', text: row.status };
      return h(NTag, { type: status.type }, { default: () => status.text });
    },
  },
  {
    title: '操作时间',
    key: 'operatedAt',
    width: 160,
    render: (row) => formatDate(row.operatedAt),
  },
];

const fetchAllData = async () => {
  allLoading.value = true;
  try {
    const params = {
      page: allPagination.page,
      pageSize: allPagination.pageSize,
      ...allFilters,
    };
    const response = await requestClient.get('/commission-management/records', { params });
    allData.value = response.data.list || [];
    allPagination.itemCount = response.data.total || 0;
  } catch (error) {
    console.error('Failed to fetch all data:', error);
    message.error('获取数据失败');
  } finally {
    allLoading.value = false;
  }
};

const searchAll = () => {
  allPagination.page = 1;
  fetchAllData();
};

const resetAllFilters = () => {
  const range = getTodayRange();
  Object.assign(allFilters, {
    startDate: range.start,
    endDate: range.end,
    agentAccount: '',
    status: null,
  });
  fetchAllData();
};

// Helper functions
const viewAgentDetail = (agentId: number) => {
  // TODO: Implement agent detail view
  message.info('查看代理详情: ' + agentId);
};

const viewCommissionDetail = (recordId: number) => {
  // TODO: Implement commission detail view
  message.info('查看佣金详情: ' + recordId);
};

// Initialize
onMounted(() => {
  fetchSettings();
  fetchPendingData();
});

// Watch activeTab and auto-load data when switching tabs
watch(activeTab, (newTab) => {
  switch (newTab) {
    case 'pending':
      fetchPendingData();
      break;
    case 'ready':
      fetchReadyData();
      break;
    case 'withdrawn':
      fetchWithdrawnData();
      break;
    case 'rejected':
      fetchRejectedData();
      break;
    case 'claimed':
      fetchClaimedData();
      break;
    case 'all':
      fetchAllData();
      break;
  }
});
</script>

<style scoped>
.n-card {
  margin: 16px 0;
}
</style>

