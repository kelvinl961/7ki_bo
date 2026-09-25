/**
 * Default Newblade (新砍一刀) turntable assets — style 1 (turntable_1).
 * Keep in sync with 7ki_api / 7ki_client `newbladeDefaultAssets`.
 */
export const NEWBLADE_DEFAULT_ASSETS = {
  hubAssetUrl:
    'http://media.cheshi8899.com/media/media-1787060941699-101343003-kyd_style_1_zp_2_2.avif',
  wheelAssetUrl:
    'http://media.cheshi8899.com/media/media-1787060960569-287791186.webp',
  segmentAssetUrl:
    'http://media.cheshi8899.com/media/media-1787060969798-853196446-kyd_style_1_zp_4.avif',
  winEffectAssetUrl:
    'http://media.cheshi8899.com/media/media-1787095174855-312850869.png',
  frameAssetUrl:
    'http://media.cheshi8899.com/media/media-1787095251131-193211716.webp',
  spinAssetUrl:
    'http://media.cheshi8899.com/media/media-1787097571130-8116396.webp',
} as const;

export function pickNewbladeAssetOrDefault(
  value: unknown,
  fallback: string,
): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}
