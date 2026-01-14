<template>
  <div class="associations-tab">
    <!-- Filter Section -->
    <n-card class="mb-4">
      <n-form :model="filterForm" label-placement="left" label-width="100px" class="filter-form">
        <div class="filter-form-row">
          <!-- 操作时间类型选择 -->
          <n-form-item label="操作时间">
            <n-select
              v-model:value="filterForm.timeType"
              :options="timeTypeOptions"
              placeholder="请选择时间类型"
              style="width: 150px"
              clearable
            />
          </n-form-item>
          
          <!-- 时间段快捷选择 (日/周/月) -->
          <div class="flex flex-col">
            <QuickDateSelect
              v-model="filterForm.dateQuickSelect"
              @update:modelValue="handleQuickDateSelect"
            />
          </div>
          
          <!-- 日期范围选择器 -->
          <div class="flex flex-col">
            <TimezoneDatePicker
              v-model="filterForm.dateRange"
              @update:modelValue="handleDateRangeChange"
            />
          </div>
        </div>
        
        <div class="filter-form-row">
          <n-form-item label="会员账号">
            <n-input
              v-model:value="filterForm.memberAccount"
              placeholder="请输入会员账号"
              style="width: 200px"
              clearable
            />
          </n-form-item>
          
          <n-form-item label="关联类型">
            <n-select
              v-model:value="filterForm.associationType"
              :options="typeOptions"
              placeholder="请选择关联类型"
              style="width: 150px"
              clearable
            />
          </n-form-item>
          
          <n-form-item label="全部处罚方式">
            <n-select
              v-model:value="filterForm.punishmentMethod"
              :options="punishmentMethodOptions"
              placeholder="请选择处罚方式"
              style="width: 150px"
              clearable
            />
          </n-form-item>
        </div>
        
        <div class="filter-form-row">
          <n-form-item>
            <n-space>
              <n-button type="primary" @click="handleSearch">搜索</n-button>
              <n-button @click="handleReset">重置</n-button>
              <n-button @click="handleExport">导出报表</n-button>
            </n-space>
          </n-form-item>
        </div>
      </n-form>
    </n-card>

    <!-- Data Table -->
    <n-card class="table-card">
      <div class="table-container">
        <div class="table-content-wrapper">
          <n-data-table
            :columns="columns"
            :data="tableData"
            :loading="loading"
            :pagination="false"
            :row-key="(row) => row.id"
            :scroll-x="minTableWidth"
            :bordered="true"
            :single-line="false"
          />
        </div>
        <!-- Fixed Pagination Bar -->
        <div class="pagination-wrapper">
          <n-pagination
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-count="(pagination as any).pageCount"
            :page-sizes="pagination.pageSizes"
            show-size-picker
            show-quick-jumper
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, h } from 'vue';
import { NCard, NForm, NFormItem, NInput, NSelect, NButton, NSpace, NDataTable, useMessage } from 'naive-ui';
import { requestClient } from '#/api/request';
import TimezoneDatePicker from '#/components/common/TimezoneDatePicker.vue';
import QuickDateSelect from '#/components/common/QuickDateSelect.vue';
import { formatCurrency, formatDateTime } from '#/utils/format';
import { convertTimezoneToUTC, getDisplayTimezone, getNowInTimezone } from '#/utils/timezoneUtils';

interface Props {
  userId: number;
  initialAssociationType?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  initialAssociationType: null
});

const message = useMessage();

// Filter form
const filterForm = ref({
  timeType: 'operationTime' as 'operationTime' | 'associationTime', // 操作时间 or 关联时间
  dateQuickSelect: 'day' as 'day' | 'week' | 'month', // day, week, month
  dateRange: null as [number, number] | null,
  memberAccount: '',
  punishmentMethod: null as string | null,
  associationType: null as string | null
});

// Table data
const tableData = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const pagination = ref({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.value.page = page;
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize;
    pagination.value.page = 1;
  }
});

// Options
const timeTypeOptions = [
  { label: '操作时间', value: 'operationTime' },
  { label: '关联时间', value: 'associationTime' }
];

const typeOptions = [
  { label: '全部类型', value: 'all' },
  { label: '同上级代理', value: 'same_superior_agent' },
  { label: '同姓名', value: 'same_name' },
  { label: '同IP', value: 'same_ip' },
  { label: '同设备号', value: 'same_device' },
  { label: '同登录密码', value: 'same_password' },
  { label: '同提现密码', value: 'same_withdrawal_pin' },
  { label: '同提现账号', value: 'same_withdrawal_account' }
];

