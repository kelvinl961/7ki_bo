import type { SelectedPlatform } from '#/api/activity/platformSelection';

/** 领取入口（含 APP 细分与次数限制） */
export interface ProvidentFundClaimEntrance {
  pc: boolean;
  /** 兼容旧版「H5」：读入时若仅有 h5 会映射到 androidH5 / iosH5 */
  h5?: boolean;
  androidH5: boolean;
  iosH5: boolean;
  androidApp: boolean;
  iosApp: boolean;
  appNative: boolean;
  appSpeed: boolean;
  appShell: boolean;
  appPwa: boolean;
  appIosSigned: boolean;
  sameDeviceLimitEnabled: boolean;
  sameDeviceLimitCount: number;
  sameFingerprintLimitEnabled: boolean;
  sameFingerprintLimitCount: number;
}

/** 更多领取限制中的数值型规则（设备/指纹次数在 claimEntrance） */
export interface ProvidentFundMoreRestrictionLimits {
  sameIpLimitEnabled: boolean;
  sameIpLimitMax: number;
  recentDaysForRechargeRules: number;
  recentDaysMinRechargeCountEnabled: boolean;
  recentDaysMinRechargeCount: number;
  recentDaysMinRechargeAmountEnabled: boolean;
  recentDaysMinRechargeAmount: number;
}

export function defaultClaimEntrance(): ProvidentFundClaimEntrance {
  return {
    pc: true,
    androidH5: true,
    iosH5: true,
    androidApp: true,
    iosApp: true,
    appNative: true,
    appSpeed: true,
    appShell: true,
    appPwa: true,
    appIosSigned: true,
    sameDeviceLimitEnabled: false,
    sameDeviceLimitCount: 1,
    sameFingerprintLimitEnabled: false,
    sameFingerprintLimitCount: 1,
  };
}

export function defaultMoreRestrictionLimits(): ProvidentFundMoreRestrictionLimits {
  return {
    sameIpLimitEnabled: false,
    sameIpLimitMax: 1,
    recentDaysForRechargeRules: 30,
    recentDaysMinRechargeCountEnabled: false,
    recentDaysMinRechargeCount: 1,
    recentDaysMinRechargeAmountEnabled: false,
    recentDaysMinRechargeAmount: 0,
  };
}

/** 公积金设置完整快照（后台弹窗读写，持久化到 API JSON） */
export interface ProvidentFundFormSnapshot {
  nameMode: 'system' | 'custom';
  displayName: string;
  currencies: string[];
  depositMinByCurrency: Record<string, number | null>;
  giftRatioPercent: number;
  cumulativeGiftCap: number;
  giftFrequency: number;
  betMultipleWithGift: number;
  betMultipleWithoutGift: number;
  wagerNewDepositAfterCap?: number;
  platformRestriction:
    | 'all_platforms'
    | 'specific_platforms'
    | 'exclude_platforms';
  selectedPlatforms: SelectedPlatform[];
  resetCycle:
    | 'none'
    | 'monthly'
    | 'quarterly'
    | 'semi_annual'
    | 'annual';
  /**
   * 同周期能否多次参与：与重置周期锚点配合；充值累积逻辑见 API。
   * - once_per_cycle：同一周期内仅一次获赠机会（完成后同周期也不可再参与）
   * - repeat_after_completion：打码未完成前不开启新一轮；完成后同周期可再参与
   */
  sameCycleParticipation: 'once_per_cycle' | 'repeat_after_completion';
  distributionMethod: 'player_claim_expire' | 'player_claim_auto';
  /** 充值成功后是否直接弹窗引导领取 */
  claimPopupAfterRecharge: boolean;
  claimEntrance: ProvidentFundClaimEntrance;
  /** 规则说明：前台展示系统文案或自定义 */
  ruleDescriptionMode: 'system' | 'custom';
  ruleDescriptionCustom: string;
  moreRestrictions: string[];
  moreRestrictionLimits: ProvidentFundMoreRestrictionLimits;
  claimLevels: string[];
}

