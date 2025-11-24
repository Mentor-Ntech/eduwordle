# Deployment Guide - Celo Sepolia

## 🚀 Deploy to Celo Sepolia Testnet

### Prerequisites

1. **Private Key**: Your wallet private key with testnet CELO for gas
2. **Celoscan API Key**: For contract verification (optional but recommended)

### Step 1: Set Environment Variables

Create a `.env` file in `apps/contracts/`:

```bash
PRIVATE_KEY=your_private_key_here
CELOSCAN_API_KEY=your_celoscan_api_key_here
```

Or export them:

```bash
export PRIVATE_KEY=your_private_key_here
export CELOSCAN_API_KEY=your_celoscan_api_key_here
```

### Step 2: Get Testnet CELO

Get testnet CELO from Celo Sepolia faucet:
- https://faucet.celo.org/ (select Sepolia network)
- Or use: https://celo-sepolia.blockscout.com/

### Step 3: Deploy Contracts

```bash
cd apps/contracts
pnpm deploy
```

This will deploy:
1. **EduWordle** contract
2. **Leaderboard** contract
3. Automatically link them together

### Step 4: Verify Deployment

After deployment, you'll see:
- Contract addresses
- Transaction hashes
- Deployment summary

### Step 5: Verify on Celoscan

```bash
pnpm hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 📋 Configuration

### Default Parameters

- **cUSD Address**: `0x1C7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Base Reward**: 1 cUSD
- **Hint Price**: 0.1 cUSD
- **Streak Bonus**: 50% per day
- **Max Top Players**: 100

### Custom Parameters

You can override defaults in the deployment script or via parameters:

```bash
pnpm hardhat ignition deploy ignition/modules/EduWordle.ts \
  --network sepolia \
  --parameters '{"EduWordleModule":{"baseRewardAmount":"2000000000000000000"}}'
```

## 🔗 Network Information

### Celo Sepolia
- **Chain ID**: 11142220
- **RPC URL**: https://forno.celo-sepolia.celo-testnet.org
- **Explorer**: https://celo-sepolia.blockscout.com
- **cUSD**: `0x1C7D4B196Cb0C7B01d743Fbc6116a902379C7238`

## 📝 Post-Deployment

### 1. Fund Treasury

After deployment, fund the contract treasury:

```typescript
const eduWordle = await ethers.getContractAt("EduWordle", contractAddress);
const cusd = await ethers.getContractAt("IERC20", cusdAddress);

// Approve
await cusd.approve(contractAddress, ethers.parseEther("1000"));

// Fund
await eduWordle.fundTreasury(ethers.parseEther("1000"));
```

### 2. Initialize First Puzzle

```typescript
const solution = "REACT";
const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));
await eduWordle.initializeDay(solutionHash);
```

### 3. Update Frontend

Update your frontend with:
- Contract addresses
- ABI files
- Network configuration

## 🧪 Testing on Sepolia

1. Get testnet cUSD from faucet
2. Connect wallet to Celo Sepolia
3. Test puzzle submission
4. Test hint purchases
5. Verify rewards distribution

## 🔍 Troubleshooting

### Insufficient Gas
- Get more CELO from faucet
- Check gas price settings

### Contract Verification Failed
- Ensure constructor arguments are correct
- Check Celoscan API key
- Try manual verification on explorer

### Deployment Failed
- Check private key is correct
- Verify network configuration
- Ensure sufficient CELO balance

## 📚 Next Steps

After successful deployment:
1. ✅ Fund treasury with cUSD
2. ✅ Initialize first puzzle
3. ✅ Test all functions
4. ✅ Update frontend configuration
5. ✅ Deploy frontend
6. ✅ Test end-to-end flow

---

**Network**: Celo Sepolia Testnet
**Status**: Ready for Deployment

