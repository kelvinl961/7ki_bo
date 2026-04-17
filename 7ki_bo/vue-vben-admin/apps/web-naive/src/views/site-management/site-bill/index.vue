<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NFormItem,
  NGrid,
  NGi,
  NInputNumber,
  NModal,
  NEmpty,
  NCheckbox,
  NCheckboxGroup,
  NSelect,
  NSpace,
  NTag,
  NText,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { SettingsOutline } from '@vicons/ionicons5';
import { useUserStore } from '@vben/stores';
import SiteBillDetailPanel from './SiteBillDetailPanel.vue';
import {
  confirmSiteBillPaymentApi,
  confirmSiteBillVerifiedApi,
  getExchangeRatesApi,
  getGameVendorCommissionsApi,
  getSiteBalanceUsdtApi,
  getSiteBillListApi,
  putGameVendorCommissionsApi,
  rebuildSiteBillFromBetlogApi,
  recalculateSiteBillCommissionsApi,
  type ExchangeRateRow,
  type SiteBillListItem,
  type SiteBillStatus,
  type SiteBillType,
} from '#/api/core/site-bill';
import {
  getEnabledGamePlatforms,
  type GamePlatformRecord,
} from '#/api/game/gamePlatform';

const message = useMessage();
const dialog = useDialog();
const router = useRouter();
const userStore = useUserStore();

const currentRole = computed(() => {
  const roles = (userStore.userInfo as any)?.roles || [];
  return String(roles?.[0] || '').toUpperCase();
});

/** 全局抽佣配置、按配置重算账单：与列表权限一致（超管 / 管理员 / 财务） */
const canEditGlobalCommission = computed(() =>
  ['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(currentRole.value),
);

/** 站点账单页「全局厂商抽佣」入口；关闭后仅保留 API/DB 配置与「重算佣金」 */
const showGlobalCommissionSettingsButton = false;

const COLUMN_STORAGE_KEY = 'site-bill-table-columns-v1';

const billTypeOptions = [
  { label: '每月账单', value: 'monthly' as SiteBillType },
  { label: '一次性费用', value: 'one_time' as SiteBillType },
];

const statusOptions: { label: string; value: SiteBillStatus }[] = [
  { label: '待下发', value: 'pending_issue' },
  { label: '待核对', value: 'pending_verify' },
  { label: '待支付', value: 'pending_payment' },
  { label: '存在异议', value: 'disputed' },
  { label: '已逾期', value: 'overdue' },
  { label: '已支付', value: 'paid' },
  { label: '已坏账', value: 'bad_debt' },
];

const STATUS_META: Record<
  SiteBillStatus,
  { label: string; type: 'default' | 'info' | 'success' | 'warning' | 'error' }
> = {
  pending_issue: { label: '待下发', type: 'default' },
  pending_verify: { label: '待核对', type: 'info' },
  pending_payment: { label: '待支付', type: 'warning' },
  disputed: { label: '存在异议', type: 'default' },
  overdue: { label: '已逾期', type: 'error' },
  paid: { label: '已支付', type: 'success' },
  bad_debt: { label: '已坏账', type: 'error' },
};

/** 可配置列（key 用于显示与持久化） */
const ALL_COLUMN_KEYS = [
  { key: 'brandId', label: '品牌名称(ID)' },
  { key: 'groupName', label: '所属集团' },
  { key: 'companyName', label: '所属公司' },
  { key: 'billMonth', label: '账单月份' },
  { key: 'sameBrandMonth', label: '同品牌月份' },
  { key: 'billType', label: '账单类型' },
  { key: 'feeDetail', label: '费用明细' },
  { key: 'actualPayUsdt', label: '实际支付总额U' },
  { key: 'lateFeeUsdt', label: '滞纳金' },
  { key: 'thirdPartyFixedDiscountPct', label: '三方固定优惠' },
  { key: 'thirdPartyTierDiscountPct', label: '本月三方阶梯优惠' },
  { key: 'thirdPartyEffectiveDiscountPct', label: '本月三方生效优惠' },
  { key: 'promoDiscount', label: '推广折扣' },
  { key: 'status', label: '账单状态' },
  { key: 'stationMasterRemark', label: '站长备注' },
  { key: 'operatedAt', label: '操作时间' },
  { key: 'operatorName', label: '操作人' },
] as const;

type ColumnKey = (typeof ALL_COLUMN_KEYS)[number]['key'];

function loadColumnVisibility(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      const next: Record<string, boolean> = {};
      for (const { key } of ALL_COLUMN_KEYS) {
        next[key] = parsed[key] !== false;
      }
      return next;
    }
  } catch {
    /* ignore */
  }
  const def: Record<string, boolean> = {};
  for (const { key } of ALL_COLUMN_KEYS) def[key] = true;
  return def;
}

