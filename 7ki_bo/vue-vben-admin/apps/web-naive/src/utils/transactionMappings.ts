/**
 * Centralized Transaction Type and Subcategory Mappings
 *
 * Display labels are in finance.txTypes / finance.txSubs / finance.txGameCats (i18n).
 * These maps keep the set of known codes and legacy aliases.
 */

import { $t, $te } from '@vben/locales';

/**
 * Known transaction type codes (账变大类).
 * Values are i18n key suffixes under finance.txTypes.
 */
export const TRANSACTION_TYPE_MAPPINGS: Record<string, string> = {
  deposit: 'deposit',
  recharge: 'recharge',
  member_recharge: 'member_recharge',
  withdrawal: 'withdrawal',
  withdraw: 'withdraw',
  transfer_in: 'transfer_in',
  transfer_out: 'transfer_out',
  game_transfer_in: 'game_transfer_in',
  game_transfer_out: 'game_transfer_out',
  bet_placed: 'bet_placed',
  bet: 'bet',
  bet_won: 'bet_won',
  bet_win: 'bet_win',
  bet_lost: 'bet_lost',
  bet_settle: 'bet_settle',
  bonus: 'bonus',
  activity_reward: 'activity_reward',
  task_reward: 'task_reward',
  vip_reward: 'vip_reward',
  deposit_bonus: 'deposit_bonus',
  referral_bonus: 'referral_bonus',
  rebate: 'rebate',
  commission: 'commission',
  provident_fund: 'provident_fund',
  manual_credit: 'manual_credit',
  manual_debit: 'manual_debit',
  adjustment: 'adjustment',
  correction: 'correction',
  manual: 'manual',
  fee: 'fee',
  withdrawal_fee: 'withdrawal_fee',
  penalty_deduction: 'penalty_deduction',
  penalty: 'penalty',
  credit: 'credit',
  debit: 'debit',
};

/**
 * Known subcategory codes (小类明细).
 * Values are i18n key suffixes under finance.txSubs.
 */
export const TRANSACTION_SUBCATEGORY_MAPPINGS: Record<string, string> = {
  checkin: 'checkin',
  wagering: 'wagering',
  wagering_reward: 'wagering_reward',
  'Wagering Activity': 'wagering',
  rescue: 'rescue',
  rescue_activity: 'rescue_activity',
  promotion: 'promotion',
  promotion_activity: 'promotion_activity',
  redpacket: 'redpacket',
  newbie: 'newbie',
  newbie_activity: 'newbie_activity',
  feedback: 'feedback',
  activity: 'activity',
  activity_reward: 'activity_reward',
  withdrawal_freeze: 'withdrawal_freeze',
  withdrawal_unfreeze: 'withdrawal_unfreeze',
  withdrawal_success: 'withdrawal_success',
  withdrawal: 'withdrawal',
  online_recharge: 'online_recharge',
  'online recharge': 'online_recharge',
  'Online Recharge': 'online_recharge',
  referral: 'referral',
  vip_reward: 'vip_reward',
  VIP_MONTHLY_REWARD: 'VIP_MONTHLY_REWARD',
  MONTHLY_REWARD: 'MONTHLY_REWARD',
  VIP_WEEKLY_REWARD: 'VIP_WEEKLY_REWARD',
  WEEKLY_REWARD: 'WEEKLY_REWARD',
  VIP_DAILY_REWARD: 'VIP_DAILY_REWARD',
  DAILY_REWARD: 'DAILY_REWARD',
  VIP_BIRTHDAY_REWARD: 'VIP_BIRTHDAY_REWARD',
  BIRTHDAY_REWARD: 'BIRTHDAY_REWARD',
  VIP_UPGRADE_BONUS: 'VIP_UPGRADE_BONUS',
  'upgrade bonus': 'VIP_UPGRADE_BONUS',
  bonus: 'bonus',
  recharge_rebate: 'recharge_rebate',
  customer_compensation: 'customer_compensation',
  system_error_compensation: 'system_error_compensation',
  promotion_reward: 'promotion_reward',
  referral_reward: 'referral_reward',
  registration_reward: 'registration_reward',
  newbie_task: 'newbie_task',
  task_reward: 'task_reward',
  other_credit: 'other_credit',
  violation_penalty: 'violation_penalty',
  system_error_debit: 'system_error_debit',
  dispute_resolution: 'dispute_resolution',
  fee_deduction: 'fee_deduction',
  other_debit: 'other_debit',
  penalty_deduction: 'penalty_deduction',
  balance_adjustment: 'balance_adjustment',
  exchange_rate_adjustment: 'exchange_rate_adjustment',
  account_migration: 'account_migration',
  data_correction: 'data_correction',
  duplicate_correction: 'duplicate_correction',
  error_correction: 'error_correction',
  bonus_grant: 'bonus_grant',
  bonus_revoke: 'bonus_revoke',
  bonus_correction: 'bonus_correction',
  violation_fine: 'violation_fine',
  overdue_penalty: 'overdue_penalty',
  abuse_penalty: 'abuse_penalty',
  manual_credit: 'manual_credit',
  manual_debit: 'manual_debit',
  manual_deduct: 'manual_deduct',
  manual_recharge: 'manual_recharge',
  provident_fund: 'provident_fund',
  provident_reward: 'provident_reward',
  claimed: 'claimed',
  commission_claimed: 'commission_claimed',
  commission: 'commission',
};