export interface ProvidentFundListItem {
  id: string;
  snapshot: ProvidentFundFormSnapshot;
  updatedAt: number;
}

export function cloneSnapshot(
  s: ProvidentFundFormSnapshot,
): ProvidentFundFormSnapshot {
  return JSON.parse(JSON.stringify(s)) as ProvidentFundFormSnapshot;
}

export function normalizeClaimEntrance(
  raw: Partial<ProvidentFundClaimEntrance> & { h5?: boolean } | undefined,
): ProvidentFundClaimEntrance {
  const base = defaultClaimEntrance();
  if (!raw || typeof raw !== 'object') return base;
  const merged: ProvidentFundClaimEntrance = {
    ...base,
    pc: Boolean(raw.pc ?? base.pc),
    androidH5: Boolean(raw.androidH5 ?? base.androidH5),
    iosH5: Boolean(raw.iosH5 ?? base.iosH5),
    androidApp: Boolean(raw.androidApp ?? base.androidApp),
    iosApp: Boolean(raw.iosApp ?? base.iosApp),
    appNative: Boolean(raw.appNative ?? base.appNative),
    appSpeed: Boolean(raw.appSpeed ?? base.appSpeed),
    appShell: Boolean(raw.appShell ?? base.appShell),
    appPwa: Boolean(raw.appPwa ?? base.appPwa),
    appIosSigned: Boolean(raw.appIosSigned ?? base.appIosSigned),
    sameDeviceLimitEnabled: Boolean(
      raw.sameDeviceLimitEnabled ?? base.sameDeviceLimitEnabled,
    ),
    sameDeviceLimitCount: Math.max(
      1,
      Number(raw.sameDeviceLimitCount ?? base.sameDeviceLimitCount) || 1,
    ),
    sameFingerprintLimitEnabled: Boolean(
      raw.sameFingerprintLimitEnabled ?? base.sameFingerprintLimitEnabled,
    ),
    sameFingerprintLimitCount: Math.max(
      1,
      Number(raw.sameFingerprintLimitCount ?? base.sameFingerprintLimitCount) ||
        1,
    ),
  };
  if (raw.h5 === true && !raw.androidH5 && !raw.iosH5) {
    merged.androidH5 = true;
    merged.iosH5 = true;
  }
  return merged;
}

export function normalizeMoreRestrictionLimits(
  raw: unknown,
): ProvidentFundMoreRestrictionLimits {
  const base = defaultMoreRestrictionLimits();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const num = (v: unknown, d: number) =>
    Math.max(0, Number(v ?? d) || d);
  return {
    sameIpLimitEnabled: Boolean(r.sameIpLimitEnabled ?? base.sameIpLimitEnabled),
    sameIpLimitMax: Math.max(1, num(r.sameIpLimitMax, base.sameIpLimitMax)),
    recentDaysForRechargeRules: Math.min(
      90,
      Math.max(1, num(r.recentDaysForRechargeRules, base.recentDaysForRechargeRules)),
    ),
    recentDaysMinRechargeCountEnabled: Boolean(
      r.recentDaysMinRechargeCountEnabled ??
        base.recentDaysMinRechargeCountEnabled,
    ),
    recentDaysMinRechargeCount: Math.max(
      1,
      num(r.recentDaysMinRechargeCount, base.recentDaysMinRechargeCount),
    ),
    recentDaysMinRechargeAmountEnabled: Boolean(
      r.recentDaysMinRechargeAmountEnabled ??
        base.recentDaysMinRechargeAmountEnabled,
    ),
    recentDaysMinRechargeAmount: num(
      r.recentDaysMinRechargeAmount,
      base.recentDaysMinRechargeAmount,
    ),
  };
}

