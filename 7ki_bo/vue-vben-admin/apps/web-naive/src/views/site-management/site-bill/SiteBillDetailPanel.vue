<script setup lang="ts">
import { $t } from '@vben/locales';

import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  NButton,
  NDataTable,
  NSelect,
  NSpace,
  NSpin,
  useMessage,
  type DataTableColumns,
  type DataTableCreateSummary,
} from 'naive-ui';
import { ReloadOutline } from '@vicons/ionicons5';
import {
  buildDetailSummaryFromBill,
  getSiteBalanceUsdtApi,
  getSiteBillDetailApi,
  type SiteBillDetail,
  type SiteBillFeeLine,
} from '#/api/core/site-bill';

const props = withDefaults(
  defineProps<{
    billId: string;
    showBack?: boolean;
  }>(),
  { showBack: false },
);

const emit = defineEmits<{
  back: [];
}>();

const message = useMessage();

/** 不用 flex-height（父级高度常为 0 会导致表格体完全不渲染） */
const feeTableMaxHeight = ref(400);
function updateFeeTableMaxHeight() {
  feeTableMaxHeight.value = Math.max(
    260,
    Math.round(window.innerHeight * 0.92 - 400),
  );
}

function formatGameTypeLabel(raw: string | undefined): string {
  const t = (raw || '').trim();
  if (!t || t === '—') return '—';
  if (t.toUpperCase() === 'SLOT') return $t('system.siteBill.gameTypeSlot');
  return t;
}

const loading = ref(true);
const detail = ref<null | SiteBillDetail>(null);
const balanceLoading = ref(false);
const siteBalance = ref(0);

const filterBrand = ref<string | null>(null);
const filterCurrency = ref<string | null>(null);
const filterGameType = ref<string | null>(null);
const filterVendor = ref<string | null>(null);

const summary = computed(() => {
  if (!detail.value) return null;
  return (
    detail.value.summary ??
    buildDetailSummaryFromBill(detail.value.bill, detail.value.feeLines)
  );
});

const currencyOptions = computed(() => {
  if (!detail.value) return [];
  const set = new Set<string>();
  for (const row of detail.value.feeLines) {
    const c = row.lineCurrency?.trim();
    if (c) set.add(c);
  }
  if (set.size === 0) set.add('BRL');
  return [
    { label: $t('system.siteBill.allCurrencies'), value: null as string | null },
    ...[...set].sort().map((c) => ({ label: c, value: c })),
  ];
});

const gameTypeOptions = computed(() => {
  if (!detail.value) return [];
  const set = new Set<string>();
  for (const row of detail.value.feeLines) {
    if (row.gameType && row.gameType !== '—') set.add(row.gameType);
  }
  return [
    { label: $t('system.siteBill.allTypes'), value: null as string | null },
    ...[...set].sort().map((c) => ({ label: formatGameTypeLabel(c), value: c })),
  ];
});

const vendorOptions = computed(() => {
  if (!detail.value) return [];
  const set = new Set<string>();
  for (const row of detail.value.feeLines) {
    if (row.gameVendor && row.gameVendor !== '—') set.add(row.gameVendor);
  }
  return [
    { label: $t('system.siteBill.allVendors'), value: null as string | null },
    ...[...set].sort().map((c) => ({ label: c, value: c })),
  ];
});

const filteredFeeLines = computed(() => {
  if (!detail.value) return [];
  let rows = detail.value.feeLines;
  if (filterCurrency.value) {
    rows = rows.filter((r) => (r.lineCurrency || 'BRL') === filterCurrency.value);
  }
  if (filterGameType.value) {
    rows = rows.filter((r) => r.gameType === filterGameType.value);
  }
  if (filterVendor.value) {
    rows = rows.filter((r) => r.gameVendor === filterVendor.value);
  }
  return rows;
});

function fmtMoney(n: number, fd = 2) {
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: fd,
    maximumFractionDigits: fd,
  });
}

function fmtPctFromDecimal(d: number) {
  return `${(d * 100).toFixed(2)}%`;
}

