<script setup lang="ts">
import { $t } from '@vben/locales';

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

const COLUMN_KEYS = [
  'brandId',
  'groupName',
  'companyName',
  'billMonth',
  'sameBrandMonth',
  'billType',
  'feeDetail',
  'actualPayUsdt',
  'lateFeeUsdt',
  'thirdPartyFixedDiscountPct',
  'thirdPartyTierDiscountPct',
  'thirdPartyEffectiveDiscountPct',
  'promoDiscount',
  'status',
  'stationMasterRemark',
  'operatedAt',
  'operatorName',
] as const;

type ColumnKey = (typeof COLUMN_KEYS)[number];

const allColumnKeys = computed(() => [
  { key: 'brandId' as const, label: $t('system.siteBill.brandNameId') },
  { key: 'groupName' as const, label: $t('system.siteBill.groupName') },
  { key: 'companyName' as const, label: $t('system.siteBill.companyName') },
  { key: 'billMonth' as const, label: $t('system.siteBill.billMonth') },
  { key: 'sameBrandMonth' as const, label: $t('system.siteBill.sameBrandMonth') },
  { key: 'billType' as const, label: $t('system.siteBill.billType') },
  { key: 'feeDetail' as const, label: $t('system.siteBill.feeDetail') },
  { key: 'actualPayUsdt' as const, label: $t('system.siteBill.actualPayUsdt') },
  { key: 'lateFeeUsdt' as const, label: $t('system.siteBill.lateFee') },
  { key: 'thirdPartyFixedDiscountPct' as const, label: $t('system.siteBill.thirdPartyFixedDiscount') },
  { key: 'thirdPartyTierDiscountPct' as const, label: $t('system.siteBill.thirdPartyTierDiscount') },
  { key: 'thirdPartyEffectiveDiscountPct' as const, label: $t('system.siteBill.thirdPartyEffectiveDiscount') },
  { key: 'promoDiscount' as const, label: $t('system.siteBill.promoDiscount') },
  { key: 'status' as const, label: $t('system.siteBill.billStatus') },
  { key: 'stationMasterRemark' as const, label: $t('system.siteBill.stationMasterRemarkCol') },
  { key: 'operatedAt' as const, label: $t('common.operationTime') },
  { key: 'operatorName' as const, label: $t('common.operator') },
]);

const billTypeOptions = computed(() => [
  { label: $t('system.siteBill.monthlyBill'), value: 'monthly' as SiteBillType },
  { label: $t('system.siteBill.oneTimeFee'), value: 'one_time' as SiteBillType },
]);

const statusOptions = computed<{ label: string; value: SiteBillStatus }[]>(() => [
  { label: $t('system.siteBill.statusPendingIssue'), value: 'pending_issue' },
  { label: $t('system.siteBill.statusPendingVerify'), value: 'pending_verify' },
  { label: $t('system.siteBill.statusPendingPayment'), value: 'pending_payment' },
  { label: $t('system.siteBill.statusDisputed'), value: 'disputed' },
  { label: $t('system.siteBill.statusOverdue'), value: 'overdue' },
  { label: $t('system.siteBill.statusPaid'), value: 'paid' },
  { label: $t('system.siteBill.statusBadDebt'), value: 'bad_debt' },
]);

const STATUS_META = computed<
  Record<
    SiteBillStatus,
    { label: string; type: 'default' | 'info' | 'success' | 'warning' | 'error' }
  >
>(() => ({
  pending_issue: { label: $t('system.siteBill.statusPendingIssue'), type: 'default' },
  pending_verify: { label: $t('system.siteBill.statusPendingVerify'), type: 'info' },
  pending_payment: { label: $t('system.siteBill.statusPendingPayment'), type: 'warning' },
  disputed: { label: $t('system.siteBill.statusDisputed'), type: 'default' },
  overdue: { label: $t('system.siteBill.statusOverdue'), type: 'error' },
  paid: { label: $t('system.siteBill.statusPaid'), type: 'success' },
  bad_debt: { label: $t('system.siteBill.statusBadDebt'), type: 'error' },
}));

function loadColumnVisibility(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      const next: Record<string, boolean> = {};
      for (const key of COLUMN_KEYS) {
        next[key] = parsed[key] !== false;
      }
      return next;
    }
  } catch {
    /* ignore */
  }
  const def: Record<string, boolean> = {};
  for (const key of COLUMN_KEYS) def[key] = true;
  return def;
}

