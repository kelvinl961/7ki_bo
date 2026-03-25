<template>
  <div class="activity-reward-report">
    <Page>
      <n-card title="筛选条件" class="mb-4">
        <!-- Filter -->
        <div class="filter-section">
          <n-form :label-width="100" label-placement="left">
            <n-grid :cols="24" :x-gap="12" :y-gap="12">
              <n-gi :span="24">
                <n-form-item label="">
                  <n-space align="center" :size="12">
                    <n-radio-group v-model:value="timeGranularity" @update:value="onTimeGranularityChange">
                      <n-radio-button value="day">日</n-radio-button>
                      <n-radio-button value="week">周</n-radio-button>
                      <n-radio-button value="month">月</n-radio-button>
                    </n-radio-group>
                    <n-date-picker
                      v-model:value="dateRange"
                      type="datetimerange"
                      :timezone="REPORT_TIMEZONE"
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
                    placeholder="请选择优惠来源"
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi v-if="filters.benefitSource === '活动'" :span="6">
                <n-form-item label="活动名称">
                  <n-select
                    v-model:value="filters.activityId"
                    :options="activitySelectOptions"
                    placeholder="请选择或搜索活动"
                    filterable
                    clearable
                    :loading="loadingActivitiesForFilter"
                    @focus="loadActivitiesForRewardFilter"
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
                    placeholder="请选择奖励类型"
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="12">
                <n-form-item :show-label="false">
                  <n-space>
                    <n-button type="primary" :loading="loading" @click="runSearch">
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
            row-key="orderNo"
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

          <div
            v-if="listData.length > 0 && !loading"
            class="totals-summary"
          >
            <div class="total-item">
              <span class="total-label">发放奖励合计:</span>
              <span class="total-value total-value--reward">{{ totalGrantedReward.toFixed(2) }}</span>
            </div>
          </div>

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

      <!-- 优惠明细详情弹窗 -->
      <n-modal
        v-model:show="showRewardDetailModal"
        preset="card"
        title="详情"
        style="width: 560px; max-width: 90vw"
        :bordered="false"
        size="huge"
        :mask-closable="false"
      >
        <div v-if="rewardDetail" class="reward-detail">
          <n-card size="small" :bordered="false" class="mb-0">
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">会员账号</span>
                <span class="detail-value">{{ rewardDetail.memberAccount ?? '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">活动名称</span>
                <span class="detail-value">{{ rewardDetail.activityName ?? rewardDetail.benefitName ?? '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">活动ID</span>
                <span class="detail-value">{{ rewardDetail.activityId ?? '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">奖励类型</span>
                <span class="detail-value">{{ rewardDetail.rewardType ?? '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">赠送奖励</span>
                <span class="detail-value detail-value--reward">{{ rewardDetail.grantedReward != null ? Number(rewardDetail.grantedReward).toFixed(2) : '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">领取时间</span>
                <span class="detail-value">{{ formatDateTime(rewardDetail.acquisitionTime) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">领取方式</span>
                <span class="detail-value">{{ rewardDetail.collectionMethod ?? '-' }}</span>
              </div>
            </div>
          </n-card>
        </div>
        <template #footer>
          <n-button @click="showRewardDetailModal = false">关闭</n-button>
        </template>
      </n-modal>
    </Page>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, defineAsyncComponent, h } from 'vue';
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
  NModal,
  type DataTableColumns,
} from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Page } from '@vben/common-ui';
import { getActivityList, type Activity } from '#/api/activity';
import {
  getRewardHistory,
  getRewardHistoryByOrderNo,
  type RewardHistoryParams,
} from '#/api/activityRewardReport';
import { exportGridData } from '#/utils/exportUtils';
import type { RewardHistoryItem } from '#/api/activityRewardReport';
import {
  convertTimezoneToUTC,
  formatDateTimeInTimezone,
  getNowInTimezone,
} from '#/utils/timezoneUtils';

/** 本页筛选与接口日期均按巴西圣保罗日历日（与后端 ACTIVE_TIMEZONES 一致） */
const REPORT_TIMEZONE = 'America/Sao_Paulo';

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
const totalGrantedReward = ref<number>(0);
const showUserDetailModal = ref(false);
const currentUserIdForDetail = ref(0);
const showRewardDetailModal = ref(false);
const rewardDetail = ref<RewardHistoryItem | null>(null);
const loadingRewardDetail = ref(false);

function addCalendarDaysInTz(
  year: number,
  month: number,
  day: number,
  deltaDays: number,
  tz: string,
): { year: number; month: number; day: number } {
  const anchor = convertTimezoneToUTC(year, month, day, 12, 0, 0, tz).getTime();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(anchor + deltaDays * 86_400_000));
  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const d = Number(parts.find((p) => p.type === 'day')?.value);
  return { year: y, month: m, day: d };
}

/** 圣保罗「今天」00:00:00 ~ 23:59:59 */
function getTodayRange(): [number, number] {
  const tz = REPORT_TIMEZONE;
  const tzNow = getNowInTimezone(tz);
  const start = convertTimezoneToUTC(tzNow.year, tzNow.month, tzNow.day, 0, 0, 0, tz);
  const end = convertTimezoneToUTC(tzNow.year, tzNow.month, tzNow.day, 23, 59, 59, tz);
  return [start.getTime(), end.getTime()];
}

/** 圣保罗当周：周一 00:00:00 ~ 周日 23:59:59 */
function getWeekRange(): [number, number] {
  const tz = REPORT_TIMEZONE;
  const { year, month, day } = getNowInTimezone(tz);
  const noon = convertTimezoneToUTC(year, month, day, 12, 0, 0, tz);
  const weekdayShort = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
  }).format(noon);
  const dowMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dow = dowMap[weekdayShort] ?? 1;
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  let monY = year;
  let monM = month;
  let monD = day;
  for (let i = 0; i < daysFromMonday; i++) {
    const prev = addCalendarDaysInTz(monY, monM, monD, -1, tz);
    monY = prev.year;
    monM = prev.month;
    monD = prev.day;
  }
  const sun = addCalendarDaysInTz(monY, monM, monD, 6, tz);
  const start = convertTimezoneToUTC(monY, monM, monD, 0, 0, 0, tz);
  const end = convertTimezoneToUTC(sun.year, sun.month, sun.day, 23, 59, 59, tz);
  return [start.getTime(), end.getTime()];
}

/** 圣保罗当月 1 日 ~ 末日 */
function getMonthRange(): [number, number] {
  const tz = REPORT_TIMEZONE;
  const { year, month } = getNowInTimezone(tz);
  const start = convertTimezoneToUTC(year, month, 1, 0, 0, 0, tz);
  const lastDay = new Date(year, month, 0).getDate();
  const end = convertTimezoneToUTC(year, month, lastDay, 23, 59, 59, tz);
  return [start.getTime(), end.getTime()];
}

const timeGranularity = ref<'day' | 'week' | 'month'>('day');
const dateRange = ref<[number, number] | null>(getTodayRange());

/** 筛选条件 */
const filters = ref({
  orderNo: '',
  userIdOrAccount: '',
  benefitSource: null as string | null,
  activityId: null as number | null,
  collectionMethod: null as string | null,
  rewardType: null as string | null,
});

const activityListForFilter = ref<Activity[]>([]);
const loadingActivitiesForFilter = ref(false);

function trimmedActivityLabel(a: Activity): string {
  const raw = (a.config?.title ?? a.title ?? '').toString();
  const t = raw.trim();
  return t || `活动 #${a.id}`;
}

/** trim 标题并按去空格后的文案去重；若当前选中 ID 在重复组内则保留该 ID，避免选项被合并后显示异常 */
const activitySelectOptions = computed(() => {
  const currentId = filters.value.activityId;
  const groups = new Map<string, Activity[]>();
  for (const a of activityListForFilter.value) {
    const label = trimmedActivityLabel(a);
    let g = groups.get(label);
    if (!g) {
      g = [];
      groups.set(label, g);
    }
    g.push(a);
  }
  const out: { label: string; value: number }[] = [];
  for (const [label, acts] of groups) {
    const preferred = acts.find((a) => a.id === currentId);
    const pick = preferred ?? acts[0];
    if (pick) out.push({ label, value: pick.id });
  }
  out.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
  return out;
});

async function loadActivitiesForRewardFilter() {
  if (activityListForFilter.value.length > 0) return;
  loadingActivitiesForFilter.value = true;
  try {
    const res = await getActivityList({ page: 1, pageSize: 500 });
    activityListForFilter.value = res.list ?? [];
  } catch {
    message.error('加载活动列表失败');
    activityListForFilter.value = [];
  } finally {
    loadingActivitiesForFilter.value = false;
  }
}

watch(
  () => filters.value.benefitSource,
  (v) => {
    if (v !== '活动') {
      filters.value.activityId = null;
    } else {
      void loadActivitiesForRewardFilter();
    }
  },
);

const benefitSourceOptions = [
  { label: '活动', value: '活动' },
  { label: '任务', value: '任务' },
  { label: '新人福利', value: '新人福利' },
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

const FETCH_CHUNK_SIZE = 500;
const MAX_FETCH_PAGES = 120;

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
  void fetchData();
}

function handlePageSizeChange(pageSize: number) {
  paginationPageSize.value = pageSize;
  paginationPage.value = 1;
  void fetchData();
}

function runSearch() {
  paginationPage.value = 1;
  void fetchData();
}

function openUserDetail(row: RewardHistoryItem) {
  const internalId = row.userId != null
    ? Number(row.userId)
    : row.memberId != null
      ? Number(row.memberId)
      : 0;
  if (!internalId) return;
  currentUserIdForDetail.value = internalId;
  showUserDetailModal.value = true;
}

function openUpperAgentDetail(upperAgentId: number) {
  if (!upperAgentId) return;
  currentUserIdForDetail.value = upperAgentId;
  showUserDetailModal.value = true;
}

const detailFieldMap: Record<string, string> = {
  order_no: 'orderNo',
  acquisition_time: 'acquisitionTime',
  benefit_name: 'benefitName',
  member_currency: 'memberCurrency',
  member_id: 'memberId',
  member_account: 'memberAccount',
  upper_agent_account: 'upperAgentAccount',
  upper_agent_user_id: 'upperAgentUserID',
  benefit_source: 'benefitSource',
  source_type: 'sourceType',
  collection_method: 'collectionMethod',
  reward_type: 'rewardType',
  granted_reward: 'grantedReward',
  activity_id: 'activityId',
  activity_name: 'activityName',
  reward_condition: 'rewardCondition',
  loss_amount: 'lossAmount',
};

function normalizeDetail(row: Record<string, unknown>): RewardHistoryItem {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = detailFieldMap[k] ?? k;
    out[key] = v;
  }
  return out as RewardHistoryItem;
}

async function handleViewDetail(row: RewardHistoryItem) {
  const orderNo = row.orderNo?.trim();
  if (!orderNo) {
    rewardDetail.value = row;
    showRewardDetailModal.value = true;
    return;
  }
  loadingRewardDetail.value = true;
  rewardDetail.value = null;
  try {
    const res = await getRewardHistoryByOrderNo(orderNo);
    const raw = res && typeof res === 'object' && !Array.isArray(res) ? (res as Record<string, unknown>) : null;
    const data = raw?.data && typeof raw.data === 'object' ? (raw.data as Record<string, unknown>) : raw;
    const item = data ? normalizeDetail(data) : row;
    rewardDetail.value = item;
    showRewardDetailModal.value = true;
  } catch {
    rewardDetail.value = row;
    showRewardDetailModal.value = true;
  } finally {
    loadingRewardDetail.value = false;
  }
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : formatDateTimeInTimezone(d, REPORT_TIMEZONE);
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
    render: (row) => {
      const internalId =
        row.userId != null
          ? Number(row.userId)
          : row.memberId != null
            ? Number(row.memberId)
            : 0;
      return internalId
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
        : (row.memberAccount ?? row.memberId ?? '-');
    },
  },
  {
    title: '上级代理',
    key: 'upperAgent',
    width: 180,
    ellipsis: { tooltip: true },
    render(row) {
      const account = row.upperAgentAccount ?? (row as any).upper_agent_account;
      const userID = row.upperAgentUserID ?? (row as any).upper_agent_user_id;
      if (!account && !userID) return '-';
      const agentId = Number(row.upperAgentId ?? (row as any).upper_agent_id ?? 0);
      const canOpen = agentId > 0;
      const linkStyle = { color: '#2080f0', cursor: 'pointer', textDecoration: 'none' };
      const onClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (canOpen) {
          openUpperAgentDetail(agentId);
        } else {
          message.info('上级代理详情暂不可用（需后端返回 upper_agent_id）');
        }
      };
      return h(
        'a',
        {
          class: 'link-account',
          style: { ...linkStyle, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' },
          title: canOpen ? '点击查看上级代理详情' : '点击提示',
          onClick,
        },
        [
          account ? h('span', {}, account) : null,
          userID ? h('span', { style: 'font-size: 12px;' }, `(${userID})`) : null,
        ].filter(Boolean),
      );
    },
  },
  { title: '优惠来源', key: 'benefitSource', width: 100, ellipsis: { tooltip: true } },
  {
    title: '来源类型',
    key: 'sourceType',
    width: 100,
    ellipsis: { tooltip: true },
    render: (row) => {
      const sourceTypeMap: Record<string, string> = {
        redpacket: '红包',
        promotion: '推广',
        newbie: '新人彩金',
      };
      return sourceTypeMap[row.sourceType ?? ''] ?? (row.sourceType ?? '-');
    },
  },
  { title: '发放方式', key: 'collectionMethod', width: 110, ellipsis: { tooltip: true } },
  { title: '奖励类型', key: 'rewardType', width: 100, ellipsis: { tooltip: true } },
  { title: '获取时间', key: 'acquisitionTime', width: 165, ellipsis: { tooltip: true }, render: (row) => formatDateTime(row.acquisitionTime) },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small', justify: 'center' },
        {
          default: () =>
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                text: true,
                onClick: () => handleViewDetail(row),
              },
              { default: () => '详情' },
            ),
        },
      ),
  },
];

