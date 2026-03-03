<template>
  <div class="activity-reward-report">
    <Page
      title="优惠明细"
      description="查看活动奖励发放明细，支持筛选与导出"
    >
      <div class="mb-4">
        <n-breadcrumb>
          <n-breadcrumb-item>优惠活动</n-breadcrumb-item>
          <n-breadcrumb-item>优惠明细</n-breadcrumb-item>
        </n-breadcrumb>
      </div>

      <n-card title="筛选条件" class="mb-4">
        <!-- Filter -->
        <div class="filter-section">
          <n-form :label-width="100" label-placement="left">
            <n-grid :cols="24" :x-gap="12" :y-gap="12">
              <n-gi :span="24">
                <n-form-item label="开始日期 - 结束日期">
                  <n-space align="center" :size="12">
                    <n-radio-group v-model:value="timeGranularity" @update:value="onTimeGranularityChange">
                      <n-radio-button value="day">日</n-radio-button>
                      <n-radio-button value="week">周</n-radio-button>
                      <n-radio-button value="month">月</n-radio-button>
                    </n-radio-group>
                    <n-date-picker
                      v-model:value="dateRange"
                      type="datetimerange"
                      clearable
                      placeholder="选择开始和结束日期时间"
                      format="yyyy-MM-dd HH:mm:ss"
                      style="width: 380px"
                    />
                  </n-space>
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item label="订单号">
                  <n-input
                    v-model:value="filters.orderNo"
                    placeholder="订单号"
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item label="用户ID/账号">
                  <n-input
                    v-model:value="filters.userIdOrAccount"
                    placeholder="用户ID 或 账号"
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item label="优惠来源">
                  <n-select
                    v-model:value="filters.benefitSource"
                    :options="benefitSourceOptions"
                    placeholder="多选"
                    multiple
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item v-if="filters.benefitSource?.includes('活动')" label="活动名称">
                  <n-input
                    v-model:value="filters.activityName"
                    placeholder="活动名称"
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item label="领取方式">
                  <n-select
                    v-model:value="filters.collectionMethod"
                    :options="collectionMethodOptions"
                    placeholder="全部领取方式"
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item label="奖励类型">
                  <n-select
                    v-model:value="filters.rewardType"
                    :options="rewardTypeOptions"
                    placeholder="多选"
                    multiple
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="12">
                <n-form-item :show-label="false">
                  <n-space>
                    <n-button type="primary" :loading="loading" @click="fetchData">
                      搜索
                    </n-button>
                    <n-button @click="resetFilters">重置</n-button>
                    <n-button type="success" :loading="exporting" @click="handleExport">
                      导出
                    </n-button>
                  </n-space>
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-form>
        </div>

        <!-- Data Grid -->
        <n-card size="small">
          <template #header>
            <n-space justify="space-between">
              <span>数据列表</span>
              <span style="font-size: 13px; color: #666">
                共 {{ totalCount }} 条记录
              </span>
            </n-space>
          </template>

          <div v-if="error" class="py-4">
            <n-alert type="error" :title="error" />
          </div>

          <SmartDataGrid
            v-else-if="listData.length > 0"
            :data="tableData"
            :columns="columns"
            :loading="loading"
            :pagination="paginationReactive"
            :scroll-x="tableScrollX"
            remote
            size="small"
            class="reward-report-table"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
            @refresh="fetchData"
          >
            <template #empty>
              <n-empty description="暂无数据" style="padding: 40px 0" />
            </template>
          </SmartDataGrid>

          <n-empty v-else-if="!loading" description="暂无数据" style="padding: 40px 0" />
          <div v-else class="py-8 text-center">
            <n-spin size="large" />
            <p class="mt-4">正在加载数据...</p>
          </div>
        </n-card>
      </n-card>

      <!-- 用户详情弹窗：点击会员账号打开 -->
      <UserDetailModal
        v-model:visible="showUserDetailModal"
        :user-id="currentUserIdForDetail"
        @refresh="fetchData"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent, h } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NSelect,
  NDatePicker,
  NButton,
  NRadioGroup,
  NRadioButton,
  NSpin,
  NAlert,
  NEmpty,
  NSpace,
  type DataTableColumns,
} from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Page } from '@vben/common-ui';
import { getRewardHistory } from '#/api/activityRewardReport';
import { exportGridData } from '#/utils/exportUtils';
import type { RewardHistoryItem } from '#/api/activityRewardReport';

const UserDetailModal = defineAsyncComponent(
  () => import('#/components/user/UserDetailModal.vue'),
);
const SmartDataGrid = defineAsyncComponent(
  () => import('#/components/smart/SmartDataGrid/index.vue'),
);

const message = useMessage();
const loading = ref(false);
const exporting = ref(false);
const error = ref('');
const listData = ref<RewardHistoryItem[]>([]);
const totalCount = ref(0);
const showUserDetailModal = ref(false);
const currentUserIdForDetail = ref(0);

/** 今天 00:00:00 和 23:59:59.999（本地） */
function getTodayRange(): [number, number] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  return [start, end];
}

