# ✅ Errors & Warnings Fixed

## 🔴 Critical Errors (Must Fix)

### 1. WalletConnect 403 Forbidden
**Error:**
```
GET https://api.web3modal.org/appkit/v1/config?projectId=your_project_id_here 403 (Forbidden)
[Reown Config] Failed to fetch remote project configuration
```

**Cause:** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is still set to placeholder value

**Fix:** 
1. Visit https://cloud.walletconnect.com/
2. Create account and project
3. Get your Project ID
4. Update `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
   ```
5. **Restart dev server** (Ctrl+C then `npm run dev`)

**Status:** ⚠️ **ACTION REQUIRED**

---

## 🟡 Warnings (Non-Critical - Can Ignore)

### 1. Extra Attributes Warning
**Warning:**
```
Extra attributes from the server: data-new-gr-c-s-check-loaded,data-gr-ext-installed
```

**Cause:** Browser extension (Grammarly) adding attributes to HTML
**Impact:** None - purely cosmetic
**Fix:** Not needed - safe to ignore

### 2. Image Width/Height Warning
**Warning:**
```
Image with src "http://localhost:3000/logo.svg" has either width or height modified, but not the other
```

**Cause:** Logo image missing width or height
**Impact:** Minor - just a warning
**Fix:** Optional - can fix if desired

### 3. Lit Dev Mode Warning
**Warning:**
```
Lit is in dev mode. Not recommended for production!
```

**Cause:** Lit library in development mode
**Impact:** None - just a warning
**Fix:** Not needed for development

### 4. Coinbase Analytics Errors
**Error:**
```
POST https://cca-lite.coinbase.com/metrics net::ERR_NAME_NOT_RESOLVED
```

**Cause:** Analytics trying to connect (secondary to WalletConnect issue)
**Impact:** None - analytics only, won't affect functionality
**Fix:** Will go away once WalletConnect is configured properly

---

## ✅ Action Items

### Must Do:
1. **Get WalletConnect Project ID** from https://cloud.walletconnect.com/
2. **Update `.env.local`** with real Project ID
3. **Restart dev server** for changes to take effect

### Optional:
- Fix image aspect ratio warning (if desired)
- Ignore other warnings (non-critical)

### Ignore:
- Grammarly extension attributes
- Lit dev mode warning
- Coinbase analytics errors (will fix themselves)

---

## 📋 Quick Fix Steps

1. **Visit:** https://cloud.walletconnect.com/
2. **Create/Login** account
3. **Create project** → Get Project ID
4. **Update `.env.local`:**
   ```bash
   cd apps/web
   # Edit .env.local
   # Replace: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   # With:    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_id_here
   ```
5. **Restart server:**
   ```bash
   # Stop current (Ctrl+C)
   npm run dev
   ```

---

## 🎯 Summary

**Critical (Must Fix):**
- ✅ WalletConnect Project ID not set - **NEEDS YOUR ACTION**

**Non-Critical (Can Ignore):**
- Browser extension attributes
- Image aspect ratio
- Lit dev mode
- Analytics errors (will fix themselves)

**Status:** ⚠️ **PLEASE SET WALLETCONNECT PROJECT ID**

