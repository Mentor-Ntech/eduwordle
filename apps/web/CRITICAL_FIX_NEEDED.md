# ⚠️ CRITICAL: WalletConnect Project ID Required

## 🔴 Main Issue: WalletConnect Not Configured

Your app is currently using a **placeholder** WalletConnect Project ID (`your_project_id_here`), which is causing:

- ❌ 403 Forbidden errors from WalletConnect API
- ❌ Wallet connection not working
- ❌ Secondary analytics errors

## ✅ Quick Fix (5 minutes)

### Step 1: Get WalletConnect Project ID

1. **Visit:** https://cloud.walletconnect.com/
2. **Sign up/Login** (free account)
3. **Create a new project** (or use existing)
4. **Copy your Project ID** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 2: Update Environment Variable

Edit `apps/web/.env.local`:

```bash
cd apps/web
# Open .env.local in your editor
# Find this line:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Replace with your actual Project ID:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_from_walletconnect_cloud
```

**Or use this command:**
```bash
cd apps/web
# Replace YOUR_ACTUAL_PROJECT_ID with the one from WalletConnect Cloud
sed -i '' 's/NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=.*/NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_ACTUAL_PROJECT_ID/' .env.local
```

### Step 3: Restart Dev Server

**IMPORTANT:** You MUST restart the dev server for env changes:

```bash
# Stop current server (Ctrl+C or Cmd+C)
# Then restart
npm run dev
```

### Step 4: Verify Fix

After restarting, check browser console:
- ✅ Should NOT see 403 errors
- ✅ Should see: `[Reown Config] Successfully fetched remote project configuration`
- ✅ Wallet connection should work

---

## 🟡 Other Warnings (Non-Critical)

These warnings are **NOT errors** and can be ignored:

### 1. Extra Attributes Warning
```
Extra attributes from the server: data-new-gr-c-s-check-loaded
```
- **Cause:** Grammarly browser extension
- **Fix:** None needed - ignore it

### 2. Image Width/Height Warning
```
Image with src "logo.svg" has either width or height modified
```
- **Status:** ✅ **FIXED** - Added width/height styles
- **Impact:** None - just a warning

### 3. Lit Dev Mode Warning
```
Lit is in dev mode. Not recommended for production!
```
- **Cause:** Development mode (normal)
- **Fix:** None needed - production build will be optimized

### 4. Coinbase Analytics Errors
```
POST https://cca-lite.coinbase.com/metrics net::ERR_NAME_NOT_RESOLVED
```
- **Cause:** Secondary to WalletConnect issue
- **Fix:** Will resolve automatically once WalletConnect is configured

---

## 📋 Summary

**MUST FIX (Critical):**
1. ✅ Set real WalletConnect Project ID in `.env.local`
2. ✅ Restart dev server

**ALREADY FIXED:**
- ✅ Image aspect ratio warning
- ✅ Webpack async-storage error

**CAN IGNORE:**
- Browser extension attributes (Grammarly)
- Lit dev mode warning
- Analytics errors (will fix themselves)

---

## 🚀 After Fixing

Once you set the WalletConnect Project ID and restart:

1. ✅ Wallet connection will work
2. ✅ All 403 errors will disappear
3. ✅ Analytics errors will resolve
4. ✅ App will be fully functional

---

**Status:** ⚠️ **ACTION REQUIRED - Set WalletConnect Project ID and Restart Server**

**Need Help?**
- WalletConnect Docs: https://docs.walletconnect.com/
- Cloud Console: https://cloud.walletconnect.com/

