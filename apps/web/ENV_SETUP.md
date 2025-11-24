# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in `apps/web/` with the following variables:

```env
# WalletConnect Project ID (Required)
# Get yours from: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Contract Addresses (Required after deployment)
# Update these after deploying contracts to your target network
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Daily Word (Required for UI feedback)
# This should match the word hash set on-chain via initializeDay
# Format: 5-letter uppercase word
# IMPORTANT: This is for UI feedback only - contract verification uses hash
NEXT_PUBLIC_DAILY_WORD=REACT

# Network Configuration (Optional)
# Options: sepolia, alfajores, celo
# Default: sepolia (Celo Sepolia testnet)
NEXT_PUBLIC_NETWORK=sepolia
```

## Setup Instructions

### 1. Create .env.local file

```bash
cd apps/web
touch .env.local
```

### 2. Add WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Copy your Project ID
4. Add it to `.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
   ```

### 3. Deploy Contracts

After deploying contracts, update the addresses:

```bash
cd ../contracts
pnpm deploy
```

This will output contract addresses. Update `.env.local`:
```env
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0xYourEduWordleAddress
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0xYourLeaderboardAddress
```

### 4. Set Daily Word

**Important:** The daily word must match what's set on-chain!

1. Choose a 5-letter word (e.g., "REACT")
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_DAILY_WORD=REACT
   ```

3. Set the hash on-chain (as contract owner):
   ```typescript
   const solution = "REACT";
   const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));
   await eduWordle.initializeDay(solutionHash);
   ```

## Environment Variable Details

### NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
- **Required:** Yes
- **Description:** WalletConnect Project ID for wallet connections
- **Where to get:** https://cloud.walletconnect.com/
- **Default:** `YOUR_PROJECT_ID` (will show warning in console)

### NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS
- **Required:** Yes (after deployment)
- **Description:** Address of deployed EduWordle contract
- **Default:** `0x0000000000000000000000000000000000000000`
- **Note:** Contract reads will fail until address is set

### NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS
- **Required:** Yes (after deployment)
- **Description:** Address of deployed Leaderboard contract
- **Default:** `0x0000000000000000000000000000000000000000`
- **Note:** Leaderboard will be empty until address is set

### NEXT_PUBLIC_DAILY_WORD
- **Required:** Yes
- **Description:** 5-letter word for UI feedback (must match on-chain hash)
- **Format:** Uppercase, 5 letters (e.g., "REACT")
- **Default:** None (will cause UI issues)
- **Important:** This is for UI feedback only - contract verification uses hash

### NEXT_PUBLIC_NETWORK
- **Required:** No
- **Description:** Target network identifier
- **Options:** `sepolia`, `alfajores`, `celo`
- **Default:** `sepolia`

## Example .env.local (Complete)

```env
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abcd1234efgh5678ijkl9012mnop3456

# Contracts (Celo Sepolia Testnet)
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0x0987654321098765432109876543210987654321

# Daily Puzzle
NEXT_PUBLIC_DAILY_WORD=REACT

# Network
NEXT_PUBLIC_NETWORK=sepolia
```

## Validation

After setting up `.env.local`, verify:

1. **WalletConnect:** Should connect without console warnings
2. **Contract Addresses:** Should appear in contract config
3. **Daily Word:** Should load in game logic
4. **Network:** Should match your deployment network

## Troubleshooting

### "WalletConnect Project ID is missing"
- Make sure `.env.local` exists
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Restart dev server after adding env vars

### "Contract address is zero address"
- Deploy contracts first
- Update `.env.local` with correct addresses
- Restart dev server

### "Daily word not loading"
- Check `NEXT_PUBLIC_DAILY_WORD` is set
- Verify it's exactly 5 uppercase letters
- Restart dev server

### Environment variables not loading
- Make sure file is named `.env.local` (not `.env`)
- File should be in `apps/web/` directory
- Restart Next.js dev server
- Variables must start with `NEXT_PUBLIC_` to be exposed to browser

## Security Notes

- `.env.local` is gitignored - never commit it
- Don't share your WalletConnect Project ID publicly
- Contract addresses are public - safe to share
- Daily word is public - safe to share (it's just for UI)

