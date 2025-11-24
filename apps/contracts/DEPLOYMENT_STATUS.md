# 🚀 Deployment Status - Celo Sepolia

## Current Status

✅ **Configuration Fixed**
- Private key format corrected
- Address checksumming fixed
- Deployment script ready

⚠️ **Action Required: Fund Wallet**

Your deployment wallet needs **testnet CELO** to pay for gas fees.

## Get Testnet CELO

### Option 1: Celo Sepolia Faucet
1. Visit: https://faucet.celo.org/
2. Select **"Celo Sepolia"** network
3. Enter your wallet address
4. Request testnet CELO

### Option 2: Blockscout Faucet
1. Visit: https://celo-sepolia.blockscout.com/
2. Connect your wallet or enter address
3. Request testnet tokens

### Option 3: Discord Faucet
1. Join Celo Discord: https://discord.gg/celo
2. Navigate to #faucet channel
3. Request Sepolia testnet CELO

## Your Deployment Address

Check your deployment address:
```bash
cd apps/contracts
node -e "require('dotenv').config(); const { ethers } = require('ethers'); const wallet = new ethers.Wallet(process.env.PRIVATE_KEY); console.log('Address:', wallet.address);"
```

## After Funding

Once your wallet has testnet CELO (recommended: at least 0.1 CELO), run:

```bash
cd apps/contracts
pnpm deploy
```

## Deployment Will Deploy

1. **EduWordle Contract** - Main game contract
2. **Leaderboard Contract** - On-chain leaderboard
3. **Auto-link** - Leaderboard linked to EduWordle

## Estimated Gas Costs

- EduWordle deployment: ~0.01-0.02 CELO
- Leaderboard deployment: ~0.005-0.01 CELO
- Linking: ~0.001 CELO

**Total: ~0.02-0.03 CELO**

## Next Steps After Deployment

1. ✅ Fund treasury with cUSD
2. ✅ Initialize first puzzle
3. ✅ Update frontend with contract addresses
4. ✅ Test the contracts

---

**Status**: Waiting for wallet funding ⏳

