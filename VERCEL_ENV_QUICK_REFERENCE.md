# 🚀 Vercel Environment Variables - Quick Reference

Copy and paste these into your Vercel project settings.

## ⚡ Quick Copy-Paste for Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Then add these variables:

---

### 🔴 REQUIRED (Must Have)

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id-here
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0x30dd0Ff90fA9e956964f8C033F8651Bf40A5Fc08
NEXT_PUBLIC_TARGET_CHAIN_ID=11142220
```

---

### 🟡 RECOMMENDED (For Full Functionality)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

---

### 🟢 OPTIONAL (Auto-updated by daily automation)

```env
NEXT_PUBLIC_DAILY_WORD=DREAM
```

---

## 📋 Step-by-Step Instructions

1. **Get WalletConnect Project ID:**
   - Visit: https://cloud.walletconnect.com/
   - Sign up/Login
   - Create a new project
   - Copy the Project ID
   - Add as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

2. **Add Contract Addresses:**
   - Use the addresses from `CONTRACT_ADDRESSES.md`
   - Or check your deployment: `apps/contracts/ignition/deployments/chain-11142220/deployed_addresses.json`

3. **Add Supabase (if using):**
   - Go to Supabase Dashboard → Settings → API
   - Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Set Chain ID:**
   - `11142220` = Celo Sepolia (Testnet) ← **Current**
   - `44787` = Celo Alfajores (Testnet)
   - `42220` = Celo Mainnet

5. **Save and Redeploy:**
   - Click **Save** in Vercel
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment → **Redeploy**

---

## ✅ Verification

After deployment, check:
- [ ] Wallet connection works
- [ ] Contract interactions work
- [ ] Leaderboard loads (if Supabase configured)
- [ ] No console errors

---

**Need help?** See `VERCEL_ENV_VARIABLES.md` for detailed instructions.

