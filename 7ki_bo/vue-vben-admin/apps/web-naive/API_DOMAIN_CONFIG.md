# API Domain Configuration Audit

## Main API Domain Configuration

### ✅ Primary Configuration (Used by ALL API calls)
**File:** `src/api/request.ts` (line 22)
```typescript
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
```

**Source:** 
- **Development:** `VITE_GLOB_API_URL` from `.env` files
- **Production:** `window._VBEN_ADMIN_PRO_APP_CONF_.VITE_GLOB_API_URL` from `dist/_app.config.js`

**How it works:**
1. `useAppConfig` reads `VITE_GLOB_API_URL` from environment
2. In production, reads from `window._VBEN_ADMIN_PRO_APP_CONF_` (injected in `index.html`)
3. All `requestClient` calls use this `apiURL` as base URL

---

## Hardcoded API Domains Found

### ❌ **CRITICAL: Hardcoded Production Domain**

**File:** `src/utils/imageUtils.ts` (line 37)
```typescript
const baseUrl = 'https://api.pangu6688.com';  // ❌ HARDCODED!
```

**Impact:** Production images always use `api.pangu6688.com` regardless of environment config.

**Fix Needed:** Should use `useAppConfig` to get API URL dynamically.

---

### ⚠️ **Hardcoded Development Domains**

**File:** `src/utils/imageUtils.ts` (line 16, 20)
```typescript
return `http://localhost:5000${imageUrl}`;  // ❌ HARDCODED!
```

**File:** `src/views/finance/WithdrawManagement.vue` (line 2486, 2531)
```typescript
const apiUrl = import.meta.env.VITE_GLOB_API_URL || 'http://localhost:5888/api';  // ⚠️ Fallback hardcoded
```

**File:** `src/services/adminNotificationService.ts` (line 32)
```typescript
const apiUrl = import.meta.env.VITE_GLOB_API_URL || 'http://localhost:5888/api';  // ⚠️ Fallback hardcoded
```

**File:** `src/views/activity/components/ActivityFormModal.vue` (line 5132)
```typescript
const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/...`;  // ⚠️ Wrong env var + hardcoded
```

**File:** `src/layouts/basic.vue` (line 334)
```typescript
eventSource = new EventSource(`/api/admin/deposit-updates/stream?token=...`);  // ⚠️ Relative path (should use apiURL)
```

**File:** `src/views/media-manager/index.vue` (line 220, 222)
```typescript
return `http://localhost:5000${url}`;  // ❌ HARDCODED!
```

---

### ⚠️ **Other Hardcoded URLs (Non-API)**

**File:** `src/api/referral/index.ts` (line 150)
```typescript
baseUrl: string = 'https://sevenki.118br.com'  // ⚠️ Default referral domain
```

**File:** `src/composables/useSkinPreview.ts` (line 245)
```typescript
const baseUrl = `https://sweykpro.pubs3static.com/siteadmin/template/...`;  // ✅ OK (external CDN)
```

---

## Summary

### ✅ **Correctly Configured (Uses `useAppConfig`)**
- All API calls via `requestClient` in `src/api/*.ts` files
- Main request client in `src/api/request.ts`

### ❌ **Needs Fix (Hardcoded Domains)**
1. **`src/utils/imageUtils.ts`** - Line 37: `https://api.pangu6688.com` hardcoded
2. **`src/utils/imageUtils.ts`** - Line 16, 20: `http://localhost:5000` hardcoded
3. **`src/views/media-manager/index.vue`** - Line 220, 222: `http://localhost:5000` hardcoded

### ⚠️ **Needs Review (Fallback Hardcoded)**
1. **`src/views/finance/WithdrawManagement.vue`** - Uses `VITE_GLOB_API_URL` but hardcoded fallback
2. **`src/services/adminNotificationService.ts`** - Uses `VITE_GLOB_API_URL` but hardcoded fallback
3. **`src/views/activity/components/ActivityFormModal.vue`** - Uses wrong env var `VITE_API_URL` (should be `VITE_GLOB_API_URL`)
4. **`src/layouts/basic.vue`** - Uses relative path `/api/...` (should use `apiURL`)

---

## Recommended Fixes

### 1. Fix `imageUtils.ts` to use dynamic API URL
```typescript
import { useAppConfig } from '@vben/hooks';

export function getProductionImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // ✅ Use dynamic API URL instead of hardcoded
  const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
  const baseUrl = apiURL.replace('/api', ''); // Remove /api suffix
  
  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }
  return `${baseUrl}/${imageUrl}`;
}
```

### 2. Fix `ActivityFormModal.vue` to use correct env var
```typescript
// ❌ WRONG:
const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/...`;

// ✅ CORRECT:
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const downloadUrl = `${apiURL}/activities/promotion/template/download`;
```

### 3. Fix `basic.vue` SSE to use apiURL
```typescript
// ❌ WRONG:
eventSource = new EventSource(`/api/admin/deposit-updates/stream?token=...`);

// ✅ CORRECT:
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
eventSource = new EventSource(`${apiURL}/admin/deposit-updates/stream?token=...`);
```

---

## Where to Set API Domain

### Development
Set in `.env` or `.env.development`:
```bash
VITE_GLOB_API_URL=http://localhost:5000/api
```

### Production
After build, edit `dist/_app.config.js`:
```javascript
window._VBEN_ADMIN_PRO_APP_CONF_ = {
  VITE_GLOB_API_URL: 'https://api.pangu6688.com/api',
};
```

**Note:** This file is generated during build and can be edited after build without recompiling.
