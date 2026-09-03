<template>
  <div class="lucky-wheel-page">
    <Page :title="$t('activity.rewardReport.k5e78')" :description="$t('activity.luckyWheel.k7ba1k5e78')">
      <n-card>
        <n-tabs v-model:value="activeTab" type="line" class="mb-4" @update:value="onTabChange">
          <n-tab-pane name="wheels" :tab="$t('activity.luckyWheel.k8f6c')" />
          <n-tab-pane name="lucky-value-records" :tab="$t('activity.luckyWheel.k5e78')" />
          <n-tab-pane name="remaining-lucky-value" :tab="$t('activity.luckyWheel.k5269')" />
          <n-tab-pane name="winning-records" :tab="$t('activity.luckyWheel.k4e2d')" />
          <n-tab-pane name="physical-orders" :tab="$t('activity.luckyWheel.k5b9e')" />
        </n-tabs>

        <!-- 顶部操作栏 -->
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <n-space align="center" wrap>
            <template v-if="activeTab === 'wheels'">
              <span class="text-sm text-gray-600">{{ $t('activity.luckyWheelEdit.k8f6c2') }}</span>
              <n-switch
                :value="lwEnabled"
                :loading="switchLoading"
                @update:value="onGlobalSwitch"
              />
              <n-text v-if="lwEnabledAt" depth="3" class="text-xs">
                {{ $t('activity.common.enabledAt') }}<TzDateTime :value="lwEnabledAt" fallback="" />
              </n-text>
            </template>
          </n-space>
          <n-space>
            <n-button
              v-if="activeTab === 'wheels'"
              type="primary"
              @click="openCreate"
            >{{ $t('activity.luckyWheelEdit.k6dfb') }}</n-button>
            <n-button
              v-if="activeTab === 'wheels'"
              type="primary"
              @click="showPublicConfig = true"
            >{{ $t('activity.luckyWheel.k8f6c3') }}</n-button>
            <n-button
              v-if="showAddLuckyValueBtn"
              type="primary"
              @click="openAddLuckyValue()"
            >{{ $t('activity.luckyWheelAddLuckyValue.k65b0') }}</n-button>
            <n-button
              v-if="showExportBtn"
              secondary
              :loading="exportLoading"
              @click="handleExport"
            >{{ $t('activity.luckyWheel.k5bfc') }}</n-button>
          </n-space>
        </div>

        <!-- 筛选区 -->
        <n-form class="mb-4" :show-feedback="false" label-placement="left" label-width="auto">
          <n-grid :cols="24" :x-gap="12" :y-gap="8">
            <!-- 转盘列表 -->
            <template v-if="activeTab === 'wheels'">
              <n-gi :span="6">
                <n-form-item :label="$t('activity.luckyWheelEdit.k8f6c')">
                  <n-select
                    v-model:value="filters.wheelType"
                    clearable
                    :placeholder="$t('activity.luckyWheel.k5168')"
                    :options="wheelTypeFilterOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item :label="$t('activity.activityList.k72b6')">
                  <n-select
                    v-model:value="filters.enabled"
                    clearable
                    :placeholder="$t('activity.luckyWheel.k51682')"
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
                <n-form-item :label="$t('activity.luckyWheel.k65f6')">
                  <n-select
                    v-model:value="filters.timeField"
                    :options="physicalOrderTimeFieldOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="activeTab === 'physical-orders' ? 10 : 12">
                <n-form-item :label="activeTab === 'physical-orders' ? ' ' : $t('activity.common.timeLabel')">
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
              <n-form-item :label="$t('activity.common.memberLabel')">
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
              <n-form-item :label="$t('activity.luckyWheel.k53d8')">
                <n-select
                  v-model:value="filters.changeType"
                  clearable
                  :placeholder="$t('activity.luckyWheel.k53d8')"
                  :options="luckyValueChangeTypeOptions"
                />
              </n-form-item>
            </n-gi>

            <!-- 剩余幸运值：指标范围 -->
            <template v-if="activeTab === 'remaining-lucky-value'">
              <n-gi :span="6">
                <n-form-item :label="$t('activity.rewardReport.k5e782')">
                  <n-select
                    v-model:value="filters.remainingMetric"
                    :options="remainingMetricOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="8">
                <n-form-item :label="$t('activity.luckyWheel.k8303')">
                  <n-space align="center">
                    <n-input-number
                      v-model:value="filters.metricMin"
                      :show-button="false"
                      :placeholder="$t('activity.luckyWheel.k6700')"
                      clearable
                      style="width: 120px"
                    />
                    <span class="text-gray-400">—</span>
                    <n-input-number
                      v-model:value="filters.metricMax"
                      :show-button="false"
                      :placeholder="$t('activity.luckyWheel.k67002')"
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
                <n-form-item :label="$t('activity.rewardReport.k5956')">
                  <n-select
                    v-model:value="filters.rewardTypes"
                    multiple
                    clearable
                    :placeholder="$t('activity.rewardReport.k5956')"
                    :options="winningRewardTypeOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="6">
                <n-form-item :label="$t('activity.luckyWheel.k8f6c2')">
                  <n-select
                    v-model:value="filters.wheelType"
                    clearable
                    :placeholder="$t('activity.luckyWheel.k51683')"
                    :options="wheelTypeFilterOptions"
                  />
                </n-form-item>
              </n-gi>
            </template>

            <!-- 实物订单：状态 + 操作人 -->
            <template v-if="activeTab === 'physical-orders'">
              <n-gi :span="6">
                <n-form-item :label="$t('activity.luckyWheel.k8ba22')">
                  <n-select
                    v-model:value="filters.orderStatus"
                    clearable
                    :placeholder="$t('activity.luckyWheel.k51682')"
                    :options="physicalOrderStatusOptions"
                  />
                </n-form-item>
              </n-gi>
              <n-gi :span="8">
                <n-form-item :label="$t('activity.luckyWheel.k4eba')">
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
                  <n-button type="primary" @click="reloadActive">{{ $t('activity.rewardReport.k641c') }}</n-button>
                  <n-button @click="resetFilters">{{ $t('activity.recordModal.k91cd') }}</n-button>
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
          >{{ $t('activity.luckyWheel.k51684') }}</n-checkbox>
          <n-checkbox v-model:checked="selectAllResults">{{ $t('activity.luckyWheel.k51685') }}</n-checkbox>
          <n-select
            v-model:value="bulkAction"
            :options="bulkActionOptions"
            :placeholder="$t('activity.common.batchOperation')"
            clearable
            style="width: 140px"
            @update:value="handleBulkAction"
          />
          <span class="text-sm text-gray-500">
            {{ $t('activity.common.selectedCountShort', [selectedCount, pagination.itemCount]) }}
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
        :create-mode="editCreateMode"
        :default-currency="wheels[0]?.currency || 'BRL'"
        @saved="onWheelSaved"
      />

      <LuckyWheelAddLuckyValueModal
        v-model:show="showAddLuckyValue"
        :initial-account="addLuckyValueAccount"
        :initial-member-id="addLuckyValueMemberId"
        @saved="reloadActive"
      />

      <LuckyWheelDeductLuckyValueModal
        v-model:show="showDeductLuckyValue"
        :user-ids="deductUserIds"
        :remaining-by-user-id="deductRemainingByUserId"
        @saved="reloadActive"
      />

      <LuckyWheelPhysicalOrderModal
        v-model:show="showPhysicalOrderModal"
        :order="editingPhysicalOrder"
        @saved="reloadActive"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import TzDateTime from '#/components/common/TzDateTime.vue';