async function load() {
  if (!props.billId) return;
  loading.value = true;
  try {
    const d = await getSiteBillDetailApi(props.billId);
    detail.value = d;
    siteBalance.value = d.siteBalanceUsdt;
    filterBrand.value = d.bill.brandId;
  } catch (e: any) {
    message.error(e?.message || $t('system.siteBill.loadFailed'));
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.billId,
  () => {
    void load();
  },
  { immediate: true },
);

onMounted(() => {
  updateFeeTableMaxHeight();
  window.addEventListener('resize', updateFeeTableMaxHeight);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateFeeTableMaxHeight);
});

function feeLineRowKey(row: SiteBillFeeLine) {
  if (row.id) return row.id;
  return `${row.gameVendor}:${row.gameType}:${row.lineCurrency ?? ''}:${row.validBet}:${row.winLoss}`;
}

async function refreshBalance() {
  if (!detail.value) return;
  balanceLoading.value = true;
  try {
    siteBalance.value = await getSiteBalanceUsdtApi(
      detail.value.bill.mainSiteId || props.billId,
    );
    message.success($t('system.siteBill.balanceRefreshed'));
  } catch {
    message.error($t('system.siteBill.refreshFailed'));
  } finally {
    balanceLoading.value = false;
  }
}

/** 详情明细表列：与业务清单标题一致（顺序与文案固定） */
const feeColumns = computed<DataTableColumns<SiteBillFeeLine>>(() => {
  void detail.value;
  const b = detail.value?.bill;

  const brandTitle = (): string => {
    if (!b) return '—';
    return `${b.brandName}(${b.brandId})`;
  };

  return [
    {
      title: $t('system.siteBill.brandNameId'),
      key: 'brandNameId',
      width: 168,
      ellipsis: { tooltip: true },
      render: () => brandTitle(),
    },
    {
      title: $t('system.siteBill.billMonth'),
      key: 'billMonth',
      width: 100,
      render: () => b?.billMonth ?? '—',
    },
    {
      title: $t('common.currency'),
      key: 'lineCurrency',
      width: 72,
      render: (row) => {
        const c = row.lineCurrency?.trim();
        return c || '—';
      },
    },
    {
      title: $t('system.siteBill.gameType'),
      key: 'gameType',
      width: 96,
      render: (row) => formatGameTypeLabel(row.gameType),
    },
    {
      title: $t('system.siteBill.gameVendor'),
      key: 'gameVendor',
      minWidth: 120,
      ellipsis: { tooltip: true },
    },
    {
      title: $t('system.siteBill.validBet'),
      key: 'validBet',
      width: 120,
      render: (row) => fmtMoney(row.validBet),
    },
    {
      title: $t('system.siteBill.winLoss'),
      key: 'winLoss',
      width: 120,
      render: (row) => fmtMoney(row.winLoss),
    },
    {
      title: $t('system.siteBill.commissionRate'),
      key: 'commissionRate',
      width: 100,
      render: (row) => fmtPctFromDecimal(row.commissionRate),
    },
    {
      title: $t('system.siteBill.billAmount'),
      key: 'billAmount',
      width: 110,
      render: (row) => fmtMoney(row.billAmount),
    },
    {
      title: $t('system.siteBill.vendorExclusiveDiscount'),
      key: 'vendorExclusiveDiscount',
      width: 120,
      render: (row) => fmtPctFromDecimal(row.vendorExclusiveDiscount),
    },
    {
      title: $t('system.siteBill.rateAfterDiscount'),
      key: 'rateAfterDiscount',
      width: 110,
      render: (row) => fmtPctFromDecimal(row.rateAfterDiscount),
    },
    {
      title: $t('system.siteBill.commissionAmount'),
      key: 'commissionCutAmount',
      width: 110,
      render: (row) => fmtMoney(row.commissionCutAmount),
    },
    {
      title: $t('system.siteBill.fxRate'),
      key: 'fxRate',
      width: 100,
      render: (row) =>
        row.fxRate.toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        }),
    },
    {
      title: $t('system.siteBill.gameBillUsdt'),
      key: 'adjustedBillUsdt',
      width: 110,
      render: (row) => fmtMoney(row.adjustedBillUsdt),
    },
    {
      title: $t('common.status'),
      key: 'lineStatus',
      width: 80,
      render: (row) =>
        row.lineStatus === 'normal'
          ? h('span', { class: 'text-emerald-600' }, $t('system.siteBill.statusNormal'))
          : h('span', { class: 'text-rose-600' }, $t('system.siteBill.statusAbnormal')),
    },
  ];
});

