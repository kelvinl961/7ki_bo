<template>
  <div class="lucky-wheel-page">
    <Page title="幸运转盘" description="管理转盘配置、幸运值记录与中奖数据">
      <n-card>
        <n-tabs v-model:value="activeTab" type="line" class="mb-4" @update:value="onTabChange">
          <n-tab-pane name="wheels" tab="转盘列表" />
          <n-tab-pane name="lucky-value-records" tab="幸运值记录" />
          <n-tab-pane name="remaining-lucky-value" tab="剩余幸运值" />
          <n-tab-pane name="winning-records" tab="中奖记录" />
          <n-tab-pane name="physical-orders" tab="实物订单" />
        </n-tabs>

        <!-- 顶部操作栏 -->
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <n-space align="center" wrap>
            <template v-if="activeTab === 'wheels'">
              <span class="text-sm text-gray-600">转盘开关</span>
              <n-switch
                :value="lwEnabled"
                :loading="switchLoading"
                @update:value="onGlobalSwitch"
              />
              <n-text v-if="lwEnabledAt" depth="3" class="text-xs">
                开启时间：{{ formatTs(lwEnabledAt) }}
              </n-text>
            </template>
          </n-space>
          <n-space>
            <n-button
              v-if="activeTab === 'wheels'"
              type="primary"
              @click="showPublicConfig = true"
            >
              + 转盘公共配置
            </n-button>
            <n-button
              v-if="showAddLuckyValueBtn"
              type="primary"
              @click="showAddLuckyValue = true"
            >
              新增幸运值
            </n-button>
            <n-button
              v-if="showExportBtn"
              secondary
              :loading="exportLoading"
              @click="handleExport"
            >
              导出报表
            </n-button>
          </n-space>
        </div>

        <!-- 筛选区 -->
        <n-form class="mb-4" :show-feedback="false" label-placement="left" label-width="auto">
          <n-grid :cols="24" :x-gap="12" :y-gap="8">
            <!-- 转盘列表 -->
            <template v-if="activeTab === 'wheels'">
              <n-gi :span="6">
                <n-form-item label="转盘类型">
                  <n-select
                    v-model:value="filters.wheelType"
                    clearable
                    placeholder="全部转盘类型"
                    :options="wheelTypeFilterOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item label="状态">
                  <n-select
                    v-model:value="filters.enabled"
                    clearable
                    placeholder="全部状态"
                    :options="enabledFilterOptions"
                  />
                </n-form-item>
              </n-gi>
            </template>

            <!-- 幸运值记录 / 中奖记录 / 实物订单：时间 -->
            <template
              v-if="
                activeTab === 'lucky-value-records' ||
                activeTab === 'winning-records' ||
                activeTab === 'physical-orders'
              "
            >
              <n-gi :span="6" v-if="activeTab === 'physical-orders'">
                <n-form-item label="时间">
                  <n-select
                    v-model:value="filters.timeField"
                    :options="physicalOrderTimeFieldOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="activeTab === 'physical-orders' ? 10 : 12">
                <n-form-item :label="activeTab === 'physical-orders' ? ' ' : '时间'">
                  <n-space align="center" wrap>
                    <QuickDateSelect
                      v-model="dateQuickSelect"
                      @update:model-value="handleQuickDateSelect"
                    />
                    <TimezoneDatePicker
                      :key="`lw-dr-${dateRange?.[0] ?? 'x'}-${dateRange?.[1] ?? 'x'}`"
                      v-model="dateRange"
                      width="360px"
                      @update:model-value="handleDateRangeChange"
                    />
                  </n-space>
                </n-form-item>
              </n-gi>
            </template>

            <!-- 会员搜索 -->
            <n-gi
              v-if="activeTab !== 'wheels'"
              :span="8"
            >
              <n-form-item label="会员">
                <n-input-group>
                  <n-select
                    v-model:value="filters.memberSearchType"
                    :options="memberSearchOptions"
                    style="width: 120px"
                  />
                  <n-input
                    v-model:value="filters.memberKeyword"
                    clearable
                    :placeholder="memberKeywordPlaceholder"
                  />
                </n-input-group>
              </n-form-item>
            </n-gi>

            <!-- 幸运值记录：变动类型 -->
            <n-gi v-if="activeTab === 'lucky-value-records'" :span="6">
              <n-form-item label="变动类型">
                <n-select
                  v-model:value="filters.changeType"
                  clearable
                  placeholder="变动类型"
                  :options="luckyValueChangeTypeOptions"
                />
              </n-form-item>
            </n-gi>

            <!-- 剩余幸运值：指标范围 -->
            <template v-if="activeTab === 'remaining-lucky-value'">
              <n-gi :span="6">
                <n-form-item label="幸运值">
                  <n-select
                    v-model:value="filters.remainingMetric"
                    :options="remainingMetricOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="8">
                <n-form-item label="范围">
                  <n-space align="center">
                    <n-input-number
                      v-model:value="filters.metricMin"
                      :show-button="false"
                      placeholder="最小值"
                      clearable
                      style="width: 120px"
                    />
                    <span class="text-gray-400">—</span>
                    <n-input-number
                      v-model:value="filters.metricMax"
                      :show-button="false"
                      placeholder="最大值"
                      clearable
                      style="width: 120px"
                    />
                  </n-space>
                </n-form-item>
              </n-gi>
            </template>

            <!-- 中奖记录：奖励类型 + 转盘 -->
            <template v-if="activeTab === 'winning-records'">
              <n-gi :span="8">
                <n-form-item label="奖励类型">
                  <n-select
                    v-model:value="filters.rewardTypes"
                    multiple
                    clearable
                    placeholder="奖励类型"
                    :options="winningRewardTypeOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item label="转盘">
                  <n-select
                    v-model:value="filters.wheelType"
                    clearable
                    placeholder="全部类型"
                    :options="wheelTypeFilterOptions"
                  />
                </n-form-item>
              </n-gi>
            </template>

            <!-- 实物订单：状态 + 操作人 -->
            <template v-if="activeTab === 'physical-orders'">
              <n-gi :span="6">
                <n-form-item label="订单状态">
                  <n-select
                    v-model:value="filters.orderStatus"
                    clearable
                    placeholder="全部状态"
                    :options="physicalOrderStatusOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="8">
                <n-form-item label="人员">
                  <n-input-group>
                    <n-select
                      v-model:value="filters.operatorSearchType"
                      :options="operatorSearchOptions"
                      style="width: 110px"
                    />
                    <n-input
                      v-model:value="filters.operatorKeyword"
                      clearable
                      :placeholder="operatorKeywordPlaceholder"
                    />
                  </n-input-group>
                </n-form-item>
              </n-gi>
            </template>

            <n-gi :span="6">
              <n-form-item :show-label="false">
                <n-space>
                  <n-button type="primary" @click="reloadActive">搜索</n-button>
                  <n-button @click="resetFilters">重置</n-button>
                </n-space>
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-form>

        <n-data-table
          :key="activeTab"
          :columns="activeColumns"
          :data="tableRows"
          :loading="loading"
          :scroll-x="tableScrollX"
          :row-key="rowKey"
          v-model:checked-row-keys="checkedRowKeys"
          striped
          size="small"
          remote
          :pagination="activeTab === 'wheels' ? false : pagination"
          @update:page="onPage"
          @update:page-size="onPageSize"
          @update:sorter="onSorterChange"
        />

        <div
          v-if="showBulkActions"
          class="mt-3 flex flex-wrap items-center gap-3"
        >
          <n-checkbox
            :checked="isAllCurrentPageSelected"
            :indeterminate="isCurrentPageIndeterminate"
            @update:checked="toggleSelectCurrentPage"
          >
            全选当前页
          </n-checkbox>
          <n-checkbox v-model:checked="selectAllResults">全选所有结果</n-checkbox>
          <n-select
            v-model:value="bulkAction"
            :options="bulkActionOptions"
            placeholder="批量操作"
            clearable
            style="width: 140px"
            @update:value="handleBulkAction"
          />
          <span class="text-sm text-gray-500">
            已选择 {{ selectedCount }} 条数据 共 {{ pagination.itemCount }} 条
          </span>
        </div>
      </n-card>

      <LuckyWheelPublicConfigModal
        v-model:show="showPublicConfig"
        :initial-snapshot="publicConfigSnapshot"
        @saved="onPublicConfigSaved"
      />

      <LuckyWheelEditModal
        v-model:show="showEditModal"
        :wheel="editingWheel"
        :read-only="editReadOnly"
        @saved="onWheelSaved"
      />

      <LuckyWheelAddLuckyValueModal
        v-model:show="showAddLuckyValue"
        @saved="reloadActive"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import {
  NCard,
  NTabs,
  NTabPane,
  NSpace,
  NButton,
  NText,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputNumber,
  NSelect,
  NGrid,
  NGi,
  NDataTable,
  NSwitch,
  NCheckbox,
  useMessage,
  type DataTableColumns,
  type DataTableSortState,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import QuickDateSelect from '#/components/common/QuickDateSelect.vue';
import TimezoneDatePicker from '#/components/common/TimezoneDatePicker.vue';
import {
  applyDefaultDayQuickRange,
  buildQuickDateRange,
  type QuickDateValue,
} from '#/utils/quickDateRange';
import LuckyWheelPublicConfigModal from './components/LuckyWheelPublicConfigModal.vue';
import LuckyWheelEditModal from './components/LuckyWheelEditModal.vue';
import LuckyWheelAddLuckyValueModal from './components/LuckyWheelAddLuckyValueModal.vue';
import {
  BULK_ACTION_OPTIONS,
  LUCKY_VALUE_CHANGE_TYPE_OPTIONS,
  MEMBER_SEARCH_OPTIONS,
  OPERATOR_SEARCH_OPTIONS,
  PHYSICAL_ORDER_STATUS_OPTIONS,
  PHYSICAL_ORDER_TIME_FIELD_OPTIONS,
  REMAINING_VALUE_METRIC_OPTIONS,
  WHEEL_TYPE_FILTER_OPTIONS,
  WINNING_REWARD_TYPE_OPTIONS,
} from './components/luckyWheelUiConstants';
import {
  type LuckyWheelItem,
  type LuckyWheelPublicConfigSnapshot,
  normalizeLuckyWheelItem,
  normalizeLuckyWheelPublicConfig,
  wheelTypeLabel,
} from './components/luckyWheelTypes';
import {
  exportLuckyWheelLuckyValueRecordsApi,
  exportLuckyWheelPhysicalOrdersApi,
  exportLuckyWheelRemainingLuckyValueApi,
  exportLuckyWheelWinningRecordsApi,
  getLuckyWheelAdminConfigApi,
  listLuckyWheelLuckyValueRecordsApi,
  listLuckyWheelPhysicalOrdersApi,
  listLuckyWheelRemainingLuckyValueApi,
  listLuckyWheelWinningRecordsApi,
  putLuckyWheelAdminSwitchApi,
  putLuckyWheelItemSwitchApi,
} from '#/api/core/lucky-wheel-admin';

type TabName =
  | 'wheels'
  | 'lucky-value-records'
  | 'remaining-lucky-value'
  | 'winning-records'
  | 'physical-orders';

const message = useMessage();
const activeTab = ref<TabName>('wheels');

const lwEnabled = ref(false);
const lwEnabledAt = ref<string | null>(null);
const switchLoading = ref(false);
const exportLoading = ref(false);
const showPublicConfig = ref(false);
const showEditModal = ref(false);
const showAddLuckyValue = ref(false);
const editReadOnly = ref(false);
const editingWheel = ref<LuckyWheelItem | null>(null);
const publicConfigSnapshot = ref<LuckyWheelPublicConfigSnapshot | null>(null);
const wheels = ref<LuckyWheelItem[]>([]);

const dateRange = ref<[number, number] | null>(null);
const dateQuickSelect = ref<QuickDateValue | null>(null);
const filters = reactive({
  wheelType: null as string | null,
  enabled: null as boolean | null,
  memberSearchType: 'account' as string,
  memberKeyword: '',
  changeType: null as string | null,
  remainingMetric: 'remaining' as string,
  metricMin: null as number | null,
  metricMax: null as number | null,
  rewardTypes: [] as string[],
  orderStatus: null as string | null,
  timeField: 'wonAt' as string,
  operatorSearchType: 'operator' as string,
  operatorKeyword: '',
});

const sortState = reactive({
  sortBy: '' as string,
  sortOrder: '' as '' | 'asc' | 'desc',
});

const memberSearchOptions = [...MEMBER_SEARCH_OPTIONS];
const operatorSearchOptions = [...OPERATOR_SEARCH_OPTIONS];
const luckyValueChangeTypeOptions = LUCKY_VALUE_CHANGE_TYPE_OPTIONS;
const remainingMetricOptions = [...REMAINING_VALUE_METRIC_OPTIONS];
const winningRewardTypeOptions = WINNING_REWARD_TYPE_OPTIONS;
const wheelTypeFilterOptions = WHEEL_TYPE_FILTER_OPTIONS;
const physicalOrderStatusOptions = PHYSICAL_ORDER_STATUS_OPTIONS;
const physicalOrderTimeFieldOptions = PHYSICAL_ORDER_TIME_FIELD_OPTIONS;
const bulkActionOptions = BULK_ACTION_OPTIONS;

const enabledFilterOptions = [
  { label: '全部状态', value: null },
  { label: '开启', value: true },
  { label: '关闭', value: false },
];

const showAddLuckyValueBtn = computed(
  () =>
    activeTab.value === 'lucky-value-records' ||
    activeTab.value === 'remaining-lucky-value',
);
const showExportBtn = computed(() => activeTab.value !== 'wheels');
const showBulkActions = computed(
  () =>
    activeTab.value === 'remaining-lucky-value' ||
    activeTab.value === 'physical-orders',
);
const tableScrollX = computed(() => {
  if (activeTab.value === 'wheels') return 1600;
  if (activeTab.value === 'physical-orders') return 2400;
  if (activeTab.value === 'lucky-value-records') return 1800;
  if (activeTab.value === 'remaining-lucky-value') return 1400;
  return 1300;
});

const loading = ref(false);
const tableRows = ref<any[]>([]);
const checkedRowKeys = ref<Array<string | number>>([]);
const selectAllResults = ref(false);
const bulkAction = ref<string | null>(null);

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => `共 ${info.itemCount} 条`,
});

