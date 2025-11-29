# 🔐 Vercel Environment Variables Guide

Complete list of all environment variables needed for your EduWordle deployment on Vercel.

## 📋 Required Environment Variables

### 1. **Blockchain Configuration**

#### `NEXT_PUBLIC_TARGET_CHAIN_ID`
- **Description:** The Celo network chain ID your contracts are deployed on
- **Required:** Yes
- **Example:** `11142220` (Celo Sepolia Testnet)
- **Options:**
  - `11142220` - Celo Sepolia Testnet (default)
  - `44787` - Celo Alfajores Testnet
  - `42220` - Celo Mainnet

#### `NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS`
- **Description:** The deployed EduWordle contract address
- **Required:** Yes
- **Example:** `0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95`
- **How to get:** After deploying contracts, check `apps/contracts/ignition/deployments/chain-{CHAIN_ID}/deployed_addresses.json`

#### `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS`
- **Description:** The deployed Leaderboard contract address
- **Required:** Yes
- **Example:** `0x30dd0Ff90fA9e956964f8C033F8651Bf40A5Fc08`
- **How to get:** After deploying contracts, check `apps/contracts/ignition/deployments/chain-{CHAIN_ID}/deployed_addresses.json`

### 2. **WalletConnect Configuration**

#### `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Description:** Your WalletConnect Cloud Project ID (required for wallet connections)
- **Required:** Yes ⚠️
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **How to get:**
  1. Go to https://cloud.walletconnect.com/
  2. Sign up or log in
  3. Create a new project
  4. Copy the Project ID
- **Note:** This is required for the app to work - without it, wallet connections will fail

### 3. **Supabase Configuration** (Optional but Recommended)

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description:** Your Supabase project URL
- **Required:** No (but recommended for leaderboard stats)
- **Example:** `https://abcdefghijklmnop.supabase.co`
- **How to get:**
  1. Go to https://supabase.com/
  2. Create a project or use existing one
  3. Go to Settings > API
  4. Copy the Project URL

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description:** Your Supabase anonymous/public key
- **Required:** No (but recommended for leaderboard stats)
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get:**
  1. In Supabase dashboard, go to Settings > API
  2. Copy the `anon` `public` key
- **Note:** This is safe to expose publicly (it's the anon key)

### 4. **Daily Word** (Optional)

#### `NEXT_PUBLIC_DAILY_WORD`
- **Description:** Today's word for UI feedback (contract uses hash, this is just for display)
- **Required:** No
- **Example:** `DREAM`
- **Note:** 
  - This is automatically updated by the daily automation script
  - The app will also fetch from `/daily-word.json` if this is not set
  - Contract verification uses hash, not this value

---

## 🚀 How to Add Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key:** The variable name (e.g., `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`)
   - **Value:** The actual value
   - **Environment:** Select which environments (Production, Preview, Development)
5. Click **Save**
6. **Important:** Redeploy your application for changes to take effect

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
vercel env add NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_TARGET_CHAIN_ID
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Pull environment variables to verify
vercel env pull .env.local
```

---

## 📝 Complete Example Configuration

Here's what your Vercel environment variables should look like:

```env
# Blockchain
NEXT_PUBLIC_TARGET_CHAIN_ID=11142220
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0x30dd0Ff90fA9e956964f8C033F8651Bf40A5Fc08

# WalletConnect (REQUIRED)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here

# Supabase (Optional but Recommended)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Daily Word (Optional - auto-updated by automation)
NEXT_PUBLIC_DAILY_WORD=DREAM
```

---

## ✅ Verification Checklist

After adding all variables, verify:

- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set (required)
- [ ] `NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS` matches your deployed contract
- [ ] `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS` matches your deployed contract
- [ ] `NEXT_PUBLIC_TARGET_CHAIN_ID` matches your deployment network
- [ ] Supabase variables are set (if using Supabase features)
- [ ] All variables are added to **Production** environment
- [ ] Redeployed the application after adding variables

---

## 🔍 How to Verify Your Configuration

### 1. Check Build Logs
After deployment, check Vercel build logs for any environment variable errors.

### 2. Test in Browser
1. Open your deployed app
2. Open browser console (F12)
3. Check for errors related to missing environment variables
4. Try connecting a wallet - it should work if `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set

### 3. Check Network Tab
- Verify contract addresses are correct
- Check that API calls to Supabase work (if configured)

---

## 🚨 Common Issues

### Issue: "WalletConnect Project ID is not set"
**Solution:** Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel environment variables and redeploy.

### Issue: "Contract address is 0x0000..."
**Solution:** Verify `NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS` and `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS` are set correctly.

### Issue: "Wrong network"
**Solution:** Check `NEXT_PUBLIC_TARGET_CHAIN_ID` matches your contract deployment network.

### Issue: Environment variables not updating
**Solution:** 
1. Make sure you saved the variables in Vercel dashboard
2. **Redeploy** your application (variables are injected at build time)
3. Clear browser cache

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🔄 Updating Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit the variable value
3. Click **Save**
4. **Redeploy** your application (go to Deployments → Click "..." → Redeploy)

**Note:** Environment variables are injected at build time, so you must redeploy for changes to take effect.

---

**Last Updated:** $(date -u +"%Y-%m-%d")

