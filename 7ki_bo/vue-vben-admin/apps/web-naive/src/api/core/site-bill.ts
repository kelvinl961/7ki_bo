/**
 * 站点账单 API（相对 requestClient baseURL，一般为 …/api/ → 路径用 /site-management/*）
 */
import { requestClient } from '#/api/request';

export type SiteBillType = 'monthly' | 'one_time';

export type SiteBillStatus =
  | 'pending_issue'
  | 'pending_verify'
  | 'pending_payment'
  | 'disputed'
  | 'overdue'
  | 'paid'
  | 'bad_debt';

export interface SiteBillListItem {
  id: string;
  brandId: string;
  brandName: string;
  groupName: string;
  companyName: string;
  billMonth: string;
  /** 同品牌月份筛选用（含子品牌汇总场景） */
  sameBrandMonth?: string;
  billType: SiteBillType;
  feeDetail: string;
  actualPayUsdt: number;
  lateFeeUsdt: number;
  thirdPartyFixedDiscountPct: number;
  thirdPartyTierDiscountPct: number;
  thirdPartyEffectiveDiscountPct: number;
  promoDiscount: number;
  status: SiteBillStatus;
  stationMasterRemark: string;
  operatedAt?: string;
  operatorName?: string;
  /** 支付弹窗：站点主站展示名 */
  mainSiteName?: string;
  mainSiteId?: string;
  currenciesText?: string;
  cdnTrafficFeeUsdt?: number;
  lineMaintenanceFeeUsdt?: number;
  otherFeesUsdt?: number;
  feeAdjustmentUsdt?: number;
  referralDiscountUsdt?: number;
  referralDiscountPct?: number;
  cdnCapSavedUsdt?: number;
}

export interface SiteBillListQuery {
  billMonth?: string | null;
  sameBrandMonth?: string | null;
  billType: SiteBillType;
  status?: SiteBillStatus | null;
  page?: number;
  pageSize?: number;
}

export interface SiteBillListResponse {
  list: SiteBillListItem[];
  total: number;
}

export interface ExchangeRateRow {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
}

export interface SiteBillFeeLine {
  id: string;
  /** 行币种，空表示未拆分 */
  lineCurrency?: string;
  gameType: string;
  gameVendor: string;
  validBet: number;
  winLoss: number;
  commissionRate: number;
  billAmount: number;
  vendorExclusiveDiscount: number;
  rateAfterDiscount: number;
  commissionCutAmount: number;
  fxRate: number;
  commissionUsdt: number;
  gameAdjustment: number;
  adjustedBillUsdt: number;
  lineStatus: 'normal' | 'abnormal';
}

export interface SiteBillDetailSummary {
  gameBillUsdt: number;
  cdnTrafficFeeUsdt: number;
  lineMaintenanceFeeUsdt: number;
  otherFeesUsdt: number;
  feeAdjustmentUsdt: number;
  billTotalUsdt: number;
  referralDiscountUsdt: number;
  referralDiscountPct: number;
  actualPayUsdt: number;
  cdnCapSavedUsdt: number;
}

export interface SiteBillDetail {
  bill: SiteBillListItem;
  siteBalanceUsdt: number;
  feeLines: SiteBillFeeLine[];
  summary: SiteBillDetailSummary;
  financeRemark: string;
}

export interface GameVendorCommissionRow {
  id: string;
  /** 与 game_platforms.platform_id 一致，便于按台汇总投注后匹配抽佣 */
  platformId?: string;
  gameVendor: string;
  gameType: string;
  commissionRate: number;
  updatedAt?: string;
  updatedBy?: string;
}

export async function getSiteBillListApi(
  query: SiteBillListQuery,
): Promise<SiteBillListResponse> {
  const res: any = await requestClient.get('/site-management/site-bills', {
    params: {
      billMonth: query.billMonth || undefined,
      sameBrandMonth: query.sameBrandMonth || undefined,
      billType: query.billType,
      status: query.status || undefined,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    },
  });
  const payload = res?.data ?? res;
  const list = payload?.list;
  if (!Array.isArray(list)) {
    throw new Error(
      typeof payload?.message === 'string'
        ? payload.message
        : '站点账单列表响应无效',
    );
  }
  return {
    list,
    total: typeof payload.total === 'number' ? payload.total : list.length,
  };
}

export async function getExchangeRatesApi(): Promise<ExchangeRateRow[]> {
  const res: any = await requestClient.get(
    '/site-management/exchange-rates',
  );
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload as ExchangeRateRow[];
  if (Array.isArray(payload?.list)) return payload.list as ExchangeRateRow[];
  return [];
}

export async function getSiteBalanceUsdtApi(siteKey: string): Promise<number> {
  try {
    const res: any = await requestClient.get(
      '/site-management/site-balance',
      { params: { siteKey } },
    );
    const payload = res?.data ?? res;
    if (typeof payload?.balanceUsdt === 'number') return payload.balanceUsdt;
    if (typeof payload === 'number') return payload;
  } catch {
    /* 余额可选失败时按 0 展示 */
  }
  return 0;
}