const filteredWheels = computed(() => {
  let list = [...wheels.value];
  if (filters.wheelType) list = list.filter((w) => w.wheelType === filters.wheelType);
  if (filters.enabled !== null && filters.enabled !== undefined) {
    list = list.filter((w) => w.enabled === filters.enabled);
  }
  return list;
});

const currentPageRowKeys = computed(() =>
  tableRows.value.map((row) => rowKey(row)),
);

const isAllCurrentPageSelected = computed(
  () =>
    currentPageRowKeys.value.length > 0 &&
    currentPageRowKeys.value.every((k) => checkedRowKeys.value.includes(k)),
);

const isCurrentPageIndeterminate = computed(
  () =>
    checkedRowKeys.value.length > 0 &&
    !isAllCurrentPageSelected.value &&
    currentPageRowKeys.value.some((k) => checkedRowKeys.value.includes(k)),
);

const selectedCount = computed(() =>
  selectAllResults.value ? pagination.itemCount : checkedRowKeys.value.length,
);

const memberKeywordPlaceholder = computed(() =>
  filters.memberSearchType === 'memberId' ? '请输入会员ID' : '请输入会员账号',
);

const operatorKeywordPlaceholder = computed(() =>
  filters.operatorSearchType === 'recipient' ? '请输入收件人' : '请输入操作人',
);

