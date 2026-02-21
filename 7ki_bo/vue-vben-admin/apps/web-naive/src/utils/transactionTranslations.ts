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
import { getActivityById } from '#/api/activity';

// Cache for activity names to avoid repeated API calls
const activityNameCache = new Map<number, string>();
const activityNameCacheExpiry = new Map<number, number>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch activity name by ID with caching
 */
async function getActivityName(activityId: number | string): Promise<string | null> {
  const id = typeof activityId === 'string' ? parseInt(activityId, 10) : activityId;
  
  if (isNaN(id)) {
    return null;
  }

  // Check cache first
  const cached = activityNameCache.get(id);
  const expiry = activityNameCacheExpiry.get(id);
  if (cached && expiry && Date.now() < expiry) {
    return cached;
  }

  try {
    const activity = await getActivityById(id);
    const activityName = activity?.locales?.[0]?.title || 
                        activity?.config?.title || 
                        activity?.title || 
                        null;
    
    if (activityName) {
      // Cache the result
      activityNameCache.set(id, activityName);
      activityNameCacheExpiry.set(id, Date.now() + CACHE_TTL);
    }
    
    return activityName;
  } catch (error) {
    console.warn(`[translateSubcategory] Failed to fetch activity ${id}:`, error);
    return null;
  }
}

/**
 * Pre-load activity names for a list of transactions
 * This populates the cache so translateSubcategory can use them synchronously
 * 
 * @param transactions - Array of transaction objects with metadata containing activityId
 */
