import type { SelectedPlatform } from '#/api/activity/platformSelection';
import {
  type ProvidentFundClaimEntrance,
  type ProvidentFundMoreRestrictionLimits,
  defaultClaimEntrance,
  defaultMoreRestrictionLimits,
  normalizeClaimEntrance,
  normalizeMoreRestrictionLimits,
} from './providentFundTypes';

export type LuckyWheelType = 'silver' | 'gold' | 'diamond';

export const LUCKY_WHEEL_TYPE_OPTIONS: {
  value: LuckyWheelType;
  label: string;
}[] = [
  { value: 'silver', label: '白银转盘' },
  { value: 'gold', label: '黄金转盘' },
  { value: 'diamond', label: '钻石转盘' },
];

export const LUCKY_WHEEL_PRIZE_COUNT_OPTIONS = [4, 6, 8, 10, 12] as const;

export type LuckyWheelPrizeType = 'fixed_bonus' | 'physical' | 'lucky_value' | 'none';

export interface LuckyWheelMoreRestrictionLimits
  extends ProvidentFundMoreRestrictionLimits {
  sameNameLimitEnabled: boolean;
  sameNameLimitMax: number;
  recentDaysMinRechargeDaysEnabled: boolean;
  recentDaysMinRechargeDays: number;
  recentDaysMinTurnoverEnabled: boolean;
  recentDaysMinTurnover: number;
  recentDaysTurnoverMultiplierEnabled: boolean;
  recentDaysTurnoverMultiplier: number;
}

export interface LuckyWheelPublicConfigSnapshot {
  luckyValuePerBet: number;
  luckyValueValidDays: number;
  claimEntrance: ProvidentFundClaimEntrance;
  moreRestrictions: string[];
  moreRestrictionLimits: LuckyWheelMoreRestrictionLimits;
  memberTierIds: string[];
  auditMultiplier: number;
  auditPlatformRestriction:
    | 'all_platforms'
    | 'specific_platforms'
    | 'exclude_platforms';
  auditSelectedPlatforms: SelectedPlatform[];
  ruleDescriptionMode: 'system' | 'custom';
  ruleDescriptionCustom: string;
}

export interface LuckyWheelPrizeItem {
  id: string;
  prizeType: LuckyWheelPrizeType;
  reward: number | null;
  realProbability: number | null;
  displayProbability: number | null;
  iconUrl: string | null;
}

export interface LuckyWheelItem {
  id: string;
  currency: string;
  name: string;
  nameMode: 'system' | 'custom';
  wheelType: LuckyWheelType;
  prizeCount: number;
  luckyValueCost: number | null;
  showProbabilityAndCost: 'show' | 'hide';
  realCost: number | null;
  displayCost: number | null;
  enabled: boolean;
  prizes: LuckyWheelPrizeItem[];
  grandPrizeAnnouncement: boolean;
  screenBurstNotification: boolean;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export function defaultLuckyWheelMoreRestrictionLimits(): LuckyWheelMoreRestrictionLimits {
  const base = defaultMoreRestrictionLimits();
  return {
    ...base,
    sameNameLimitEnabled: false,
    sameNameLimitMax: 1,
    recentDaysMinRechargeDaysEnabled: false,
    recentDaysMinRechargeDays: 1,
    recentDaysMinTurnoverEnabled: false,
    recentDaysMinTurnover: 0,
    recentDaysTurnoverMultiplierEnabled: false,
    recentDaysTurnoverMultiplier: 1,
  };
}

export function defaultLuckyWheelPublicConfig(): LuckyWheelPublicConfigSnapshot {
  return {
    luckyValuePerBet: 1,
    luckyValueValidDays: 31,
    claimEntrance: defaultClaimEntrance(),
    moreRestrictions: [],
    moreRestrictionLimits: defaultLuckyWheelMoreRestrictionLimits(),
    memberTierIds: [],
    auditMultiplier: 1,
    auditPlatformRestriction: 'all_platforms',
    auditSelectedPlatforms: [],
    ruleDescriptionMode: 'system',
    ruleDescriptionCustom: '',
  };
}

export function createPrizeSlots(count: number): LuckyWheelPrizeItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `prize-${i + 1}`,
    prizeType: 'fixed_bonus' as const,
    reward: null,
    realProbability: null,
    displayProbability: null,
    iconUrl: null,
  }));
}