import QuickDateSelect from '#/components/common/QuickDateSelect.vue';
import TimezoneDatePicker from '#/components/common/TimezoneDatePicker.vue';
import {
  applyDefaultDayQuickRange,
  buildQuickDateRange,
  type QuickDateValue,
} from '#/utils/quickDateRange';
import { pickerRangeToUtcIso } from '#/utils/timezoneUtils';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
import LuckyWheelPublicConfigModal from './components/LuckyWheelPublicConfigModal.vue';
import LuckyWheelEditModal from './components/LuckyWheelEditModal.vue';
import LuckyWheelAddLuckyValueModal from './components/LuckyWheelAddLuckyValueModal.vue';
import LuckyWheelDeductLuckyValueModal from './components/LuckyWheelDeductLuckyValueModal.vue';
import LuckyWheelPhysicalOrderModal from './components/LuckyWheelPhysicalOrderModal.vue';
import {
  BULK_ACTION_OPTION_KEYS,
  LUCKY_VALUE_CHANGE_TYPE_OPTION_KEYS,
  MEMBER_SEARCH_OPTION_KEYS,
  OPERATOR_SEARCH_OPTION_KEYS,
  PHYSICAL_ORDER_STATUS_OPTION_KEYS,
  PHYSICAL_ORDER_TIME_FIELD_OPTION_KEYS,
  REMAINING_VALUE_METRIC_OPTION_KEYS,
  WHEEL_TYPE_FILTER_OPTION_KEYS,
  WINNING_REWARD_TYPE_OPTION_KEYS,
} from './components/luckyWheelUiConstants';
import {
  type LuckyWheelItem,
  type LuckyWheelPublicConfigSnapshot,
  normalizeLuckyWheelItem,
  normalizeLuckyWheelPublicConfig,
  luckyWheelScheduleStatus,
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
const { timezone } = useDisplayTimezone();
const activeTab = ref<TabName>('wheels');

const lwEnabled = ref(false);
const lwEnabledAt = ref<string | null>(null);
const switchLoading = ref(false);
const exportLoading = ref(false);
const showPublicConfig = ref(false);
const showEditModal = ref(false);
const showAddLuckyValue = ref(false);
const showDeductLuckyValue = ref(false);
const addLuckyValueAccount = ref('');
const addLuckyValueMemberId = ref<number | string | null>(null);
const deductUserIds = ref<number[]>([]);
const deductRemainingByUserId = ref<Record<number, number>>({});
const showPhysicalOrderModal = ref(false);
const editReadOnly = ref(false);
const editCreateMode = ref(false);
const editingWheel = ref<LuckyWheelItem | null>(null);
const editingPhysicalOrder = ref<Record<string, any> | null>(null);
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

function mapLabelOptions<T extends { labelKey: string; value: unknown }>(
  keys: readonly T[] | T[],
) {
  return keys.map((k) => ({ label: $t(k.labelKey), value: k.value }));
}

const memberSearchOptions = computed(() => mapLabelOptions(MEMBER_SEARCH_OPTION_KEYS));
const operatorSearchOptions = computed(() => mapLabelOptions(OPERATOR_SEARCH_OPTION_KEYS));
const luckyValueChangeTypeOptions = computed(() =>
  mapLabelOptions(LUCKY_VALUE_CHANGE_TYPE_OPTION_KEYS),
);
const remainingMetricOptions = computed(() =>
  mapLabelOptions(REMAINING_VALUE_METRIC_OPTION_KEYS),
);
const winningRewardTypeOptions = computed(() =>
  mapLabelOptions(WINNING_REWARD_TYPE_OPTION_KEYS),
);
const wheelTypeFilterOptions = computed(() => mapLabelOptions(WHEEL_TYPE_FILTER_OPTION_KEYS));
const physicalOrderStatusOptions = computed(() =>
  mapLabelOptions(PHYSICAL_ORDER_STATUS_OPTION_KEYS),
);
const physicalOrderTimeFieldOptions = computed(() =>
  mapLabelOptions(PHYSICAL_ORDER_TIME_FIELD_OPTION_KEYS),
);
const bulkActionOptions = computed(() => mapLabelOptions(BULK_ACTION_OPTION_KEYS));

const enabledFilterOptions = [
  { label: $t('activity.luckyWheel.k51682'), value: null },
  { label: $t('activity.activityList.k5f00'), value: true },
  { label: $t('activity.activityList.k5173'), value: false },
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
  prefix: (info: any) => $t('activity.totalRecords', [info.itemCount]),
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
  filters.memberSearchType === 'memberId'
    ? $t('activity.luckyWheelUi.pleaseEnterMemberId')
    : $t('activity.luckyWheelUi.pleaseEnterMemberAccount'),
);

const operatorKeywordPlaceholder = computed(() =>
  filters.operatorSearchType === 'operator'
    ? $t('activity.luckyWheelUi.pleaseEnterOperator')
    : $t('activity.luckyWheelUi.pleaseEnterRecipient'),
);

function rowKey(row: any) {
  return row.id ?? row.orderNo ?? row.memberId ?? `${row.account}-${row.createdAt}`;
}

function displayValue(v: unknown) {
  if (v === null || v === undefined || v === '') return '—';
  return v;
}

function isOpaqueRefId(value: unknown) {
  const s = String(value ?? '').trim();
  if (!s || s === '—') return true;
  if (s === 'system') return true;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function labelWheelType(type?: string | null) {
  const key = String(type || '').toLowerCase();
  const map: Record<string, string> = {
    silver: $t('activity.luckyWheelUi.wheelSilver'),
    gold: $t('activity.luckyWheelUi.wheelGold'),
    diamond: $t('activity.luckyWheelUi.wheelDiamond'),
    custom: $t('activity.luckyWheelUi.wheelCustom'),
  };
  return map[key] || type || '—';
}

function labelPromotionSource(source?: string | null) {
  const key = String(source || '').toUpperCase();
  const map: Record<string, string> = {
    MANUAL: $t('activity.luckyWheelUi.sourceManual'),
    LUCKY_SPIN: $t('activity.luckyWheelUi.sourceLuckySpin'),
    LUCKY_SPIN_COMPENSATION: $t('activity.luckyWheelUi.sourceCompensation'),
    BET: $t('activity.luckyWheelUi.sourceBet'),
    DEPOSIT: $t('activity.luckyWheelUi.sourceDeposit'),
    LUCKY_EXPIRY: $t('activity.luckyWheelUi.sourceExpiry'),
    TASK: $t('activity.luckyWheelUi.sourceTask'),
    SURPRISE: $t('activity.luckyWheelUi.sourceSurprise'),
  };
  return map[key] || displayValue(source);
}

function labelChangeType(changeType?: string | null) {
  const key = String(changeType || '').toUpperCase();
  const map: Record<string, string> = {
    BET_EARN: $t('activity.luckyWheelUi.earn'),
    DEPOSIT_EARN: $t('activity.luckyWheelUi.depositEarn'),
    TASK_EARN: $t('activity.luckyWheelUi.taskEarn'),
    SURPRISE_EARN: $t('activity.luckyWheelUi.surpriseEarn'),
    MANUAL_ADD: $t('activity.luckyWheelUi.manualAdd'),
    MANUAL_DEDUCT: $t('activity.luckyWheelUi.deduct'),
    SPIN_CONSUME_SILVER: $t('activity.luckyWheelUi.consumeSilver'),
    SPIN_CONSUME_GOLD: $t('activity.luckyWheelUi.consumeGold'),
    SPIN_CONSUME_DIAMOND: $t('activity.luckyWheelUi.consumeDiamond'),
    SPIN_CONSUME: $t('activity.luckyWheelUi.consume'),
    EXPIRE_VOID: $t('activity.luckyWheelUi.expire'),
    MALL_REDEEM_CONSUME: $t('activity.luckyWheelUi.mallRedeem'),
    REDEEM_REFUND: $t('activity.luckyWheelUi.redeemRefund'),
  };
  return map[key] || displayValue(changeType);
}

function wheelTypeFromChangeType(changeType?: string | null) {
  const key = String(changeType || '').toUpperCase();
  if (key.includes('SILVER')) return 'silver';
  if (key.includes('GOLD')) return 'gold';
  if (key.includes('DIAMOND')) return 'diamond';
  if (key === 'SPIN_CONSUME') return 'custom';
  return null;
}

function labelPromotionType(row: {
  changeType?: string | null;
  metadata?: { wheelId?: string } | null;
  promotionSource?: string | null;
  promotionType?: string | null;
}) {
  const source = String(row.promotionSource || '').toUpperCase();
  const change = String(row.changeType || '').toUpperCase();
  const metaWheelId = row.metadata?.wheelId;
  if (metaWheelId) {
    const wheel = wheels.value.find((w) => w.id === metaWheelId);
    if (wheel?.name) return wheel.name;
  }

  const fromChange = wheelTypeFromChangeType(change);
  if (source === 'LUCKY_SPIN' || fromChange) {
    return fromChange
      ? labelWheelType(fromChange)
      : $t('activity.luckyWheelUi.sourceLuckySpin');
  }
  if (source === 'MANUAL') {
    return change === 'MANUAL_DEDUCT'
      ? $t('activity.luckyWheelUi.deduct')
      : $t('activity.luckyWheelUi.manual');
  }
  if (source === 'BET') return $t('activity.luckyWheelUi.sourceBet');
  if (source === 'DEPOSIT') return $t('activity.luckyWheelUi.sourceDeposit');
  if (source === 'LUCKY_EXPIRY') return $t('activity.luckyWheelUi.sourceExpiry');
  if (source === 'LUCKY_SPIN_COMPENSATION') {
    return $t('activity.luckyWheelUi.sourceCompensation');
  }
  if (source === 'TASK') return $t('activity.luckyWheelUi.sourceTask');
  if (isOpaqueRefId(row.promotionType)) {
    return labelPromotionSource(row.promotionSource);
  }
  return displayValue(row.promotionType);
}

function labelRewardType(type?: string | null) {
  const key = String(type || '').toUpperCase();
  const map: Record<string, string> = {
    FIXED_CASH: $t('activity.luckyWheelUi.fixedBonus'),
    FIXED_BONUS: $t('activity.luckyWheelUi.fixedBonus'),
    RANDOM_CASH: $t('activity.luckyWheelUi.randomBonus'),
    RANDOM_BONUS: $t('activity.luckyWheelUi.randomBonus'),
    PHYSICAL: $t('activity.luckyWheelUi.physical'),
    THANK_YOU: $t('activity.luckyWheelUi.none'),
    NONE: $t('activity.luckyWheelUi.none'),
    DISPLAY_ONLY: $t('activity.luckyWheelUi.displayOnly'),
  };
  return map[key] || displayValue(type);
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
  const { startDate, endDate } = pickerRangeToUtcIso(dateRange.value);
  return { from: startDate, to: endDate };
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

function openAddLuckyValue(row?: Record<string, any>) {
  addLuckyValueAccount.value = row?.account ? String(row.account) : '';
  addLuckyValueMemberId.value = row?.memberId ?? null;
  showAddLuckyValue.value = true;
}

function openDeductLuckyValue(rows: Array<Record<string, any>>) {
  const remaining: Record<number, number> = {};
  const ids: number[] = [];
  for (const row of rows) {
    const userId = Number(row.memberId);
    if (!Number.isInteger(userId) || userId <= 0) continue;
    ids.push(userId);
    remaining[userId] = Number(row.remainingLuckyValue || 0);
  }
  deductUserIds.value = [...new Set(ids)];
  deductRemainingByUserId.value = remaining;
  if (deductUserIds.value.length === 0) {
    message.warning($t('activity.luckyWheelAddLuckyValue.memberIds'));
    return;
  }
  showDeductLuckyValue.value = true;
}

function handleBulkAction(action: string | null) {
  if (!action) return;
  if (action === 'export') handleExport();
  if (action === 'deduct' && activeTab.value === 'remaining-lucky-value') {
    const selected = tableRows.value.filter((row) => checkedRowKeys.value.includes(rowKey(row)));
    openDeductLuckyValue(selected);
  }
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
    message.success(v ? $t('activity.common.lwEnabledOn') : $t('activity.common.lwDisabled'));
  } catch {
    message.error($t('activity.luckyWheel.k5f00'));
  } finally {
    switchLoading.value = false;
  }
}

async function onWheelSwitch(row: LuckyWheelItem, enabled: boolean) {
  try {
    const updated = await putLuckyWheelItemSwitchApi(row.id, enabled);
    const idx = wheels.value.findIndex((w) => w.id === row.id);
    if (idx >= 0) wheels.value[idx] = { ...wheels.value[idx], ...updated };
    message.success(enabled ? $t('activity.common.wheelEnabled') : $t('activity.common.wheelDisabled'));
  } catch {
    message.error($t('activity.luckyWheel.k8f6c5'));
    await reloadActive();
  }
}

function openCreate() {
  editingWheel.value = null;
  editReadOnly.value = false;
  editCreateMode.value = true;
  showEditModal.value = true;
}

function openEdit(row: LuckyWheelItem, readOnly = false) {
  editingWheel.value = row;
  editReadOnly.value = readOnly;
  editCreateMode.value = false;
  showEditModal.value = true;
}

function openPhysicalOrder(row: Record<string, any>) {
  editingPhysicalOrder.value = row;
  showPhysicalOrderModal.value = true;
}

const wheelColumns = computed<DataTableColumns<LuckyWheelItem>>(() => [
  { title: $t('activity.luckyWheel.k5e01'), key: 'currency', width: 70, render: (r) => displayValue(r.currency) },
  { title: $t('activity.luckyWheelEdit.k8f6c3'), key: 'name', width: 120, render: (r) => displayValue(r.name) },
  {
    title: $t('activity.luckyWheelEdit.k8f6c'),
    key: 'wheelType',
    width: 120,
    render: (row) => wheelTypeLabel(row.wheelType),
  },
  {
    title: $t('activity.luckyWheelEdit.k8d452'),
    key: 'schedule',
    width: 210,
    render: (row) => {
      const status = luckyWheelScheduleStatus(row.startsAt, row.endsAt);
      const statusLabel =
        status === 'always'
          ? $t('activity.luckyWheelEdit.k8d451')
          : status === 'upcoming'
            ? $t('activity.luckyWheelEdit.k8d448')
            : status === 'ended'
              ? $t('activity.luckyWheelEdit.k8d450')
              : $t('activity.luckyWheelEdit.k8d449');
      if (!row.startsAt && !row.endsAt) return statusLabel;
      return h('span', [
        `${statusLabel} · `,
        renderTzDateTime(row.startsAt),
        ' ~ ',
        renderTzDateTime(row.endsAt),
      ]);
    },
  },
  { title: $t('activity.luckyWheelEdit.k5956'), key: 'prizeCount', width: 90, render: (r) => displayValue(r.prizeCount) },
  {
    title: $t('activity.luckyWheelEdit.k6d88'),
    key: 'luckyValueCost',
    width: 100,
    render: (r) => displayValue(r.luckyValueCost),
  },
  {
    title: $t('activity.luckyWheelEdit.k662f'),
    key: 'showProbabilityAndCost',
    width: 140,
    render: (row) => (row.showProbabilityAndCost === 'show' ? $t('activity.common.showLabel') : $t('activity.common.hideLabel')),
  },
  { title: $t('activity.luckyWheelEdit.k771f'), key: 'realCost', width: 90, render: (r) => displayValue(r.realCost) },
  { title: $t('activity.luckyWheelEdit.k5c55'), key: 'displayCost', width: 90, render: (r) => displayValue(r.displayCost) },
  {
    title: $t('activity.luckyWheelEdit.k8f6c2'),
    key: 'enabled',
    width: 100,
    render: (row) =>
      h(NSwitch, {
        value: row.enabled,
        onUpdateValue: (v: boolean) => onWheelSwitch(row, v),
      }),
  },
  {
    title: $t('activity.rewardReport.k64cd'),
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 8 }, () => [
        h(NButton, { text: true, type: 'primary', onClick: () => openEdit(row, false) }, { default: () => $t('activity.luckyWheelEdit.k4fee') }),
        h(NButton, { text: true, type: 'info', onClick: () => openEdit(row, true) }, { default: () => $t('activity.rewardReport.k8be6') }),
        h(NButton, {
          text: true,
          type: 'default',
          onClick: () => {
            activeTab.value = 'winning-records';
            filters.wheelType = row.wheelType;
            onTabChange();
            reloadActive();
          },
        }, { default: () => $t('activity.activityList.k8bb0') }),
      ]),
  },
  { title: $t('activity.activityList.k64cd'), key: 'updatedBy', width: 90, render: (r) => displayValue(r.updatedBy) },
  { title: $t('activity.noviceWelfare.k64cd'), key: 'updatedAt', width: 160, render: (r) => renderTzDateTime(r.updatedAt) },
]);