function rowKey(row: any) {
  return row.id ?? row.orderNo ?? row.memberId ?? `${row.account}-${row.createdAt}`;
}

function displayValue(v: unknown) {
  if (v === null || v === undefined || v === '') return '—';
  return v;
}

function formatTs(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString('zh-CN');
}

function renderPrizeIcon(url: string | null | undefined) {
  if (!url) return '—';
  return h('img', {
    src: url,
    alt: 'icon',
    style: { width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' },
  });
}

function sortable(key: string) {
  return { sorter: true, key };
}

function handleQuickDateSelect(value: QuickDateValue | null) {
  if (!value) return;
  dateQuickSelect.value = value;
  dateRange.value = buildQuickDateRange(value);
}

function handleDateRangeChange(_value: [number, number] | null) {
  dateQuickSelect.value = null;
}

function applyDefaultDayFilter() {
  const { quickSelect, range } = applyDefaultDayQuickRange();
  dateQuickSelect.value = quickSelect;
  dateRange.value = range;
}

function isTimeFilteredTab(tab: TabName) {
  return (
    tab === 'lucky-value-records' ||
    tab === 'winning-records' ||
    tab === 'physical-orders'
  );
}

function rangeParams() {
  if (!dateRange.value) return {};
  const [a, b] = dateRange.value;
  return { from: new Date(a).toISOString(), to: new Date(b).toISOString() };
}

function memberSearchParams() {
  if (!filters.memberKeyword.trim()) return {};
  return {
    memberSearchType: filters.memberSearchType,
    memberKeyword: filters.memberKeyword.trim(),
  };
}

function sortParams() {
  if (!sortState.sortBy || !sortState.sortOrder) return {};
  return { sortBy: sortState.sortBy, sortOrder: sortState.sortOrder };
}

function toFiniteNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function applyServerPagination(meta: any, currentListLength: number) {
  const current =
    toFiniteNumber(meta?.current) ??
    toFiniteNumber(meta?.page) ??
    toFiniteNumber(meta?.pageNum);
  if (current != null && current >= 1) pagination.page = Math.floor(current);

  const size =
    toFiniteNumber(meta?.pageSize) ??
    toFiniteNumber(meta?.size) ??
    toFiniteNumber(meta?.limit);
  if (size != null && size >= 1) pagination.pageSize = Math.floor(size);

  const total =
    toFiniteNumber(meta?.total) ??
    toFiniteNumber(meta?.totalCount) ??
    toFiniteNumber(meta?.itemCount);
  if (total != null && total >= 0) {
    pagination.itemCount = Math.floor(total);
    return;
  }
  if (pagination.page <= 1) pagination.itemCount = currentListLength;
}

function toggleSelectCurrentPage(checked: boolean) {
  if (checked) {
    const merged = new Set([...checkedRowKeys.value, ...currentPageRowKeys.value]);
    checkedRowKeys.value = [...merged];
  } else {
    checkedRowKeys.value = checkedRowKeys.value.filter(
      (k) => !currentPageRowKeys.value.includes(k),
    );
  }
}

function handleBulkAction(action: string | null) {
  if (!action) return;
  if (action === 'export') handleExport();
  bulkAction.value = null;
}

function onTabChange(tab: TabName) {
  checkedRowKeys.value = [];
  selectAllResults.value = false;
  sortState.sortBy = '';
  sortState.sortOrder = '';
  pagination.page = 1;
  if (isTimeFilteredTab(tab) && !dateRange.value) {
    applyDefaultDayFilter();
  }
}

function onSorterChange(sorter: DataTableSortState | null) {
  sortState.sortBy = (sorter?.columnKey as string) ?? '';
  sortState.sortOrder = sorter?.order === 'ascend' ? 'asc' : sorter?.order === 'descend' ? 'desc' : '';
  reloadActive();
}

async function loadConfig() {
  try {
    const cfg = await getLuckyWheelAdminConfigApi();
    lwEnabled.value = cfg.enabled;
    lwEnabledAt.value = cfg.enabledAt;
    publicConfigSnapshot.value = normalizeLuckyWheelPublicConfig(
      cfg.publicConfig as Record<string, unknown>,
    );
    wheels.value = (cfg.wheels ?? [])
      .map((w) => normalizeLuckyWheelItem(w))
      .filter((w): w is LuckyWheelItem => w != null);
  } catch {
    publicConfigSnapshot.value = normalizeLuckyWheelPublicConfig(null);
    wheels.value = [];
  }
}

async function onGlobalSwitch(v: boolean) {
  switchLoading.value = true;
  try {
    const r = await putLuckyWheelAdminSwitchApi(v);
    lwEnabled.value = r.enabled;
    lwEnabledAt.value = r.enabledAt;
    message.success(v ? '已开启幸运转盘' : '已关闭幸运转盘');
  } catch {
    message.error('开关更新失败');
  } finally {
    switchLoading.value = false;
  }
}

async function onWheelSwitch(row: LuckyWheelItem, enabled: boolean) {
  try {
    const updated = await putLuckyWheelItemSwitchApi(row.id, enabled);
    const idx = wheels.value.findIndex((w) => w.id === row.id);
    if (idx >= 0) wheels.value[idx] = { ...wheels.value[idx], ...updated };
    message.success(enabled ? '转盘已开启' : '转盘已关闭');
  } catch {
    message.error('转盘开关更新失败');
    await reloadActive();
  }
}

function openEdit(row: LuckyWheelItem, readOnly = false) {
  editingWheel.value = row;
  editReadOnly.value = readOnly;
  showEditModal.value = true;
}

const wheelColumns = computed<DataTableColumns<LuckyWheelItem>>(() => [
  { title: '币种', key: 'currency', width: 70, render: (r) => displayValue(r.currency) },
  { title: '转盘名称', key: 'name', width: 120, render: (r) => displayValue(r.name) },
  {
    title: '转盘类型',
    key: 'wheelType',
    width: 120,
    render: (row) => wheelTypeLabel(row.wheelType),
  },
  { title: '奖项数量', key: 'prizeCount', width: 90, render: (r) => displayValue(r.prizeCount) },
  {
    title: '消耗幸运值',
    key: 'luckyValueCost',
    width: 100,
    render: (r) => displayValue(r.luckyValueCost),
  },
  {
    title: '是否公开概率和成本',
    key: 'showProbabilityAndCost',
    width: 140,
    render: (row) => (row.showProbabilityAndCost === 'show' ? '展示' : '不展示'),
  },
  { title: '真实成本', key: 'realCost', width: 90, render: (r) => displayValue(r.realCost) },
  { title: '展示成本', key: 'displayCost', width: 90, render: (r) => displayValue(r.displayCost) },
  {
    title: '转盘开关',
    key: 'enabled',
    width: 100,
    render: (row) =>
      h(NSwitch, {
        value: row.enabled,
        onUpdateValue: (v: boolean) => onWheelSwitch(row, v),
      }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 8 }, () => [
        h(NButton, { text: true, type: 'primary', onClick: () => openEdit(row, false) }, { default: () => '修改' }),
        h(NButton, { text: true, type: 'info', onClick: () => openEdit(row, true) }, { default: () => '详情' }),
        h(NButton, {
          text: true,
          type: 'default',
          onClick: () => {
            activeTab.value = 'winning-records';
            filters.wheelType = row.wheelType;
            onTabChange();
            reloadActive();
          },
        }, { default: () => '记录' }),
      ]),
  },
  { title: '操作人', key: 'updatedBy', width: 90, render: (r) => displayValue(r.updatedBy) },
  { title: '操作时间', key: 'updatedAt', width: 160, render: (r) => formatTs(r.updatedAt) },
]);

