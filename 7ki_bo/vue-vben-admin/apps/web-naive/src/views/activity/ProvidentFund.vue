<template>
  <div class="provident-fund-page">
    <Page :title="$t('activity.rewardReport.k516c')" :description="$t('activity.providentFund.k7528k9700k4ec5')">
      <n-card>
        <n-tabs v-model:value="activeTab" type="line" class="mb-4">
          <n-tab-pane name="details" :tab="$t('activity.providentFund.k516c')" />
          <n-tab-pane name="wagering" :tab="$t('activity.providentFund.k6295')" />
          <n-tab-pane name="withdrawals" :tab="$t('activity.providentFund.k53d6')" />
        </n-tabs>

        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <n-space align="center" wrap>
            <span class="text-sm text-gray-600">{{ $t('activity.providentFund.k516c2') }}</span>
            <n-switch
              :value="pfEnabled"
              :loading="switchLoading"
              @update:value="onSwitch"
            />
            <n-text v-if="pfEnabledAt" depth="3" class="text-xs">
              {{ $t('activity.common.enabledAt') }}<TzDateTime :value="pfEnabledAt" fallback="" />
            </n-text>
          </n-space>
          <n-space>
            <n-button type="primary" @click="showSettings = true">{{ $t('activity.providentFund.k516c3') }}</n-button>
            <n-button v-if="activeTab === 'details'" secondary @click="exportDetails">{{ $t('activity.luckyWheel.k5bfc') }}</n-button>
          </n-space>
        </div>

        <n-form class="mb-4" :show-feedback="false" label-placement="left" label-width="auto">
          <n-grid :cols="24" :x-gap="12" :y-gap="8">
            <n-gi :span="6">
              <n-form-item :label="$t('activity.luckyWheel.k65f6')">
                <n-space>
                  <n-button size="small" @click="setQuickRange('day')">{{ $t('activity.statistics.k65e5') }}</n-button>
                  <n-button size="small" @click="setQuickRange('week')">{{ $t('activity.providentFund.k5468') }}</n-button>
                  <n-button size="small" @click="setQuickRange('month')">{{ $t('activity.providentFund.k6708') }}</n-button>
                </n-space>
              </n-form-item>
            </n-gi>
            <n-gi :span="12">
              <n-form-item :label="$t('activity.luckyWheel.k8303')">
                <n-date-picker
                  v-model:value="dateRange"
                  type="datetimerange"
                  :time-zone="timezone"
                  clearable
                  style="width: 100%"
                />
              </n-form-item>
            </n-gi>
            <n-gi :span="6">
              <n-form-item :label="$t('activity.rewardReport.k4f1a3')">
                <n-input v-model:value="filters.account" clearable :placeholder="$t('activity.luckyWheelAddLuckyValue.k8bf7')" />
              </n-form-item>
            </n-gi>
            <n-gi :span="6">
              <n-form-item :label="$t('activity.providentFund.k6d3b')">
                <n-select
                  v-model:value="filters.currency"
                  clearable
                  :placeholder="$t('activity.common.allPlaceholder')"
                  :options="currencyOptions"
                />
              </n-form-item>
            </n-gi>
            <n-gi :span="6" v-if="activeTab === 'wagering'">
              <n-form-item :label="$t('activity.providentFund.k62952')">
                <n-select
                  v-model:value="filters.status"
                  clearable
                  :placeholder="$t('activity.common.allPlaceholder')"
                  :options="statusOptions"
                />
              </n-form-item>
            </n-gi>
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
          :scroll-x="1200"
          striped
          size="small"
          remote
          :pagination="pagination"
          @update:page="onPage"
          @update:page-size="onPageSize"
        />
      </n-card>

      <ProvidentFundSettingModal
        v-model:show="showSettings"
        mode="edit"
        :title-text="$t('activity.common.pfSettingsTitle')"
        :initial-snapshot="settingsSnapshot ?? defaultProvidentFundSnapshot()"
        @saved="onSettingsSaved"
      />
    </Page>
  </div>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, watch, h } from 'vue';
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
  NSelect,
  NGrid,
  NGi,
  NDataTable,
  NSwitch,
  NDatePicker,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { Page } from '@vben/common-ui';
