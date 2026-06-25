/**
 * Live client iframe preview — iPhone 13 Pro logical viewport (CSS px).
 * @see https://developer.apple.com/design/human-interface-guidelines/layout
 * 6.1" display · 390×844 pt · 3× (@1170×2532 physical)
 */
export const LIVE_PREVIEW_DEVICE = {
  id: 'iphone-13-pro',
  label: 'iPhone 13 Pro',
  width: 390,
  height: 844,
  aspectRatio: 390 / 844,
} as const;
