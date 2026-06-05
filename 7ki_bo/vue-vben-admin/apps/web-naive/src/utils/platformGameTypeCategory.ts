/** Tab keys used in DistributeRewardModal / activity platform pickers */
export const PLATFORM_TAB_CATEGORIES = [
  { label: '棋牌', value: 'chess_cards' },
  { label: '捕鱼', value: 'hunting' },
  { label: '电子', value: 'slot' },
  { label: '区块链', value: 'blockchain' },
  { label: '真人', value: 'live' },
  { label: '体育', value: 'sports' },
  { label: '彩票', value: 'lottery' },
  { label: '其他', value: 'other' },
] as const;

export type PlatformTabCategory = (typeof PLATFORM_TAB_CATEGORIES)[number]['value'];

/**
 * Map API gameType (e.g. CHESS_CARDS, SLOT) to tab category value (chess_cards, slot).
 */
export function normalizeGameTypeToTabCategory(
  gameType: string | null | undefined,
): PlatformTabCategory | 'other' {
  if (!gameType) return 'other';
  const key = gameType.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');

  const aliases: Record<string, PlatformTabCategory | 'other'> = {
    chess_cards: 'chess_cards',
    chess: 'chess_cards',
    table: 'chess_cards',
    hunting: 'hunting',
    fish: 'hunting',
    fishing: 'hunting',
    slot: 'slot',
    slots: 'slot',
    video: 'slot',
    arcade: 'slot',
    blockchain: 'blockchain',
    live: 'live',
    sports: 'sports',
    esports: 'sports',
    lottery: 'lottery',
    simulation: 'other',
    cockfight: 'other',
    other: 'other',
  };

  return aliases[key] ?? (key as PlatformTabCategory);
}