/** 本周一 00:00:00 至周日 23:59:59.999 */
function getWeekRange(): [number, number] {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0).getTime();
  const end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999).getTime();
  return [start, end];
}

/** 本月 1 日 00:00:00 至最后一日 23:59:59.999 */
function getMonthRange(): [number, number] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  return [start, end];
}

const timeGranularity = ref<'day' | 'week' | 'month'>('day');
const dateRange = ref<[number, number] | null>(getTodayRange());

/** 筛选条件 */
const filters = ref({
  orderNo: '',
  userIdOrAccount: '',
  benefitSource: [] as string[],
  activityName: '',
  collectionMethod: null as string | null,
  rewardType: [] as string[],
});

const benefitSourceOptions = [
  { label: '活动', value: '活动' },
  { label: '任务', value: '任务' },
  { label: '返水', value: '返水' },
  { label: '返佣', value: '返佣' },
  { label: 'VIP奖励', value: 'VIP奖励' },
  { label: '利息宝', value: '利息宝' },
  { label: '幸运转盘', value: '幸运转盘' },
  { label: '公积金', value: '公积金' },
  { label: '盲盒抽奖', value: '盲盒抽奖' },
  { label: '充值优惠', value: '充值优惠' },
  { label: '银商结算', value: '银商结算' },
  { label: 'SVIP奖励', value: 'SVIP奖励' },
  { label: '积分抽奖', value: '积分抽奖' },
  { label: '折扣券', value: '折扣券' },
];

const collectionMethodOptions = [
  { label: '全部领取方式', value: '' },
  { label: '手动领取', value: '手动领取' },
  { label: '系统派发', value: '系统派发' },
  { label: '后台手动派发', value: '后台手动派发' },
  { label: '活动扣除', value: '活动扣除' },
];

const rewardTypeOptions = [
  { label: '奖金', value: '奖金' },
  { label: '加倍奖金', value: '加倍奖金' },
  { label: '活跃度', value: '活跃度' },
  { label: '幸运值', value: '幸运值' },
  { label: '积分', value: '积分' },
  { label: '盲盒免费次数', value: '盲盒免费次数' },
];

function onTimeGranularityChange(value: 'day' | 'week' | 'month') {
  if (value === 'day') dateRange.value = getTodayRange();
  else if (value === 'week') dateRange.value = getWeekRange();
  else if (value === 'month') dateRange.value = getMonthRange();
}


const paginationPage = ref(1);
const paginationPageSize = ref(20);

/** 服务端分页：当前页数据即 listData，点击页码时再请求 */
const tableData = computed(() => listData.value ?? []);

