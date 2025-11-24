# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
cd apps/web
npm install
# or
pnpm install
```

## Step 2: Set Up Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get WalletConnect Project ID:**
   - Visit https://cloud.walletconnect.com/
   - Create a project
   - Copy your Project ID
   - Add to `.env.local`:
     ```env
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
     ```

3. **After deploying contracts, add addresses:**
   ```env
   NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0xYourAddress
   NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0xYourAddress
   ```

4. **Set daily word:**
   ```env
   NEXT_PUBLIC_DAILY_WORD=REACT
   ```
   **Important:** This must match the word hash set on-chain!

## Step 3: Deploy Contracts (If Not Done)

```bash
cd ../contracts
pnpm install
pnpm deploy
```

Copy the contract addresses to `apps/web/.env.local`.

## Step 4: Initialize First Puzzle

After deploying, initialize the first puzzle on-chain:

```typescript
const solution = "REACT"; // Match NEXT_PUBLIC_DAILY_WORD
const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));
await eduWordle.initializeDay(solutionHash);
```

## Step 5: Fund Treasury

Fund the contract with cUSD for rewards:

```typescript
const cusd = await ethers.getContractAt("IERC20", cusdAddress);
await cusd.approve(eduWordleAddress, ethers.parseEther("1000"));
await eduWordle.fundTreasury(ethers.parseEther("1000"));
```

## Step 6: Run Development Server

```bash
cd apps/web
npm run dev
```

Visit http://localhost:3000

## Step 7: Test the Application

1. Connect wallet (RainbowKit/MiniPay)
2. Navigate to Play page
3. Submit a guess
4. If correct, reward should be claimed automatically
5. Check leaderboard for stats
6. Try purchasing hints

## Troubleshooting

### Environment variables not working?
- Make sure file is named `.env.local` (not `.env`)
- Restart dev server after changing env vars
- Variables must start with `NEXT_PUBLIC_`

### Wallet not connecting?
- Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Verify it's a valid Project ID
- Check browser console for errors

### Contract errors?
- Verify contract addresses in `.env.local`
- Make sure contracts are deployed
- Check network matches (sepolia/alfajores/celo)

### Game not working?
- Check `NEXT_PUBLIC_DAILY_WORD` is set
- Verify puzzle is initialized on-chain
- Make sure word matches hash on-chain

## Need Help?

See detailed documentation:
- `ENV_SETUP.md` - Environment variables guide
- `INTEGRATION_COMPLETE.md` - Integration overview
- `IMPLEMENTATION_PLAN.md` - Full implementation details

