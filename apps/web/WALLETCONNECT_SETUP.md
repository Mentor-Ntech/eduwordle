# 🔧 WalletConnect Project ID Setup

## ❌ Current Error

You're seeing this error because the WalletConnect Project ID is not set:

```
GET https://api.web3modal.org/appkit/v1/config?projectId=your_project_id_here 403 (Forbidden)
[Reown Config] Failed to fetch remote project configuration
```

## ✅ Solution: Get Your WalletConnect Project ID

### Step 1: Create Account on WalletConnect Cloud

1. Visit: **https://cloud.walletconnect.com/**
2. Sign up or log in with your account
3. Create a new project (or use existing one)

### Step 2: Get Your Project ID

1. After creating a project, you'll see your **Project ID**
2. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. Copy this Project ID

### Step 3: Update Environment Variables

**Option A: Edit `.env.local` file**

```bash
cd apps/web
# Edit .env.local and update:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
```

**Option B: Set via command line**

```bash
cd apps/web
echo 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here' >> .env.local
```

### Step 4: Restart Dev Server

**Important:** You MUST restart the dev server for env changes to take effect:

```bash
# Stop current server (Ctrl+C or Cmd+C)
# Then restart
npm run dev
```

## 📋 Quick Setup Script

Run this command and replace with your actual Project ID:

```bash
cd apps/web

# Create or update .env.local with your Project ID
cat > .env.local << 'EOF'
# WalletConnect Project ID
# Get yours from: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE

# Contract Addresses (Update after deployment)
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Daily Word (for UI feedback only)
NEXT_PUBLIC_DAILY_WORD=REACT

# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia
EOF

# Then edit .env.local and replace YOUR_PROJECT_ID_HERE with actual Project ID
```

## ✅ Verification

After setting the Project ID and restarting:

1. Check browser console - should NOT see 403 errors
2. Check for successful config fetch:
   ```
   [Reown Config] Successfully fetched remote project configuration
   ```
3. Wallet connection should work properly

## 🔍 Other Warnings (Non-Critical)

### 1. Extra attributes warning (data-new-gr-c-s-check-loaded)
- **Cause:** Browser extension (Grammarly)
- **Impact:** None - safe to ignore
- **Fix:** Not needed - it's from browser extension

### 2. Image width/height warning
- **Cause:** logo.svg missing width/height
- **Impact:** Minor - just a warning
- **Fix:** Add width/height to image or use CSS `width: auto` or `height: auto`

### 3. Lit dev mode warning
- **Cause:** Lit is in development mode
- **Impact:** None - just a warning
- **Fix:** Not needed for development

### 4. Coinbase analytics errors
- **Cause:** WalletConnect not properly configured
- **Impact:** None - analytics only
- **Fix:** Will go away once WalletConnect is configured

## 🎯 Priority Fixes

**Must Fix:**
1. ✅ Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`
2. ✅ Restart dev server

**Optional:**
- Fix image aspect ratio warning (if you want)

**Ignore:**
- Grammarly extension attributes
- Lit dev mode warning
- Coinbase analytics errors (non-critical)

## 📚 Resources

- **WalletConnect Cloud:** https://cloud.walletconnect.com/
- **Documentation:** https://docs.walletconnect.com/
- **Support:** https://walletconnect.com/support

---

**Status:** ⚠️ **ACTION REQUIRED - Set WalletConnect Project ID**