/** SmartDataGrid 分页配置 */
const paginationReactive = computed(() => ({
  page: paginationPage.value,
  pageSize: paginationPageSize.value,
  total: totalCount.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条记录`,
}));

function handlePageChange(page: number) {
  paginationPage.value = page;
  fetchData();
}

function handlePageSizeChange(pageSize: number) {
  paginationPageSize.value = pageSize;
  paginationPage.value = 1;
  fetchData();
}

function openUserDetail(row: RewardHistoryItem) {
  const id = row.memberId === undefined || row.memberId === null ? 0 : Number(row.memberId);
  if (!id) return;
  currentUserIdForDetail.value = id;
  showUserDetailModal.value = true;
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'medium' });
}

const columns: DataTableColumns<RewardHistoryItem> = [
  { title: '订单号', key: 'orderNo', width: 140, ellipsis: { tooltip: true } },
  { title: '优惠名称', key: 'benefitName', width: 160, ellipsis: { tooltip: true } },
  { title: '会员币种', key: 'memberCurrency', width: 100, ellipsis: { tooltip: true } },
  { title: '发放奖励', key: 'grantedReward', width: 100, render: (row) => row.grantedReward ?? '-' },
  { title: '会员ID', key: 'memberId', width: 100, ellipsis: { tooltip: true } },
  {
    title: '会员账号',
    key: 'memberAccount',
    width: 140,
    ellipsis: { tooltip: true },
    render: (row) =>
      row.memberId !== undefined && row.memberId !== null
        ? h(
            'a',
            {
              class: 'link-account',
              style: { color: '#2080f0', cursor: 'pointer', textDecoration: 'none' },
              onClick: (e: Event) => {
                e.preventDefault();
                openUserDetail(row);
              },
            },
            (row.memberAccount ?? row.memberId ?? '-') as string,
          )
        : (row.memberAccount ?? '-'),
  },
  { title: '优惠来源', key: 'benefitSource', width: 100, ellipsis: { tooltip: true } },
  { title: '来源类型', key: 'sourceType', width: 100, ellipsis: { tooltip: true } },
  { title: '发放方式', key: 'collectionMethod', width: 110, ellipsis: { tooltip: true } },
  { title: '奖励类型', key: 'rewardType', width: 100, ellipsis: { tooltip: true } },
  { title: '获取时间', key: 'acquisitionTime', width: 165, ellipsis: { tooltip: true }, render: (row) => formatDateTime(row.acquisitionTime) },
];

/** 表格横向滚动宽度（11 列，含订单号），保证所有列都能显示 */
const tableScrollX = 1405;

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const range = dateRange.value?.length === 2 ? dateRange.value : getTodayRange();
    const today = getTodayRange();
    const toYmd = (ts: number) => {
      const d = new Date(ts);
      return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    };
    const startDate = toYmd(range[0]) || toYmd(today[0]);
    const endDate = toYmd(range[1]) || toYmd(today[1]);
    const orderNo = filters.value.orderNo?.trim() || undefined;
    const userIdOrAccount = filters.value.userIdOrAccount?.trim() || undefined;
    const res = await getRewardHistory({
      startDate,
      endDate,
      orderNo,
      userId: userIdOrAccount,
      memberAccount: userIdOrAccount,
      benefitSource: filters.value.benefitSource?.length ? filters.value.benefitSource : undefined,
      activityName: filters.value.benefitSource?.includes('活动') && filters.value.activityName?.trim()
        ? filters.value.activityName.trim()
        : undefined,
      collectionMethod: filters.value.collectionMethod || undefined,
      rewardType: filters.value.rewardType?.length ? filters.value.rewardType : undefined,
      page: paginationPage.value,
      pageSize: paginationPageSize.value,
    });
    // 兼容多种后端返回格式（含嵌套 data/list/records/result/rows）
    const raw = (res && typeof res === 'object' && !Array.isArray(res)) ? (res as Record<string, unknown>) : null;
    const inner = raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? (raw.data as Record<string, unknown>) : null;
    const rows: RewardHistoryItem[] = Array.isArray(raw?.data)
      ? (raw.data as RewardHistoryItem[])
      : Array.isArray(raw?.list)
        ? (raw.list as RewardHistoryItem[])
        : Array.isArray(raw?.records)
          ? (raw.records as RewardHistoryItem[])
          : Array.isArray(raw?.items)
            ? (raw.items as RewardHistoryItem[])
            : Array.isArray(raw?.result)
              ? (raw.result as RewardHistoryItem[])
              : Array.isArray(raw?.rows)
                ? (raw.rows as RewardHistoryItem[])
                : Array.isArray(inner?.list)
                  ? (inner.list as RewardHistoryItem[])
                  : Array.isArray(inner?.data)
                    ? (inner.data as RewardHistoryItem[])
                    : Array.isArray(inner?.records)
                      ? (inner.records as RewardHistoryItem[])
                      : Array.isArray(res)
                      ? (res as RewardHistoryItem[])
                      : [];
    // 统一为 camelCase，兼容后端返回 snake_case（如 benefit_name → benefitName）
    const fieldMap: Record<string, string> = {
      order_no: 'orderNo',
      acquisition_time: 'acquisitionTime',
      benefit_name: 'benefitName',
      member_currency: 'memberCurrency',
      member_id: 'memberId',
      member_account: 'memberAccount',
      benefit_source: 'benefitSource',
      source_type: 'sourceType',
      collection_method: 'collectionMethod',
      reward_type: 'rewardType',
      granted_reward: 'grantedReward',
    };
    const normalize = (row: Record<string, unknown>): RewardHistoryItem => {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        const key = fieldMap[k] ?? k;
        out[key] = v;
      }
      return out as RewardHistoryItem;
    };
    const normalizedRows = rows.map((r) => normalize(r as Record<string, unknown>));
    const pagination = (raw?.pagination ?? inner?.pagination) as Record<string, unknown> | undefined;
    const total =
      typeof raw?.total === 'number' ? raw.total
        : typeof inner?.total === 'number' ? inner.total
          : typeof pagination?.total === 'number' ? (pagination.total as number)
            : normalizedRows.length;
    listData.value = normalizedRows;
    totalCount.value = total;
  } catch (e: any) {
    error.value = e?.message || '加载失败';
    listData.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  timeGranularity.value = 'day';
  dateRange.value = getTodayRange();
  filters.value = {
    orderNo: '',
    userIdOrAccount: '',
    benefitSource: [],
    activityName: '',
    collectionMethod: null,
    rewardType: [],
  };
  paginationPage.value = 1;
  fetchData();
}

async function handleExport() {
  if (!listData.value?.length) {
    message.warning('没有数据可导出');
    return;
  }
  exporting.value = true;
  try {
    await exportGridData(columns, listData.value, {
      filename: `activity-reward-report-${Date.now()}`,
      sheetName: '优惠明细',
    });
  } finally {
    exporting.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.filter-section .n-form-item {
  margin-bottom: 12px;
}
.activity-reward-report .table-wrapper {
  width: 100%;
  overflow-x: auto;
}
.reward-report-table {
  min-width: 1265px;
}
/* 会员账号链接：蓝色+悬停下划线，表格内用 :deep 穿透 */
.activity-reward-report :deep(.link-account) {
  color: #2080f0 !important;
  cursor: pointer;
  text-decoration: none;
}
.activity-reward-report :deep(.link-account:hover) {
  color: #4098fc !important;
  text-decoration: underline;
}
</style>