const luckyValueRecordColumns = computed<DataTableColumns<any>>(() => [
  { title: '会员币种', key: 'currency', width: 80, render: (r) => displayValue(r.currency) },
  { title: '会员ID', key: 'memberId', width: 90, render: (r) => displayValue(r.memberId) },
  { title: '会员账号', key: 'account', width: 120, render: (r) => displayValue(r.account) },
  { title: '优惠来源', key: 'promotionSource', width: 100, render: (r) => displayValue(r.promotionSource) },
  { title: '优惠类型', key: 'promotionType', width: 100, render: (r) => displayValue(r.promotionType) },
  { title: '变动类型', key: 'changeType', width: 90, render: (r) => displayValue(r.changeType) },
  { title: '变动前', key: 'balanceBefore', width: 90, render: (r) => displayValue(r.balanceBefore) },
  { title: '变动幸运值', key: 'changeAmount', width: 110, ...sortable('changeAmount'), render: (r) => displayValue(r.changeAmount) },
  { title: '变动后', key: 'balanceAfter', width: 90, render: (r) => displayValue(r.balanceAfter) },
  { title: '幸运值周期', key: 'luckyValuePeriod', width: 100, render: (r) => displayValue(r.luckyValuePeriod) },
  { title: '过期时间', key: 'expireAt', width: 150, render: (r) => formatTs(r.expireAt) },
  { title: '前台备注', key: 'frontendRemark', width: 120, render: (r) => displayValue(r.frontendRemark) },
  { title: '后台备注', key: 'backendRemark', width: 120, render: (r) => displayValue(r.backendRemark) },
  { title: '变动时间', key: 'createdAt', width: 150, render: (r) => formatTs(r.createdAt) },
]);

