/**
 * XSS-safe HTML for BO rich text rendered via v-html.
 */
import DOMPurify from 'dompurify';

const RICH_TEXT_PURIFY: Parameters<typeof DOMPurify.sanitize>[1] = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'template', 'form'],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeRichTextHtml(dirty: string | null | undefined): string {
  if (!dirty?.trim()) return '';
  return DOMPurify.sanitize(dirty, RICH_TEXT_PURIFY);
}