import { renderTzDateTime } from '#/components/common/tzDateTimeRender';
import TzDateTime from '#/components/common/TzDateTime.vue';
import { useDisplayTimezone } from '#/composables/useDisplayTimezone';
import ProvidentFundSettingModal from './components/ProvidentFundSettingModal.vue';
import {
  type ProvidentFundFormSnapshot,
  defaultProvidentFundSnapshot,
  normalizeProvidentFundSettings,
} from './components/providentFundTypes';
import {
  exportProvidentFundDetailsCsvApi,
  forceReleaseProvidentFundWageringApi,
  getProvidentFundAdminConfigApi,
  listProvidentFundDetailsApi,
  listProvidentFundWageringApi,
  listProvidentFundWithdrawalsApi,
  putProvidentFundAdminSwitchApi,
} from '#/api/core/provident-fund-admin';

const message = useMessage();
const { timezone } = useDisplayTimezone();
const activeTab = ref<'details' | 'wagering' | 'withdrawals'>('details');
const pfEnabled = ref(false);
const pfEnabledAt = ref<string | null>(null);
const settingsSnapshot = ref<ProvidentFundFormSnapshot | null>(null);
const switchLoading = ref(false);
const showSettings = ref(false);

const dateRange = ref<[number, number] | null>(null);
const filters = reactive({
  account: '',
  currency: null as string | null,
  status: null as string | null,
});

const currencyOptions = [{ label: 'BRL', value: 'BRL' }];

const statusOptions = [
  { label: $t('activity.detailModal.k8fdb'), value: 'IN_PROGRESS' },
  { label: $t('activity.recordModal.k5df2'), value: 'COMPLETED' },
];

const loading = ref(false);
const tableRows = ref<any[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: any) => $t('activity.totalRecords', [info.itemCount]),
});

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
  if (current != null && current >= 1) {
    pagination.page = Math.floor(current);
  }

  const size =
    toFiniteNumber(meta?.pageSize) ??
    toFiniteNumber(meta?.size) ??
    toFiniteNumber(meta?.limit);
  if (size != null && size >= 1) {
    pagination.pageSize = Math.floor(size);
  }

  const total =
    toFiniteNumber(meta?.total) ??
    toFiniteNumber(meta?.totalCount) ??
    toFiniteNumber(meta?.itemCount) ??
    toFiniteNumber(meta?.count);
  const totalPages = toFiniteNumber(meta?.totalPages);

  if (total != null && total >= 0) {
    pagination.itemCount = Math.floor(total);
    return;
  }

  if (totalPages != null && totalPages >= 0) {
    pagination.itemCount = Math.floor(totalPages) * pagination.pageSize;
    return;
  }

  // Fallback for non-standard responses: keep pagination usable on first page.
  if (pagination.page <= 1) {
    pagination.itemCount = currentListLength;
  }
}

function rangeParams() {
  if (!dateRange.value) return {};
  const [a, b] = dateRange.value;
  return { from: new Date(a).toISOString(), to: new Date(b).toISOString() };
}

function setQuickRange(kind: 'day' | 'week' | 'month') {
  const end = new Date();
  const start = new Date(end);
  if (kind === 'day') start.setHours(0, 0, 0, 0);
  if (kind === 'week') start.setDate(start.getDate() - 7);
  if (kind === 'month') start.setMonth(start.getMonth() - 1);
  dateRange.value = [start.getTime(), end.getTime()];
}

async function loadConfig() {
  const cfg = await getProvidentFundAdminConfigApi();
  pfEnabled.value = cfg.enabled;
  pfEnabledAt.value = cfg.enabledAt;
  settingsSnapshot.value = normalizeProvidentFundSettings(
    cfg.settings as Record<string, unknown>,
  );
}