const luckyValueRecordColumns = computed<DataTableColumns<any>>(() => [
  { title: $t('activity.rewardReport.k4f1a'), key: 'currency', width: 80, render: (r) => displayValue(r.currency) },
  { title: $t('activity.rewardReport.k4f1a2'), key: 'memberId', width: 90, render: (r) => displayValue(r.memberId) },
  { title: $t('activity.rewardReport.k4f1a3'), key: 'account', width: 120, render: (r) => displayValue(r.account) },
  { title: $t('activity.rewardReport.k4f18'), key: 'promotionSource', width: 100, render: (r) => labelPromotionSource(r.promotionSource) },
  { title: $t('activity.formModal.k4f182'), key: 'promotionType', width: 120, render: (r) => labelPromotionType(r) },
  { title: $t('activity.luckyWheel.k53d8'), key: 'changeType', width: 120, render: (r) => labelChangeType(r.changeType) },
  { title: $t('activity.luckyWheel.k53d82'), key: 'balanceBefore', width: 90, render: (r) => displayValue(r.balanceBefore) },
  { title: $t('activity.luckyWheelAddLuckyValue.k53d8'), key: 'changeAmount', width: 110, ...sortable('changeAmount'), render: (r) => displayValue(r.changeAmount) },
  { title: $t('activity.luckyWheel.k53d83'), key: 'balanceAfter', width: 90, render: (r) => displayValue(r.balanceAfter) },
  { title: $t('activity.luckyWheel.k5e782'), key: 'luckyValuePeriod', width: 100, render: (r) => displayValue(r.luckyValuePeriod) },
  { title: $t('activity.luckyWheel.k8fc7'), key: 'expireAt', width: 150, render: (r) => renderTzDateTime(r.expireAt) },
  { title: $t('activity.distributeReward.k524d'), key: 'frontendRemark', width: 120, render: (r) => displayValue(r.frontendRemark) },
  { title: $t('activity.distributeReward.k540e'), key: 'backendRemark', width: 120, render: (r) => displayValue(r.backendRemark) },
  { title: $t('activity.luckyWheel.k53d84'), key: 'createdAt', width: 150, render: (r) => renderTzDateTime(r.createdAt) },
]);

