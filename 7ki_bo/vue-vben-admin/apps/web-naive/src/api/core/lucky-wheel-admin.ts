import { requestClient } from '#/api/request';
import type {
  LuckyWheelItem,
  LuckyWheelPrizeItem,
  LuckyWheelPublicConfigSnapshot,
} from '#/views/activity/components/luckyWheelTypes';

const base = '/admin/lucky-wheel';
const DEFAULT_CURRENCY = 'BRL';

export interface LuckyWheelAdminConfig {
  enabled: boolean;
  enabledAt: string | null;
  publicConfig: Record<string, unknown>;
  wheels: LuckyWheelItem[];
  updatedBy?: string | null;
  updatedAt?: string;
}

export interface LuckyWheelPagination {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

type BackendWheel = {
  id: string;
  currency: string;
  tier: 'SILVER' | 'GOLD' | 'DIAMOND' | 'CUSTOM';
  name: string;
  prizeCount: number;
  luckyCostPerSpin: string;
  showProbability: boolean;
  showCost: boolean;
  enabled: boolean;
  announcementEnabled?: boolean;
  announcementThreshold?: string | null;
  fullscreenBroadcastEnabled?: boolean;
  fullscreenBroadcastThreshold?: string | null;
  bannerAssetUrl?: string | null;
  wheelAssetUrl?: string | null;
  frameAssetUrl?: string | null;
  pointerAssetUrl?: string | null;
  modalAssetUrl?: string | null;
  modalTopAssetUrl?: string | null;
  modalBottomAssetUrl?: string | null;
  spinAssetUrl?: string | null;
  winEffectAssetUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  sortOrder?: number;
  updatedBy?: string | null;
  updatedAt?: string | null;
  prizes: Array<{
    id: string;
    prizeType: string;
    fixedAmount?: string | null;
    randomMinAmount?: string | null;
    randomMaxAmount?: string | null;
    probabilityWeight?: number;
    displayProbability?: string | null;
    displayCost?: string | null;
    physicalPrizeName?: string | null;
    displayOnly?: boolean;
    iconUrl?: string | null;
  }>;
};

type BackendGlobalConfig = {
  currency: string;
  enabled: boolean;
  earnMode: 'BET' | 'DEPOSIT';
  earnRate: string;
  defaultExpiryDays: number;
  auditMultiplier: string;
  validWageringScope?: string | null;
  validWageringConfig?: Record<string, unknown>;
  eligibleTierConfig?: Record<string, unknown>;
  claimEntryConfig?: Record<string, unknown>;
  restrictionConfig?: Record<string, unknown>;
  ruleDisplayMode: 'system' | 'custom';
  customRuleText?: string | null;
  updatedAt?: string | null;
};

function unwrapSuccess<T>(response: { data?: T; success?: boolean } | T): T {
  if (
    response &&
    typeof response === 'object' &&
    'success' in (response as Record<string, unknown>) &&
    'data' in (response as Record<string, unknown>)
  ) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function tierToWheelType(tier: string): LuckyWheelItem['wheelType'] {
  if (tier === 'GOLD') return 'gold';
  if (tier === 'DIAMOND') return 'diamond';
  if (tier === 'CUSTOM') return 'custom';
  return 'silver';
}

function wheelTypeToTier(type?: string) {
  if (type === 'gold') return 'GOLD';
  if (type === 'diamond') return 'DIAMOND';
  if (type === 'custom') return 'CUSTOM';
  return 'SILVER';
}

function expectedBackendPrizeAmount(prize: BackendWheel['prizes'][number]) {
  if (prize.prizeType === 'THANK_YOU' || prize.prizeType === 'DISPLAY_ONLY' || prize.displayOnly) {
    return 0;
  }
  if (prize.prizeType === 'RANDOM_CASH') {
    return (Number(prize.randomMinAmount || 0) + Number(prize.randomMaxAmount || 0)) / 2;
  }
  return Number(prize.fixedAmount || 0);
}

function computeWheelCost(prizes: BackendWheel['prizes'], mode: 'real' | 'display') {
  const weighted = prizes.map((prize) => {
    const percent =
      mode === 'display'
        ? Number(prize.displayProbability || 0)
        : Number(prize.probabilityWeight || 0) / 100;
    return { probability: percent, amount: expectedBackendPrizeAmount(prize) };
  });
  if (weighted.length === 0) return null;
  const total = weighted.reduce((sum, item) => sum + (item.probability / 100) * item.amount, 0);
  return Number(total.toFixed(2));
}

function isPersistedPrizeId(id?: string | null) {
  if (!id) return false;
  const trimmed = id.trim();
  if (trimmed.startsWith('prize-')) return false;
  return trimmed.length >= 16 && /^[a-z0-9]+$/i.test(trimmed);
}

function mapBackendPrizeType(prizeType: string): LuckyWheelPrizeItem['prizeType'] {
  if (prizeType === 'RANDOM_CASH') return 'random_bonus';
  if (prizeType === 'PHYSICAL') return 'physical';
  if (prizeType === 'THANK_YOU') return 'none';
  if (prizeType === 'DISPLAY_ONLY') return 'display_only';
  return 'fixed_bonus';
}

function mapFrontendPrizeType(prizeType?: LuckyWheelPrizeItem['prizeType']) {
  if (prizeType === 'random_bonus') return 'RANDOM_CASH';
  if (prizeType === 'physical') return 'PHYSICAL';
  if (prizeType === 'none') return 'THANK_YOU';
  if (prizeType === 'display_only') return 'DISPLAY_ONLY';
  return 'FIXED_CASH';
}

function toNullableAssetUrl(value?: string | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function mapPrize(prize: BackendWheel['prizes'][number], index: number): LuckyWheelPrizeItem {
  const weight = Number(prize.probabilityWeight ?? 0);
  return {
    id: prize.id || `prize-${index + 1}`,
    prizeType: mapBackendPrizeType(prize.prizeType),
    reward: prize.fixedAmount != null && prize.fixedAmount !== '' ? Number(prize.fixedAmount) : null,
    randomMin:
      prize.randomMinAmount != null && prize.randomMinAmount !== ''
        ? Number(prize.randomMinAmount)
        : null,
    randomMax:
      prize.randomMaxAmount != null && prize.randomMaxAmount !== ''
        ? Number(prize.randomMaxAmount)
        : null,
    physicalName: prize.physicalPrizeName ?? null,
    realProbability: Number.isFinite(weight) ? weight / 100 : null,
    displayProbability:
      prize.displayProbability != null && prize.displayProbability !== ''
        ? Number(prize.displayProbability)
        : null,
    iconUrl: prize.iconUrl ?? null,
  };
}

function mapWheel(row: BackendWheel): LuckyWheelItem {
  return {
    id: row.id,
    currency: row.currency,
    name: row.name,
    nameMode: 'custom',
    wheelType: tierToWheelType(row.tier),
    prizeCount: row.prizeCount,
    luckyValueCost: Number(row.luckyCostPerSpin || 0),
    showProbabilityAndCost: row.showProbability ? 'show' : 'hide',
    realCost: computeWheelCost(row.prizes, 'real'),
    displayCost: row.showCost ? computeWheelCost(row.prizes, 'display') : null,
    enabled: row.enabled,
    prizes: row.prizes.map(mapPrize),
    grandPrizeAnnouncement: Boolean(row.announcementEnabled),
    grandPrizeAnnouncementThreshold:
      row.announcementThreshold != null ? Number(row.announcementThreshold) : null,
    screenBurstNotification: Boolean(row.fullscreenBroadcastEnabled),
    screenBurstNotificationThreshold:
      row.fullscreenBroadcastThreshold != null
        ? Number(row.fullscreenBroadcastThreshold)
        : null,
    bannerAssetUrl: row.bannerAssetUrl ?? null,
    wheelAssetUrl: row.wheelAssetUrl ?? null,
    frameAssetUrl: row.frameAssetUrl ?? null,
    pointerAssetUrl: row.pointerAssetUrl ?? null,
    modalAssetUrl: row.modalAssetUrl ?? null,
    modalTopAssetUrl: row.modalTopAssetUrl ?? null,
    modalBottomAssetUrl: row.modalBottomAssetUrl ?? null,
    spinAssetUrl: row.spinAssetUrl ?? null,
    winEffectAssetUrl: row.winEffectAssetUrl ?? null,
    startsAt: row.startsAt ?? null,
    endsAt: row.endsAt ?? null,
    sortOrder: row.sortOrder,
    updatedBy: row.updatedBy ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

function mapGlobalConfig(row: BackendGlobalConfig): LuckyWheelPublicConfigSnapshot {
  const eligibleTierConfig = row.eligibleTierConfig || {};
  const restrictionConfig = row.restrictionConfig || {};
  return {
    earnMode: row.earnMode === 'DEPOSIT' ? 'DEPOSIT' : 'BET',
    luckyValuePerBet: Number(row.earnRate || 1),
    luckyValueValidDays: Math.min(31, Math.max(0, Number(row.defaultExpiryDays || 31))),
    claimEntrance: (row.claimEntryConfig as LuckyWheelPublicConfigSnapshot['claimEntrance']) || {
      pc: true,
      androidH5: true,
      iosH5: true,
      androidApp: true,
      iosApp: true,
      appNative: true,
      appSpeed: true,
      appShell: false,
      appPwa: false,
      appIosSigned: false,
      sameDeviceLimitEnabled: false,
      sameDeviceLimitCount: 1,
      sameFingerprintLimitEnabled: false,
      sameFingerprintLimitCount: 1,
    },
    moreRestrictions: Array.isArray(restrictionConfig.moreRestrictions)
      ? (restrictionConfig.moreRestrictions as string[])
      : [],
    moreRestrictionLimits:
      (restrictionConfig.moreRestrictionLimits as LuckyWheelPublicConfigSnapshot['moreRestrictionLimits']) ||
      {
        sameIpLimitEnabled: false,
        sameIpLimitMax: 1,
        recentDaysForRechargeRules: 7,
        recentDaysMinRechargeCountEnabled: false,
        recentDaysMinRechargeCount: 1,
        recentDaysMinRechargeAmountEnabled: false,
        recentDaysMinRechargeAmount: 0,
        sameNameLimitEnabled: false,
        sameNameLimitMax: 1,
        recentDaysMinRechargeDaysEnabled: false,
        recentDaysMinRechargeDays: 1,
        recentDaysMinTurnoverEnabled: false,
        recentDaysMinTurnover: 0,
        recentDaysTurnoverMultiplierEnabled: false,
        recentDaysTurnoverMultiplier: 1,
      },
    memberTierIds: Array.isArray((eligibleTierConfig as { memberTierIds?: string[] }).memberTierIds)
      ? ((eligibleTierConfig as { memberTierIds?: string[] }).memberTierIds || [])
      : [],
    auditMultiplier: Number(row.auditMultiplier || 0),
    auditPlatformRestriction:
      row.validWageringScope === 'specific_platforms' || row.validWageringScope === 'exclude_platforms'
        ? (row.validWageringScope as LuckyWheelPublicConfigSnapshot['auditPlatformRestriction'])
        : 'all_platforms',
    auditSelectedPlatforms:
      ((row.validWageringConfig as { selectedPlatforms?: never[] })?.selectedPlatforms as never[]) || [],
    ruleDescriptionMode: row.ruleDisplayMode || 'system',
    ruleDescriptionCustom: row.customRuleText || '',
  };
}

function mapPublicConfigToBackend(
  snapshot: LuckyWheelPublicConfigSnapshot,
  enabled: boolean,
): Record<string, unknown> {
  return {
    currency: DEFAULT_CURRENCY,
    enabled,
    earnMode: snapshot.earnMode === 'DEPOSIT' ? 'DEPOSIT' : 'BET',
    earnRate: String(snapshot.luckyValuePerBet || 1),
    defaultExpiryDays: Math.min(31, Math.max(0, snapshot.luckyValueValidDays ?? 31)),
    auditMultiplier: String(snapshot.auditMultiplier || 0),
    validWageringScope: snapshot.auditPlatformRestriction,
    validWageringConfig: {
      selectedPlatforms: snapshot.auditSelectedPlatforms,
    },
    eligibleTierConfig: {
      memberTierIds: snapshot.memberTierIds,
    },
    claimEntryConfig: snapshot.claimEntrance,
    restrictionConfig: {
      moreRestrictions: snapshot.moreRestrictions,
      moreRestrictionLimits: snapshot.moreRestrictionLimits,
    },
    ruleDisplayMode: snapshot.ruleDescriptionMode,
    customRuleText: snapshot.ruleDescriptionCustom,
    customRuleI18n: {},
    metadata: {},
  };
}

function mapWheelPayload(payload: Partial<LuckyWheelItem>, options?: { forCreate?: boolean }) {
  return {
    currency: options?.forCreate ? payload.currency : undefined,
    tier: options?.forCreate ? wheelTypeToTier(payload.wheelType) : undefined,
    enabled: payload.enabled,
    name: payload.name,
    luckyCostPerSpin:
      payload.luckyValueCost !== undefined && payload.luckyValueCost !== null
        ? String(payload.luckyValueCost)
        : undefined,
    prizeCount: payload.prizeCount,
    showProbability: payload.showProbabilityAndCost === 'show',
    showCost: payload.showProbabilityAndCost === 'show',
    announcementEnabled: payload.grandPrizeAnnouncement,
    announcementThreshold:
      payload.grandPrizeAnnouncementThreshold != null
        ? String(payload.grandPrizeAnnouncementThreshold)
        : null,
    fullscreenBroadcastEnabled: payload.screenBurstNotification,
    fullscreenBroadcastThreshold:
      payload.screenBurstNotificationThreshold != null
        ? String(payload.screenBurstNotificationThreshold)
        : null,
    bannerAssetUrl: toNullableAssetUrl(payload.bannerAssetUrl),
    wheelAssetUrl: toNullableAssetUrl(payload.wheelAssetUrl),
    frameAssetUrl: toNullableAssetUrl(payload.frameAssetUrl),
    pointerAssetUrl: toNullableAssetUrl(payload.pointerAssetUrl),
    modalAssetUrl: toNullableAssetUrl(payload.modalAssetUrl),
    modalTopAssetUrl: toNullableAssetUrl(payload.modalTopAssetUrl),
    modalBottomAssetUrl: toNullableAssetUrl(payload.modalBottomAssetUrl),
    spinAssetUrl: toNullableAssetUrl(payload.spinAssetUrl),
    winEffectAssetUrl: toNullableAssetUrl(payload.winEffectAssetUrl),
    startsAt: payload.startsAt ?? null,
    endsAt: payload.endsAt ?? null,
    prizes: payload.prizes?.map((prize, index) => {
      const prizeType = mapFrontendPrizeType(prize.prizeType);
      const row: Record<string, unknown> = {
        position: index + 1,
        prizeType,
        label:
          prize.physicalName ||
          (prizeType === 'PHYSICAL'
            ? 'Physical Prize'
            : prizeType === 'THANK_YOU'
              ? 'Thank You'
              : prizeType === 'DISPLAY_ONLY'
                ? 'Display Prize'
                : 'Cash Prize'),
        probabilityWeight: Math.max(0, Math.round(Number(prize.realProbability ?? 0) * 100)),
        displayProbability:
          prize.displayProbability != null ? String(prize.displayProbability) : undefined,
        displayOnly: prizeType === 'DISPLAY_ONLY',
        enabled: true,
      };
      if (isPersistedPrizeId(prize.id)) row.id = prize.id;
      if (prize.iconUrl) row.iconUrl = prize.iconUrl;
      if (prizeType === 'FIXED_CASH' && prize.reward != null) {
        row.fixedAmount = String(prize.reward);
      }
      if (prizeType === 'RANDOM_CASH') {
        row.randomMinAmount = String(prize.randomMin ?? 0);
        row.randomMaxAmount = String(prize.randomMax ?? prize.reward ?? 0);
      }
      if (prizeType === 'PHYSICAL') {
        row.physicalPrizeName = prize.physicalName || 'Physical Prize';
        if (prize.reward != null) row.fixedAmount = String(prize.reward);
      }
      return row;
    }),
  };
}

function normalizePagination(payload: { page?: number; pageSize?: number; total?: number }) {
  const current = Number(payload.page || 1);
  const pageSize = Number(payload.pageSize || 20);
  const total = Number(payload.total || 0);
  return {
    current,
    pageSize,
    total,
    totalPages: pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1,
  };
}

function memberParams(params: {
  memberSearchType?: string;
  memberKeyword?: string;
}) {
  if (!params.memberKeyword?.trim()) return {};
  if (params.memberSearchType === 'memberId') {
    return { userId: Number(params.memberKeyword) };
  }
  return { account: params.memberKeyword.trim() };
}

function csvBlob(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8' });
  }
  const headers = Object.keys(rows[0] || {});
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((key) => JSON.stringify(row[key] ?? ''))
        .join(','),
    ),
  ];
  return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
}

export async function getLuckyWheelAdminConfigApi() {
  const [publicConfigResp, wheelsResp] = await Promise.all([
    requestClient
      .get<BackendGlobalConfig | { success: true; data: BackendGlobalConfig }>(`${base}/global-config`, {
        params: { currency: DEFAULT_CURRENCY },
      })
      .catch(() => null) as Promise<
        | BackendGlobalConfig
        | { success: true; data: BackendGlobalConfig }
        | null
      >,
    requestClient.get<BackendWheel[] | { success: true; data: BackendWheel[] }>(`${base}/wheels`) as Promise<
      BackendWheel[] | { success: true; data: BackendWheel[] }
    >,
  ]);
  const publicConfigRaw =
    publicConfigResp == null
      ? {
          currency: DEFAULT_CURRENCY,
          enabled: false,
          earnMode: 'BET' as const,
          earnRate: '1',
          defaultExpiryDays: 31,
          auditMultiplier: '0',
          ruleDisplayMode: 'system' as const,
          customRuleText: '',
          updatedAt: null,
        }
      : unwrapSuccess(publicConfigResp);
  const wheelsRaw = unwrapSuccess(wheelsResp);

  return {
    enabled: Boolean(publicConfigRaw.enabled),
    enabledAt: publicConfigRaw.updatedAt || null,
    publicConfig: mapGlobalConfig(publicConfigRaw),
    wheels: (wheelsRaw || []).map(mapWheel),
    updatedAt: publicConfigRaw.updatedAt || undefined,
  } satisfies LuckyWheelAdminConfig;
}

export async function putLuckyWheelAdminPublicConfigApi(
  publicConfig: LuckyWheelPublicConfigSnapshot,
) {
  const current = await getLuckyWheelAdminConfigApi();
  await requestClient.put(`${base}/global-config`, mapPublicConfigToBackend(publicConfig, current.enabled));
  return getLuckyWheelAdminConfigApi();
}

export async function putLuckyWheelAdminSwitchApi(enabled: boolean) {
  const current = await getLuckyWheelAdminConfigApi();
  const merged = mapPublicConfigToBackend(
    current.publicConfig as LuckyWheelPublicConfigSnapshot,
    enabled,
  );
  const updatedResp = await requestClient.put<
    BackendGlobalConfig | { success: true; data: BackendGlobalConfig }
  >(`${base}/global-config`, merged) as BackendGlobalConfig | { success: true; data: BackendGlobalConfig };
  const updated = unwrapSuccess(updatedResp);
  return { enabled: updated.enabled, enabledAt: updated.updatedAt || null };
}

export async function createLuckyWheelItemApi(payload: Partial<LuckyWheelItem>) {
  const createdResp = await requestClient.post<BackendWheel | { success: true; data: BackendWheel }>(
    `${base}/wheels`,
    mapWheelPayload(payload, { forCreate: true }),
  ) as BackendWheel | { success: true; data: BackendWheel };
  const created = unwrapSuccess(createdResp);
  return mapWheel(created);
}

export async function putLuckyWheelItemApi(
  id: string,
  payload: Partial<LuckyWheelItem>,
) {
  const updatedResp = await requestClient.put<BackendWheel | { success: true; data: BackendWheel }>(
    `${base}/wheels/${id}`,
    mapWheelPayload(payload),
  ) as BackendWheel | { success: true; data: BackendWheel };
  const updated = unwrapSuccess(updatedResp);
  return mapWheel(updated);
}

export async function putLuckyWheelItemSwitchApi(id: string, enabled: boolean) {
  const updatedResp = await requestClient.put<BackendWheel | { success: true; data: BackendWheel }>(
    `${base}/wheels/${id}`,
    { enabled },
  ) as BackendWheel | { success: true; data: BackendWheel };
  const updated = unwrapSuccess(updatedResp);
  return mapWheel(updated);
}

export async function listLuckyWheelLuckyValueRecordsApi(params: {
  page: number;
  pageSize: number;
  memberSearchType?: string;
  memberKeyword?: string;
  changeType?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const resResp = await requestClient.get<{
    page: number;
    pageSize: number;
    total: number;
    items: Array<Record<string, unknown>>;
  } | { success: true; data: {
    page: number;
    pageSize: number;
    total: number;
    items: Array<Record<string, unknown>>;
  } }>(`${base}/lucky-value/logs`, {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      changeType: params.changeType,
      startDate: params.from,
      endDate: params.to,
      ...memberParams(params),
    },
  }) as
    | { page: number; pageSize: number; total: number; items: Array<Record<string, unknown>> }
    | { success: true; data: { page: number; pageSize: number; total: number; items: Array<Record<string, unknown>> } };
  const res = unwrapSuccess(resResp);

  const list = (res.items || []).map((item) => {
    const createdAt = String(item.createdAt || '');
    const expireAt = item.expiresAt ? String(item.expiresAt) : null;
    const luckyValuePeriod =
      expireAt && createdAt
        ? Math.max(
            0,
            Math.round(
              (new Date(expireAt).getTime() - new Date(createdAt).getTime()) /
                (24 * 60 * 60 * 1000),
            ),
          )
        : null;
    return {
      id: item.id,
      currency: item.currency,
      memberId: item.memberId,
      account: item.account,
      promotionSource: item.sourceRefType ?? '—',
      promotionType: item.sourceRefId ?? '—',
      changeType: item.changeType,
      balanceBefore: item.balanceBefore,
      changeAmount: item.deltaValue,
      balanceAfter: item.balanceAfter,
      luckyValuePeriod,
      expireAt,
      frontendRemark: item.frontRemark,
      backendRemark: item.backRemark,
      createdAt,
    };
  });

  return { list, pagination: normalizePagination(res) };
}

export async function exportLuckyWheelLuckyValueRecordsApi(params: Record<string, unknown>) {
  const res = await listLuckyWheelLuckyValueRecordsApi(params as never);
  return csvBlob(res.list);
}

export async function listLuckyWheelRemainingLuckyValueApi(params: {
  page: number;
  pageSize: number;
  memberSearchType?: string;
  memberKeyword?: string;
  metric?: string;
  metricMin?: number;
  metricMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const resResp = await requestClient.get<{
    page: number;
    pageSize: number;
    total: number;
    items: Array<Record<string, unknown>>;
  } | { success: true; data: {
    page: number;
    pageSize: number;
    total: number;
    items: Array<Record<string, unknown>>;
  } }>(`${base}/lucky-value/balances`, {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      ...memberParams(params),
    },
  }) as
    | { page: number; pageSize: number; total: number; items: Array<Record<string, unknown>> }
    | { success: true; data: { page: number; pageSize: number; total: number; items: Array<Record<string, unknown>> } };
  const res = unwrapSuccess(resResp);

  const list = (res.items || []).map((item) => ({
    id: item.id,
    currency: item.currency,
    memberId: item.memberId,
    account: item.account,
    updatedAt: item.updatedAt,
    earnedLuckyValue: item.lifetimeEarned,
    consumedLuckyValue: item.lifetimeSpent,
    expiredLuckyValue: item.lifetimeExpired,
    deductedLuckyValue: '0',
    remainingLuckyValue: item.availableValue,
    operator: item.operator ?? item.updatedBy ?? null,
  }));

  return { list, pagination: normalizePagination(res) };
}

export async function exportLuckyWheelRemainingLuckyValueApi(params: Record<string, unknown>) {
  const res = await listLuckyWheelRemainingLuckyValueApi(params as never);
  return csvBlob(res.list);
}

export async function listLuckyWheelWinningRecordsApi(params: {
  page: number;
  pageSize: number;
  memberSearchType?: string;
  memberKeyword?: string;
  rewardTypes?: string[];
  wheelType?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const resResp = await requestClient.get<{
    page: number;
    pageSize: number;
    total: number;
    items: Array<Record<string, unknown>>;
  } | { success: true; data: {
    page: number;
    pageSize: number;
    total: number;
    items: Array<Record<string, unknown>>;
  } }>(`${base}/spin-records`, {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      tier: params.wheelType ? wheelTypeToTier(params.wheelType) : undefined,
      startDate: params.from,
      endDate: params.to,
      ...memberParams(params),
    },
  }) as
    | { page: number; pageSize: number; total: number; items: Array<Record<string, unknown>> }
    | { success: true; data: { page: number; pageSize: number; total: number; items: Array<Record<string, unknown>> } };
  const res = unwrapSuccess(resResp);

  const list = (res.items || []).map((item) => ({
    id: item.id,
    currency: item.currency,
    memberId: item.memberId,
    account: item.account,
    wheelName: (item.wheel as { name?: string } | undefined)?.name || '—',
    wheelType: tierToWheelType(String(item.wheelTier || 'SILVER')),
    wheelTypeLabel:
      String(item.wheelTier || 'SILVER') === 'GOLD'
        ? 'Gold Wheel'
        : String(item.wheelTier || 'SILVER') === 'DIAMOND'
          ? 'Diamond Wheel'
          : 'Silver Wheel',
    luckyValueCost: item.luckyCost,
    rewardType: item.prizeType,
    prizeIcon: ((item.prize as { iconUrl?: string | null } | undefined)?.iconUrl) || null,
    reward:
      item.prizeAmount ||
      item.physicalPrizeName ||
      (((item.prize as { physicalPrizeName?: string | null } | undefined)?.physicalPrizeName) ?? '—'),
    wonAt: item.createdAt,
  }));

  return { list, pagination: normalizePagination(res) };
}

export async function exportLuckyWheelWinningRecordsApi(params: Record<string, unknown>) {
  const res = await listLuckyWheelWinningRecordsApi(params as never);
  return csvBlob(res.list);
}

export async function listLuckyWheelPhysicalOrdersApi(params: {
  page: number;
  pageSize: number;
  memberSearchType?: string;
  memberKeyword?: string;
  operatorSearchType?: string;
  operatorKeyword?: string;
  status?: string;
  timeField?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const resResp = await requestClient.get<{
    page: number;
    pageSize: number;
    total: number;
    items: Array<Record<string, unknown>>;
  } | { success: true; data: {
    page: number;
    pageSize: number;
    total: number;
    items: Array<Record<string, unknown>>;
  } }>(`${base}/physical-orders`, {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      ...memberParams(params),
    },
  }) as
    | { page: number; pageSize: number; total: number; items: Array<Record<string, unknown>> }
    | { success: true; data: { page: number; pageSize: number; total: number; items: Array<Record<string, unknown>> } };
  const res = unwrapSuccess(resResp);

  const list = (res.items || []).map((item) => ({
    id: item.id,
    orderNo: item.id,
    currency: item.currency,
    memberId: item.memberId,
    account: item.account,
    prizeIcon: null,
    prizeName: item.prizeName,
    wonAt: item.createdAt,
    receiverName: item.recipientName,
    addressLine1: item.addressLine1,
    addressLine2: item.addressLine2,
    city: item.city,
    state: item.state,
    postalCode: item.postalCode,
    country: item.country,
    receiverAddress: [item.addressLine1, item.addressLine2, item.city, item.state, item.country]
      .filter(Boolean)
      .join(' '),
    receiverPhone: item.phone,
    status: item.status,
    statusLabel: item.status,
    trackingNo: item.trackingNumber,
    courierCompany: item.courierCompany,
    shippedAt: item.shippedAt,
    cancelReason: item.cancelReason,
    frontendRemark: '',
    backendRemark: item.remark,
    operator: item.updatedBy ?? item.operator ?? null,
    operatedAt: item.updatedAt,
  }));

  return { list, pagination: normalizePagination(res) };
}

export async function exportLuckyWheelPhysicalOrdersApi(params: Record<string, unknown>) {
  const res = await listLuckyWheelPhysicalOrdersApi(params as never);
  return csvBlob(res.list);
}

export async function addLuckyWheelLuckyValueApi(payload: {
  userIds?: number[];
  accounts?: string[];
  account?: string;
  currency?: string;
  deltaValue: number;
  effectiveDays?: number;
  frontRemark?: string;
  backRemark?: string;
  sourceType?: 'MANUAL_ADD' | 'MANUAL_DEDUCT';
}) {
  return requestClient.post(`${base}/lucky-value/add`, {
    currency: payload.currency || DEFAULT_CURRENCY,
    userIds: payload.userIds,
    accounts: payload.accounts,
    account: payload.account,
    deltaValue: Math.abs(payload.deltaValue),
    effectiveDays: payload.effectiveDays,
    frontRemark: payload.frontRemark,
    backRemark: payload.backRemark,
    sourceType: payload.sourceType ?? (payload.deltaValue < 0 ? 'MANUAL_DEDUCT' : 'MANUAL_ADD'),
  });
}

export async function putLuckyWheelPhysicalOrderApi(
  id: string,
  payload: Record<string, unknown>,
) {
  const response = await requestClient.put<
    Record<string, unknown> | { success: true; data: Record<string, unknown> }
  >(`${base}/physical-orders/${id}`, payload) as
    | Record<string, unknown>
    | { success: true; data: Record<string, unknown> };
  return unwrapSuccess(response);
}
