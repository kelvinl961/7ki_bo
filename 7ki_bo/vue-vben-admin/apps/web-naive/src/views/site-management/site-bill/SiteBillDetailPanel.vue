<script setup lang="ts">
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
  if (t.toUpperCase() === 'SLOT') return '电子';
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
    { label: '全部币种', value: null as string | null },
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
    { label: '全部类型', value: null as string | null },
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
    { label: '全部厂商', value: null as string | null },
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
    message.error(e?.message || '加载失败');
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
    message.success('余额已刷新');
  } catch {
    message.error('刷新失败');
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
      title: '品牌名称(ID)',
      key: 'brandNameId',
      width: 168,
      ellipsis: { tooltip: true },
      render: () => brandTitle(),
    },
    {
      title: '账单月份',
      key: 'billMonth',
      width: 100,
      render: () => b?.billMonth ?? '—',
    },
    {
      title: '币种',
      key: 'lineCurrency',
      width: 72,
      render: (row) => {
        const c = row.lineCurrency?.trim();
        return c || '—';
      },
    },
    {
      title: '游戏类型',
      key: 'gameType',
      width: 96,
      render: (row) => formatGameTypeLabel(row.gameType),
    },
    {
      title: '游戏厂商',
      key: 'gameVendor',
      minWidth: 120,
      ellipsis: { tooltip: true },
    },
    {
      title: '有效投注',
      key: 'validBet',
      width: 120,
      render: (row) => fmtMoney(row.validBet),
    },
    {
      title: '盈亏金额',
      key: 'winLoss',
      width: 120,
      render: (row) => fmtMoney(row.winLoss),
    },
    {
      title: '抽佣比例',
      key: 'commissionRate',
      width: 100,
      render: (row) => fmtPctFromDecimal(row.commissionRate),
    },
    {
      title: '账单金额',
      key: 'billAmount',
      width: 110,
      render: (row) => fmtMoney(row.billAmount),
    },
    {
      title: '厂商专属优惠',
      key: 'vendorExclusiveDiscount',
      width: 120,
      render: (row) => fmtPctFromDecimal(row.vendorExclusiveDiscount),
    },
    {
      title: '优惠后比例',
      key: 'rateAfterDiscount',
      width: 110,
      render: (row) => fmtPctFromDecimal(row.rateAfterDiscount),
    },
    {
      title: '抽佣金额',
      key: 'commissionCutAmount',
      width: 110,
      render: (row) => fmtMoney(row.commissionCutAmount),
    },
    {
      title: '折算汇率',
      key: 'fxRate',
      width: 100,
      render: (row) =>
        row.fxRate.toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        }),
    },
    {
      title: '游戏帐单U',
      key: 'adjustedBillUsdt',
      width: 110,
      render: (row) => fmtMoney(row.adjustedBillUsdt),
    },
    {
      title: '状态',
      key: 'lineStatus',
      width: 80,
      render: (row) =>
        row.lineStatus === 'normal'
          ? h('span', { class: 'text-emerald-600' }, '正常')
          : h('span', { class: 'text-rose-600' }, '异常'),
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
      value: h('span', { class: 'font-semibold text-slate-800' }, '合计'),
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
          ← 返回列表
        </n-button>
        <span class="text-sm text-slate-600">
          {{ detail.bill.brandName }} · 品牌ID {{ detail.bill.brandId }} ·
          {{ detail.bill.billMonth }} · 主站 {{ detail.bill.mainSiteName || '—' }}
        </span>
      </div>

      <!-- 汇总条（对齐业务详情页） -->
      <div
        class="shrink-0 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3"
      >
        <div class="min-w-[128px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="flex items-center gap-1 text-xs text-slate-500">
            游戏账单
            <n-tooltip trigger="hover">
              <template #trigger>
                <span class="cursor-help text-slate-400">ⓘ</span>
              </template>
              各厂商游戏账单 U 合计
            </n-tooltip>
          </div>
          <div class="text-base font-semibold tabular-nums text-slate-900">
            {{ fmtMoney(summary.gameBillUsdt) }}
          </div>
        </div>
        <div class="min-w-[128px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="flex items-center gap-1 text-xs text-slate-500">
            CDN流量费
            <n-tooltip trigger="hover">
              <template #trigger>
                <span class="cursor-help text-slate-400">ⓘ</span>
              </template>
              当月 CDN 流量费用(BRL)
            </n-tooltip>
          </div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.cdnTrafficFeeUsdt) }}
          </div>
          <div class="text-[11px] leading-tight text-slate-400">
            封顶规则本月已为您节约 {{ fmtMoney(summary.cdnCapSavedUsdt) }}
          </div>
        </div>
        <div class="min-w-[128px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="flex items-center gap-1 text-xs text-slate-500">
            线路维护费
            <n-tooltip trigger="hover">
              <template #trigger>
                <span class="cursor-help text-slate-400">ⓘ</span>
              </template>
              固定线路 / 运维类费用(BRL)
            </n-tooltip>
          </div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.lineMaintenanceFeeUsdt) }}
          </div>
        </div>
        <div class="min-w-[120px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">其他费用</div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.otherFeesUsdt) }}
          </div>
        </div>
        <div class="min-w-[120px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">费用调整</div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.feeAdjustmentUsdt) }}
          </div>
        </div>
        <div class="min-w-[120px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">账单合计</div>
          <div class="text-base font-semibold tabular-nums text-blue-700">
            {{ fmtMoney(summary.billTotalUsdt) }}
          </div>
        </div>
        <div class="min-w-[140px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">推荐折扣</div>
          <div class="text-base font-semibold tabular-nums">
            {{ fmtMoney(summary.referralDiscountUsdt) }}
            <span class="text-xs font-normal text-slate-500">
              ({{ fmtPctFromDecimal(summary.referralDiscountPct) }})
            </span>
          </div>
        </div>
        <div class="min-w-[160px] flex-1 rounded border border-white bg-white p-2 shadow-sm">
          <div class="text-xs text-slate-500">实际需支付总额U</div>
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
            placeholder="品牌ID"
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
            placeholder="币种"
            clearable
            :options="currencyOptions"
            style="width: 120px"
            size="small"
          />
          <n-select
            v-model:value="filterGameType"
            placeholder="游戏类型"
            clearable
            :options="gameTypeOptions"
            style="width: 120px"
            size="small"
          />
          <n-select
            v-model:value="filterVendor"
            placeholder="游戏厂商"
            clearable
            :options="vendorOptions"
            style="width: 160px"
            size="small"
          />
          <n-button type="primary" size="small" @click="message.success('已应用筛选')">
            搜索
          </n-button>
          <n-button size="small" @click="resetFilters">重置</n-button>
        </n-space>
        <n-space size="small">
          <span class="text-xs text-slate-500">
            站点余额(BRL):
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
            @click="message.info('导出报表：待对接后端导出接口')"
          >
            导出报表
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
        站长备注：{{ detail.financeRemark }}
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