const remainingColumns = computed<DataTableColumns<any>>(() => [
  { type: 'selection' },
  { title: $t('activity.rewardReport.k4f1a'), key: 'currency', width: 80, render: (r) => displayValue(r.currency) },
  { title: $t('activity.rewardReport.k4f1a2'), key: 'memberId', width: 90, render: (r) => displayValue(r.memberId) },
  { title: $t('activity.rewardReport.k4f1a3'), key: 'account', width: 120, render: (r) => displayValue(r.account) },
  { title: $t('activity.detailModal.k66f4'), key: 'updatedAt', width: 150, render: (r) => renderTzDateTime(r.updatedAt) },
  { title: $t('activity.luckyWheelPublicConfig.k83b7'), key: 'earnedLuckyValue', width: 110, ...sortable('earnedLuckyValue'), render: (r) => displayValue(r.earnedLuckyValue) },
  { title: $t('activity.luckyWheelEdit.k6d88'), key: 'consumedLuckyValue', width: 110, ...sortable('consumedLuckyValue'), render: (r) => displayValue(r.consumedLuckyValue) },
  { title: $t('activity.luckyWheel.k8fc72'), key: 'expiredLuckyValue', width: 110, ...sortable('expiredLuckyValue'), render: (r) => displayValue(r.expiredLuckyValue) },
  { title: $t('activity.luckyWheel.k6263'), key: 'deductedLuckyValue', width: 110, ...sortable('deductedLuckyValue'), render: (r) => displayValue(r.deductedLuckyValue) },
  { title: $t('activity.luckyWheel.k5269'), key: 'remainingLuckyValue', width: 110, ...sortable('remainingLuckyValue'), render: (r) => displayValue(r.remainingLuckyValue) },
  {
    title: $t('activity.rewardReport.k64cd'),
    key: 'actions',
    width: 180,
    render: (row) =>
      h(NSpace, { size: 8 }, () => [
        h(
          NButton,
          { text: true, type: 'primary', onClick: () => openAddLuckyValue(row) },
          { default: () => $t('activity.luckyWheelAddLuckyValue.k65b0') },
        ),
        h(
          NButton,
          { text: true, type: 'warning', onClick: () => openDeductLuckyValue([row]) },
          { default: () => $t('activity.luckyWheelAddLuckyValue.deductAction') },
        ),
      ]),
  },
  { title: $t('activity.activityList.k64cd'), key: 'operator', width: 90, render: (r) => displayValue(r.operator) },
]);

