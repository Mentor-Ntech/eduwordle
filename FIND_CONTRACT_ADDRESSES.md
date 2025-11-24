# 🔍 How to Find EDUWORDLE_CONTRACT_ADDRESS

## Quick Method

Run this script to extract contract addresses from deployment journal:

```bash
cd apps/contracts
node get-contract-addresses.js
```

This will display:
- ✅ EduWordle contract address
- ✅ Leaderboard contract address
- ✅ Links to blockchain explorer
- ✅ Ready-to-use .env.local format

## If Script Shows "Not Found"

This means contracts **haven't been deployed yet**. Here's how to deploy:

### Step 1: Check Deployment Wallet

Your deployment wallet address is:
```
0x5c7e85c6e93570ba4f45e41ab41ee8e06e14772f
```

### Step 2: Fund Wallet with Testnet CELO

Get testnet CELO from:
- **Celo Sepolia Faucet**: https://faucet.celo.org/ (select Sepolia)
- **Blockscout Faucet**: https://celo-sepolia.blockscout.com/
- **Discord**: Join Celo Discord and request in #faucet channel

**Minimum needed**: ~0.03 CELO for deployment

### Step 3: Deploy Contracts

```bash
cd apps/contracts
pnpm deploy
```

After deployment, you'll see output like:
```
✅ Deployed EduWordle at: 0x...
✅ Deployed Leaderboard at: 0x...
```

### Step 4: Get Addresses Again

```bash
node get-contract-addresses.js
```

## Alternative: Manual Check

### Method 1: Check Deployment Output

When you run `pnpm deploy`, the addresses are printed in the console output.

### Method 2: Check Blockscout Explorer

1. Visit: https://celo-sepolia.blockscout.com/
2. Search for your deployment wallet: `0x5c7e85c6e93570ba4f45e41ab41ee8e06e14772f`
3. Look at recent transactions
4. Click on contract creation transactions
5. Find the contract addresses

### Method 3: Use Hardhat Ignition CLI

```bash
cd apps/contracts

# List all deployments
pnpm hardhat ignition list --network sepolia

# Check specific deployment status
pnpm hardhat ignition status <deployment-id> --network sepolia
```

### Method 4: Check Journal File Directly

```bash
cd apps/contracts
cat ignition/deployments/chain-11142220/journal.jsonl | grep -i "address"
```

## After Finding Addresses

Update `apps/web/.env.local`:

```env
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0xYourEduWordleAddress
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0xYourLeaderboardAddress
```

**Important:** Restart your Next.js dev server after updating `.env.local`!

## Verification

After adding addresses, verify:
1. ✅ Restart dev server
2. ✅ Check browser console - no contract errors
3. ✅ Connect wallet - should see contract data
4. ✅ Visit Play page - should load puzzle data

## Troubleshooting

### "Module not found" error
- Make sure you're in `apps/contracts` directory
- Run: `pnpm install` to install dependencies

### "Journal not found" error
- Contracts haven't been deployed yet
- Follow deployment steps above

### Addresses show as zero addresses
- Contracts may not be deployed
- Check deployment was successful
- Verify on blockchain explorer

## Quick Reference

- **Deployment Script**: `apps/contracts/get-contract-addresses.js`
- **Journal Path**: `apps/contracts/ignition/deployments/chain-11142220/journal.jsonl`
- **Explorer**: https://celo-sepolia.blockscout.com/
- **Deployment Wallet**: `0x5c7e85c6e93570ba4f45e41ab41ee8e06e14772f`

---

**Status**: ✅ **Script Created - Run `node get-contract-addresses.js` to find addresses!**