const remainingColumns = computed<DataTableColumns<any>>(() => [
  { type: 'selection' },
  { title: '会员币种', key: 'currency', width: 80, render: (r) => displayValue(r.currency) },
  { title: '会员ID', key: 'memberId', width: 90, render: (r) => displayValue(r.memberId) },
  { title: '会员账号', key: 'account', width: 120, render: (r) => displayValue(r.account) },
  { title: '更新时间', key: 'updatedAt', width: 150, render: (r) => formatTs(r.updatedAt) },
  { title: '获得幸运值', key: 'earnedLuckyValue', width: 110, ...sortable('earnedLuckyValue'), render: (r) => displayValue(r.earnedLuckyValue) },
  { title: '消耗幸运值', key: 'consumedLuckyValue', width: 110, ...sortable('consumedLuckyValue'), render: (r) => displayValue(r.consumedLuckyValue) },
  { title: '过期幸运值', key: 'expiredLuckyValue', width: 110, ...sortable('expiredLuckyValue'), render: (r) => displayValue(r.expiredLuckyValue) },
  { title: '扣除幸运值', key: 'deductedLuckyValue', width: 110, ...sortable('deductedLuckyValue'), render: (r) => displayValue(r.deductedLuckyValue) },
  { title: '剩余幸运值', key: 'remainingLuckyValue', width: 110, ...sortable('remainingLuckyValue'), render: (r) => displayValue(r.remainingLuckyValue) },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render: () => h(NButton, { text: true, type: 'primary', disabled: true }, { default: () => '详情' }),
  },
  { title: '操作人', key: 'operator', width: 90, render: (r) => displayValue(r.operator) },
]);