const winningColumns = computed<DataTableColumns<any>>(() => [
  { title: $t('activity.rewardReport.k4f1a'), key: 'currency', width: 80, render: (r) => displayValue(r.currency) },
  { title: $t('activity.rewardReport.k4f1a2'), key: 'memberId', width: 90, render: (r) => displayValue(r.memberId) },
  { title: $t('activity.rewardReport.k4f1a3'), key: 'account', width: 120, render: (r) => displayValue(r.account) },
  { title: $t('activity.luckyWheelEdit.k8f6c3'), key: 'wheelName', width: 110, render: (r) => displayValue(r.wheelName) },
  { title: $t('activity.luckyWheelEdit.k8f6c'), key: 'wheelType', width: 100, ...sortable('wheelType'), render: (r) => labelWheelType(r.wheelType) },
  { title: $t('activity.luckyWheelEdit.k6d88'), key: 'luckyValueCost', width: 100, ...sortable('luckyValueCost'), render: (r) => displayValue(r.luckyValueCost) },
  { title: $t('activity.rewardReport.k5956'), key: 'rewardType', width: 120, render: (r) => labelRewardType(r.rewardType) },
  { title: $t('activity.luckyWheelEdit.k59564'), key: 'reward', width: 90, ...sortable('reward'), render: (r) => displayValue(r.reward) },
  { title: $t('activity.luckyWheel.k4e2d2'), key: 'wonAt', width: 150, render: (r) => renderTzDateTime(r.wonAt) },
]);

