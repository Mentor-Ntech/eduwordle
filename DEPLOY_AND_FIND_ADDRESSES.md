# 🚀 Deploy Contracts & Find Addresses

## Current Status: Contracts Not Deployed ⚠️

Your contracts have **not been deployed yet**. The deployment journal shows only initialization, not completed deployment.

## Quick Guide: Deploy & Get Addresses

### Step 1: Fund Your Deployment Wallet

**Your Deployment Wallet:**
```
0x5c7e85c6e93570ba4f45e41ab41ee8e06e14772f
```

**Get Testnet CELO:**

1. **Celo Sepolia Faucet** (Recommended):
   - Visit: https://faucet.celo.org/
   - Select **"Celo Sepolia"** network
   - Enter your address: `0x5c7e85c6e93570ba4f45e41ab41ee8e06e14772f`
   - Request testnet CELO

2. **Blockscout Faucet** (Alternative):
   - Visit: https://celo-sepolia.blockscout.com/
   - Connect wallet or enter address
   - Request tokens

3. **Discord Faucet** (Backup):
   - Join Celo Discord: https://discord.gg/celo
   - Go to #faucet channel
   - Request Sepolia testnet CELO

**Minimum Required**: ~0.03 CELO for deployment

### Step 2: Deploy Contracts

```bash
cd apps/contracts
pnpm deploy
```

**What happens:**
- Deploys EduWordle contract
- Deploys Leaderboard contract
- Links them together
- Shows addresses in output

**Expected output:**
```
✅ Deployed EduWordle at: 0x...
✅ Deployed Leaderboard at: 0x...
```

### Step 3: Get Contract Addresses Automatically

After deployment, run:

```bash
cd apps/contracts
node get-contract-addresses.js
```

This will show:
- ✅ EduWordle contract address
- ✅ Leaderboard contract address
- ✅ Links to blockchain explorer
- ✅ Ready-to-use .env.local format

### Step 4: Update Frontend Environment

Copy the addresses and update `apps/web/.env.local`:

```env
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0xYourEduWordleAddress
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0xYourLeaderboardAddress
```

### Step 5: Restart Dev Server

**Important:** Restart Next.js dev server for env changes:

```bash
cd apps/web
# Stop server (Ctrl+C or Cmd+C)
npm run dev
```

## Alternative: Check Manual Deployment

If you deployed manually or addresses are elsewhere:

### Method 1: Check Deployment Output

Look at the terminal output when you ran `pnpm deploy`. Addresses should be printed there.

### Method 2: Check Blockscout Explorer

1. Visit: https://celo-sepolia.blockscout.com/
2. Search for wallet: `0x5c7e85c6e93570ba4f45e41ab41ee8e06e14772f`
3. Check recent transactions
4. Look for "Contract Creation" transactions
5. Find the contract addresses

### Method 3: Use Hardhat CLI

```bash
cd apps/contracts

# List deployments
pnpm hardhat ignition list --network sepolia

# Check specific deployment
pnpm hardhat ignition status <deployment-id> --network sepolia
```

## Troubleshooting

### "Insufficient funds" error
- Fund your wallet with testnet CELO (see Step 1)
- Minimum ~0.03 CELO needed

### "Private key not found" error
- Make sure `.env` file exists in `apps/contracts/`
- Set `PRIVATE_KEY=your_private_key_here`

### Deployment succeeds but addresses not found
- Run: `node get-contract-addresses.js` again
- Check deployment output directly
- Verify on Blockscout explorer

## After Deployment Checklist

- [ ] Contracts deployed successfully
- [ ] Addresses extracted using script
- [ ] Addresses added to `apps/web/.env.local`
- [ ] Dev server restarted
- [ ] Wallet connected - contract data loads
- [ ] Play page works - puzzle data loads

## Quick Command Reference

```bash
# Deploy contracts
cd apps/contracts && pnpm deploy

# Get addresses
cd apps/contracts && node get-contract-addresses.js

# Update env (manual)
# Edit apps/web/.env.local with addresses

# Restart frontend
cd apps/web && npm run dev
```

---

**Status**: ⚠️ **Contracts Not Deployed - Follow Steps Above to Deploy & Get Addresses**

**Your Deployment Wallet**: `0x5c7e85c6e93570ba4f45e41ab41ee8e06e14772f`