/** 明细表底部合计行（按当前筛选结果汇总） */
const feeTableSummary: DataTableCreateSummary<SiteBillFeeLine> = (pageData) => {
  if (!pageData.length) return {};
  let validBet = 0;
  let winLoss = 0;
  let billAmount = 0;
  let commissionCutAmount = 0;
  let adjustedBillUsdt = 0;
  for (const r of pageData) {
    validBet += r.validBet;
    winLoss += r.winLoss;
    billAmount += r.billAmount;
    commissionCutAmount += r.commissionCutAmount;
    adjustedBillUsdt += r.adjustedBillUsdt;
  }
  return {
    brandNameId: {
      value: h('span', { class: 'font-semibold text-slate-800' }, $t('common.total')),
    },
    billMonth: { value: '' },
    lineCurrency: { value: '' },
    gameType: { value: '' },
    gameVendor: { value: '' },
    validBet: {
      value: h('span', { class: 'font-semibold tabular-nums' }, fmtMoney(validBet)),
    },
    winLoss: {
      value: h('span', { class: 'font-semibold tabular-nums' }, fmtMoney(winLoss)),
    },
    commissionRate: { value: '—' },
    billAmount: {
      value: h('span', { class: 'font-semibold tabular-nums' }, fmtMoney(billAmount)),
    },
    vendorExclusiveDiscount: { value: '—' },
    rateAfterDiscount: { value: '—' },
    commissionCutAmount: {
      value: h('span', { class: 'font-semibold tabular-nums' }, fmtMoney(commissionCutAmount)),
    },
    fxRate: { value: '—' },
    adjustedBillUsdt: {
      value: h(
        'span',
        { class: 'font-semibold tabular-nums text-blue-700' },
        fmtMoney(adjustedBillUsdt),
      ),
    },
    lineStatus: { value: '' },
  };
};

function resetFilters() {
  filterCurrency.value = null;
  filterGameType.value = null;
  filterVendor.value = null;
}

</script>