const visibleColumnKeys = ref<ColumnKey[]>(
  ALL_COLUMN_KEYS.filter((c) => loadColumnVisibility()[c.key]).map((c) => c.key),
);

const columnVisibility = computed(() => {
  const set = new Set(visibleColumnKeys.value);
  const m: Record<string, boolean> = {};
  for (const { key } of ALL_COLUMN_KEYS) m[key] = set.has(key);
  return m;
});

const filterForm = reactive({
  billMonth: null as string | null,
  sameBrandMonth: null as string | null,
  billType: 'monthly' as SiteBillType,
  status: null as SiteBillStatus | null,
});

const loading = ref(false);
const tableData = ref<SiteBillListItem[]>([]);

const tablePagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50] as const,
  onUpdatePage: (p: number) => {
    tablePagination.page = p;
    void loadTable();
  },
  onUpdatePageSize: (ps: number) => {
    tablePagination.pageSize = ps;
    tablePagination.page = 1;
    void loadTable();
  },
});

const showRateModal = ref(false);
const rateRows = ref<ExchangeRateRow[]>([]);
const rateLoading = ref(false);

const showColumnModal = ref(false);
const columnDraft = ref<ColumnKey[]>([]);

const payModal = ref(false);
const payTarget = ref<null | SiteBillListItem>(null);
const payBalance = ref(0);
const payBalanceLoading = ref(false);

const detailModalShow = ref(false);
const detailBillId = ref('');
const detailReloadKey = ref(0);

const showCommissionModal = ref(false);
const commissionLoadLoading = ref(false);
const commissionSaving = ref(false);
const recalcLoadingId = ref<string | null>(null);
const rebuildBetlogLoadingId = ref<string | null>(null);

type CommissionDraftRow = {
  /** 与游戏平台「平台名称」一致，写入 site_game_vendor_commissions.game_vendor */
  gameVendor: string;
  gameType: string;
  ratePercent: number;
  platformId: string;
};

const commissionDraft = ref<CommissionDraftRow[]>([]);

/** 随视口变化，让抽佣表在大弹窗内尽量占满中间区域 */
const commissionTableMaxHeight = computed(() => {
  if (typeof window === 'undefined') return 520;
  return Math.max(280, Math.round(window.innerHeight * 0.88 - 260));
});

const DEFAULT_COMMISSION_DECIMAL = 0.06;

function lookupSavedCommission(
  saved: Map<string, number>,
  vendor: string,
  gameType: string,
): number {
  const v = vendor.trim();
  const t = (gameType || '').trim();
  const exact = saved.get(`${v}\t${t}`);
  if (exact !== undefined) return exact;
  const vendorOnly = saved.get(`${v}\t`);
  if (vendorOnly !== undefined) return vendorOnly;
  return DEFAULT_COMMISSION_DECIMAL;
}

function rateFromSavedRows(
  savedByPlatformId: Map<string, number>,
  savedByVendorType: Map<string, number>,
  platformId: string,
  vendor: string,
  gameType: string,
): number {
  const pid = platformId.trim();
  if (pid && savedByPlatformId.has(pid)) {
    return savedByPlatformId.get(pid)!;
  }
  return lookupSavedCommission(savedByVendorType, vendor, gameType);
}

