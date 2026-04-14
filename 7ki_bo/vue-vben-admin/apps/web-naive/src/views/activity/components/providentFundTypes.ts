import type { SelectedPlatform } from '#/api/activity/platformSelection';

/** 公积金设置完整快照（列表存此结构，弹窗读写） */
export interface ProvidentFundFormSnapshot {
  nameMode: 'system' | 'custom';
  displayName: string;
  currencies: string[];
  depositMinByCurrency: Record<string, number | null>;
  giftRatioPercent: number;
  cumulativeGiftCap: number;
  giftFrequency: number;
  betMultipleWithGift: number;
  wagerNewDepositAfterCap: number;
  platformRestriction:
    | 'all_platforms'
    | 'specific_platforms'
    | 'exclude_platforms';
  selectedPlatforms: SelectedPlatform[];
}

export interface ProvidentFundListItem {
  id: string;
  snapshot: ProvidentFundFormSnapshot;
  updatedAt: number;
}

export function cloneSnapshot(
  s: ProvidentFundFormSnapshot,
): ProvidentFundFormSnapshot {
  return JSON.parse(JSON.stringify(s)) as ProvidentFundFormSnapshot;
}

export function defaultProvidentFundSnapshot(): ProvidentFundFormSnapshot {
  return {
    nameMode: 'system',
    displayName: '公积金',
    currencies: ['BRL'],
    depositMinByCurrency: { BRL: 0 },
    giftRatioPercent: 100,
    cumulativeGiftCap: 0,
    giftFrequency: 0,
    betMultipleWithGift: 60,
    wagerNewDepositAfterCap: 15,
    platformRestriction: 'specific_platforms',
    selectedPlatforms: [],
  };
}