async function onSwitch(v: boolean) {
  switchLoading.value = true;
  try {
    const r = await putProvidentFundAdminSwitchApi(v);
    pfEnabled.value = r.enabled;
    pfEnabledAt.value = r.enabledAt;
    message.success(v ? $t('activity.common.pfEnabledOn') : $t('activity.common.pfDisabled'));
  } catch {
    message.error($t('activity.luckyWheel.k5f00'));
  } finally {
    switchLoading.value = false;
  }
}

function resetFilters() {
  filters.account = '';
  filters.currency = null;
  filters.status = null;
  dateRange.value = null;
  pagination.page = 1;
  reloadActive();
}

async function reloadActive() {
  loading.value = true;
  try {
    const rp = rangeParams();
    if (activeTab.value === 'details') {
      const res = await listProvidentFundDetailsApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        account: filters.account || undefined,
        currency: filters.currency || undefined,
        ...rp,
      });
      tableRows.value = res.list;
      applyServerPagination(res.pagination, res.list?.length ?? 0);
    } else if (activeTab.value === 'wagering') {
      const res = await listProvidentFundWageringApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        account: filters.account || undefined,
        currency: filters.currency || undefined,
        status: filters.status || undefined,
        ...rp,
      });
      tableRows.value = res.list;
      applyServerPagination(res.pagination, res.list?.length ?? 0);
    } else {
      const res = await listProvidentFundWithdrawalsApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        account: filters.account || undefined,
        currency: filters.currency || undefined,
        ...rp,
      });
      tableRows.value = res.list;
      applyServerPagination(res.pagination, res.list?.length ?? 0);
    }
  } catch (e) {
    console.error(e);
    message.error($t('activity.rewardReport.k52a03'));
  } finally {
    loading.value = false;
  }
}

function onPage(p: number) {
  pagination.page = p;
  reloadActive();
}
function onPageSize(s: number) {
  pagination.pageSize = s;
  pagination.page = 1;
  reloadActive();
}

watch(activeTab, () => {
  pagination.page = 1;
  reloadActive();
});