const visibleColumnKeys = ref<ColumnKey[]>(
  COLUMN_KEYS.filter((c) => loadColumnVisibility()[c]),
);

const columnVisibility = computed(() => {
  const set = new Set(visibleColumnKeys.value);
  const m: Record<string, boolean> = {};
  for (const key of COLUMN_KEYS) m[key] = set.has(key);
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
    message.error(e?.message || $t('system.siteBill.loadFailed'));
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
    message.warning($t('system.siteBill.noPlatformsWarning'));
    return;
  }

  commissionSaving.value = true;
  try {
    await putGameVendorCommissionsApi(items, { replaceAll: true });
    message.success($t('system.siteBill.globalCommissionSaved'));
    showCommissionModal.value = false;
  } catch (e: any) {
    message.error(e?.message || $t('system.siteBill.saveFailed'));
  } finally {
    commissionSaving.value = false;
  }
}

async function recalcBillCommissions(row: SiteBillListItem) {
  recalcLoadingId.value = row.id;
  try {
    await recalculateSiteBillCommissionsApi(row.id);
    message.success($t('system.siteBill.recalcSuccess'));
    void loadTable();
  } catch (e: any) {
    message.error(e?.message || $t('system.siteBill.recalcFailed'));
  } finally {
    recalcLoadingId.value = null;
  }
}