const punishmentMethodOptions = [
  { label: '全部处罚方式', value: 'all' },
  { label: '加入黑名单', value: 'blacklist' },
  { label: '修改会员层级', value: 'change_member_tier' },
  { label: '修改会员标签', value: 'change_member_tag' },
  { label: '恢复正常', value: 'restore_normal' },
  { label: '禁止领取优惠', value: 'ban_bonus' },
  { label: '冻结', value: 'freeze' },
  { label: '禁止进入游戏', value: 'ban_game' }
];

// Calculate minimum table width for horizontal scrolling
const minTableWidth = computed(() => {
  // Sum of all column widths + selection column (50px) + padding
  return 50 + 180 + 120 + 200 + 100 + 80 + 120 + 150 + 120 + 120 + 120 + 100 + 180 + 140 + 140 + 120 + 120 + 100 + 140 + 120 + 120 + 150 + 180 + 100 + 100;
});

// Table columns with responsive widths
const columns = computed(() => [
  {
    type: 'selection' as const,
    multiple: true,
    width: 50,
    fixed: 'left' as const
  },
  {
    title: '关联时间',
    key: 'associationTime',
    width: 180,
    minWidth: 150,
    render: (row: any) => formatDateTime(row.associationTime)
  },
  {
    title: '关联类型',
    key: 'associationType',
    width: 120,
    minWidth: 100
  },
  {
    title: '具体关联信息',
    key: 'associationInfo',
    width: 200,
    minWidth: 150,
    ellipsis: { tooltip: true }
  },
  {
    title: '处罚方式',
    key: 'punishmentMethod',
    width: 100,
    minWidth: 80
  },
  {
    title: '币种',
    key: 'currency',
    width: 80,
    minWidth: 60
  },
  {
    title: '会员ID',
    key: 'userId',
    width: 120,
    minWidth: 100
  },
  {
    title: '会员账号',
    key: 'account',
    width: 180,
    minWidth: 150,
    ellipsis: { tooltip: true },
    render: (row: any) => `${row.account} (${row.memberLevel})`
  },
  {
    title: '真实姓名',
    key: 'realName',
    width: 120,
    minWidth: 100,
    ellipsis: { tooltip: true }
  },
  {
    title: '顶层代理',
    key: 'topAgent',
    width: 120,
    minWidth: 100,
    ellipsis: { tooltip: true }
  },
  {
    title: '上级代理',
    key: 'superiorAgent',
    width: 120,
    minWidth: 100,
    ellipsis: { tooltip: true }
  },
  {
    title: '账号状态',
    key: 'accountStatus',
    width: 100,
    minWidth: 80
  },
  {
    title: '注册时间',
    key: 'registrationTime',
    width: 180,
    minWidth: 150,
    render: (row: any) => formatDateTime(row.registrationTime)
  },
  {
    title: '累计充值金额',
    key: 'totalDeposit',
    width: 140,
    minWidth: 120,
    render: (row: any) => formatCurrency(row.totalDeposit)
  },
  {
    title: '累计提现金额',
    key: 'totalWithdraw',
    width: 140,
    minWidth: 120,
    render: (row: any) => formatCurrency(row.totalWithdraw)
  },
  {
    title: '充提差额',
    key: 'depositWithdrawDiff',
    width: 120,
    minWidth: 100,
    render: (row: any) => formatCurrency(row.depositWithdrawDiff)
  },
  {
    title: '当前余额',
    key: 'currentBalance',
    width: 120,
    minWidth: 100,
    render: (row: any) => formatCurrency(row.currentBalance)
  },
  {
    title: '利息宝',
    key: 'savingsWallet',
    width: 100,
    minWidth: 80,
    render: (row: any) => formatCurrency(row.savingsWallet)
  },
  {
    title: '优惠累计领取',
    key: 'totalRewards',
    width: 140,
    minWidth: 120,
    render: (row: any) => formatCurrency(row.totalRewards)
  },
  {
    title: '累计投注',
    key: 'totalBetting',
    width: 120,
    minWidth: 100,
    render: (row: any) => formatCurrency(row.totalBetting)
  },
  {
    title: '累计输赢',
    key: 'totalWinLoss',
    width: 120,
    minWidth: 100,
    render: (row: any) => formatCurrency(row.totalWinLoss)
  },
  {
    title: '备注',
    key: 'notes',
    width: 150,
    minWidth: 120,
    ellipsis: { tooltip: true }
  },
  {
    title: '操作时间',
    key: 'operationTime',
    width: 180,
    minWidth: 150,
    render: (row: any) => formatDateTime(row.operationTime)
  },
  {
    title: '操作人',
    key: 'operator',
    width: 100,
    minWidth: 80,
    ellipsis: { tooltip: true }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    minWidth: 80,
    fixed: 'right' as const,
    render: (row: any) => {
      return h('div', [
        h(NButton, {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: () => handleViewUser(row.id)
        }, { default: () => '查看' })
      ]);
    }
  }
]);