const tableScrollX = 1690;

/** 列表行 snake_case → camelCase（含活动字段，供前端按活动筛选） */
const rewardHistoryRowFieldMap: Record<string, string> = {
  order_no: 'orderNo',
  acquisition_time: 'acquisitionTime',
  benefit_name: 'benefitName',
  member_currency: 'memberCurrency',
  member_id: 'memberId',
  member_account: 'memberAccount',
  upper_agent_account: 'upperAgentAccount',
  upper_agent_user_id: 'upperAgentUserID',
  upper_agent_id: 'upperAgentId',
  uplineAccount: 'upperAgentAccount',
  uplineUserID: 'upperAgentUserID',
  uplineUserId: 'upperAgentId',
  benefit_source: 'benefitSource',
  source_type: 'sourceType',
  collection_method: 'collectionMethod',
  reward_type: 'rewardType',
  granted_reward: 'grantedReward',
  activity_id: 'activityId',
  activity_name: 'activityName',
};

function normalizeRewardHistoryRow(row: Record<string, unknown>): RewardHistoryItem {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = rewardHistoryRowFieldMap[k] ?? k;
    out[key] = v;
  }
  return out as RewardHistoryItem;
}

function extractNormalizedRowsFromResponse(res: unknown): RewardHistoryItem[] {
  const raw =
    res && typeof res === 'object' && !Array.isArray(res)
      ? (res as Record<string, unknown>)
      : null;
  const inner =
    raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
      ? (raw.data as Record<string, unknown>)
      : null;
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
  return rows.map((r) => normalizeRewardHistoryRow(r as Record<string, unknown>));
}

