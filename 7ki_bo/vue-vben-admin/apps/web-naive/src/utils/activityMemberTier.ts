import type { MemberTier } from '#/api/core/memberTier';

export type MemberTierOption = {
  id: string;
  label: string;
  tierCode: string;
  keyTags: string[];
};

/** Legacy BO checkbox / memberScope slugs → display labels (fallback when tier not found). */
export const LEGACY_MEMBER_TAG_LABELS: Record<string, string> = {
  all: '全部会员',
  backup: '备用层级',
  default: '默认等级',
  user: '备用等级',
  five_yuan: '五元玩家',
  ten_yuan: '十元玩家',
  thirty_yuan: '三十元玩家',
  fifty_yuan: '五十元玩家',
  hundred_yuan: '一百元玩家',
  three_hundred: '三百元玩家',
  three_thousand: '三千元玩家',
  five_thousand: '五千元玩家',
  ten_thousand: '十万元玩家',
  hundred_thousand: '百万土豪',
  millionaire: '百万土豪',
  suspicion: '可疑玩家',
  high_win: '高胜率',
  test_user: '测试专用',
  manual_add: '手动出款',
  brush: '刷子玩家',
  other_bad: '其他恶性',
  dead_user: '死半用户',
  thirty_thousand: '三万玩家',
  fifty_thousand: '五万玩家',
  全部会员: '全部会员',
};

/** Legacy memberScope quick-select slugs → BO memberTags (matches backend). */
const LEGACY_MEMBER_SCOPE_TO_TAG: Record<string, string> = {
  backup: 'user',
  millionaire: 'hundred_thousand',
  brush: 'suspicion',
  other_bad: 'suspicion',
  dead_user: 'test_user',
};

export function normalizeMemberTierKey(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function parseStringArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function parseNumericIdArray(raw: unknown): number[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  return [];
}

export function memberTiersToOptions(tiers: MemberTier[]): MemberTierOption[] {
  return tiers.map((tier) => ({
    id: String(tier.id),
    label: tier.tierName || tier.tierCode || `层级${tier.id}`,
    tierCode: tier.tierCode,
    keyTags: tier.keyTags || [],
  }));
}

function buildTierKeyLookup(
  tierOptions: MemberTierOption[],
): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const tier of tierOptions) {
    lookup.set(normalizeMemberTierKey(tier.id), tier.id);
    lookup.set(normalizeMemberTierKey(tier.tierCode), tier.id);
    for (const tag of tier.keyTags) {
      lookup.set(normalizeMemberTierKey(tag), tier.id);
    }
  }
  return lookup;
}

function resolveTagToTierId(
  tag: string,
  tierById: Map<string, MemberTierOption>,
  tierByKey: Map<string, string>,
): string | null {
  if (tierById.has(tag)) return tag;

  const norm = normalizeMemberTierKey(tag);
  if (tierByKey.has(norm)) return tierByKey.get(norm)!;

  const legacyTag = LEGACY_MEMBER_SCOPE_TO_TAG[norm] ?? norm;
  if (tierByKey.has(legacyTag)) return tierByKey.get(legacyTag)!;

  return null;
}

export function resolveMemberTierIdsFromConfig(
  config:
    | {
        memberTags?: unknown;
        memberGroups?: unknown;
        memberScope?: unknown;
      }
    | null
    | undefined,
  tierOptions: MemberTierOption[],
): string[] {
  if (!config) return [];

  const tierById = new Map(tierOptions.map((t) => [t.id, t]));
  const tierByKey = buildTierKeyLookup(tierOptions);

  const memberGroups = parseNumericIdArray(config.memberGroups);
  if (memberGroups.length > 0) {
    return memberGroups
      .map((id) => String(id))
      .filter((id) => tierById.has(id));
  }

  const memberTags = parseStringArray(config.memberTags);
  if (memberTags.length > 0) {
    const resolved = memberTags
      .map((tag) => resolveTagToTierId(tag, tierById, tierByKey))
      .filter((id): id is string => Boolean(id));
    return [...new Set(resolved)];
  }

  const memberScope = String(config.memberScope ?? '').trim();
  if (memberScope && memberScope !== 'all') {
    const resolved = resolveTagToTierId(memberScope, tierById, tierByKey);
    return resolved ? [resolved] : [];
  }

  return [];
}

export function buildMemberTierLabelMap(
  tierOptions: MemberTierOption[],
): Map<string, string> {
  return new Map(tierOptions.map((t) => [t.id, t.label]));
}

export function formatActivityMemberParticipation(
  config:
    | {
        memberTags?: unknown;
        memberGroups?: unknown;
        memberScope?: unknown;
      }
    | null
    | undefined,
  tierOptions: MemberTierOption[],
): string {
  const labelById = buildMemberTierLabelMap(tierOptions);
  const selectedIds = resolveMemberTierIdsFromConfig(config, tierOptions);

  if (selectedIds.length > 0) {
    return selectedIds
      .map((id) => labelById.get(id) || id)
      .join(', ');
  }

  const memberScope = String(config?.memberScope ?? '').trim();
  if (!memberScope || memberScope === 'all') {
    return '全部会员';
  }

  if (labelById.has(memberScope)) {
    return labelById.get(memberScope)!;
  }

  const norm = normalizeMemberTierKey(memberScope);
  return LEGACY_MEMBER_TAG_LABELS[norm] || LEGACY_MEMBER_TAG_LABELS[memberScope] || memberScope;
}

export function memberGroupsFromTierIds(tierIds: string[]): number[] {
  return tierIds
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0);
}
