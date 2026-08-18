import {
  COMPREHENSIVE_HOME_TEMPLATE_IDS,
  resolveComprehensiveHomeTemplateId,
  type ComprehensiveHomeTemplateId,
} from '#/constants/comprehensiveHomeTemplates';

/** CDN base for static comprehensive template reference screenshots. */
const PREVIEW_THUMB_BASE =
  'https://sweykpro.pubs3static.com/siteadmin/skin-preview';

const DEFAULT_THUMB = `${PREVIEW_THUMB_BASE}/comprehensive_v1.webp`;

const TEMPLATE_THUMBNAILS: Record<ComprehensiveHomeTemplateId, string> =
  Object.fromEntries(
    COMPREHENSIVE_HOME_TEMPLATE_IDS.map((id) => [
      id,
      `${PREVIEW_THUMB_BASE}/${id}.webp`,
    ]),
  ) as Record<ComprehensiveHomeTemplateId, string>;

export function getComprehensiveTemplatePreviewThumbnail(
  templateId: string | null | undefined,
): string {
  const resolved = resolveComprehensiveHomeTemplateId(templateId ?? '');
  return TEMPLATE_THUMBNAILS[resolved] ?? DEFAULT_THUMB;
}

export function getComprehensiveTemplatePreviewThumbnailFallback(): string {
  return DEFAULT_THUMB;
}