function rebuildBillFromBetlog(row: SiteBillListItem) {
  dialog.warning({
    title: $t('system.siteBill.rebuildTitle'),
    content: $t('system.siteBill.rebuildContent'),
    positiveText: $t('system.siteBill.rebuild'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      rebuildBetlogLoadingId.value = row.id;
      return rebuildSiteBillFromBetlogApi(row.id)
        .then((r) => {
          message.success(
            $t('system.siteBill.rebuildSuccess', [
              r.lineCount,
              r.gameBillUsdt.toFixed(2),
            ]),
          );
          void loadTable();
          if (detailModalShow.value && detailBillId.value === row.id) {
            detailReloadKey.value += 1;
          }
          return true;
        })
        .catch((e: any) => {
          message.error(e?.message || $t('system.siteBill.rebuildFailed'));
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
      title: $t('system.siteBill.platformId'),
      key: 'platformId',
      width: 120,
      ellipsis: { tooltip: true },
      render: (row) =>
        h('span', { class: 'text-xs text-slate-600' }, row.platformId || '—'),
    },
    {
      title: $t('system.siteBill.platformNameForBill'),
      key: 'gameVendor',
      minWidth: 140,
      ellipsis: { tooltip: true },
      render: (row) => h('span', { class: 'text-sm' }, row.gameVendor),
    },
    {
      title: $t('system.siteBill.gameType'),
      key: 'gameType',
      width: 100,
      render: (row) => h('span', { class: 'text-sm' }, row.gameType || '—'),
    },
    {
      title: $t('system.siteBill.commissionPercent'),
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
  for (const key of COLUMN_KEYS) {
    stored[key] = columnDraft.value.includes(key);
  }
  localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(stored));
  showColumnModal.value = false;
  message.success($t('system.siteBill.columnsSaved'));
}

function resetColumns() {
  columnDraft.value = [...COLUMN_KEYS];
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
    message.error(e?.message || $t('system.siteBill.loadFailed'));
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
    message.success($t('system.siteBill.balanceRefreshed'));
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
    message.warning($t('system.siteBill.insufficientBalance'));
    goRecharge();
    return;
  }
  try {
    await confirmSiteBillPaymentApi(payTarget.value.id);
    message.success($t('system.siteBill.paymentSubmitted'));
    payModal.value = false;
    payTarget.value = null;
    void loadTable();
  } catch (e: any) {
    message.error(e?.message || $t('system.siteBill.paymentFailed'));
  }
}

async function confirmVerified(row: SiteBillListItem) {
  try {
    await confirmSiteBillVerifiedApi(row.id);
    message.success($t('system.siteBill.verifiedConfirmed'));
    void loadTable();
  } catch (e: any) {
    message.error(e?.message || $t('common.operationFailed'));
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
      title: $t('system.siteBill.brandNameId'),
      key: 'brandId',
      width: 220,
      ellipsis: { tooltip: true },
      render: (row) => `${row.brandName}（${row.brandId}）`,
    });
  }
  if (v.groupName) {
    cols.push({ title: $t('system.siteBill.groupName'), key: 'groupName', width: 120 });
  }
  if (v.companyName) {
    cols.push({ title: $t('system.siteBill.companyName'), key: 'companyName', width: 140, ellipsis: { tooltip: true } });
  }
  if (v.billMonth) {
    cols.push({ title: $t('system.siteBill.billMonth'), key: 'billMonth', width: 100 });
  }
  if (v.sameBrandMonth) {
    cols.push({
      title: $t('system.siteBill.sameBrandMonth'),
      key: 'sameBrandMonth',
      width: 110,
      render: (row) => row.sameBrandMonth || '—',
    });
  }
  if (v.billType) {
    cols.push({
      title: $t('system.siteBill.billType'),
      key: 'billType',
      width: 110,
      render: (row) =>
        row.billType === 'monthly'
          ? $t('system.siteBill.monthlyBill')
          : $t('system.siteBill.oneTimeFee'),
    });
  }
  if (v.feeDetail) {
    cols.push({ title: $t('system.siteBill.feeDetail'), key: 'feeDetail', width: 130, ellipsis: { tooltip: true } });
  }
  if (v.actualPayUsdt) {
    cols.push({
      title: $t('system.siteBill.actualPayUsdt'),
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
      title: $t('system.siteBill.lateFee'),
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
      title: $t('system.siteBill.thirdPartyFixedDiscount'),
      key: 'thirdPartyFixedDiscountPct',
      width: 120,
      render: (row) => `${row.thirdPartyFixedDiscountPct.toFixed(2)}%`,
    });
  }
  if (v.thirdPartyTierDiscountPct) {
    cols.push({
      title: $t('system.siteBill.thirdPartyTierDiscount'),
      key: 'thirdPartyTierDiscountPct',
      width: 150,
      render: (row) => `${row.thirdPartyTierDiscountPct.toFixed(2)}%`,
    });
  }
  if (v.thirdPartyEffectiveDiscountPct) {
    cols.push({
      title: $t('system.siteBill.thirdPartyEffectiveDiscount'),
      key: 'thirdPartyEffectiveDiscountPct',
      width: 150,
      render: (row) => `${row.thirdPartyEffectiveDiscountPct.toFixed(2)}%`,
    });
  }
  if (v.promoDiscount) {
    cols.push({
      title: $t('system.siteBill.promoDiscount'),
      key: 'promoDiscount',
      width: 100,
      render: (row) => String(row.promoDiscount),
    });
  }
  if (v.status) {
    cols.push({
      title: $t('system.siteBill.billStatus'),
      key: 'status',
      width: 100,
      render: (row) => {
        const m = STATUS_META.value[row.status];
        return h(NTag, { type: m.type, size: 'small' }, { default: () => m.label });
      },
    });
  }
  if (v.stationMasterRemark) {
    cols.push({
      title: $t('system.siteBill.stationMasterRemarkCol'),
      key: 'stationMasterRemark',
      width: 140,
      ellipsis: { tooltip: true },
    });
  }
  if (v.operatedAt) {
    cols.push({ title: $t('common.operationTime'), key: 'operatedAt', width: 160, render: (row) => row.operatedAt || '—' });
  }
  if (v.operatorName) {
    cols.push({ title: $t('common.operator'), key: 'operatorName', width: 100, render: (row) => row.operatorName || '—' });
  }

  cols.push({
    title: $t('common.actions'),
    key: 'actions',
    width: canEditGlobalCommission.value ? 340 : 180,
    fixed: 'right',
    render: (row) => {
      const nodes = [
        h(
          NButton,
          { size: 'tiny', type: 'primary', quaternary: true, onClick: () => goDetail(row) },
          { default: () => $t('common.detail') },
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
            { default: () => $t('system.siteBill.recalcCommission') },
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
            { default: () => $t('system.siteBill.confirmVerified') },
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
            { default: () => $t('system.siteBill.pay') },
          ),
        );
      }
      return h(NSpace, { size: 'small', wrap: false }, () => nodes);
    },
  });

  return cols;
});