const winningColumns = computed<DataTableColumns<any>>(() => [
  { title: '会员币种', key: 'currency', width: 80, render: (r) => displayValue(r.currency) },
  { title: '会员ID', key: 'memberId', width: 90, render: (r) => displayValue(r.memberId) },
  { title: '会员账号', key: 'account', width: 120, render: (r) => displayValue(r.account) },
  { title: '转盘名称', key: 'wheelName', width: 110, render: (r) => displayValue(r.wheelName) },
  { title: '转盘类型', key: 'wheelType', width: 100, ...sortable('wheelType'), render: (r) => displayValue(r.wheelTypeLabel ?? r.wheelType) },
  { title: '消耗幸运值', key: 'luckyValueCost', width: 100, ...sortable('luckyValueCost'), render: (r) => displayValue(r.luckyValueCost) },
  { title: '奖励类型', key: 'rewardType', width: 100, render: (r) => displayValue(r.rewardType) },
  { title: '奖励Icon', key: 'prizeIcon', width: 80, render: (r) => renderPrizeIcon(r.prizeIcon) },
  { title: '奖励', key: 'reward', width: 90, ...sortable('reward'), render: (r) => displayValue(r.reward) },
  { title: '中奖时间', key: 'wonAt', width: 150, render: (r) => formatTs(r.wonAt) },
]);