export function normalizeLuckyWheelPrize(raw: unknown, index: number): LuckyWheelPrizeItem {
  const base = createPrizeSlots(1)[0]!;
  if (!raw || typeof raw !== 'object') {
    return { ...base, id: `prize-${index + 1}` };
  }
  const r = raw as Record<string, unknown>;
  const num = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    id: String(r.id ?? `prize-${index + 1}`),
    prizeType:
      r.prizeType === 'physical' ||
      r.prizeType === 'lucky_value' ||
      r.prizeType === 'none'
        ? r.prizeType
        : 'fixed_bonus',
    reward: num(r.reward ?? r.amount),
    realProbability: num(r.realProbability ?? r.probability),
    displayProbability: num(r.displayProbability ?? r.displayAmount),
    iconUrl: typeof r.iconUrl === 'string' ? r.iconUrl : null,
  };
}

export function normalizeLuckyWheelItem(raw: unknown): LuckyWheelItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const wheelType = r.wheelType as LuckyWheelType;
  if (!wheelType) return null;
  const typeLabel = wheelTypeLabel(wheelType);
  const prizeCount = Number(r.prizeCount) || 4;
  const prizesRaw = Array.isArray(r.prizes) ? r.prizes : [];
  const prizes =
    prizesRaw.length > 0
      ? prizesRaw.map((p, i) => normalizeLuckyWheelPrize(p, i))
      : createPrizeSlots(prizeCount);
  return {
    id: String(r.id ?? ''),
    currency: String(r.currency ?? 'BRL'),
    name: String(r.name ?? typeLabel),
    nameMode: r.nameMode === 'custom' ? 'custom' : 'system',
    wheelType,
    prizeCount: prizes.length || prizeCount,
    luckyValueCost: Number(r.luckyValueCost) || null,
    showProbabilityAndCost: r.showProbabilityAndCost === 'hide' ? 'hide' : 'show',
    realCost: Number(r.realCost) || null,
    displayCost: Number(r.displayCost) || null,
    enabled: Boolean(r.enabled),
    prizes,
    grandPrizeAnnouncement: Boolean(r.grandPrizeAnnouncement),
    screenBurstNotification: Boolean(r.screenBurstNotification),
    updatedBy: r.updatedBy != null ? String(r.updatedBy) : null,
    updatedAt: r.updatedAt != null ? String(r.updatedAt) : null,
  };
}

export function normalizeLuckyWheelMoreRestrictionLimits(
  raw: unknown,
): LuckyWheelMoreRestrictionLimits {
  const base = defaultLuckyWheelMoreRestrictionLimits();
  const normalized = normalizeMoreRestrictionLimits(raw);
  if (!raw || typeof raw !== 'object') {
    return { ...base, ...normalized };
  }
  const r = raw as Record<string, unknown>;
  const num = (v: unknown, d: number) => Math.max(0, Number(v ?? d) || d);
  return {
    ...base,
    ...normalized,
    sameNameLimitEnabled: Boolean(
      r.sameNameLimitEnabled ?? base.sameNameLimitEnabled,
    ),
    sameNameLimitMax: Math.max(1, num(r.sameNameLimitMax, base.sameNameLimitMax)),
    recentDaysMinRechargeDaysEnabled: Boolean(
      r.recentDaysMinRechargeDaysEnabled ??
        base.recentDaysMinRechargeDaysEnabled,
    ),
    recentDaysMinRechargeDays: Math.max(
      1,
      num(r.recentDaysMinRechargeDays, base.recentDaysMinRechargeDays),
    ),
    recentDaysMinTurnoverEnabled: Boolean(
      r.recentDaysMinTurnoverEnabled ?? base.recentDaysMinTurnoverEnabled,
    ),
    recentDaysMinTurnover: num(
      r.recentDaysMinTurnover,
      base.recentDaysMinTurnover,
    ),
    recentDaysTurnoverMultiplierEnabled: Boolean(
      r.recentDaysTurnoverMultiplierEnabled ??
        base.recentDaysTurnoverMultiplierEnabled,
    ),
    recentDaysTurnoverMultiplier: Math.max(
      0,
      num(r.recentDaysTurnoverMultiplier, base.recentDaysTurnoverMultiplier),
    ),
  };
}