export async function preloadActivityNames(transactions: any[]): Promise<void> {
  // Extract unique activity IDs from recharge activity transactions
  const activityIds = new Set<number>();
  
  transactions.forEach(tx => {
    if (tx.metadata?.activityId && 
        tx.metadata?.activityType === 'recharge' && 
        (!tx.metadata?.activityTitle || tx.metadata?.activityTitle === 'recharge')) {
      const id = typeof tx.metadata.activityId === 'string' 
        ? parseInt(tx.metadata.activityId, 10) 
        : tx.metadata.activityId;
      if (!isNaN(id)) {
        activityIds.add(id);
      }
    }
  });
  
  // Filter out already cached activities
  const uncachedIds = Array.from(activityIds).filter(id => {
    const cached = activityNameCache.get(id);
    const expiry = activityNameCacheExpiry.get(id);
    return !(cached && expiry && Date.now() < expiry);
  });
  
  if (uncachedIds.length === 0) {
    return;
  }
  
  // Fetch all activity names in parallel
  console.log(`[preloadActivityNames] Pre-loading ${uncachedIds.length} activity names...`);
  await Promise.allSettled(
    uncachedIds.map(id => getActivityName(id))
  );
  console.log(`[preloadActivityNames] Pre-loaded ${uncachedIds.length} activity names`);
}

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
 * 
 * Note: For async version that fetches activity names, use translateSubcategoryAsync
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
  
  // Special handling for "recharge" activity rewards - show activity name from metadata
  // When subcategoryDetails is "recharge" and it's an activity reward, use activity title from metadata
  // This handles transactions where subcategoryDetails is "recharge" from recharge activity rewards
  if (trimmed === 'recharge') {
    // Check if this is a recharge activity reward (has activityId and activityType)
    if (metadata?.activityId && metadata?.activityType === 'recharge') {
      // ✅ PRIORITY 1: Use activity title from metadata if available and valid
      const activityTitle = metadata?.activityTitle || metadata?.subcategoryDetails;
      
      if (activityTitle && activityTitle !== 'recharge' && activityTitle.trim() !== '') {
        return activityTitle;
      }
      
      // ✅ PRIORITY 2: Check cache for activity name (populated by async version or pre-loading)
      const activityId = metadata.activityId;
      if (activityId) {
        const id = typeof activityId === 'string' ? parseInt(activityId, 10) : activityId;
        if (!isNaN(id)) {
          const cached = activityNameCache.get(id);
          const expiry = activityNameCacheExpiry.get(id);
          if (cached && expiry && Date.now() < expiry) {
            return cached;
          }
        }
      }
      
      // ✅ FALLBACK: Check condition from metadata to determine correct translation
      const condition = metadata?.condition || 
                        metadata?.rewardMetadata?.condition || 
                        metadata?.participationInput?.condition ||
                        metadata?.participationInput?.participationMethod;
      
      // ✅ FIX: Also check description pattern as fallback (首充奖励 vs 累计充值奖励)
      const description = metadata?.description || metadata?.rowDescription || '';
      const isFirstDepositFromDescription = description.includes('首充奖励') || description.includes('首充');
      const isAccumulateFromDescription = description.includes('累计充值奖励') || description.includes('累计充值');
      
      if (condition === 'first_deposit' || isFirstDepositFromDescription) {
        return '首充活动'; // First Deposit Activity (fallback)
      } else if (condition === 'accumulate_recharge' || isAccumulateFromDescription) {
        return '充值累计活动'; // Accumulated Recharge Activity (fallback)
      } else if (condition === 'single_recharge') {
        return '单笔充值活动'; // Single Deposit Activity (fallback)
      } else if (condition === 'recharge_count') {
        return '充值次数活动'; // Deposit Count Activity (fallback)
      }
      
      // Default to "充值累计活动" (Accumulated Recharge Activity) if condition not found
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
 * Async version of translateSubcategory that fetches real activity names from API
 * Use this when you need the actual activity name from the database
 * 
 * @param subcategory - Subcategory string
 * @param metadata - Optional metadata object
 * @returns Promise<string> - Chinese translation or original value if not found
 */
export async function translateSubcategoryAsync(
  subcategory: string | null | undefined,
  metadata?: any
): Promise<string> {
  if (!subcategory) return '-';
  
  const trimmed = subcategory.trim();
  if (!trimmed) return '-';
  
  // For "recharge" activity rewards, fetch real activity name from API
  if (trimmed === 'recharge') {
    if (metadata?.activityId && metadata?.activityType === 'recharge') {
      // ✅ PRIORITY 1: Use activity title from metadata if available
      const activityTitle = metadata?.activityTitle || metadata?.subcategoryDetails;
      
      if (activityTitle && activityTitle !== 'recharge' && activityTitle.trim() !== '') {
        return activityTitle;
      }
      
      // ✅ PRIORITY 2: Fetch actual activity name from API using activityId
      const activityId = metadata.activityId;
      if (activityId) {
        try {
          const realActivityName = await getActivityName(activityId);
          if (realActivityName && realActivityName.trim() !== '') {
            return realActivityName;
          }
        } catch (error) {
          console.warn(`[translateSubcategoryAsync] Failed to fetch activity name for ${activityId}:`, error);
        }
      }
      
      // ✅ FALLBACK: Use condition-based translation
      const condition = metadata?.condition || 
                        metadata?.rewardMetadata?.condition || 
                        metadata?.participationInput?.condition ||
                        metadata?.participationInput?.participationMethod;
      
      const description = metadata?.description || metadata?.rowDescription || '';
      const isFirstDepositFromDescription = description.includes('首充奖励') || description.includes('首充');
      const isAccumulateFromDescription = description.includes('累计充值奖励') || description.includes('累计充值');
      
      if (condition === 'first_deposit' || isFirstDepositFromDescription) {
        return '首充活动';
      } else if (condition === 'accumulate_recharge' || isAccumulateFromDescription) {
        return '充值累计活动';
      } else if (condition === 'single_recharge') {
        return '单笔充值活动';
      } else if (condition === 'recharge_count') {
        return '充值次数活动';
      }
      
      return '充值累计活动';
    }
  }
  
  // For all other cases, use the synchronous version
  return translateSubcategory(subcategory, metadata);
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