const physicalOrderColumns = computed<DataTableColumns<any>>(() => [
  { type: 'selection' },
  { title: '订单编号', key: 'orderNo', width: 140, render: (r) => displayValue(r.orderNo) },
  { title: '会员币种', key: 'currency', width: 80, render: (r) => displayValue(r.currency) },
  { title: '会员ID', key: 'memberId', width: 90, render: (r) => displayValue(r.memberId) },
  { title: '会员账号', key: 'account', width: 120, render: (r) => displayValue(r.account) },
  { title: '奖品icon', key: 'prizeIcon', width: 80, render: (r) => renderPrizeIcon(r.prizeIcon) },
  { title: '奖品', key: 'prizeName', width: 110, render: (r) => displayValue(r.prizeName) },
  { title: '中奖时间', key: 'wonAt', width: 150, render: (r) => formatTs(r.wonAt) },
  { title: '收货姓名', key: 'receiverName', width: 100, render: (r) => displayValue(r.receiverName) },
  { title: '收货地址', key: 'receiverAddress', width: 160, render: (r) => displayValue(r.receiverAddress) },
  { title: '联系电话', key: 'receiverPhone', width: 120, render: (r) => displayValue(r.receiverPhone) },
  { title: '订单状态', key: 'status', width: 90, ...sortable('status'), render: (r) => displayValue(r.statusLabel ?? r.status) },
  { title: '快递单号', key: 'trackingNo', width: 130, render: (r) => displayValue(r.trackingNo) },
  { title: '快递公司', key: 'courierCompany', width: 100, render: (r) => displayValue(r.courierCompany) },
  { title: '发货时间', key: 'shippedAt', width: 150, render: (r) => formatTs(r.shippedAt) },
  { title: '前台备注', key: 'frontendRemark', width: 120, render: (r) => displayValue(r.frontendRemark) },
  { title: '后台备注', key: 'backendRemark', width: 120, render: (r) => displayValue(r.backendRemark) },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render: () => h(NButton, { text: true, type: 'primary', disabled: true }, { default: () => '详情' }),
  },
  { title: '操作人', key: 'operator', width: 90, render: (r) => displayValue(r.operator) },
  { title: '操作时间', key: 'operatedAt', width: 150, render: (r) => formatTs(r.operatedAt) },
]);

const activeColumns = computed(() => {
  switch (activeTab.value) {
    case 'wheels':
      return wheelColumns.value;
    case 'lucky-value-records':
      return luckyValueRecordColumns.value;
    case 'remaining-lucky-value':
      return remainingColumns.value;
    case 'winning-records':
      return winningColumns.value;
    case 'physical-orders':
      return physicalOrderColumns.value;
    default:
      return [];
  }
});

