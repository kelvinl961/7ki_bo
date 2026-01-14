# Transaction Mappings - Centralized Structure

## Overview

This directory contains centralized transaction type and subcategory mappings to ensure consistency across the entire application. All transaction translations are now managed in one place.

## File Structure

```
utils/
  ├── transactionMappings.ts      # All mapping constants
  └── transactionTranslations.ts   # Utility functions
```

## Files

### `transactionMappings.ts`
Contains all the mapping constants:
- `TRANSACTION_TYPE_MAPPINGS` - Maps transaction types (账变大类) to Chinese
- `TRANSACTION_SUBCATEGORY_MAPPINGS` - Maps subcategories (小类明细) to Chinese
- `GAME_CATEGORY_MAPPINGS` - Maps game category codes to Chinese
- `TRANSACTION_PATTERN_HANDLERS` - Handles complex patterns (e.g., game sessions)

### `transactionTranslations.ts`
Provides utility functions:
- `translateTransactionType(type)` - Translate transaction type to Chinese
- `translateSubcategory(subcategory, metadata?)` - Translate subcategory to Chinese
- `getTransactionTypeTagType(type)` - Get UI tag color for transaction type
- `isDebitType(type)` - Check if type is a debit
- `isCreditType(type)` - Check if type is a credit
- `getTransactionAmountColor(type, amount?)` - Get CSS class for amount display

## Usage

### Basic Usage

```typescript
import { translateTransactionType, translateSubcategory } from '#/utils/transactionTranslations';

// Translate transaction type
const typeText = translateTransactionType('deposit'); // Returns '充值'

// Translate subcategory
const subcategoryText = translateSubcategory('checkin'); // Returns '签到活动'
```

### With Metadata (for game sessions and VIP levels)

```typescript
// Game session with metadata
const gameSessionText = translateSubcategory('PG game session entry', {
  gameCategory: 'SLOT'
}); // Returns '大厅转到PG电子'

// VIP upgrade bonus with level
const vipText = translateSubcategory('VIP_UPGRADE_BONUS', {
  vipLevel: 5
}); // Returns 'VIP5晋升奖金'
```

### In Vue Components

```vue
<script setup lang="ts">
import { translateTransactionType, translateSubcategory } from '#/utils/transactionTranslations';

// In render function
render: (row) => {
  const translatedType = translateTransactionType(row.type);
  const translatedSubcategory = translateSubcategory(
    row.subcategoryDetails, 
    row.metadata
  );
  return h('span', translatedType);
}
</script>
```

## Adding New Mappings

### Adding a New Transaction Type

1. Open `transactionMappings.ts`
2. Add to `TRANSACTION_TYPE_MAPPINGS`:
```typescript
export const TRANSACTION_TYPE_MAPPINGS: Record<string, string> = {
  // ... existing mappings
  'new_transaction_type': '新交易类型', // ✅ Add here
};
```

### Adding a New Subcategory

1. Open `transactionMappings.ts`
2. Add to `TRANSACTION_SUBCATEGORY_MAPPINGS`:
```typescript
export const TRANSACTION_SUBCATEGORY_MAPPINGS: Record<string, string> = {
  // ... existing mappings
  'new_subcategory': '新子类别', // ✅ Add here
};
```

### Adding a Complex Pattern Handler

1. Open `transactionMappings.ts`
2. Add to `TRANSACTION_PATTERN_HANDLERS`:
```typescript
export const TRANSACTION_PATTERN_HANDLERS: PatternHandler[] = [
  // ... existing handlers
  {
    pattern: /^your-pattern$/i,
    handler: (match, metadata) => {
      // Your translation logic
      return '翻译结果';
    }
  }
];
```

## Benefits

✅ **Single Source of Truth** - All mappings in one place  
✅ **Easy to Extend** - Add new types in one file  
✅ **Reusable** - Import functions anywhere  
✅ **Type-Safe** - TypeScript support  
✅ **Maintainable** - Clear structure and comments  
✅ **Pattern Support** - Handles complex cases  

## Migration Status

- ✅ `UserDetailModal.vue` - Migrated to use centralized functions
- ⏳ Other components can be migrated as needed

## Examples

### Example 1: Simple Type Translation
```typescript
translateTransactionType('penalty_deduction') // Returns '罚款扣除'
```

### Example 2: Subcategory with Pattern
```typescript
translateSubcategory('withdrawal_success-PIX') // Returns '提现成功-PIX'
```

### Example 3: Game Session
```typescript
translateSubcategory('PG game session entry', { gameCategory: 'SLOT' })
// Returns '大厅转到PG电子'
```

### Example 4: VIP Reward with Level
```typescript
translateSubcategory('VIP_UPGRADE_BONUS', { vipLevel: 3 })
// Returns 'VIP3晋升奖金'
```

## Notes

- All mappings are case-insensitive
- Pattern handlers are checked first, then direct mappings
- Metadata is optional but recommended for complex translations
- Functions return the original value if no translation is found

