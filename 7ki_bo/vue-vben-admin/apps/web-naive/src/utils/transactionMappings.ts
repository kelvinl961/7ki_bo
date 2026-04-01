/**
 * Centralized Transaction Type and Subcategory Mappings
 *
 * This file contains all transaction type (账变大类) and subcategory (小类明细) mappings
 * to ensure consistency across the entire application.
 *
 * When adding new transaction types or subcategories:
 * 1. Add the mapping here
 * 2. All components using these mappings will automatically pick up the new translation
 */

/**
 * Transaction Type Mappings (账变大类)
 * Maps transaction types to their Chinese display names
 */
export const TRANSACTION_TYPE_MAPPINGS: Record<string, string> = {
  // Deposits & Withdrawals
  deposit: '充值',
  recharge: '充值',
  member_recharge: '会员充值',
  withdrawal: '会员提现',
  withdraw: '会员提现',

  // Transfers
  transfer_in: '资金切换',
  transfer_out: '资金切换',
  game_transfer_in: '资金切换',
  game_transfer_out: '资金切换',

  // Betting
  bet_placed: '投注',
  bet: '投注',
  bet_won: '派彩',
  bet_win: '派彩',
  bet_lost: '投注',
  bet_settle: '结算',

  // Rewards & Bonuses
  bonus: '奖励',
  activity_reward: '活动',
  task_reward: '任务奖励',
  vip_reward: 'VIP奖励',
  deposit_bonus: '存款奖励',
  referral_bonus: '推荐奖励',
  rebate: '返水',
  commission: '佣金',

  // Manual operations
  manual_credit: '人工加款',
  manual_debit: '人工扣款',
  adjustment: '资金修复',
  correction: '资金修复',
  manual: '手动操作',

  // Fees
  fee: '手续费',
  withdrawal_fee: '提现手续费',

  // Penalties
  penalty_deduction: '拒绝扣款',
  penalty: '罚款',

  // Legacy/Alternative names
  credit: '加款',
  debit: '扣款',
};

/**
 * Transaction Subcategory Mappings (小类明细)
 * Maps subcategories to their Chinese display names
 */
export const TRANSACTION_SUBCATEGORY_MAPPINGS: Record<string, string> = {
  // Activities
  checkin: '签到活动',
  wagering: '打码活动',
  wagering_reward: '每日投注奖励',
  'Wagering Activity': '打码活动',
  rescue: '救援金活动',
  rescue_activity: '救援活动',
  promotion: '推广活动',
  promotion_activity: '推广活动',
  redpacket: '红包活动',
  newbie: '新人彩金',
  newbie_activity: '新人彩金活动',
  feedback: '反馈奖励', // ✅ FIX: Translate "feedback" to "反馈奖励"
  activity: '活动',
  activity_reward: '活动奖励',

  // Withdrawal flow
  withdrawal_freeze: '提现冻结',
  withdrawal_unfreeze: '提现解冻',
  withdrawal_success: '提现成功',
  withdrawal: '提现',

  // Recharge methods
  online_recharge: '在线充值',
  'online recharge': '在线充值',
  'Online Recharge': '在线充值',

  // Referrals & VIP
  referral: '推荐好友开宝箱活动',
  vip_reward: 'VIP奖励',
  VIP_MONTHLY_REWARD: 'VIP月奖金',
  MONTHLY_REWARD: 'VIP月奖金',
  VIP_WEEKLY_REWARD: 'VIP周奖金',
  WEEKLY_REWARD: 'VIP周奖金',
  VIP_DAILY_REWARD: 'VIP每日奖金',
  DAILY_REWARD: 'VIP每日奖金',
  VIP_BIRTHDAY_REWARD: 'VIP生日奖金',
  BIRTHDAY_REWARD: 'VIP生日奖金',
  VIP_UPGRADE_BONUS: 'VIP晋升奖金',
  'upgrade bonus': 'VIP晋升奖金',

  // Bonuses & Rewards
  bonus: '优惠',
  recharge_rebate: '充值返利',
  customer_compensation: '客服补偿',
  system_error_compensation: '系统错误补偿',
  promotion_reward: '促销奖励',
  referral_reward: '推荐奖励',
  registration_reward: '注册奖励',
  newbie_task: '新手任务奖励',
  task_reward: '任务奖励',
  other_credit: '其他加款',

  // Penalties & Deductions
  violation_penalty: '违规扣款',
  system_error_debit: '系统错误扣款',
  dispute_resolution: '争议处理',
  fee_deduction: '手续费',
  other_debit: '其他扣款',
  penalty_deduction: '拒绝扣款',

  // Adjustments
  balance_adjustment: '余额调整',
  exchange_rate_adjustment: '汇率调整',
  account_migration: '账户迁移',

  // Corrections
  data_correction: '数据修正',
  duplicate_correction: '重复交易修正',
  error_correction: '错误交易修正',

  // Bonus management
  bonus_grant: '奖金发放',
  bonus_revoke: '奖金回收',
  bonus_correction: '奖金修正',

  // Fines
  violation_fine: '违规罚款',
  overdue_penalty: '逾期罚款',
  abuse_penalty: '滥用罚款',

  // Manual transaction subtypes
  manual_credit: '手动加款',
  manual_debit: '手动扣款',
  manual_deduct: '手动扣款',
  manual_recharge: '手动充值', // ✅ NEW: Manual recharge (admin approved deposits)

  // Commission
  claimed: '代理佣金', // ✅ FIX: Translate "claimed" to Chinese for commission transactions
  commission_claimed: '代理佣金',
  commission: '代理佣金',
};

