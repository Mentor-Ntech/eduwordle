# How to Find Contract Addresses

## Status: Contracts Not Yet Deployed

Based on the deployment logs, the contracts have **not been successfully deployed** to Celo Sepolia yet. The deployment failed due to insufficient funds in the deployment wallet.

## Your Deployment Wallet

**Address**: `0x5c7e85c6e93570Ba4f45e41aB41ee8e06e14772F`

**Current Balance**: 0 CELO (needs funding)

## Steps to Deploy and Get Addresses

### 1. Fund Your Wallet

Get testnet CELO from:
- https://faucet.celo.org/ (select Sepolia)
- https://celo-sepolia.blockscout.com/

Send to: `0x5c7e85c6e93570Ba4f45e41aB41ee8e06e14772F`

### 2. Deploy Contracts

```bash
cd apps/contracts
pnpm deploy
```

### 3. Get Contract Addresses

After successful deployment, addresses will be displayed in the output:

```
✅ Deployed EduWordle at: 0x...
✅ Deployed Leaderboard at: 0x...
```

### 4. Alternative: Check Deployment Status

```bash
# List all deployments
pnpm hardhat ignition list --network sepolia

# Check specific deployment
pnpm hardhat ignition status <deployment-id> --network sepolia
```

### 5. Check on Blockchain Explorer

Once deployed, view contracts on:
- https://celo-sepolia.blockscout.com/address/YOUR_CONTRACT_ADDRESS

## Expected Contract Addresses Format

- **EduWordle**: `0x` + 40 hex characters (e.g., `0x1234...abcd`)
- **Leaderboard**: `0x` + 40 hex characters (e.g., `0x5678...efgh`)

## After Deployment

Update your `.env.local` file:

```env
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0xYourEduWordleAddress
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0xYourLeaderboardAddress
```

---

**Current Status**: ⏳ Waiting for wallet funding and deployment