export function normalizeLuckyWheelPublicConfig(
  raw: Record<string, unknown> | null | undefined,
): LuckyWheelPublicConfigSnapshot {
  const base = defaultLuckyWheelPublicConfig();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<LuckyWheelPublicConfigSnapshot> & Record<string, unknown>;
  return {
    ...base,
    ...r,
    luckyValuePerBet: Math.max(1, Number(r.luckyValuePerBet ?? base.luckyValuePerBet) || 1),
    luckyValueValidDays: Math.min(
      365,
      Math.max(1, Number(r.luckyValueValidDays ?? base.luckyValueValidDays) || 31),
    ),
    claimEntrance: normalizeClaimEntrance(
      r.claimEntrance as ProvidentFundClaimEntrance | undefined,
    ),
    moreRestrictions: Array.isArray(r.moreRestrictions)
      ? (r.moreRestrictions as string[])
      : base.moreRestrictions,
    moreRestrictionLimits: normalizeLuckyWheelMoreRestrictionLimits(
      r.moreRestrictionLimits,
    ),
    memberTierIds: Array.isArray(r.memberTierIds)
      ? (r.memberTierIds as string[])
      : base.memberTierIds,
    auditMultiplier: Math.max(
      0,
      Number(r.auditMultiplier ?? base.auditMultiplier) || 1,
    ),
    auditPlatformRestriction:
      r.auditPlatformRestriction === 'specific_platforms' ||
      r.auditPlatformRestriction === 'exclude_platforms'
        ? r.auditPlatformRestriction
        : base.auditPlatformRestriction,
    auditSelectedPlatforms: Array.isArray(r.auditSelectedPlatforms)
      ? (r.auditSelectedPlatforms as SelectedPlatform[])
      : base.auditSelectedPlatforms,
    ruleDescriptionMode:
      r.ruleDescriptionMode === 'custom' ? 'custom' : base.ruleDescriptionMode,
    ruleDescriptionCustom:
      typeof r.ruleDescriptionCustom === 'string'
        ? r.ruleDescriptionCustom
        : base.ruleDescriptionCustom,
  };
}

export function cloneLuckyWheelPublicConfig(
  s: LuckyWheelPublicConfigSnapshot,
): LuckyWheelPublicConfigSnapshot {
  return JSON.parse(JSON.stringify(s)) as LuckyWheelPublicConfigSnapshot;
}

export function wheelTypeLabel(type: LuckyWheelType): string {
  return LUCKY_WHEEL_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

/** 根据奖励金额反比生成中奖概率（待 API 接入后可替换为服务端算法） */
export function generateWheelProbabilities(prizes: LuckyWheelPrizeItem[]): LuckyWheelPrizeItem[] {
  const weights = prizes.map((p) => 1 / Math.max(p.reward ?? 0.01, 0.01));
  const total = weights.reduce((sum, w) => sum + w, 0) || 1;
  return prizes.map((p, i) => {
    const real = (weights[i]! / total) * 100;
    const display = real * (0.98 + (i % 3) * 0.01);
    return {
      ...p,
      realProbability: Number(real.toFixed(6)),
      displayProbability: Number(display.toFixed(6)),
    };
  });
}

export function calcWheelRealCost(prizes: LuckyWheelPrizeItem[]): number {
  const sum = prizes.reduce(
    (acc, p) => acc + (p.reward ?? 0) * ((p.realProbability ?? 0) / 100),
    0,
  );
  return Number(sum.toFixed(2));
}

export function calcWheelDisplayCost(prizes: LuckyWheelPrizeItem[]): number {
  const sum = prizes.reduce(
    (acc, p) => acc + (p.reward ?? 0) * ((p.displayProbability ?? 0) / 100),
    0,
  );
  return Number(sum.toFixed(2));
}
