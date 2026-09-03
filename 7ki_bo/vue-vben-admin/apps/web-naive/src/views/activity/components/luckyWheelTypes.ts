import type { SelectedPlatform } from '#/api/activity/platformSelection';
import {
  type ProvidentFundClaimEntrance,
  type ProvidentFundMoreRestrictionLimits,
  defaultClaimEntrance,
  defaultMoreRestrictionLimits,
  normalizeClaimEntrance,
  normalizeMoreRestrictionLimits,
} from './providentFundTypes';

export type LuckyWheelType = 'silver' | 'gold' | 'diamond' | 'custom';

export const LUCKY_WHEEL_TYPE_OPTIONS: {
  value: LuckyWheelType;
  label: string;
}[] = [
  { value: 'silver', label: '白银转盘' },
  { value: 'gold', label: '黄金转盘' },
  { value: 'diamond', label: '钻石转盘' },
  { value: 'custom', label: '自定义转盘' },
];

export const LUCKY_WHEEL_PRIZE_COUNT_OPTIONS = [4, 6, 8, 10, 12] as const;

export type LuckyWheelPrizeType =
  | 'fixed_bonus'
  | 'random_bonus'
  | 'physical'
  | 'lucky_value'
  | 'none'
  | 'display_only';

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
  earnMode: 'BET' | 'DEPOSIT';
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
  randomMin?: number | null;
  randomMax?: number | null;
  physicalName?: string | null;
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
  grandPrizeAnnouncementThreshold: number | null;
  screenBurstNotification: boolean;
  screenBurstNotificationThreshold: number | null;
  bannerAssetUrl: string | null;
  wheelAssetUrl: string | null;
  frameAssetUrl: string | null;
  pointerAssetUrl: string | null;
  modalAssetUrl: string | null;
  modalTopAssetUrl: string | null;
  modalBottomAssetUrl: string | null;
  spinAssetUrl: string | null;
  winEffectAssetUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder?: number;
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
    earnMode: 'BET',
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
    randomMin: null,
    randomMax: null,
    physicalName: null,
    realProbability: null,
    displayProbability: null,
    iconUrl: null,
  }));
}

function nullableUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
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
      r.prizeType === 'none' ||
      r.prizeType === 'random_bonus' ||
      r.prizeType === 'display_only'
        ? r.prizeType
        : 'fixed_bonus',
    reward: num(r.reward ?? r.amount),
    randomMin: num(r.randomMin),
    randomMax: num(r.randomMax),
    physicalName: typeof r.physicalName === 'string' ? r.physicalName : null,
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
    grandPrizeAnnouncementThreshold: Number(r.grandPrizeAnnouncementThreshold) || null,
    screenBurstNotification: Boolean(r.screenBurstNotification),
    screenBurstNotificationThreshold: Number(r.screenBurstNotificationThreshold) || null,
    bannerAssetUrl: nullableUrl(r.bannerAssetUrl),
    wheelAssetUrl: nullableUrl(r.wheelAssetUrl),
    frameAssetUrl: nullableUrl(r.frameAssetUrl),
    pointerAssetUrl: nullableUrl(r.pointerAssetUrl),
    modalAssetUrl: nullableUrl(r.modalAssetUrl),
    modalTopAssetUrl: nullableUrl(r.modalTopAssetUrl),
    modalBottomAssetUrl: nullableUrl(r.modalBottomAssetUrl),
    spinAssetUrl: nullableUrl(r.spinAssetUrl),
    winEffectAssetUrl: nullableUrl(r.winEffectAssetUrl),
    startsAt: typeof r.startsAt === 'string' && r.startsAt ? r.startsAt : null,
    endsAt: typeof r.endsAt === 'string' && r.endsAt ? r.endsAt : null,
    sortOrder: Number(r.sortOrder) || 0,
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
    earnMode: r.earnMode === 'DEPOSIT' ? 'DEPOSIT' : 'BET',
    luckyValuePerBet: Math.max(1, Number(r.luckyValuePerBet ?? base.luckyValuePerBet) || 1),
    luckyValueValidDays: Math.min(
      31,
      Math.max(0, Number(r.luckyValueValidDays ?? base.luckyValueValidDays) || 31),
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

export type LuckyWheelScheduleStatus = 'always' | 'upcoming' | 'active' | 'ended';

export function luckyWheelScheduleStatus(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  now = Date.now(),
): LuckyWheelScheduleStatus {
  if (!startsAt && !endsAt) return 'always';
  const start = startsAt ? Date.parse(startsAt) : Number.NEGATIVE_INFINITY;
  const end = endsAt ? Date.parse(endsAt) : Number.POSITIVE_INFINITY;
  if (Number.isFinite(start) && now < start) return 'upcoming';
  if (Number.isFinite(end) && now > end) return 'ended';
  return 'active';
}

/** Inverse of prize value, then normalize. DISPLAY_ONLY stays 0. THANK_YOU / none (value 0) gets the highest odds. */
export function generateWheelProbabilities(prizes: LuckyWheelPrizeItem[]): LuckyWheelPrizeItem[] {
  const drawableIndexes = prizes
    .map((prize, index) => (prize.prizeType === 'display_only' ? -1 : index))
    .filter((index) => index >= 0);
  const raw = drawableIndexes.map((index) => {
    const value = expectedReward(prizes[index]!);
    return 1 / Math.max(value, 1);
  });
  const sum = raw.reduce((acc, value) => acc + value, 0);
  let assigned = 0;
  return prizes.map((prize, index) => {
    if (prize.prizeType === 'display_only') {
      return { ...prize, realProbability: 0, displayProbability: 0 };
    }
    const drawableOffset = drawableIndexes.indexOf(index);
    const isLast = index === drawableIndexes[drawableIndexes.length - 1];
    let real = 0;
    if (drawableIndexes.length > 0) {
      if (sum <= 0) {
        const even = Number((100 / drawableIndexes.length).toFixed(6));
        real = isLast ? Number((100 - assigned).toFixed(6)) : even;
        if (!isLast) assigned += even;
      } else {
        real = isLast
          ? Number((100 - assigned).toFixed(6))
          : Number(((raw[drawableOffset]! / sum) * 100).toFixed(6));
        if (!isLast) assigned += real;
      }
    }
    return {
      ...prize,
      realProbability: real,
      displayProbability: real,
    };
  });
}

function expectedReward(prize: LuckyWheelPrizeItem): number {
  if (prize.prizeType === 'none' || prize.prizeType === 'display_only') return 0;
  if (prize.prizeType === 'random_bonus') {
    return ((prize.randomMin ?? 0) + (prize.randomMax ?? prize.reward ?? 0)) / 2;
  }
  return prize.reward ?? 0;
}

export function calcWheelRealCost(prizes: LuckyWheelPrizeItem[]): number {
  const sum = prizes.reduce(
    (acc, p) => acc + expectedReward(p) * ((p.realProbability ?? 0) / 100),
    0,
  );
  return Number(sum.toFixed(2));
}

export function calcWheelDisplayCost(prizes: LuckyWheelPrizeItem[]): number {
  const sum = prizes.reduce(
    (acc, p) => acc + expectedReward(p) * ((p.displayProbability ?? 0) / 100),
    0,
  );
  return Number(sum.toFixed(2));
}
