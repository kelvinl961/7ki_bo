# API Endpoint 404 Fix

## Problem

The following endpoints are returning 404 errors:

1. `/api/admin/bet-transactions` (with query params)
2. `/api/admin/bet-transactions/types`
3. `/api/admin/bet-transactions/categories`

## Root Cause

The backend may not have these endpoints implemented, or they might be under a different path structure.

## Solution Implemented

### 1. ✅ Added Fallback Endpoints

All bet-transactions API calls now try alternative endpoints if the primary endpoint returns 404:

**Primary Endpoints (with `/admin` prefix):**

- `/admin/bet-transactions`
- `/admin/bet-transactions/types`
- `/admin/bet-transactions/categories`
- `/admin/bet-transactions/providers`

**Fallback Endpoints (without `/admin` prefix):**

- `/bet-transactions`
- `/bet-transactions/types`
- `/bet-transactions/categories`
- `/bet-transactions/providers`

### 2. ✅ Graceful Error Handling

- If primary endpoint returns 404, automatically tries fallback
- If both fail, returns empty array for filter options (prevents UI breakage)
- For main list endpoint, throws error (so user knows data failed to load)

### 3. ✅ Default Values for Types

If `/bet-transactions/types` fails, returns default types:

- `bet_placed` (下注)
- `bet_won` (中奖)
- `bet_lost` (输)
- `bet_draw` (平局)
- `bet_cancelled` (取消)
- `bet_refunded` (退款)

## Files Modified

### `src/api/game/betTransactions.ts`

- ✅ `getBetTransactionsApi()` - Added fallback to `/bet-transactions`
- ✅ `getGameCategoriesApi()` - Added fallback to `/bet-transactions/categories`
- ✅ `getBetTransactionTypesApi()` - Added fallback to `/bet-transactions/types` + default values
- ✅ `getGameProvidersApi()` - Added fallback to `/bet-transactions/providers`

## Next Steps (Backend Required)

**Option 1: Implement Missing Endpoints** If the backend doesn't have these endpoints, they need to be created:

- `GET /api/admin/bet-transactions` - List bet transactions with filters
- `GET /api/admin/bet-transactions/types` - Get unique transaction types
- `GET /api/admin/bet-transactions/categories` - Get unique game categories
- `GET /api/admin/bet-transactions/providers` - Get unique game providers

**Option 2: Use Alternative Endpoints** If the endpoints exist under a different path, update the code to use the correct paths.

**Option 3: Remove `/admin` Prefix** If endpoints should be `/bet-transactions` instead of `/admin/bet-transactions`, the fallback will handle it automatically.

## Testing

After deploying, check browser console:

- ✅ Should see warning if primary endpoint returns 404
- ✅ Should see if fallback endpoint succeeds
- ✅ Filter dropdowns should still work (with empty/default values if endpoints fail)

## Verification

1. Open browser DevTools → Network tab
2. Navigate to Bet Records page
3. Check for:
   - `/admin/bet-transactions` - Should work or fallback to `/bet-transactions`
   - `/admin/bet-transactions/types` - Should work or fallback
   - `/admin/bet-transactions/categories` - Should work or fallback

If all endpoints return 404, the backend needs to implement them.