export async function confirmSiteBillVerifiedApi(billId: string): Promise<void> {
  await requestClient.post(
    `/site-management/site-bills/${billId}/confirm-verified`,
  );
}

export async function confirmSiteBillPaymentApi(billId: string): Promise<void> {
  await requestClient.post(`/site-management/site-bills/${billId}/pay`);
}

export function buildDetailSummaryFromBill(
  bill: SiteBillListItem,
  feeLines: SiteBillFeeLine[],
): SiteBillDetailSummary {
  const gameBillUsdt = feeLines.reduce((s, l) => s + l.commissionUsdt, 0);
  const cdn = bill.cdnTrafficFeeUsdt ?? 0;
  const lineM = bill.lineMaintenanceFeeUsdt ?? 0;
  const other = bill.otherFeesUsdt ?? 0;
  const feeAdj = bill.feeAdjustmentUsdt ?? 0;
  const referral = bill.referralDiscountUsdt ?? 0;
  return {
    gameBillUsdt,
    cdnTrafficFeeUsdt: cdn,
    lineMaintenanceFeeUsdt: lineM,
    otherFeesUsdt: other,
    feeAdjustmentUsdt: feeAdj,
    billTotalUsdt: gameBillUsdt + cdn + lineM + other + feeAdj - referral,
    referralDiscountUsdt: referral,
    referralDiscountPct: bill.referralDiscountPct ?? 0,
    actualPayUsdt: bill.actualPayUsdt,
    cdnCapSavedUsdt: bill.cdnCapSavedUsdt ?? 0,
  };
}

/** 与后端 lineCurrencyForApi 一致：主币种 BRL，空/CNY 展示为 BRL */
function normalizeFeeLineCurrency(stored?: string): string {
  const c = (stored ?? '').trim();
  if (!c || c.toUpperCase() === 'CNY') return 'BRL';
  return c;
}

export async function getSiteBillDetailApi(
  billId: string,
): Promise<SiteBillDetail> {
  const res: any = await requestClient.get(
    `/site-management/site-bills/${billId}`,
    { params: { _t: Date.now() } },
  );
  const raw = (res?.data ?? res) as Partial<SiteBillDetail> & {
    message?: string;
  };
  if (!raw?.bill || !Array.isArray(raw.feeLines)) {
    throw new Error(
      typeof raw.message === 'string' ? raw.message : '站点账单详情响应无效',
    );
  }
  const feeLines = (raw.feeLines as SiteBillFeeLine[]).map((l) => ({
    ...l,
    lineCurrency: normalizeFeeLineCurrency(l.lineCurrency),
  }));
  const summary =
    raw.summary ?? buildDetailSummaryFromBill(raw.bill, feeLines);
  return {
    bill: raw.bill,
    feeLines,
    siteBalanceUsdt:
      typeof raw.siteBalanceUsdt === 'number' ? raw.siteBalanceUsdt : 0,
    financeRemark:
      typeof raw.financeRemark === 'string' ? raw.financeRemark : '',
    summary,
  };
}

export async function getGameVendorCommissionsApi(): Promise<
  GameVendorCommissionRow[]
> {
  try {
    const res: any = await requestClient.get(
      '/site-management/game-vendor-commissions',
    );
    const rows = res?.data ?? res;
    if (Array.isArray(rows)) return rows as GameVendorCommissionRow[];
  } catch {
    /* ignore */
  }
  return [];
}

export async function putGameVendorCommissionsApi(
  items: Array<{
    platformId?: string;
    gameVendor: string;
    gameType?: string;
    commissionRate: number;
  }>,
  options?: { replaceAll?: boolean },
): Promise<void> {
  await requestClient.put('/site-management/game-vendor-commissions', {
    items,
    replaceAll: options?.replaceAll === true,
  });
}

export async function recalculateSiteBillCommissionsApi(
  billId: string,
): Promise<void> {
  await requestClient.post(
    `/site-management/site-bills/${billId}/recalculate-commissions`,
  );
}

/** 按账单月份用 betlog.daily 汇总重写明细行并回写应付（游戏部分来自投注日报） */
export async function rebuildSiteBillFromBetlogApi(billId: string): Promise<{
  lineCount: number;
  gameBillUsdt: number;
  billTotalUsdt: number;
}> {
  const res: any = await requestClient.post(
    `/site-management/site-bills/${billId}/rebuild-from-betlog`,
  );
  const payload = res?.data ?? res;
  const d = payload?.data ?? payload;
  return {
    lineCount: typeof d?.lineCount === 'number' ? d.lineCount : 0,
    gameBillUsdt: typeof d?.gameBillUsdt === 'number' ? d.gameBillUsdt : 0,
    billTotalUsdt: typeof d?.billTotalUsdt === 'number' ? d.billTotalUsdt : 0,
  };
}