/**
 * Game category codes used in game-session patterns.
 */
export const GAME_CATEGORY_MAPPINGS: Record<string, string> = {
  SLOT: 'SLOT',
  FISH: 'FISH',
  LIVE: 'LIVE',
  SPORT: 'SPORT',
  LOTTERY: 'LOTTERY',
  POKER: 'POKER',
  ARCADE: 'ARCADE',
  EGAME: 'EGAME',
  TABLE: 'TABLE',
  CHESS: 'CHESS',
};

function txTypeLabel(key: string): string {
  const i18nKey = `finance.txTypes.${key}`;
  return $te(i18nKey) ? $t(i18nKey) : key;
}

function txSubLabel(key: string): string {
  const i18nKey = `finance.txSubs.${key}`;
  return $te(i18nKey) ? $t(i18nKey) : key;
}

function txGameCatLabel(key: string): string {
  const i18nKey = `finance.txGameCats.${key}`;
  return $te(i18nKey) ? $t(i18nKey) : key;
}

export interface PatternHandler {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, metadata?: any) => string;
}

/**
 * Special pattern handlers for complex subcategory strings.
 */
export const TRANSACTION_PATTERN_HANDLERS: PatternHandler[] = [
  {
    pattern: /^wagering_reward_tier_(\d+)$/i,
    handler: (match) => {
      const tierId = match[1];
      return $t('finance.txPatterns.wageringTier', [tierId]);
    },
  },
  {
    pattern: /^(.+?)\s+game\s+session\s+(entry|return)$/i,
    handler: (match, metadata) => {
      const providerFromText = match[1];
      const action = match[2]?.toLowerCase() || '';

      const provider =
        metadata?.platformName || metadata?.gameProvider || providerFromText;

      let gameCategory = $t('finance.txPatterns.gameFallback');
      if (metadata?.gameCategory) {
        const categoryUpper = String(metadata.gameCategory).toUpperCase();
        const mapped = GAME_CATEGORY_MAPPINGS[categoryUpper];
        gameCategory = mapped
          ? txGameCatLabel(mapped)
          : metadata.gameCategory;
      }

      const gameInfo = `${provider}${gameCategory}`;

      if (action === 'entry') {
        return $t('finance.txPatterns.sessionEntry', [gameInfo]);
      }
      if (action === 'return') {
        return $t('finance.txPatterns.sessionReturn', [gameInfo]);
      }

      return '';
    },
  },
  {
    pattern: /^withdrawal_success-(.+)$/i,
    handler: (match) => {
      const paymentMethod = match[1];
      return $t('finance.txPatterns.withdrawalSuccess', [paymentMethod]);
    },
  },
];

export { txGameCatLabel, txSubLabel, txTypeLabel };