// Watch for initial association type
watch(() => props.initialAssociationType, (newType) => {
  if (newType) {
    filterForm.value.associationType = newType;
    loadTableData();
  }
}, { immediate: true });

// Load table data
const loadTableData = async () => {
  if (!props.userId) return;
  
  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      associationType: filterForm.value.associationType
    };
    
    if (filterForm.value.dateRange) {
      const [start, end] = filterForm.value.dateRange;
      // Convert from display timezone to UTC
      const tz = getDisplayTimezone();
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // Get date components in display timezone
      const startTz = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).formatToParts(startDate);
      
      const endTz = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).formatToParts(endDate);
      
      const startUTC = convertTimezoneToUTC(
        parseInt(startTz.find(p => p.type === 'year')!.value),
        parseInt(startTz.find(p => p.type === 'month')!.value),
        parseInt(startTz.find(p => p.type === 'day')!.value),
        parseInt(startTz.find(p => p.type === 'hour')!.value),
        parseInt(startTz.find(p => p.type === 'minute')!.value),
        parseInt(startTz.find(p => p.type === 'second')!.value),
        tz
      );
      
      const endUTC = convertTimezoneToUTC(
        parseInt(endTz.find(p => p.type === 'year')!.value),
        parseInt(endTz.find(p => p.type === 'month')!.value),
        parseInt(endTz.find(p => p.type === 'day')!.value),
        parseInt(endTz.find(p => p.type === 'hour')!.value),
        parseInt(endTz.find(p => p.type === 'minute')!.value),
        parseInt(endTz.find(p => p.type === 'second')!.value),
        tz
      );
      
      params.startDate = startUTC.toISOString();
      params.endDate = endUTC.toISOString();
    }
    
    // Always include associationType if set
    if (filterForm.value.associationType) {
      params.associationType = filterForm.value.associationType;
    }
    
    if (filterForm.value.memberAccount) {
      params.memberAccount = filterForm.value.memberAccount;
    }
    
    if (filterForm.value.punishmentMethod) {
      params.punishmentMethod = filterForm.value.punishmentMethod;
    }
    
    const response = await requestClient.get(`/users/${props.userId}/associations`, { params });
    
    console.log('🔍 [AssociationsTab] API response:', response);
    console.log('🔍 [AssociationsTab] Response type:', typeof response);
    console.log('🔍 [AssociationsTab] Response keys:', response ? Object.keys(response) : 'undefined');
    
    // Response interceptor unwraps {code: 0, data: {...}} to just {...}
    // So response is already the data object with list, total, page, pageSize
    if (response && typeof response === 'object') {
      // Check if it's the unwrapped format (has list and total directly)
      if ('list' in response && 'total' in response) {
        tableData.value = (response as any).list || [];
        total.value = (response as any).total || 0;
        (pagination.value as any).pageCount = Math.ceil(total.value / pagination.value.pageSize);
        console.log('✅ [AssociationsTab] Loaded data - list:', tableData.value.length, 'total:', total.value);
      } 
      // Check if it's still wrapped (has code and data)
      else if ('code' in response && (response as any).code === 0 && 'data' in response) {
        const data = (response as any).data;
        tableData.value = data.list || [];
        total.value = data.total || 0;
        (pagination.value as any).pageCount = Math.ceil(total.value / pagination.value.pageSize);
      }
      // Check if it's error format
      else if ('code' in response && (response as any).code !== 0) {
        message.error((response as any).message || '加载关联账号失败');
        tableData.value = [];
        total.value = 0;
        (pagination.value as any).pageCount = 0;
      } else {
        // Unknown format, try to use response directly
        console.warn('Unknown response format:', response);
        tableData.value = [];
        total.value = 0;
        (pagination.value as any).pageCount = 0;
      }
    } else {
      tableData.value = [];
      total.value = 0;
      (pagination.value as any).pageCount = 0;
    }
  } catch (error: any) {
    console.error('Error loading associations:', error);
    // Only show error on actual network/exception errors
    message.error('加载关联账号失败');
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// Handlers
const handleQuickDateSelect = (value: 'day' | 'week' | 'month' | null) => {
  if (!value) return; // Handle null case
  
  // Use the exact same logic as user management page
  const tz = getDisplayTimezone();
  const tzNow = getNowInTimezone(tz);
  
  let startYear: number, startMonth: number, startDay: number;
  let endYear: number, endMonth: number, endDay: number;
  
  switch(value) {
    case 'day':
      // Today in display timezone: 00:00:00 to 23:59:59
      startYear = endYear = tzNow.year;
      startMonth = endMonth = tzNow.month;
      startDay = endDay = tzNow.day;
      break;
    case 'week':
      // Last 7 days: calculate 7 days ago
      const weekAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startYear = weekAgo.getFullYear();
      startMonth = weekAgo.getMonth() + 1;
      startDay = weekAgo.getDate();
      endYear = tzNow.year;
      endMonth = tzNow.month;
      endDay = tzNow.day;
      break;
    case 'month':
      // Last 30 days: calculate 30 days ago
      const monthAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      monthAgo.setDate(monthAgo.getDate() - 30);
      startYear = monthAgo.getFullYear();
      startMonth = monthAgo.getMonth() + 1;
      startDay = monthAgo.getDate();
      endYear = tzNow.year;
      endMonth = tzNow.month;
      endDay = tzNow.day;
      break;
    default:
      return;
  }
  
  // Convert to UTC timestamps using the same logic as user management
  const startDateUTC = convertTimezoneToUTC(startYear, startMonth, startDay, 0, 0, 0, tz);
  const endDateUTC = convertTimezoneToUTC(endYear, endMonth, endDay, 23, 59, 59, tz);
  
  // Validate and store UTC timestamps directly
  if (isNaN(startDateUTC.getTime()) || isNaN(endDateUTC.getTime())) {
    console.error('❌ Failed to convert timezone dates to UTC');
    // Fallback: approximate UTC (not ideal)
    filterForm.value.dateRange = [
      new Date(Date.UTC(startYear, startMonth - 1, startDay, 3, 0, 0)).getTime(), // São Paulo is UTC-3
      new Date(Date.UTC(endYear, endMonth - 1, endDay, 2, 59, 59)).getTime()
    ];
  } else {
    // Store UTC timestamps - these represent display timezone time
    filterForm.value.dateRange = [startDateUTC.getTime(), endDateUTC.getTime()];
  }
};

const handleDateRangeChange = (value: [number, number] | null) => {
  filterForm.value.dateRange = value;
};

const handleSearch = () => {
  pagination.value.page = 1;
  loadTableData();
};

const handleReset = () => {
  filterForm.value = {
    timeType: 'operationTime',
    dateQuickSelect: 'day',
    dateRange: null,
    memberAccount: '',
    punishmentMethod: null,
    associationType: props.initialAssociationType || null
  };
  handleQuickDateSelect('day'); // Re-apply default date range
  pagination.value.page = 1;
  loadTableData();
};

const handleExport = () => {
  message.info('导出报表功能开发中...');
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  loadTableData();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  pagination.value.page = 1;
  loadTableData();
};

const handleViewUser = (userId: number) => {
  // Emit event to parent to open user detail modal
  // This will be handled by the parent component
  message.info(`查看用户 ${userId}`);
};

onMounted(() => {
  if (props.initialAssociationType) {
    filterForm.value.associationType = props.initialAssociationType;
  }
  loadTableData();
});
</script>

<style scoped>
.associations-tab {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.table-content-wrapper {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.table-content-wrapper :deep(.n-data-table) {
  min-width: 100%;
}

/* Make table cells wrap text better on small screens */
.table-content-wrapper :deep(.n-data-table td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Fixed Pagination Bar */
.pagination-wrapper {
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid var(--n-border-color);
  background: var(--n-color);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Filter form layout - responsive wrapping */
.filter-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.filter-form-row :deep(.n-form-item) {
  margin-bottom: 0;
  flex: 0 0 auto;
}

/* Responsive: On small screens, wrap to multiple rows */
@media (max-width: 1200px) {
  .filter-form-row {
    flex-wrap: wrap;
  }
  
  .filter-form-row :deep(.n-form-item) {
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .filter-form-row {
    flex-direction: column;
  }
  
  .filter-form-row :deep(.n-form-item) {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .filter-form-row :deep(.n-form-item .n-input),
  .filter-form-row :deep(.n-form-item .n-select),
  .filter-form-row :deep(.n-form-item .n-date-picker) {
    width: 100% !important;
  }
}
</style>