async function exportDetails() {
  try {
    const blob = await exportProvidentFundDetailsCsvApi({
      account: filters.account || undefined,
      currency: filters.currency || undefined,
      ...rangeParams(),
    } as any);
    const url = URL.createObjectURL(blob as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'provident-fund-details.csv';
    a.click();
    URL.revokeObjectURL(url);
    message.success($t('activity.providentFund.k5bfc'));
  } catch {
    message.error($t('activity.statistics.k5bfc3'));
  }
}

async function onSettingsSaved() {
  await loadConfig();
}

function resetCycleLabel(v: string) {
  const m: Record<string, string> = {
    none: $t('activity.cycles.none'),
    monthly: $t('activity.cycles.monthly'),
    quarterly: $t('activity.cycles.quarterly'),
    semi_annual: $t('activity.cycles.semi_annual'),
    annual: $t('activity.cycles.annual'),
  };
  return m[v] || v || '--';
}

const detailColumns: DataTableColumns<any> = [
  {
    title: $t('activity.rewardReport.k4f1a2'),
    key: 'userId',
    width: 100,
    render: (row) =>
      h('span', { style: 'color:#2080f0;cursor:pointer' }, String(row.userId)),
  },
  { title: $t('activity.rewardReport.k4f1a3'), key: 'memberAccount', width: 120, ellipsis: { tooltip: true } },
  { title: $t('activity.luckyWheel.k5e01'), key: 'currency', width: 80 },
  { title: $t('activity.formModal.k5145'), key: 'rechargeAmount', width: 100 },
  { title: $t('activity.providentFund.k8d60'), key: 'giftRatioPercent', width: 90, render: (r) => `${r.giftRatioPercent}%` },
  { title: $t('activity.providentFund.k8d602'), key: 'balanceBefore', width: 120 },
  { title: $t('activity.providentFund.k8d603'), key: 'giftAmount', width: 110 },
  { title: $t('activity.providentFund.k8d604'), key: 'balanceAfter', width: 120 },
  {
    title: $t('activity.providentFund.k5df2k5c01'),
    key: 'times',
    width: 130,
    render: (r) =>
      r.giftTimesCap != null ? `${r.giftTimesCurrent ?? ''}/${r.giftTimesCap}` : '--',
  },
  {
    title: $t('activity.providentFund.k516c4'),
    key: 'cumulativeCap',
    width: 110,
    render: (r) => (r.cumulativeCap != null ? r.cumulativeCap : '--'),
  },
  { title: $t('activity.providentFund.k62953'), key: 'betMultiple', width: 90 },
  { title: $t('activity.providentFund.k65b0'), key: 'newBetRequirement', width: 110 },
  {
    title: $t('activity.detailModal.k66f4'),
    key: 'createdAt',
    width: 170,
    render: (r) => renderTzDateTime(r.createdAt),
  },
];

const wageringColumns: DataTableColumns<any> = [
  {
    title: $t('activity.rewardReport.k4f1a2'),
    key: 'userId',
    width: 90,
    render: (row) => h('span', { style: 'color:#2080f0' }, String(row.userId)),
  },
  { title: $t('activity.rewardReport.k4f1a3'), key: 'memberAccount', width: 120, ellipsis: { tooltip: true } },
  { title: $t('activity.luckyWheel.k5e01'), key: 'currency', width: 70 },
  { title: $t('activity.providentFundSetting.k91cd'), key: 'resetCycle', width: 100, render: (r) => resetCycleLabel(r.resetCycle) },
  { title: $t('activity.providentFund.k516c5'), key: 'bonusAmount', width: 110 },
  { title: $t('activity.providentFund.k603b'), key: 'totalRequiredBet', width: 110 },
  { title: $t('activity.providentFund.k5df23'), key: 'wageredBet', width: 90 },
  { title: $t('activity.providentFund.k5269'), key: 'remainingBet', width: 90 },
  {
    title: $t('activity.providentFund.k9650'),
    key: 'platformLabels',
    width: 120,
    ellipsis: { tooltip: true },
    render: (r) => {
      const v = r.platformLabels;
      if (v == null) return '--';
      if (Array.isArray(v)) return v.join('、') || '--';
      return String(v);
    },
  },
  {
    title: $t('activity.providentFund.k62952'),
    key: 'bettingStatus',
    width: 100,
    render: (r) =>
      h(
        'span',
        { style: { color: r.bettingStatus === 'COMPLETED' ? '#18a058' : '#2080f0' } },
        r.bettingStatus === 'COMPLETED' ? $t('activity.statuses.completed') : $t('activity.statuses.inProgress'),
      ),
  },
  {
    title: $t('activity.rewardReport.k64cd'),
    key: 'actions',
    width: 120,
    render: (r) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'info',
          text: true,
          disabled: r.bettingStatus === 'COMPLETED',
          onClick: () => doForce(r),
        },
        { default: () => $t('activity.providentFund.k5f3a') },
      ),
  },
  {
    title: $t('activity.providentFund.k521b'),
    key: 'firstOccurrenceAt',
    width: 170,
    render: (r) => renderTzDateTime(r.firstOccurrenceAt),
  },
];

const withdrawalColumns: DataTableColumns<any> = [
  { title: $t('activity.rewardReport.k4f1a2'), key: 'userId', width: 90 },
  { title: $t('activity.rewardReport.k4f1a3'), key: 'memberAccount', width: 140, ellipsis: { tooltip: true } },
  { title: $t('activity.luckyWheel.k5e01'), key: 'currency', width: 80 },
  { title: $t('activity.providentFund.k53d62'), key: 'amount', width: 110 },
  { title: $t('activity.rewardReport.k98862'), key: 'claimedAt', width: 180, render: (r) => renderTzDateTime(r.claimedAt) },
];

const activeColumns = computed(() => {
  if (activeTab.value === 'details') return detailColumns;
  if (activeTab.value === 'wagering') return wageringColumns;
  return withdrawalColumns;
});

async function doForce(row: any) {
  try {
    await forceReleaseProvidentFundWageringApi(row.id);
    message.success($t('activity.providentFund.k5df22'));
    reloadActive();
  } catch {
    message.error($t('activity.providentFund.k64cd'));
  }
}

loadConfig().then(() => reloadActive());
</script>