const rateTableColumns = computed<DataTableColumns<ExchangeRateRow>>(() => [
  { title: $t('system.siteBill.baseCurrency'), key: 'base', width: 100, render: () => 'USDT' },
  {
    title: $t('system.siteBill.quoteCurrency'),
    key: 'quoteCurrency',
    render: (r) => r.quoteCurrency,
  },
  {
    title: $t('system.siteBill.siteRate'),
    key: 'rate',
    render: (r) =>
      r.rate.toLocaleString('zh-CN', { maximumFractionDigits: 8 }),
  },
]);

onMounted(() => {
  void loadTable();
});
</script>

<template>
  <Page :title="$t('system.siteBill.title')">
    <div class="flex flex-col gap-4">
      <n-card size="small">
        <n-grid :cols="24" :x-gap="12" :y-gap="12" responsive="screen">
          <n-gi :span="24" class="mb-1">
            <n-text depth="3" class="text-sm">
              {{ $t('system.siteBill.billTypeHint') }}
            </n-text>
          </n-gi>
          <n-gi :span="6">
            <n-form-item :label="$t('system.siteBill.billMonth')" label-placement="left" :show-feedback="false">
              <n-date-picker
                v-model:formatted-value="filterForm.billMonth"
                type="month"
                clearable
                value-format="yyyy-MM"
                :placeholder="$t('system.siteBill.selectMonth')"
                class="w-full"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="6">
            <n-form-item :label="$t('system.siteBill.sameBrandMonth')" label-placement="left" :show-feedback="false">
              <n-date-picker
                v-model:formatted-value="filterForm.sameBrandMonth"
                type="month"
                clearable
                value-format="yyyy-MM"
                :placeholder="$t('system.siteBill.optional')"
                class="w-full"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="5">
            <n-form-item :label="$t('system.siteBill.billType')" label-placement="left" :show-feedback="false">
              <n-select
                v-model:value="filterForm.billType"
                :options="billTypeOptions"
                :placeholder="$t('system.siteBill.billType')"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="5">
            <n-form-item :label="$t('system.siteBill.billStatus')" label-placement="left" :show-feedback="false">
              <n-select
                v-model:value="filterForm.status"
                :options="statusOptions"
                :placeholder="$t('system.siteBill.allStatuses')"
                clearable
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="24" class="flex flex-wrap items-center gap-2">
            <n-button type="primary" @click="search">{{ $t('common.search') }}</n-button>
            <n-button @click="resetFilter">{{ $t('common.reset') }}</n-button>
            <n-button type="info" secondary @click="openRateModal">{{ $t('system.siteBill.viewExchangeRates') }}</n-button>
            <n-button
              v-if="canEditGlobalCommission && showGlobalCommissionSettingsButton"
              type="warning"
              secondary
              @click="openCommissionModal"
            >
              {{ $t('system.siteBill.globalVendorCommission') }}
            </n-button>
            <n-button @click="message.info($t('system.siteBill.exportPending'))">{{ $t('common.exportReport') }}</n-button>
            <n-button quaternary @click="openColumnModal">
              <template #icon>
                <SettingsOutline />
              </template>
              {{ $t('system.siteBill.customColumns') }}
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

      <n-card :title="$t('system.siteBill.billRulesTitle')" size="small" class="bg-slate-50">
        <ol class="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>{{ $t('system.siteBill.rule1') }}</li>
          <li>{{ $t('system.siteBill.rule2') }}</li>
          <li>{{ $t('system.siteBill.rule3') }}</li>
          <li>{{ $t('system.siteBill.rule4') }}</li>
          <li>{{ $t('system.siteBill.rule5') }}</li>
        </ol>
      </n-card>
    </div>

    <!-- 全局厂商抽佣（与详情弹窗分离） -->
    <n-modal
      v-model:show="showCommissionModal"
      preset="card"
      :title="$t('system.siteBill.globalCommissionConfig')"
      class="site-bill-commission-modal"
      style="width: 92vw; height: 88vh; margin: 0 auto"
      :mask-closable="false"
    >
      <n-spin :show="commissionLoadLoading">
        <p class="mb-3 text-xs text-slate-500">
          {{ $t('system.siteBill.globalCommissionHint') }}
          <code class="rounded bg-slate-100 px-1">site_game_vendor_commissions</code>
        </p>
        <n-empty
          v-if="!commissionLoadLoading && commissionDraft.length === 0"
          :description="$t('system.siteBill.noEnabledPlatforms')"
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
          <n-button @click="showCommissionModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="commissionSaving"
            :disabled="commissionLoadLoading || commissionDraft.length === 0"
            @click="saveGlobalCommission"
          >
            {{ $t('system.siteBill.saveFullReplace') }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 账单详情（弹窗，不新开标签页） -->
    <n-modal
      v-model:show="detailModalShow"
      preset="card"
      :title="$t('common.detail')"
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
        <n-button @click="closeDetailModal">{{ $t('common.cancel') }}</n-button>
      </template>
    </n-modal>

    <!-- 汇率 -->
    <n-modal
      v-model:show="showRateModal"
      preset="card"
      :title="$t('system.siteBill.viewRates')"
      style="width: 560px"
      :bordered="false"
      size="huge"
    >
      <n-spin :show="rateLoading">
        <n-data-table
          :columns="rateTableColumns"
          :data="rateRows"
          size="small"
          :max-height="360"
          :bordered="true"
        />
      </n-spin>
      <template #footer>
        <n-button type="primary" @click="showRateModal = false">{{ $t('common.close') }}</n-button>
      </template>
    </n-modal>

    <!-- 自定义列 -->
    <n-modal
      v-model:show="showColumnModal"
      preset="card"
      :title="$t('system.siteBill.customColumns')"
      style="width: 480px"
    >
      <n-checkbox-group v-model:value="columnDraft">
        <div class="grid grid-cols-2 gap-2">
          <n-checkbox
            v-for="c in allColumnKeys"
            :key="c.key"
            :value="c.key"
            :label="c.label"
          />
        </div>
      </n-checkbox-group>
      <template #footer>
        <n-space justify="end">
          <n-button @click="resetColumns">{{ $t('common.reset') }}</n-button>
          <n-button @click="showColumnModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="saveColumns">{{ $t('common.save') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 支付 -->
    <n-modal
      v-model:show="payModal"
      preset="card"
      :title="$t('system.siteBill.payment')"
      style="width: 520px"
      :mask-closable="false"
    >
      <div v-if="payTarget" class="space-y-3 text-sm">
        <div class="grid grid-cols-[100px_1fr] gap-y-2">
          <span class="text-slate-500">{{ $t('system.siteBill.groupName') }}</span>
          <span>{{ payTarget.groupName }}</span>
          <span class="text-slate-500">{{ $t('system.siteBill.companyName') }}</span>
          <span>{{ payTarget.companyName }}</span>
          <span class="text-slate-500">{{ $t('system.siteBill.brandName') }}</span>
          <span>{{ payTarget.brandName }}</span>
          <span class="text-slate-500">{{ $t('system.siteBill.billMonth') }}</span>
          <span>{{ payTarget.billMonth }}</span>
          <span class="text-slate-500">{{ $t('common.currency') }}</span>
          <span class="break-all text-xs leading-relaxed">{{ payTarget.currenciesText || '—' }}</span>
          <span class="text-slate-500">{{ $t('system.siteBill.siteBalance') }}</span>
          <span class="flex items-center gap-2">
            <span class="tabular-nums font-semibold">
              {{ payBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
            <n-button size="tiny" :loading="payBalanceLoading" @click="refreshPayBalance">
              {{ $t('common.refresh') }}
            </n-button>
            <n-button size="tiny" type="primary" quaternary @click="goRecharge">{{ $t('system.siteBill.recharge') }}</n-button>
          </span>
          <span class="text-slate-500">{{ $t('system.siteBill.lateFee') }}</span>
          <span class="tabular-nums">
            {{ payTarget.lateFeeUsdt.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
          <span class="text-slate-500">{{ $t('system.siteBill.actualPayTotalBrl') }}</span>
          <span class="text-base font-bold tabular-nums text-blue-600">
            {{ payableTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
        </div>
        <n-text v-if="!paySufficient" type="error">
          {{ $t('system.siteBill.insufficientBalance') }}
        </n-text>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="payModal = false">{{ $t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :disabled="!paySufficient"
            @click="submitPay"
          >
            {{ $t('system.siteBill.confirmPayment') }}
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
