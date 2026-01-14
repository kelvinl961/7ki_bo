/**
 * Transaction Translation Utilities
 * 
 * Provides utility functions for translating transaction types and subcategories
 * using the centralized mappings from transactionMappings.ts
 */

import {
  TRANSACTION_TYPE_MAPPINGS,
  TRANSACTION_SUBCATEGORY_MAPPINGS,
  TRANSACTION_PATTERN_HANDLERS,
} from './transactionMappings';

/**
 * Translate transaction type to Chinese (账变大类)
 * 
 * @param type - Transaction type (e.g., 'deposit', 'withdrawal', 'penalty_deduction')
 * @returns Chinese translation or original value if not found
 * 
 * @example
 * translateTransactionType('deposit') // Returns '充值'
 * translateTransactionType('penalty_deduction') // Returns '拒绝扣款'
 */
export function translateTransactionType(type: string | null | undefined): string {
  if (!type) return '-';
  
  const normalizedType = type.toLowerCase().trim();
  return TRANSACTION_TYPE_MAPPINGS[normalizedType] || type;
}

/**
 * Translate subcategory to Chinese (小类明细)
 * Supports pattern matching for complex cases (e.g., game sessions, withdrawal patterns)
 * 
 * @param subcategory - Subcategory string (e.g., 'checkin', 'PG game session entry')
 * @param metadata - Optional metadata object (e.g., { gameCategory: 'SLOT' })
 * @returns Chinese translation or original value if not found
 * 
 * @example
 * translateSubcategory('checkin') // Returns '签到活动'
 * translateSubcategory('PG game session entry', { gameCategory: 'SLOT' }) // Returns '大厅转到PG电子'
 * translateSubcategory('withdrawal_success-PIX') // Returns '提现成功-PIX'
 */
export function translateSubcategory(
  subcategory: string | null | undefined,
  metadata?: any
): string {
  if (!subcategory) return '-';
  
  const trimmed = subcategory.trim();
  if (!trimmed) return '-';
  
  // Try pattern handlers first (for complex cases like game sessions)
  for (const { pattern, handler } of TRANSACTION_PATTERN_HANDLERS) {
    const match = trimmed.match(pattern);
    if (match) {
      const result = handler(match, metadata);
      if (result) {
        return result;
      }
    }
  }
  
  // Try direct mapping (case-insensitive)
  const normalized = trimmed.toLowerCase();
  const directMatch = TRANSACTION_SUBCATEGORY_MAPPINGS[normalized] || 
                      TRANSACTION_SUBCATEGORY_MAPPINGS[trimmed];
  
  if (directMatch) {
    return directMatch;
  }
  
  // Special handling for "recharge" activity rewards - show activity name
  // When subcategoryDetails is "recharge" and it's an activity reward, map to activity name
  // This handles transactions where subcategoryDetails is "recharge" from recharge activity rewards
  if (trimmed === 'recharge') {
    // Check if this is a recharge activity reward (has activityId and activityType)
    if (metadata?.activityId && metadata?.activityType === 'recharge') {
      // For recharge activity rewards, show the activity name
      // Default to "充值累计活动" (Accumulated Recharge Activity) for recharge type activities
      return '充值累计活动';
    }
    // If it's just "recharge" without activity context, use default mapping
    // (fall through to direct mapping check below)
  }
  
  // Special handling for VIP_UPGRADE_BONUS - show VIP level if available
  if (trimmed === 'VIP_UPGRADE_BONUS' || trimmed.toUpperCase() === 'VIP_UPGRADE_BONUS') {
    let vipLevel = '';
    if (metadata?.vipLevel) {
      vipLevel = metadata.vipLevel;
    } else if (metadata?.vipLevelId) {
      vipLevel = metadata.vipLevelId;
    } else if (metadata?.toLevel) {
      vipLevel = metadata.toLevel;
    } else if (metadata?.level) {
      vipLevel = metadata.level;
    } else if (metadata?.vipLevelName) {
      vipLevel = metadata.vipLevelName;
    }
    
    // Format as "VIP{level}晋升奖金" (no space, direct concatenation)
    if (vipLevel) {
      return `VIP${vipLevel}晋升奖金`;
    }
    // Fallback to generic translation if no level found
    return 'VIP晋升奖金';
  }
  
  // 🎁 Handle other VIP reward types with level
  if (trimmed.startsWith('VIP_') && (trimmed.includes('REWARD') || trimmed.includes('BONUS'))) {
    let vipLevel = '';
    if (metadata?.vipLevel) {
      vipLevel = metadata.vipLevel;
    } else if (metadata?.vipLevelId) {
      vipLevel = metadata.vipLevelId;
    }
    
    if (vipLevel) {
      // Map reward types with VIP level
      if (trimmed.includes('MONTHLY')) return `VIP${vipLevel}月奖金`;
      if (trimmed.includes('WEEKLY')) return `VIP${vipLevel}周奖金`;
      if (trimmed.includes('DAILY')) return `VIP${vipLevel}每日奖金`;
      if (trimmed.includes('BIRTHDAY')) return `VIP${vipLevel}生日奖金`;
    }
  }
  
  // Return original if no match found
  return trimmed;
}