function resetFilters() {
  filters.wheelType = null;
  filters.enabled = null;
  filters.memberSearchType = 'account';
  filters.memberKeyword = '';
  filters.changeType = null;
  filters.remainingMetric = 'remaining';
  filters.metricMin = null;
  filters.metricMax = null;
  filters.rewardTypes = [];
  filters.orderStatus = null;
  filters.timeField = 'wonAt';
  filters.operatorSearchType = 'operator';
  filters.operatorKeyword = '';
  dateRange.value = null;
  dateQuickSelect.value = null;
  sortState.sortBy = '';
  sortState.sortOrder = '';
  pagination.page = 1;
  checkedRowKeys.value = [];
  selectAllResults.value = false;
  reloadActive();
}

function onPage(page: number) {
  pagination.page = page;
  reloadActive();
}

function onPageSize(size: number) {
  pagination.pageSize = size;
  pagination.page = 1;
  reloadActive();
}

function buildListParams() {
  const base = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...memberSearchParams(),
    ...sortParams(),
  };
  if (activeTab.value === 'lucky-value-records') {
    return {
      ...base,
      ...rangeParams(),
      changeType: filters.changeType || undefined,
    };
  }
  if (activeTab.value === 'remaining-lucky-value') {
    return {
      ...base,
      metric: filters.remainingMetric,
      metricMin: filters.metricMin ?? undefined,
      metricMax: filters.metricMax ?? undefined,
    };
  }
  if (activeTab.value === 'winning-records') {
    return {
      ...base,
      ...rangeParams(),
      rewardTypes: filters.rewardTypes.length ? filters.rewardTypes : undefined,
      wheelType: filters.wheelType || undefined,
    };
  }
  if (activeTab.value === 'physical-orders') {
    return {
      ...base,
      ...rangeParams(),
      timeField: filters.timeField,
      status: filters.orderStatus || undefined,
      operatorSearchType: filters.operatorKeyword.trim()
        ? filters.operatorSearchType
        : undefined,
      operatorKeyword: filters.operatorKeyword.trim() || undefined,
    };
  }
  return base;
}

async function reloadActive() {
  loading.value = true;
  try {
    if (activeTab.value === 'wheels') {
      tableRows.value = filteredWheels.value;
      return;
    }
    const params = buildListParams();
    let res: { list: any[]; pagination: any };
    if (activeTab.value === 'lucky-value-records') {
      res = await listLuckyWheelLuckyValueRecordsApi(params as any);
    } else if (activeTab.value === 'remaining-lucky-value') {
      res = await listLuckyWheelRemainingLuckyValueApi(params as any);
    } else if (activeTab.value === 'winning-records') {
      res = await listLuckyWheelWinningRecordsApi(params as any);
    } else {
      res = await listLuckyWheelPhysicalOrdersApi(params as any);
    }
    tableRows.value = res.list ?? [];
    applyServerPagination(res.pagination, tableRows.value.length);
  } catch {
    tableRows.value = [];
    pagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
}

async function handleExport() {
  exportLoading.value = true;
  try {
    const params = buildListParams();
    let blob: Blob;
    if (activeTab.value === 'lucky-value-records') {
      blob = await exportLuckyWheelLuckyValueRecordsApi(params);
    } else if (activeTab.value === 'remaining-lucky-value') {
      blob = await exportLuckyWheelRemainingLuckyValueApi(params);
    } else if (activeTab.value === 'winning-records') {
      blob = await exportLuckyWheelWinningRecordsApi(params);
    } else if (activeTab.value === 'physical-orders') {
      blob = await exportLuckyWheelPhysicalOrdersApi(params);
    } else {
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucky-wheel-${activeTab.value}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  } catch {
    message.error('导出失败，请确认 API 已接入');
  } finally {
    exportLoading.value = false;
  }
}

function onPublicConfigSaved(snapshot: LuckyWheelPublicConfigSnapshot) {
  publicConfigSnapshot.value = snapshot;
}

function onWheelSaved(updated: LuckyWheelItem) {
  const normalized = normalizeLuckyWheelItem(updated) ?? updated;
  const idx = wheels.value.findIndex((w) => w.id === normalized.id);
  if (idx >= 0) wheels.value[idx] = normalized;
  reloadActive();
}

watch(activeTab, () => {
  pagination.page = 1;
  reloadActive();
});

watch([() => filters.wheelType, () => filters.enabled], () => {
  if (activeTab.value === 'wheels') reloadActive();
});

onMounted(async () => {
  await loadConfig();
  reloadActive();
});
</script>

<style scoped>
.lucky-wheel-page {
  height: 100%;
}
</style>