const physicalOrderColumns = computed<DataTableColumns<any>>(() => [
  { type: 'selection' },
  { title: $t('activity.luckyWheel.k8ba2'), key: 'orderNo', width: 140, render: (r) => displayValue(r.orderNo) },
  { title: $t('activity.rewardReport.k4f1a'), key: 'currency', width: 80, render: (r) => displayValue(r.currency) },
  { title: $t('activity.rewardReport.k4f1a2'), key: 'memberId', width: 90, render: (r) => displayValue(r.memberId) },
  { title: $t('activity.rewardReport.k4f1a3'), key: 'account', width: 120, render: (r) => displayValue(r.account) },
  { title: $t('activity.luckyWheel.k59562'), key: 'prizeIcon', width: 80, render: (r) => renderPrizeIcon(r.prizeIcon) },
  { title: $t('activity.formModal.k595612'), key: 'prizeName', width: 110, render: (r) => displayValue(r.prizeName) },
  { title: $t('activity.luckyWheel.k4e2d2'), key: 'wonAt', width: 150, render: (r) => renderTzDateTime(r.wonAt) },
  { title: $t('activity.luckyWheel.k6536'), key: 'receiverName', width: 100, render: (r) => displayValue(r.receiverName) },
  { title: $t('activity.luckyWheel.k65362'), key: 'receiverAddress', width: 160, render: (r) => displayValue(r.receiverAddress) },
  { title: $t('activity.luckyWheel.k8054'), key: 'receiverPhone', width: 120, render: (r) => displayValue(r.receiverPhone) },
  { title: $t('activity.luckyWheel.k8ba22'), key: 'status', width: 90, ...sortable('status'), render: (r) => displayValue(r.statusLabel ?? r.status) },
  { title: $t('activity.luckyWheel.k5feb'), key: 'trackingNo', width: 130, render: (r) => displayValue(r.trackingNo) },
  { title: $t('activity.luckyWheel.k5feb2'), key: 'courierCompany', width: 100, render: (r) => displayValue(r.courierCompany) },
  { title: $t('activity.luckyWheel.k53d1'), key: 'shippedAt', width: 150, render: (r) => renderTzDateTime(r.shippedAt) },
  { title: $t('activity.distributeReward.k524d'), key: 'frontendRemark', width: 120, render: (r) => displayValue(r.frontendRemark) },
  { title: $t('activity.distributeReward.k540e'), key: 'backendRemark', width: 120, render: (r) => displayValue(r.backendRemark) },
  {
    title: $t('activity.rewardReport.k64cd'),
    key: 'actions',
    width: 80,
    render: () => h(NButton, { text: true, type: 'primary', disabled: true }, { default: () => $t('activity.rewardReport.k8be6') }),
  },
  { title: $t('activity.activityList.k64cd'), key: 'operator', width: 90, render: (r) => displayValue(r.operator) },
  { title: $t('activity.noviceWelfare.k64cd'), key: 'operatedAt', width: 150, render: (r) => renderTzDateTime(r.operatedAt) },
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
    message.success($t('activity.statistics.k5bfc2'));
  } catch {
    message.error($t('activity.luckyWheel.k5bfck8bf7APIk5df2'));
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
  else wheels.value = [normalized, ...wheels.value];
  reloadActive();
}

watch(activeTab, () => {
  pagination.page = 1;
  reloadActive();
});

watch(timezone, () => {
  if (dateQuickSelect.value) {
    handleQuickDateSelect(dateQuickSelect.value);
  }
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