/** 与列表/导出共用的查询条件（不含分页） */
function buildRewardHistoryBaseParams(): RewardHistoryParams {
  const range = dateRange.value?.length === 2 ? dateRange.value : getTodayRange();
  const today = getTodayRange();
  const toYmd = (ts: number) => {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: REPORT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  };
  const startDate = toYmd(range[0]) || toYmd(today[0]);
  const endDate = toYmd(range[1]) || toYmd(today[1]);
  const orderNo = filters.value.orderNo?.trim() || undefined;
  const userIdOrAccount = filters.value.userIdOrAccount?.trim() || undefined;
  const isActivitySource = filters.value.benefitSource === '活动';
  const selectedActivityId = filters.value.activityId;

  return {
    startDate,
    endDate,
    orderNo,
    userId: userIdOrAccount,
    memberAccount: userIdOrAccount,
    benefitSource: filters.value.benefitSource || undefined,
    activityId:
      isActivitySource && selectedActivityId != null ? selectedActivityId : undefined,
    collectionMethod: filters.value.collectionMethod || undefined,
    rewardType: filters.value.rewardType || undefined,
  };
}

/** 导出时若当前页不足总条数，按页拉全量 */
async function fetchAllRewardHistoryRowsForExport(): Promise<RewardHistoryItem[]> {
  const baseParams = buildRewardHistoryBaseParams();
  const merged: RewardHistoryItem[] = [];
  let page = 1;
  while (page <= MAX_FETCH_PAGES) {
    const res = await getRewardHistory({
      ...baseParams,
      page,
      pageSize: FETCH_CHUNK_SIZE,
    });
    const batch = extractNormalizedRowsFromResponse(res);
    merged.push(...batch);
    if (batch.length < FETCH_CHUNK_SIZE) break;
    page += 1;
  }
  return merged;
}

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const baseParams = buildRewardHistoryBaseParams();

    const res = await getRewardHistory({
      ...baseParams,
      page: paginationPage.value,
      pageSize: paginationPageSize.value,
    });
    const normalizedRows = extractNormalizedRowsFromResponse(res);
    const raw =
      res && typeof res === 'object' && !Array.isArray(res)
        ? (res as Record<string, unknown>)
        : null;
    const inner =
      raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
        ? (raw.data as Record<string, unknown>)
        : null;
    const pagination = (raw?.pagination ?? inner?.pagination) as
      | Record<string, unknown>
      | undefined;
    const total =
      typeof raw?.total === 'number'
        ? raw.total
        : typeof inner?.total === 'number'
          ? inner.total
          : typeof pagination?.total === 'number'
            ? (pagination.total as number)
            : normalizedRows.length;
    listData.value = normalizedRows;
    totalCount.value = total;
    const apiTotal =
      (typeof (raw?.totalGrantedReward ?? raw?.total_granted_reward) === 'number'
        ? (raw?.totalGrantedReward ?? raw?.total_granted_reward) as number
        : undefined) ??
      (typeof (inner?.totalGrantedReward ?? inner?.total_granted_reward) === 'number'
        ? (inner?.totalGrantedReward ?? inner?.total_granted_reward) as number
        : undefined);
    totalGrantedReward.value =
      apiTotal ??
      normalizedRows.reduce((sum, r) => sum + (Number(r.grantedReward) || 0), 0);
  } catch (e: any) {
    error.value = e?.message || '加载失败';
    listData.value = [];
    totalCount.value = 0;
    totalGrantedReward.value = 0;
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
    benefitSource: null,
    activityId: null,
    collectionMethod: null,
    rewardType: null,
  };
  paginationPage.value = 1;
  fetchData();
}

async function handleExport() {
  exporting.value = true;
  try {
    let rows = listData.value ?? [];
    if (totalCount.value > rows.length) {
      rows = await fetchAllRewardHistoryRowsForExport();
    }
    if (!rows.length) {
      message.warning('没有数据可导出');
      return;
    }
    await exportGridData(columns, rows, {
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
/* 合计栏样式与线上充值页一致：小字号、无背景、右对齐 */
.totals-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-start;
}
.totals-summary .total-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.totals-summary .total-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}
.totals-summary .total-value {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}
.totals-summary .total-value--reward {
  color: #18a058;
}

/* 详情弹窗两列布局（参考 RechargeManagement） */
.reward-detail .detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.reward-detail .detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}
.reward-detail .detail-row:last-child {
  border-bottom: none;
}
.reward-detail .detail-label {
  color: #666;
  font-size: 14px;
  flex-shrink: 0;
  margin-right: 16px;
}
.reward-detail .detail-value {
  font-size: 14px;
  text-align: right;
  word-break: break-all;
}
.reward-detail .detail-value--reward {
  font-weight: 600;
  color: #18a058;
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