export function defaultProvidentFundSnapshot(): ProvidentFundFormSnapshot {
  return {
    nameMode: 'system',
    displayName: '公积金',
    currencies: ['BRL'],
    depositMinByCurrency: { BRL: 0 },
    giftRatioPercent: 100,
    cumulativeGiftCap: 0,
    giftFrequency: 0,
    betMultipleWithGift: 30,
    betMultipleWithoutGift: 3,
    wagerNewDepositAfterCap: 3,
    platformRestriction: 'all_platforms',
    selectedPlatforms: [],
    resetCycle: 'none',
    sameCycleParticipation: 'repeat_after_completion',
    distributionMethod: 'player_claim_expire',
    claimPopupAfterRecharge: true,
    claimEntrance: defaultClaimEntrance(),
    ruleDescriptionMode: 'system',
    ruleDescriptionCustom: '',
    moreRestrictions: [],
    moreRestrictionLimits: defaultMoreRestrictionLimits(),
    claimLevels: [],
  };
}

/** Merge API JSON into a full snapshot (backward compatible). */
export function normalizeProvidentFundSettings(
  raw: Record<string, unknown> | null | undefined,
): ProvidentFundFormSnapshot {
  const base = defaultProvidentFundSnapshot();
  if (!raw || typeof raw !== 'object') return base;
  const rawObj = raw as Record<string, unknown>;
  const {
    auditPlatformRestriction: _omitAuditMode,
    auditSelectedPlatforms: _omitAuditPlats,
    auditMultiple: _omitAuditMultiple,
    ...rawRest
  } = rawObj;
  const r = rawRest as Partial<ProvidentFundFormSnapshot> &
    Record<string, unknown>;
  const without =
    r.betMultipleWithoutGift ??
    (typeof r.wagerNewDepositAfterCap === 'number'
      ? r.wagerNewDepositAfterCap
      : base.betMultipleWithoutGift);
  const rawDeps =
    typeof r.depositMinByCurrency === 'object' && r.depositMinByCurrency
      ? (r.depositMinByCurrency as Record<string, number | null>)
      : {};
  const brlMin = rawDeps.BRL;

  const legacyClaim = r.claimEntrance as
    | (Partial<ProvidentFundClaimEntrance> & { h5?: boolean })
    | undefined;

  return {
    ...base,
    ...r,
    betMultipleWithoutGift: Number(without) || base.betMultipleWithoutGift,
    currencies: ['BRL'],
    depositMinByCurrency: {
      BRL:
        brlMin !== undefined && brlMin !== null
          ? Number(brlMin) || 0
          : base.depositMinByCurrency.BRL ?? 0,
    },
    selectedPlatforms: Array.isArray(r.selectedPlatforms)
      ? (r.selectedPlatforms as SelectedPlatform[])
      : base.selectedPlatforms,
    claimPopupAfterRecharge:
      typeof r.claimPopupAfterRecharge === 'boolean'
        ? r.claimPopupAfterRecharge
        : base.claimPopupAfterRecharge,
    claimEntrance: normalizeClaimEntrance(legacyClaim),
    ruleDescriptionMode:
      r.ruleDescriptionMode === 'custom' ? 'custom' : base.ruleDescriptionMode,
    ruleDescriptionCustom:
      typeof r.ruleDescriptionCustom === 'string'
        ? r.ruleDescriptionCustom
        : base.ruleDescriptionCustom,
    moreRestrictions: Array.isArray(r.moreRestrictions)
      ? (r.moreRestrictions as string[])
      : base.moreRestrictions,
    moreRestrictionLimits: normalizeMoreRestrictionLimits(
      r.moreRestrictionLimits,
    ),
    claimLevels: Array.isArray(r.claimLevels)
      ? (r.claimLevels as string[])
      : [...base.claimLevels],
    sameCycleParticipation:
      r.sameCycleParticipation === 'once_per_cycle'
        ? 'once_per_cycle'
        : base.sameCycleParticipation,
  };
}