<template>
  <n-spin :show="loading" class="site-bill-detail-spin">
    <div v-if="detail && summary" class="flex flex-col gap-3 pr-1">
      <div class="shrink-0 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
        <n-button v-if="showBack" quaternary size="small" @click="emit('back')">
          {{ $t('system.siteBill.backToList') }}
        </n-button>
        <span class="text-sm text-slate-600">
          {{ detail.bill.brandName }} · {{ $t('system.siteBill.brandIdLabel') }}
          {{ detail.bill.brandId }} ·
          {{ detail.bill.billMonth }} · {{ $t('system.siteBill.mainSite') }}
          {{ detail.bill.mainSiteName || '—' }}
        </span>
      </div>

      <!-- 汇总条（对齐业务详情页） -->
      <div
        class="shrink-0 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3"
      >
        <div class="min-w-[128px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="flex items-center gap-1 text-xs text-slate-500">
            {{ $t('system.siteBill.gameBill') }}
            <n-tooltip trigger="hover">
              <template #trigger>
                <span class="cursor-help text-slate-400">ⓘ</span>
              </template>
              {{ $t('system.siteBill.gameBillTooltip') }}
            </n-tooltip>
          </div>
          <div class="text-base font-semibold tabular-nums text-slate-900">
            {{ fmtMoney(summary.gameBillUsdt) }}
          </div>
        </div>
        <div class="min-w-[128px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="flex items-center gap-1 text-xs text-slate-500">
            {{ $t('system.siteBill.cdnTrafficFee') }}
            <n-tooltip trigger="hover">
              <template #trigger>
                <span class="cursor-help text-slate-400">ⓘ</span>
              </template>
              {{ $t('system.siteBill.cdnTrafficTooltip') }}
            </n-tooltip>
          </div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.cdnTrafficFeeUsdt) }}
          </div>
          <div class="text-[11px] leading-tight text-slate-400">
            {{ $t('system.siteBill.cdnCapSaved', [fmtMoney(summary.cdnCapSavedUsdt)]) }}
          </div>
        </div>
        <div class="min-w-[128px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="flex items-center gap-1 text-xs text-slate-500">
            {{ $t('system.siteBill.lineMaintenanceFee') }}
            <n-tooltip trigger="hover">
              <template #trigger>
                <span class="cursor-help text-slate-400">ⓘ</span>
              </template>
              {{ $t('system.siteBill.lineMaintenanceTooltip') }}
            </n-tooltip>
          </div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.lineMaintenanceFeeUsdt) }}
          </div>
        </div>
        <div class="min-w-[120px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">{{ $t('system.siteBill.otherFees') }}</div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.otherFeesUsdt) }}
          </div>
        </div>
        <div class="min-w-[120px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">{{ $t('system.siteBill.feeAdjustment') }}</div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.feeAdjustmentUsdt) }}
          </div>
        </div>
        <div class="min-w-[120px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">{{ $t('system.siteBill.billTotal') }}</div>
          <div class="text-base font-semibold tabular-nums text-blue-700">
            {{ fmtMoney(summary.billTotalUsdt) }}
          </div>
        </div>
        <div class="min-w-[140px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">{{ $t('system.siteBill.referralDiscount') }}</div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.referralDiscountUsdt) }}
            <span class="text-xs font-normal text-slate-500">
              ({{ fmtPctFromDecimal(summary.referralDiscountPct) }})
            </span>
          </div>
        </div>
        <div class="min-w-[160px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">{{ $t('system.siteBill.actualPayTotalUsdt') }}</div>
          <div class="text-lg font-bold tabular-nums text-slate-900">
            {{ fmtMoney(summary.actualPayUsdt) }}
          </div>
        </div>
      </div>

      <div class="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <n-space size="small" align="center" class="flex-wrap">
          <n-select
            v-model:value="filterBrand"
            disabled
            :placeholder="$t('system.siteBill.brandIdLabel')"
            :options="
              detail
                ? [{ label: detail.bill.brandId, value: detail.bill.brandId }]
                : []
            "
            style="width: 200px"
            size="small"
          />
          <n-select
            v-model:value="filterCurrency"
            :placeholder="$t('common.currency')"
            clearable
            :options="currencyOptions"
            style="width: 120px"
            size="small"
          />
          <n-select
            v-model:value="filterGameType"
            :placeholder="$t('system.siteBill.gameType')"
            clearable
            :options="gameTypeOptions"
            style="width: 120px"
            size="small"
          />
          <n-select
            v-model:value="filterVendor"
            :placeholder="$t('system.siteBill.gameVendor')"
            clearable
            :options="vendorOptions"
            style="width: 160px"
            size="small"
          />
          <n-button type="primary" size="small" @click="message.success($t('system.siteBill.filterApplied'))">
            {{ $t('common.search') }}
          </n-button>
          <n-button size="small" @click="resetFilters">{{ $t('common.reset') }}</n-button>
        </n-space>
        <n-space size="small">
          <span class="text-xs text-slate-500">
            {{ $t('system.siteBill.siteBalanceBrl') }}
            <span class="tabular-nums font-medium text-slate-800">{{
              fmtMoney(siteBalance)
            }}</span>
            <n-button
              class="ml-1"
              size="tiny"
              quaternary
              circle
              :loading="balanceLoading"
              @click="refreshBalance"
            >
              <template #icon>
                <ReloadOutline />
              </template>
            </n-button>
          </span>
          <n-button
            size="small"
            @click="message.info($t('system.siteBill.exportPendingDetail'))"
          >
            {{ $t('common.exportReport') }}
          </n-button>
        </n-space>
      </div>

      <n-data-table
        :columns="feeColumns"
        :data="filteredFeeLines"
        :row-key="feeLineRowKey"
        :bordered="true"
        :single-line="false"
        size="small"
        scroll-x="1880"
        :max-height="feeTableMaxHeight"
        :summary="feeTableSummary"
        class="site-bill-fee-detail-table min-h-[200px]"
      />

      <p
        v-if="detail.financeRemark"
        class="shrink-0 rounded border border-dashed border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-600"
      >
        {{ $t('system.siteBill.stationMasterRemark') }}{{ detail.financeRemark }}
      </p>
    </div>
  </n-spin>
</template>

<style scoped>
/* 合计行贴在表格滚动区底部，数据行向上滚动（summary 与数据同在一个 NScrollbar 内） */
.site-bill-fee-detail-table :deep(tr.n-data-table-tr--summary td.n-data-table-td) {
  position: sticky;
  bottom: 0;
  z-index: 3;
  background-color: var(--n-td-color, rgb(248 250 252));
  box-shadow: 0 -1px 0 0 var(--n-border-color);
}
</style>