/**
 * Game Category Mappings
 * Used for translating game category codes in game session patterns
 */
export const GAME_CATEGORY_MAPPINGS: Record<string, string> = {
  SLOT: '电子',
  FISH: '捕鱼',
  LIVE: '真人',
  SPORT: '体育',
  LOTTERY: '彩票',
  POKER: '棋牌',
  ARCADE: '街机',
  EGAME: '电子',
  TABLE: '桌游',
  CHESS: '棋牌',
};

/**
 * Pattern Handler Interface
 * For complex translation patterns that require regex matching
 */
export interface PatternHandler {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, metadata?: any) => string;
}

/**
 * Special Pattern Handlers
 * Handles complex subcategory patterns that can't be directly mapped
 */
export const TRANSACTION_PATTERN_HANDLERS: PatternHandler[] = [
  // Wagering reward tier pattern: "wagering_reward_tier_{tierId}"
  {
    pattern: /^wagering_reward_tier_(\d+)$/i,
    handler: (match) => {
      const tierId = match[1];
      return `每日投注奖励 - 第${tierId}档`;
    },
  },

  // Game session pattern: "PG game session entry" or "PG game session return"
  {
    pattern: /^(.+?)\s+game\s+session\s+(entry|return)$/i,
    handler: (match, metadata) => {
      const providerFromText = match[1];
      const action = match[2]?.toLowerCase() || '';

      const provider =
        metadata?.platformName || metadata?.gameProvider || providerFromText;

      let gameCategory = '游戏';
      if (metadata?.gameCategory) {
        const categoryUpper = String(metadata.gameCategory).toUpperCase();
        gameCategory = GAME_CATEGORY_MAPPINGS[categoryUpper] || metadata.gameCategory;
      }

      const gameInfo = `${provider}${gameCategory}`;

      if (action === 'entry') {
        return `大厅转到${gameInfo}`;
      } else if (action === 'return') {
        return `${gameInfo}转到大厅`;
      }

      return '';
    },
  },

  // Withdrawal success pattern: "withdrawal_success-{PAYMENT_METHOD}"
  {
    pattern: /^withdrawal_success-(.+)$/i,
    handler: (match) => {
      const paymentMethod = match[1];
      return `提现成功-${paymentMethod}`;
    },
  },
];