/**
 * Get transaction type tag color for UI display
 * 
 * @param type - Transaction type
 * @returns Tag type for Naive UI components
 */
export function getTransactionTypeTagType(type: string): 'success' | 'warning' | 'error' | 'info' {
  const normalizedType = (type || '').toLowerCase();
  
  // Credit types (positive amounts)
  if (['deposit', 'recharge', 'member_recharge', 'bonus', 'activity_reward', 
       'task_reward', 'vip_reward', 'rebate', 'commission', 'manual_credit', 
       'credit'].includes(normalizedType)) {
    return 'success';
  }
  
  // Debit types (negative amounts)
  if (['withdrawal', 'withdraw', 'fee', 'withdrawal_fee', 'penalty_deduction', 
       'penalty', 'manual_debit', 'debit'].includes(normalizedType)) {
    return 'error';
  }
  
  // Neutral types
  if (['transfer_in', 'transfer_out', 'game_transfer_in', 'game_transfer_out', 
       'adjustment', 'correction'].includes(normalizedType)) {
    return 'info';
  }
  
  // Default
  return 'warning';
}

/**
 * Check if transaction type is a debit (negative amount)
 * 
 * @param type - Transaction type
 * @returns true if type is a debit, false otherwise
 */
export function isDebitType(type: string): boolean {
  const normalizedType = (type || '').toLowerCase();
  
  const debitTypes = [
    'withdrawal',
    'withdraw',
    'fee',
    'withdrawal_fee',
    'penalty_deduction',
    'penalty',
    'manual_debit',
    'debit',
    'bet_placed',
    'bet',
    'bet_lost',
    'transfer_out',
    'game_transfer_out',
  ];
  
  return debitTypes.includes(normalizedType);
}

/**
 * Check if transaction type is a credit (positive amount)
 * 
 * @param type - Transaction type
 * @returns true if type is a credit, false otherwise
 */
export function isCreditType(type: string): boolean {
  const normalizedType = (type || '').toLowerCase();
  
  const creditTypes = [
    'deposit',
    'recharge',
    'member_recharge',
    'bonus',
    'activity_reward',
    'task_reward',
    'vip_reward',
    'rebate',
    'commission',
    'manual_credit',
    'credit',
    'bet_won',
    'bet_win',
    'transfer_in',
    'game_transfer_in',
  ];
  
  return creditTypes.includes(normalizedType);
}

/**
 * Get transaction amount color class
 * 
 * @param type - Transaction type
 * @param amount - Transaction amount (optional, for additional logic)
 * @returns CSS class name for amount display
 */
export function getTransactionAmountColor(type: string, amount?: number): string {
  if (isDebitType(type)) {
    return 'text-red-600';
  }
  if (isCreditType(type)) {
    return 'text-green-600';
  }
  // If amount is provided, use it to determine color
  if (amount !== undefined) {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  }
  return 'text-gray-600';
}

