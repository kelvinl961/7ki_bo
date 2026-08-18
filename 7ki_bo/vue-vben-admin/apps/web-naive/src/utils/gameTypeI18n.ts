import { $t, $te } from '@vben/locales';
import { preferences } from '@vben/preferences';

/** Canonical game type enums used by API / filters */
export const GAME_TYPE_ENUMS = [
  'VIDEO',
  'LIVE',
  'SLOT',
  'LOTTERY',
  'SPORTS',
  'ESPORTS',
  'HUNTING',
  'CHESS_CARDS',
  'ARCADE',
  'SIMULATION',
  'COCKFIGHT',
  'BLOCKCHAIN',
  'OTHER',
] as const;

export type GameTypeEnum = (typeof GAME_TYPE_ENUMS)[number];

/** Chinese short / long labels historically returned by the API */
const CHINESE_TO_ENUM: Record<string, string> = {
  真人: 'LIVE',
  真人游戏: 'LIVE',
  电子: 'SLOT',
  电子游戏: 'SLOT',
  体育: 'SPORTS',
  体育游戏: 'SPORTS',
  彩票: 'LOTTERY',
  彩票游戏: 'LOTTERY',
  棋牌: 'CHESS_CARDS',
  棋牌游戏: 'CHESS_CARDS',
  电竞: 'ESPORTS',
  电竞游戏: 'ESPORTS',
  捕鱼: 'HUNTING',
  捕鱼游戏: 'HUNTING',
  街机: 'ARCADE',
  街机游戏: 'ARCADE',
  模拟: 'SIMULATION',
  模拟游戏: 'SIMULATION',
  斗鸡: 'COCKFIGHT',
  斗鸡游戏: 'COCKFIGHT',
  区块链: 'BLOCKCHAIN',
  区块链游戏: 'BLOCKCHAIN',
  其他: 'OTHER',
};

/** Enums that share the same filter group (e.g. VIDEO/SLOT → slots) */
const FILTER_ENUM_GROUPS: Record<string, string[]> = {
  VIDEO: ['VIDEO', 'SLOT', 'SIMULATION', 'OTHER'],
  SLOT: ['VIDEO', 'SLOT', 'SIMULATION', 'OTHER'],
  LIVE: ['LIVE'],
  LOTTERY: ['LOTTERY'],
  SPORTS: ['SPORTS', 'ESPORTS'],
  ESPORTS: ['SPORTS', 'ESPORTS'],
  HUNTING: ['HUNTING'],
  CHESS_CARDS: ['CHESS_CARDS', 'TABLE', 'CHESS_CARD', 'CHESS', 'CARDS'],
  ARCADE: ['ARCADE'],
  COCKFIGHT: ['COCKFIGHT'],
  BLOCKCHAIN: ['BLOCKCHAIN'],
  SIMULATION: ['VIDEO', 'SLOT', 'SIMULATION'],
  OTHER: ['OTHER'],
};

/**
 * Normalize API / form / filter value to a canonical enum string.
 */
export function normalizeGameTypeEnum(
  value: string | null | undefined,
): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (CHINESE_TO_ENUM[trimmed]) return CHINESE_TO_ENUM[trimmed];
  const upper = trimmed.toUpperCase().replace(/[\s-]+/g, '_');
  return upper;
}

/**
 * Localized label for a game type enum (or legacy Chinese value).
 */
export function getGameTypeLabel(value: string | null | undefined): string {
  if (!value) return '-';
  const enumKey = normalizeGameTypeEnum(value);
  const i18nKey = `game.types.${enumKey}`;
  if ($te(i18nKey)) return $t(i18nKey);
  return value;
}

/**
 * Enums to send when filtering by a selected game type option value.
 */
export function getGameTypeFilterEnums(
  selected: string | null | undefined,
): string[] {
  if (!selected) return [];
  const enumKey = normalizeGameTypeEnum(selected);
  return FILTER_ENUM_GROUPS[enumKey] ?? [enumKey];
}

/**
 * Select options for game type filters / forms (enum values + i18n labels).
 */
export function getGameTypeSelectOptions(includeShortChess = false) {
  const options = [
    { label: getGameTypeLabel('VIDEO'), value: 'VIDEO' },
    { label: getGameTypeLabel('LIVE'), value: 'LIVE' },
    { label: getGameTypeLabel('SPORTS'), value: 'SPORTS' },
    { label: getGameTypeLabel('LOTTERY'), value: 'LOTTERY' },
    { label: getGameTypeLabel('HUNTING'), value: 'HUNTING' },
    { label: getGameTypeLabel('CHESS_CARDS'), value: 'CHESS_CARDS' },
    { label: getGameTypeLabel('ARCADE'), value: 'ARCADE' },
    { label: getGameTypeLabel('COCKFIGHT'), value: 'COCKFIGHT' },
    { label: getGameTypeLabel('BLOCKCHAIN'), value: 'BLOCKCHAIN' },
  ];
  if (includeShortChess) {
    options.splice(6, 0, {
      label: $t('game.subgame.typeChessShort'),
      value: 'CHESS_CARDS',
    });
  }
  return options;
}

/** Legacy Chinese display-position values stored by the API */
export const DISPLAY_POSITION_VALUES = [
  { key: 'posHotAbove', value: '热门上方' },
  { key: 'posHotBelow', value: '热门下方' },
  { key: 'posHomeTop', value: '首页顶部' },
  { key: 'posGameLobby', value: '游戏大厅' },
  { key: 'posProfile', value: '个人中心' },
] as const;

export function getDisplayPositionLabel(
  value: string | null | undefined,
): string {
  if (!value) return '-';
  const found = DISPLAY_POSITION_VALUES.find((item) => item.value === value);
  if (found) {
    const key = `game.virtualBonusPool.${found.key}`;
    if ($te(key)) return $t(key);
  }
  return value;
}

export function getDisplayPositionOptions() {
  return DISPLAY_POSITION_VALUES.map((item) => ({
    label: $t(`game.virtualBonusPool.${item.key}`),
    value: item.value,
  }));
}

/**
 * Prefer localized game name based on active locale.
 */
export function getLocalizedGameName(row: {
  gameName?: string | null;
  gameNameEn?: string | null;
  gameNameZh?: string | null;
}): string {
  const locale = preferences.app.locale;
  const zh = row.gameNameZh || row.gameName || '';
  const en = row.gameNameEn || '';
  if (locale === 'zh-CN') return zh || en || '-';
  if (locale.startsWith('en')) return en || zh || '-';
  // vi-VN and others: prefer English name, fall back to Chinese/API name
  return en || zh || '-';
}

/**
 * Localized game category label (bet records / statistics).
 */
export function getGameCategoryLabel(
  category: string | null | undefined,
): string {
  if (!category) return '-';
  const key = `game.categories.${category}`;
  if ($te(key)) return $t(key);
  const upper = category.toUpperCase();
  const typeKey = `game.types.${upper}`;
  if ($te(typeKey)) return $t(typeKey);
  return getGameTypeLabel(category);
}
