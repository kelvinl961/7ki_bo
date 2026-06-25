/** Comprehensive home templates — mirror `7ki/client/src/theme/comprehensiveHomeTemplates.ts`. */
export const COMPREHENSIVE_HOME_TEMPLATE_IDS = [
  'comprehensive_v1',
  'comprehensive_v1_1',
  'comprehensive_v2',
  'comprehensive_v3',
  'comprehensive_v4',
  'comprehensive_v5',
  'comprehensive_v6',
  'comprehensive_v7',
  'comprehensive_v8',
  'comprehensive_v9',
  'comprehensive_v10',
  'comprehensive_v11',
  'comprehensive_v12',
  'comprehensive_v13',
] as const;

export type ComprehensiveHomeTemplateId =
  (typeof COMPREHENSIVE_HOME_TEMPLATE_IDS)[number];

const COMPREHENSIVE_HOME_TEMPLATE_SET = new Set<string>(
  COMPREHENSIVE_HOME_TEMPLATE_IDS,
);

export function normalizeComprehensiveHomeTemplateId(
  value: string | null | undefined,
): ComprehensiveHomeTemplateId | null {
  const raw = (value ?? '').trim().toLowerCase().replace(/-/g, '_');
  if (!raw || !COMPREHENSIVE_HOME_TEMPLATE_SET.has(raw)) return null;
  return raw as ComprehensiveHomeTemplateId;
}

export function resolveComprehensiveHomeTemplateId(
  value: string | null | undefined,
  fallback: ComprehensiveHomeTemplateId = 'comprehensive_v1',
): ComprehensiveHomeTemplateId {
  return normalizeComprehensiveHomeTemplateId(value) ?? fallback;
}

export const COMPREHENSIVE_HOME_TEMPLATE_LABELS: Record<
  ComprehensiveHomeTemplateId,
  string
> = {
  comprehensive_v1: '综合版1',
  comprehensive_v1_1: '综合版1_1',
  comprehensive_v2: '综合版2',
  comprehensive_v3: '综合版3',
  comprehensive_v4: '综合版4',
  comprehensive_v5: '综合版5',
  comprehensive_v6: '综合版6',
  comprehensive_v7: '综合版7',
  comprehensive_v8: '综合版8',
  comprehensive_v9: '综合版9',
  comprehensive_v10: '综合版10',
  comprehensive_v11: '综合版11',
  comprehensive_v12: '综合版12',
  comprehensive_v13: '综合版13',
};
