import type { MemberTier } from '#/api/core/memberTier';

import { normalizeMemberTierKey } from '#/utils/activityMemberTier';

const TIER_TYPE_ORDER: Record<MemberTier['tierType'], number> = {
  auto_upgrade: 0,
  fixed_tier: 1,
};

/** Known auto-upgrade tier codes in ascending threshold order. */
const AUTO_TIER_CODE_RANK: Record<string, number> = {
  five_yuan: 1,
  ten_yuan: 2,
  thirty_yuan: 3,
  fifty_yuan: 4,
  hundred_yuan: 5,
  three_hundred: 6,
  three_thousand: 7,
  five_thousand: 8,
  thirty_thousand: 9,
  fifty_thousand: 10,
  ten_thousand: 11,
  hundred_thousand: 12,
  millionaire: 12,
};

const AMOUNT_FIELDS = [
  'minDepositAmount',
  'minBetAmount',
  'minValidBetAmount',
] as const;

function getKnownAutoTierRank(tier: MemberTier): number | null {
  const keys = [tier.tierCode, ...(tier.keyTags || [])];
  for (const key of keys) {
    const rank = AUTO_TIER_CODE_RANK[normalizeMemberTierKey(key)];
    if (rank != null) return rank;
  }
  return null;
}

function compareAmountFields(a: MemberTier, b: MemberTier): number {
  for (const field of AMOUNT_FIELDS) {
    const aVal = a[field] ?? 0;
    const bVal = b[field] ?? 0;
    const aHas = aVal > 0;
    const bHas = bVal > 0;

    if (aHas && bHas) {
      const diff = aVal - bVal;
      if (diff !== 0) return diff;
      continue;
    }

    if (aHas !== bHas) {
      return aHas ? -1 : 1;
    }
  }

  return 0;
}

function compareAutoUpgradeTiers(a: MemberTier, b: MemberTier): number {
  if (a.isDefault !== b.isDefault) {
    return a.isDefault ? -1 : 1;
  }

  const amountDiff = compareAmountFields(a, b);
  if (amountDiff !== 0) return amountDiff;

  const knownA = getKnownAutoTierRank(a);
  const knownB = getKnownAutoTierRank(b);
  if (knownA != null || knownB != null) {
    if (knownA == null) return 1;
    if (knownB == null) return -1;
    const knownDiff = knownA - knownB;
    if (knownDiff !== 0) return knownDiff;
  }

  const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  if (sortDiff !== 0) return sortDiff;

  return a.id - b.id;
}

function compareFixedTiers(a: MemberTier, b: MemberTier): number {
  const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  if (sortDiff !== 0) return sortDiff;

  return a.id - b.id;
}

/** Sort tiers for dropdowns: auto-upgrade first (low → high), then fixed tiers. */
export function sortMemberTiersForDisplay(tiers: MemberTier[]): MemberTier[] {
  return [...tiers].sort((a, b) => {
    const typeDiff =
      TIER_TYPE_ORDER[a.tierType] - TIER_TYPE_ORDER[b.tierType];
    if (typeDiff !== 0) return typeDiff;

    if (a.tierType === 'auto_upgrade') {
      return compareAutoUpgradeTiers(a, b);
    }

    return compareFixedTiers(a, b);
  });
}