async function openCommissionModal() {
  showCommissionModal.value = true;
  commissionDraft.value = [];
  commissionLoadLoading.value = true;
  try {
    const [platformsRaw, savedRows] = await Promise.all([
      getEnabledGamePlatforms(),
      getGameVendorCommissionsApi(),
    ]);

    let platforms: GamePlatformRecord[] = [];
    const pr = platformsRaw as unknown;
    if (Array.isArray(pr)) {
      platforms = pr as GamePlatformRecord[];
    } else if (
      pr &&
      typeof pr === 'object' &&
      Array.isArray((pr as { data?: unknown }).data)
    ) {
      platforms = (pr as { data: GamePlatformRecord[] }).data;
    }

    const savedByVendorType = new Map<string, number>();
    const savedByPlatformId = new Map<string, number>();
    for (const r of savedRows) {
      const key = `${r.gameVendor.trim()}\t${(r.gameType || '').trim()}`;
      savedByVendorType.set(key, r.commissionRate);
      const pid = String(r.platformId || '').trim();
      if (pid) savedByPlatformId.set(pid, r.commissionRate);
    }

    const seen = new Set<string>();
    const draft: CommissionDraftRow[] = [];

    for (const p of platforms) {
      const gv = String(p.platformName || '').trim();
      const gt = String(p.gameType || '').trim();
      if (!gv) continue;
      const key = `${gv}\t${gt}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const platformIdStr = String(p.platformId || '').trim();
      const dec = rateFromSavedRows(
        savedByPlatformId,
        savedByVendorType,
        platformIdStr,
        gv,
        gt,
      );
      draft.push({
        gameVendor: gv,
        gameType: gt,
        ratePercent: dec * 100,
        platformId: String(p.platformId || ''),
      });
    }

    // Keep API order (game type category → sortOrder → name); do not re-sort by vendor.
    commissionDraft.value = draft;
  } catch (e: any) {
    message.error(e?.message || '加载失败');
    commissionDraft.value = [];
  } finally {
    commissionLoadLoading.value = false;
  }
}

async function saveGlobalCommission() {
  const items = commissionDraft.value
    .map((r) => ({
      platformId: (r.platformId || '').trim(),
      gameVendor: r.gameVendor.trim(),
      gameType: (r.gameType || '').trim(),
      commissionRate: Math.min(1, Math.max(0, r.ratePercent / 100)),
    }))
    .filter((r) => r.gameVendor.length > 0);

  if (items.length === 0) {
    message.warning('当前没有启用中的游戏平台，请先在游戏平台管理中启用平台');
    return;
  }

  commissionSaving.value = true;
  try {
    await putGameVendorCommissionsApi(items, { replaceAll: true });
    message.success('已保存全局抽佣配置');
    showCommissionModal.value = false;
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  } finally {
    commissionSaving.value = false;
  }
}

async function recalcBillCommissions(row: SiteBillListItem) {
  recalcLoadingId.value = row.id;
  try {
    await recalculateSiteBillCommissionsApi(row.id);
    message.success('已按全局配置重算该账单佣金');
    void loadTable();
  } catch (e: any) {
    message.error(e?.message || '重算失败');
  } finally {
    recalcLoadingId.value = null;
  }
}

function rebuildBillFromBetlog(row: SiteBillListItem) {
  dialog.warning({
    title: '从 betlog 重建游戏明细',
    content:
      '将删除当前游戏类明细行，并按账单月份从投注库 BetTransactionDaily 汇总后重写；CDN/线路等费用保留，应付总额（含游戏部分）会重算。已支付/坏账账单不可操作。',
    positiveText: '重建',
    negativeText: '取消',
    onPositiveClick: () => {
      rebuildBetlogLoadingId.value = row.id;
      return rebuildSiteBillFromBetlogApi(row.id)
        .then((r) => {
          message.success(
            `已写入 ${r.lineCount} 行，游戏账单 U 约 ${r.gameBillUsdt.toFixed(2)}`,
          );
          void loadTable();
          if (detailModalShow.value && detailBillId.value === row.id) {
            detailReloadKey.value += 1;
          }
          return true;
        })
        .catch((e: any) => {
          message.error(e?.message || '重建失败');
          return false;
        })
        .finally(() => {
          rebuildBetlogLoadingId.value = null;
        });
    },
  });
}

const commissionTableColumns = computed<DataTableColumns<CommissionDraftRow>>(() => {
  void commissionDraft.value.length;
  return [
    {
      title: '平台 ID',
      key: 'platformId',
      width: 120,
      ellipsis: { tooltip: true },
      render: (row) =>
        h('span', { class: 'text-xs text-slate-600' }, row.platformId || '—'),
    },
    {
      title: '平台名称（写入账单匹配）',
      key: 'gameVendor',
      minWidth: 140,
      ellipsis: { tooltip: true },
      render: (row) => h('span', { class: 'text-sm' }, row.gameVendor),
    },
    {
      title: '游戏类型',
      key: 'gameType',
      width: 100,
      render: (row) => h('span', { class: 'text-sm' }, row.gameType || '—'),
    },
    {
      title: '抽佣 %',
      key: 'ratePercent',
      width: 130,
      render: (row) =>
        h(NInputNumber, {
          value: row.ratePercent,
          min: 0,
          max: 100,
          step: 0.01,
          precision: 2,
          size: 'small',
          style: { width: '110px' },
          onUpdateValue: (v: number | null) => {
            row.ratePercent = typeof v === 'number' ? v : 0;
          },
        }),
    },
  ];
});

const payableTotal = computed(() => {
  if (!payTarget.value) return 0;
  return (
    Number(payTarget.value.actualPayUsdt || 0) +
    Number(payTarget.value.lateFeeUsdt || 0)
  );
});

const paySufficient = computed(() => payBalance.value >= payableTotal.value);

async function fetchRates() {
  rateLoading.value = true;
  try {
    rateRows.value = await getExchangeRatesApi();
  } finally {
    rateLoading.value = false;
  }
}

function openRateModal() {
  showRateModal.value = true;
  void fetchRates();
}

function openColumnModal() {
  columnDraft.value = [...visibleColumnKeys.value];
  showColumnModal.value = true;
}

function saveColumns() {
  visibleColumnKeys.value = [...columnDraft.value];
  const stored: Record<string, boolean> = {};
  for (const { key } of ALL_COLUMN_KEYS) {
    stored[key] = columnDraft.value.includes(key);
  }
  localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(stored));
  showColumnModal.value = false;
  message.success('已保存列显示');
}

function resetColumns() {
  columnDraft.value = ALL_COLUMN_KEYS.map((c) => c.key);
}

async function loadTable() {
  loading.value = true;
  try {
    const res = await getSiteBillListApi({
      billMonth: filterForm.billMonth,
      sameBrandMonth: filterForm.sameBrandMonth,
      billType: filterForm.billType,
      status: filterForm.status,
      page: tablePagination.page,
      pageSize: tablePagination.pageSize,
    });
    tableData.value = res.list;
    tablePagination.itemCount = res.total;
  } catch (e: any) {
    message.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function search() {
  tablePagination.page = 1;
  void loadTable();
}

function resetFilter() {
  filterForm.billMonth = null;
  filterForm.sameBrandMonth = null;
  filterForm.billType = 'monthly';
  filterForm.status = null;
  tablePagination.page = 1;
  void loadTable();
}

/** 切换账单类型时重新搜索（两种类型不可同窗，仅能通过筛选切换数据集） */
watch(
  () => filterForm.billType,
  () => {
    tablePagination.page = 1;
    void loadTable();
  },
);

async function openPayModal(row: SiteBillListItem) {
  payTarget.value = row;
  payModal.value = true;
  payBalanceLoading.value = true;
  try {
    payBalance.value = await getSiteBalanceUsdtApi(row.mainSiteId || row.id);
  } finally {
    payBalanceLoading.value = false;
  }
}

async function refreshPayBalance() {
  if (!payTarget.value) return;
  payBalanceLoading.value = true;
  try {
    payBalance.value = await getSiteBalanceUsdtApi(
      payTarget.value.mainSiteId || payTarget.value.id,
    );
    message.success('余额已刷新');
  } finally {
    payBalanceLoading.value = false;
  }
}

function goRecharge() {
  payModal.value = false;
  router.push({ path: '/finance/online-recharge' });
}

async function submitPay() {
  if (!payTarget.value || !paySufficient.value) {
    message.warning('主站余额不足，请先充值');
    goRecharge();
    return;
  }
  try {
    await confirmSiteBillPaymentApi(payTarget.value.id);
    message.success('支付已提交');
    payModal.value = false;
    payTarget.value = null;
    void loadTable();
  } catch (e: any) {
    message.error(e?.message || '支付失败');
  }
}

async function confirmVerified(row: SiteBillListItem) {
  try {
    await confirmSiteBillVerifiedApi(row.id);
    message.success('已确认无误');
    void loadTable();
  } catch (e: any) {
    message.error(e?.message || '操作失败');
  }
}

function goDetail(row: SiteBillListItem) {
  detailBillId.value = row.id;
  detailModalShow.value = true;
}

function closeDetailModal() {
  detailModalShow.value = false;
  detailBillId.value = '';
}

function onDetailModalAfterLeave() {
  detailBillId.value = '';
}

const baseColumns = computed<DataTableColumns<SiteBillListItem>>(() => {
  void recalcLoadingId.value;
  const v = columnVisibility.value;
  const cols: DataTableColumns<SiteBillListItem> = [];

  if (v.brandId) {
    cols.push({
      title: '品牌名称(ID)',
      key: 'brandId',
      width: 220,
      ellipsis: { tooltip: true },
      render: (row) => `${row.brandName}（${row.brandId}）`,
    });
  }
  if (v.groupName) {
    cols.push({ title: '所属集团', key: 'groupName', width: 120 });
  }
  if (v.companyName) {
    cols.push({ title: '所属公司', key: 'companyName', width: 140, ellipsis: { tooltip: true } });
  }
  if (v.billMonth) {
    cols.push({ title: '账单月份', key: 'billMonth', width: 100 });
  }
  if (v.sameBrandMonth) {
    cols.push({
      title: '同品牌月份',
      key: 'sameBrandMonth',
      width: 110,
      render: (row) => row.sameBrandMonth || '—',
    });
  }
  if (v.billType) {
    cols.push({
      title: '账单类型',
      key: 'billType',
      width: 110,
      render: (row) => (row.billType === 'monthly' ? '每月账单' : '一次性费用'),
    });
  }
  if (v.feeDetail) {
    cols.push({ title: '费用明细', key: 'feeDetail', width: 130, ellipsis: { tooltip: true } });
  }
  if (v.actualPayUsdt) {
    cols.push({
      title: '实际支付总额U',
      key: 'actualPayUsdt',
      width: 130,
      render: (row) =>
        row.actualPayUsdt.toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    });
  }
  if (v.lateFeeUsdt) {
    cols.push({
      title: '滞纳金',
      key: 'lateFeeUsdt',
      width: 100,
      render: (row) =>
        row.lateFeeUsdt.toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    });
  }
  if (v.thirdPartyFixedDiscountPct) {
    cols.push({
      title: '三方固定优惠',
      key: 'thirdPartyFixedDiscountPct',
      width: 120,
      render: (row) => `${row.thirdPartyFixedDiscountPct.toFixed(2)}%`,
    });
  }
  if (v.thirdPartyTierDiscountPct) {
    cols.push({
      title: '本月三方阶梯优惠',
      key: 'thirdPartyTierDiscountPct',
      width: 150,
      render: (row) => `${row.thirdPartyTierDiscountPct.toFixed(2)}%`,
    });
  }
  if (v.thirdPartyEffectiveDiscountPct) {
    cols.push({
      title: '本月三方生效优惠',
      key: 'thirdPartyEffectiveDiscountPct',
      width: 150,
      render: (row) => `${row.thirdPartyEffectiveDiscountPct.toFixed(2)}%`,
    });
  }
  if (v.promoDiscount) {
    cols.push({
      title: '推广折扣',
      key: 'promoDiscount',
      width: 100,
      render: (row) => String(row.promoDiscount),
    });
  }
  if (v.status) {
    cols.push({
      title: '账单状态',
      key: 'status',
      width: 100,
      render: (row) => {
        const m = STATUS_META[row.status];
        return h(NTag, { type: m.type, size: 'small' }, { default: () => m.label });
      },
    });
  }
  if (v.stationMasterRemark) {
    cols.push({
      title: '站长备注',
      key: 'stationMasterRemark',
      width: 140,
      ellipsis: { tooltip: true },
    });
  }
  if (v.operatedAt) {
    cols.push({ title: '操作时间', key: 'operatedAt', width: 160, render: (row) => row.operatedAt || '—' });
  }
  if (v.operatorName) {
    cols.push({ title: '操作人', key: 'operatorName', width: 100, render: (row) => row.operatorName || '—' });
  }

  cols.push({
    title: '操作',
    key: 'actions',
    width: canEditGlobalCommission.value ? 340 : 180,
    fixed: 'right',
    render: (row) => {
      const nodes = [
        h(
          NButton,
          { size: 'tiny', type: 'primary', quaternary: true, onClick: () => goDetail(row) },
          { default: () => '详情' },
        ),
      ];
      if (canEditGlobalCommission.value && row.billType === 'monthly') {
        nodes.push(
          h(
            NButton,
            {
              size: 'tiny',
              type: 'default',
              quaternary: true,
              loading: recalcLoadingId.value === row.id,
              onClick: () => void recalcBillCommissions(row),
            },
            { default: () => '重算佣金' },
          ),
        );
      }
      if (row.status === 'pending_verify') {
        nodes.push(
          h(
            NButton,
            {
              size: 'tiny',
              type: 'info',
              quaternary: true,
              onClick: () => void confirmVerified(row),
            },
            { default: () => '确认无误' },
          ),
        );
      }
      if (row.status === 'pending_payment') {
        nodes.push(
          h(
            NButton,
            {
              size: 'tiny',
              type: 'warning',
              quaternary: true,
              onClick: () => void openPayModal(row),
            },
            { default: () => '支付' },
          ),
        );
      }
      return h(NSpace, { size: 'small', wrap: false }, () => nodes);
    },
  });

  return cols;
});

onMounted(() => {
  void loadTable();
});
</script>

<template>
  <Page title="站点账单">
    <div class="flex flex-col gap-4">
      <n-card size="small">
        <n-grid :cols="24" :x-gap="12" :y-gap="12" responsive="screen">
          <n-gi :span="24" class="mb-1">
            <n-text depth="3" class="text-sm">
              每月账单与一次性费用须分别筛选查看，不可在同一列表混显。
            </n-text>
          </n-gi>
          <n-gi :span="6">
            <n-form-item label="账单月份" label-placement="left" :show-feedback="false">
              <n-date-picker
                v-model:formatted-value="filterForm.billMonth"
                type="month"
                clearable
                value-format="yyyy-MM"
                placeholder="选择月份"
                class="w-full"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="6">
            <n-form-item label="同品牌月份" label-placement="left" :show-feedback="false">
              <n-date-picker
                v-model:formatted-value="filterForm.sameBrandMonth"
                type="month"
                clearable
                value-format="yyyy-MM"
                placeholder="可选"
                class="w-full"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="5">
            <n-form-item label="账单类型" label-placement="left" :show-feedback="false">
              <n-select
                v-model:value="filterForm.billType"
                :options="billTypeOptions"
                placeholder="账单类型"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="5">
            <n-form-item label="账单状态" label-placement="left" :show-feedback="false">
              <n-select
                v-model:value="filterForm.status"
                :options="statusOptions"
                placeholder="全部状态"
                clearable
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="24" class="flex flex-wrap items-center gap-2">
            <n-button type="primary" @click="search">搜索</n-button>
            <n-button @click="resetFilter">重置</n-button>
            <n-button type="info" secondary @click="openRateModal">查看汇率</n-button>
            <n-button
              v-if="canEditGlobalCommission && showGlobalCommissionSettingsButton"
              type="warning"
              secondary
              @click="openCommissionModal"
            >
              全局厂商抽佣
            </n-button>
            <n-button @click="message.info('导出报表：待对接后端')">导出报表</n-button>
            <n-button quaternary @click="openColumnModal">
              <template #icon>
                <SettingsOutline />
              </template>
              自定义列
            </n-button>
          </n-gi>
        </n-grid>
      </n-card>

      <n-card size="small" class="min-h-[400px]">
        <n-data-table
          :columns="baseColumns"
          :data="tableData"
          :loading="loading"
          :bordered="true"
          :single-line="false"
          size="small"
          scroll-x="1600"
          :pagination="tablePagination"
          :remote="true"
        />
      </n-card>

      <n-card title="账单规则说明" size="small" class="bg-slate-50">
        <ol class="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            每月账单「详情」中的游戏类明细由接口按 BetTransactionDaily 实时汇总（bill_month 内 YYYY-MM 自然月）；「Betlog汇总」将同一口径写入 billing 表并刷新列表应付金额。币种 BRL，抽佣按库表 site_game_vendor_commissions，未命中时默认 6%（HG_ 会再匹配去前缀）。可选 SITE_BILL_BETLOG_TIMEZONE 限制日报时区。
          </li>
          <li>
            账单结算需保证站点余额充足；支付前请确认「站点余额」与「实际支付总额（含滞纳金）」。
          </li>
          <li>
            待下发：本月或上月账单在次月 6 日 00:00:00 前为待下发；6 日后自动进入待核对。站点确认无误后进入待支付；亦可由系统在 15 天后自动变为待支付。
          </li>
          <li>
            待支付：余额充足时可支付；不足时请先充值。30 天后可自动进入已逾期。存在异议由财务手动调整，沟通后可重新下发或改为待支付。
          </li>
          <li>
            滞纳金（V6.5）：当月账单超过次月月底视为逾期，逾期每多 1 天按账单总额加收 0.05%/天，上不封顶。已逾期不享受优惠。
          </li>
        </ol>
      </n-card>
    </div>

    <!-- 全局厂商抽佣（与详情弹窗分离） -->
    <n-modal
      v-model:show="showCommissionModal"
      preset="card"
      title="全局厂商抽佣配置"
      class="site-bill-commission-modal"
      style="width: 92vw; height: 88vh; margin: 0 auto"
      :mask-closable="false"
    >
      <n-spin :show="commissionLoadLoading">
        <p class="mb-3 text-xs text-slate-500">
          表格行自动来自已启用的游戏平台；「平台名称 + 游戏类型」与账单明细一致，仅可改抽佣比例。保存为全量替换库表
          <code class="rounded bg-slate-100 px-1">site_game_vendor_commissions</code>
          。未单独配置过的平台默认 6%；若曾保存过「仅厂商、类型留空」的规则，会作为该厂商的兜底比例。
        </p>
        <n-empty
          v-if="!commissionLoadLoading && commissionDraft.length === 0"
          description="当前没有启用中的游戏平台，请先在游戏平台管理中启用。"
          class="py-8"
        />
        <n-data-table
          v-else-if="commissionDraft.length > 0"
          :columns="commissionTableColumns"
          :data="commissionDraft"
          size="small"
          :bordered="true"
          :max-height="commissionTableMaxHeight"
        />
      </n-spin>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCommissionModal = false">取消</n-button>
          <n-button
            type="primary"
            :loading="commissionSaving"
            :disabled="commissionLoadLoading || commissionDraft.length === 0"
            @click="saveGlobalCommission"
          >
            保存（全量替换）
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 账单详情（弹窗，不新开标签页） -->
    <n-modal
      v-model:show="detailModalShow"
      preset="card"
      title="详情"
      class="site-bill-detail-modal"
      style="margin: 0 auto"
      :mask-closable="true"
      @after-leave="onDetailModalAfterLeave"
    >
      <SiteBillDetailPanel
        v-if="detailBillId"
        :key="detailReloadKey"
        :bill-id="detailBillId"
      />
      <template #footer>
        <n-button @click="closeDetailModal">取消</n-button>
      </template>
    </n-modal>

    <!-- 汇率 -->
    <n-modal
      v-model:show="showRateModal"
      preset="card"
      title="查看汇率"
      style="width: 560px"
      :bordered="false"
      size="huge"
    >
      <n-spin :show="rateLoading">
        <n-data-table
          :columns="[
            { title: '基础币种', key: 'base', width: 100, render: () => 'USDT' },
            { title: '兑换币种', key: 'quoteCurrency', render: (r: ExchangeRateRow) => r.quoteCurrency },
            {
              title: '站点汇率',
              key: 'rate',
              render: (r: ExchangeRateRow) =>
                r.rate.toLocaleString('zh-CN', { maximumFractionDigits: 8 }),
            },
          ]"
          :data="rateRows"
          size="small"
          :max-height="360"
          :bordered="true"
        />
      </n-spin>
      <template #footer>
        <n-button type="primary" @click="showRateModal = false">关闭</n-button>
      </template>
    </n-modal>

    <!-- 自定义列 -->
    <n-modal
      v-model:show="showColumnModal"
      preset="card"
      title="自定义列"
      style="width: 480px"
    >
      <n-checkbox-group v-model:value="columnDraft">
        <div class="grid grid-cols-2 gap-2">
          <n-checkbox
            v-for="c in ALL_COLUMN_KEYS"
            :key="c.key"
            :value="c.key"
            :label="c.label"
          />
        </div>
      </n-checkbox-group>
      <template #footer>
        <n-space justify="end">
          <n-button @click="resetColumns">重置</n-button>
          <n-button @click="showColumnModal = false">取消</n-button>
          <n-button type="primary" @click="saveColumns">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 支付 -->
    <n-modal
      v-model:show="payModal"
      preset="card"
      title="支付"
      style="width: 520px"
      :mask-closable="false"
    >
      <div v-if="payTarget" class="space-y-3 text-sm">
        <div class="grid grid-cols-[100px_1fr] gap-y-2">
          <span class="text-slate-500">所属集团</span>
          <span>{{ payTarget.groupName }}</span>
          <span class="text-slate-500">所属公司</span>
          <span>{{ payTarget.companyName }}</span>
          <span class="text-slate-500">品牌名称</span>
          <span>{{ payTarget.brandName }}</span>
          <span class="text-slate-500">账单月份</span>
          <span>{{ payTarget.billMonth }}</span>
          <span class="text-slate-500">币种</span>
          <span class="break-all text-xs leading-relaxed">{{ payTarget.currenciesText || '—' }}</span>
          <span class="text-slate-500">站点余额</span>
          <span class="flex items-center gap-2">
            <span class="tabular-nums font-semibold">
              {{ payBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
            <n-button size="tiny" :loading="payBalanceLoading" @click="refreshPayBalance">
              刷新
            </n-button>
            <n-button size="tiny" type="primary" quaternary @click="goRecharge">充币</n-button>
          </span>
          <span class="text-slate-500">滞纳金</span>
          <span class="tabular-nums">
            {{ payTarget.lateFeeUsdt.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
          <span class="text-slate-500">实际支付总额(BRL)</span>
          <span class="text-base font-bold tabular-nums text-blue-600">
            {{ payableTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
        </div>
        <n-text v-if="!paySufficient" type="error">
          主站余额不足，请先充值
        </n-text>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="payModal = false">取消</n-button>
          <n-button
            type="primary"
            :disabled="!paySufficient"
            @click="submitPay"
          >
            确认支付
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </Page>
</template>

<style scoped>
/* 抽佣弹窗：卡片随内容，由外层 modal scrollbar 承载 */
.site-bill-commission-modal :deep(.n-card) {
  display: flex;
  flex-direction: column;
  max-height: inherit;
  height: 100%;
}

.site-bill-commission-modal :deep(.n-card__content) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/*
 * 详情弹窗：不要用 height:100%，否则在 Naive 的 modal 外层 NScrollbar 里卡片会被撑到「整份内容高度」，
 * footer 落在视口外，看起来像取消在弹窗外。固定 92vh + overflow hidden，由 card 内 content 滚动。
 */
.site-bill-detail-modal :deep(.n-card.n-modal) {
  display: flex;
  flex-direction: column;
  width: 96vw;
  max-width: 96vw;
  height: 92vh;
  max-height: 92vh;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.site-bill-detail-modal :deep(.n-card__content) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.site-bill-detail-modal :deep(.n-card__footer) {
  flex-shrink: 0;
  border-top: 1px solid var(--n-border-color);
}
</style>
