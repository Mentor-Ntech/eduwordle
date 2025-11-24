# 🚀 EduWordle - Comprehensive Implementation Plan

## 📋 Executive Summary

This document outlines the complete implementation plan to integrate the EduWordle smart contracts with the frontend, eliminating all mock data and ensuring a fully functional, production-ready application.

**Current Status:**
- ✅ Smart contracts are complete and tested
- ✅ Frontend UI is complete
- ❌ **Contracts are NOT integrated with frontend**
- ❌ **Mock data is being used throughout the frontend**
- ❌ **No contract interaction hooks exist**
- ❌ **ABIs are not available in frontend**

**Goal:** Create a fully functional application with zero mock data, complete contract integration, and seamless user experience.

---

## 🔍 Critical Analysis - Current State

### ✅ What's Complete

1. **Smart Contracts** (`apps/contracts/`)
   - `EduWordle.sol` - Main game contract with all features
   - `Leaderboard.sol` - On-chain leaderboard tracking
   - Comprehensive test suite
   - Deployment scripts ready

2. **Frontend UI** (`apps/web/`)
   - All pages implemented (Landing, Dashboard, Play, Leaderboard, Settings)
   - All components built and styled
   - Wallet connection (RainbowKit/Wagmi) integrated
   - Design system complete

### ❌ What's Missing

1. **Contract Integration Infrastructure**
   - ❌ No ABI files in frontend
   - ❌ No contract configuration/constants
   - ❌ No contract interaction hooks
   - ❌ No transaction handling utilities
   - ❌ No error handling for contract calls

2. **Mock Data Usage (Must Remove)**
   - ❌ `leaderboard-data.ts` - Using mock leaderboard data
   - ❌ `user-context.tsx` - Using mock user stats
   - ❌ `game-logic.ts` - Hardcoded daily word ("REACT")
   - ❌ `daily-challenge-card.tsx` - Hardcoded reward amounts
   - ❌ `hint-purchase-modal.tsx` - Mock hint prices
   - ❌ `reward-claim-modal.tsx` - Mock claim logic
   - ❌ `dashboard/page.tsx` - Hardcoded reward amount

3. **Missing Contract Interactions**
   - ❌ Game submission (`submitAnswer`)
   - ❌ Reward claiming (handled in `submitAnswer`)
   - ❌ Hint purchasing (`buyHint`)
   - ❌ User stats fetching (streak, wins, earnings)
   - ❌ Leaderboard data fetching
   - ❌ Puzzle status checking (has claimed, hints purchased)
   - ❌ Daily puzzle initialization check

4. **Missing Features**
   - ❌ Daily puzzle word management (needs backend/env variable)
   - ❌ Real-time contract state updates
   - ❌ Transaction status tracking
   - ❌ Error messages for failed transactions
   - ❌ Loading states during contract calls
   - ❌ cUSD token approval handling

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation Setup (Critical)
**Goal:** Set up contract integration infrastructure

#### 1.1 Contract ABIs Setup
- [ ] Copy ABIs from `apps/contracts/artifacts/` to `apps/web/src/lib/contracts/`
  - Create `EduWordle.json` ABI file
  - Create `Leaderboard.json` ABI file
  - Create `IERC20.json` ABI for cUSD token

#### 1.2 Contract Configuration
- [ ] Create `apps/web/src/lib/contracts/config.ts`
  - Define contract addresses (environment-based)
  - Define cUSD token addresses per network
  - Export contract configurations

#### 1.3 Environment Variables
- [ ] Create/update `apps/web/.env.local.example`
  - `NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS`
  - `NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS`
  - `NEXT_PUBLIC_DAILY_WORD` (for UI feedback - separate from on-chain hash)
  - `NEXT_PUBLIC_NETWORK` (sepolia/alfajores/celo)
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

---

### Phase 2: Contract Interaction Hooks (Critical)
**Goal:** Create reusable hooks for all contract interactions

#### 2.1 Core Contract Hook
- [ ] Create `apps/web/src/hooks/use-eduwordle-contract.ts`
  - Get contract instance using Wagmi
  - Handle network switching
  - Return contract read/write functions

#### 2.2 User Stats Hook
- [ ] Create `apps/web/src/hooks/use-user-stats.ts`
  - Fetch user streak (`getUserStreak`)
  - Fetch if user claimed today (`hasUserClaimed`)
  - Fetch hints purchased (`getHintsPurchased`)
  - Fetch reward amount (`getRewardAmount`)
  - Auto-refresh on account/network change

#### 2.3 Puzzle Hook
- [ ] Create `apps/web/src/hooks/use-daily-puzzle.ts`
  - Check if puzzle initialized (`currentDay`, `currentSolutionHash`)
  - Get current day from contract
  - Verify puzzle is available
  - Handle puzzle initialization state

#### 2.4 Leaderboard Hook
- [ ] Create `apps/web/src/hooks/use-leaderboard.ts`
  - Fetch top players by wins (`getTopPlayersByWins`)
  - Fetch top players by streak (`getTopPlayersByStreak`)
  - Fetch player stats (`getPlayerStats`)
  - Transform contract data to UI format
  - Handle pagination/sorting

#### 2.5 Transaction Hooks
- [ ] Create `apps/web/src/hooks/use-submit-answer.ts`
  - Handle `submitAnswer` transaction
  - Loading states
  - Error handling
  - Success callbacks
  - Transaction status tracking

- [ ] Create `apps/web/src/hooks/use-buy-hint.ts`
  - Handle cUSD approval (if needed)
  - Handle `buyHint` transaction
  - Loading states
  - Error handling
  - Update hints purchased count

- [ ] Create `apps/web/src/hooks/use-token-approval.ts`
  - Generic token approval hook
  - Check existing approval
  - Handle approval transaction
  - For cUSD token (hints, treasury funding)

---

### Phase 3: Replace Mock Data (Critical)
**Goal:** Remove all mock data and connect to contracts

#### 3.1 User Context Integration
- [ ] Update `apps/web/src/lib/user-context.tsx`
  - Remove mock `DEFAULT_STATS`
  - Fetch real stats from contract via `use-user-stats.ts`
  - Calculate `totalEarnings` from contract rewards
  - Sync with leaderboard for total wins
  - Keep localStorage as cache only

#### 3.2 Leaderboard Integration
- [ ] Update `apps/web/src/lib/leaderboard-data.ts`
  - Remove `mockLeaderboardData`
  - Create function to fetch real data
  - Transform contract data to `LeaderboardEntry` format
  - Handle current user highlighting

- [ ] Update `apps/web/src/app/(dashboard)/leaderboard/page.tsx`
  - Use `use-leaderboard.ts` hook
  - Show loading states
  - Handle empty states
  - Real-time updates

#### 3.3 Game Logic Integration
- [ ] Update `apps/web/src/lib/game-logic.ts`
  - Remove hardcoded `DAILY_WORD`
  - Accept word as parameter (from env/backend)
  - Keep validation and checking logic
  - Document that word is for UI feedback only

- [ ] Update `apps/web/src/app/(dashboard)/play/page.tsx`
  - Get daily word from environment/context
  - Integrate `use-submit-answer.ts` hook
  - Show transaction status during submission
  - Handle win state: show reward modal with real amounts
  - Update user stats after successful submission
  - Disable game if already claimed today
  - Show "Already claimed" state

#### 3.4 Daily Challenge Card
- [ ] Update `apps/web/src/components/daily-challenge-card.tsx`
  - Fetch real reward amount from contract
  - Show actual streak bonus
  - Display if puzzle is initialized
  - Show if user already claimed

#### 3.5 Hint Purchase Modal
- [ ] Update `apps/web/src/components/modals/hint-purchase-modal.tsx`
  - Get real hint price from contract
  - Get user's hints purchased count
  - Integrate `use-buy-hint.ts` hook
  - Show transaction loading state
  - Handle approval flow
  - Update UI after purchase

#### 3.6 Reward Claim Modal
- [ ] Update `apps/web/src/components/modals/reward-claim-modal.tsx`
  - Remove mock claim logic
  - Reward is automatically claimed in `submitAnswer`
  - Show actual reward amount from contract
  - Display transaction hash after success
  - Close modal after successful transaction

#### 3.7 Dashboard Updates
- [ ] Update `apps/web/src/app/(dashboard)/dashboard/page.tsx`
  - Remove hardcoded reward amount
  - Fetch real available reward from contract
  - Show actual user stats
  - Display connection to MiniPay if available

---

### Phase 4: Enhanced Features (Important)
**Goal:** Add polish and user experience improvements

#### 4.1 Transaction Status Management
- [ ] Create `apps/web/src/hooks/use-transaction-status.ts`
  - Track pending transactions
  - Show toast notifications
  - Handle transaction confirmations
  - Error recovery

#### 4.2 Real-time Updates
- [ ] Implement contract event listening
  - Listen to `PuzzleSolved` events
  - Listen to `HintPurchased` events
  - Auto-refresh stats on events
  - Update leaderboard on new wins

#### 4.3 Error Handling
- [ ] Create `apps/web/src/lib/contract-errors.ts`
  - Map contract errors to user-friendly messages
  - Handle common errors:
    - "Already claimed today"
    - "Incorrect answer"
    - "Insufficient treasury funds"
    - "Max hints reached"
    - "Puzzle not initialized"

#### 4.4 Loading States
- [ ] Add loading skeletons/spinners
  - Contract data fetching
  - Transaction submission
  - Token approvals
  - Leaderboard loading

#### 4.5 Daily Word Management
- [ ] Document daily word setup
  - Admin sets word hash on-chain
  - Word stored in env variable for UI feedback
  - Create admin script for puzzle initialization
  - Document hash generation process

---

### Phase 5: Testing & Validation (Critical)
**Goal:** Ensure everything works correctly

#### 5.1 Integration Testing
- [ ] Test contract reads
  - User stats fetching
  - Leaderboard fetching
  - Puzzle status checking

- [ ] Test contract writes
  - Submit answer (success case)
  - Submit answer (already claimed)
  - Submit answer (incorrect answer)
  - Buy hint (with approval)
  - Buy hint (max reached)

#### 5.2 Edge Cases
- [ ] Test wallet disconnection during transaction
- [ ] Test network switching
- [ ] Test insufficient cUSD for hints
- [ ] Test puzzle not initialized
- [ ] Test treasury out of funds
- [ ] Test multiple users simultaneously

#### 5.3 UI/UX Testing
- [ ] Verify no mock data visible
- [ ] Verify loading states appear
- [ ] Verify error messages are clear
- [ ] Verify success feedback
- [ ] Test on different screen sizes
- [ ] Test with MiniPay wallet

---

## 📝 Detailed Implementation Steps

### Step 1: Set Up Contract Infrastructure

#### Create Contract ABIs Directory
```bash
mkdir -p apps/web/src/lib/contracts
```

#### Copy ABIs
1. Copy `apps/contracts/artifacts/contracts/EduWordle.sol/EduWordle.json` → `apps/web/src/lib/contracts/EduWordle.json`
2. Copy `apps/contracts/artifacts/contracts/Leaderboard.sol/Leaderboard.json` → `apps/web/src/lib/contracts/Leaderboard.json`
3. Create minimal IERC20 ABI for cUSD token interactions

#### Create Contract Config
File: `apps/web/src/lib/contracts/config.ts`

```typescript
export const CONTRACT_ADDRESSES = {
  sepolia: {
    eduWordle: process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS as `0x${string}`,
    leaderboard: process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS as `0x${string}`,
    cusd: '0x1C7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`,
  },
  alfajores: {
    eduWordle: process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS as `0x${string}`,
    leaderboard: process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS as `0x${string}`,
    cusd: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1' as `0x${string}`,
  },
  celo: {
    eduWordle: process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS as `0x${string}`,
    leaderboard: process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS as `0x${string}`,
    cusd: '0x765DE816845861e75A25fCA122bb6898B8B1282a' as `0x${string}`,
  },
}
```

### Step 2: Create Core Contract Hook

File: `apps/web/src/hooks/use-eduwordle-contract.ts`

This hook will:
- Get contract instance using Wagmi's `useReadContract` and `useWriteContract`
- Handle different networks
- Provide typed contract interface

### Step 3: Create User Stats Hook

File: `apps/web/src/hooks/use-user-stats.ts`

This hook will:
- Fetch user's current streak
- Check if user claimed today
- Get hints purchased count
- Calculate reward amount
- Auto-refresh when account changes

### Step 4: Create Game Submission Hook

File: `apps/web/src/hooks/use-submit-answer.ts`

This hook will:
- Handle word submission transaction
- Show loading state
- Handle errors gracefully
- Trigger stats refresh on success
- Show success notification

### Step 5: Create Hint Purchase Hook

File: `apps/web/src/hooks/use-buy-hint.ts`

This hook will:
- Check cUSD approval
- Request approval if needed
- Execute hint purchase
- Update hints count
- Handle errors

### Step 6: Update User Context

Replace mock data with real contract calls:
- Remove `DEFAULT_STATS`
- Use `use-user-stats.ts` to fetch real data
- Keep localStorage for caching only

### Step 7: Update Game Page

Integrate contract submission:
- Check if user already claimed
- Show appropriate state
- Integrate `use-submit-answer.ts`
- Show transaction progress
- Update game state on success

### Step 8: Update Leaderboard

Fetch real data:
- Use `use-leaderboard.ts` hook
- Transform contract data
- Show loading/empty states
- Handle real-time updates

---

## 🔧 Technical Specifications

### Contract Methods Used

#### EduWordle Contract
- **Read Functions:**
  - `getUserStreak(address user) → uint256`
  - `hasUserClaimed(address user) → bool`
  - `getHintsPurchased(address user) → uint256`
  - `getRewardAmount(address user) → uint256`
  - `currentDay() → uint256`
  - `currentSolutionHash() → bytes32`
  - `baseRewardAmount() → uint256`
  - `hintPrice() → uint256`
  - `streakBonusBps() → uint256`
  - `treasuryBalance() → uint256`
  - `getTotalSolversToday() → uint256`

- **Write Functions:**
  - `submitAnswer(string memory guess)`
  - `buyHint()`

- **Events:**
  - `PuzzleSolved(address indexed solver, uint256 indexed day, uint256 reward, uint256 streak)`
  - `HintPurchased(address indexed buyer, uint256 indexed day, uint256 hintNumber)`
  - `RewardClaimed(address indexed claimer, uint256 amount)`

#### Leaderboard Contract
- **Read Functions:**
  - `getTopPlayersByWins(uint256 n) → (address[] players, uint256[] wins)`
  - `getTopPlayersByStreak(uint256 n) → (address[] players, uint256[] streaks)`
  - `getPlayerStats(address player) → PlayerStats`
  - `getTotalPlayers() → uint256`

#### IERC20 (cUSD)
- **Read Functions:**
  - `balanceOf(address account) → uint256`
  - `allowance(address owner, address spender) → uint256`

- **Write Functions:**
  - `approve(address spender, uint256 amount)`

---

## 🐛 Potential Issues & Solutions

### Issue 1: Daily Word Management
**Problem:** Contract stores word as hash, but UI needs actual word for feedback.

**Solution:**
- Store word in environment variable (`NEXT_PUBLIC_DAILY_WORD`)
- Admin sets word hash on-chain via `initializeDay`
- Frontend uses env word for UI feedback only
- Contract verifies actual submission

### Issue 2: cUSD Approval Flow
**Problem:** Users need to approve cUSD before buying hints.

**Solution:**
- Check allowance before hint purchase
- Show approval button if needed
- Execute approval transaction
- Then execute hint purchase
- Use `use-token-approval.ts` hook

### Issue 3: Transaction Status
**Problem:** Users need feedback during transactions.

**Solution:**
- Use Wagmi's `useWaitForTransactionReceipt`
- Show loading states
- Toast notifications for success/error
- Disable buttons during transactions

### Issue 4: Network Switching
**Problem:** Users might be on wrong network.

**Solution:**
- Detect network mismatch
- Prompt user to switch
- Use Wagmi's `useSwitchChain`
- Show clear error messages

### Issue 5: Real-time Updates
**Problem:** UI doesn't update after transactions.

**Solution:**
- Invalidate React Query cache
- Listen to contract events
- Auto-refresh data
- Update local state immediately

---

## ✅ Acceptance Criteria

### Must Have (Blocking)
- [ ] Zero mock data in production build
- [ ] All contract reads working
- [ ] Game submission working
- [ ] Hint purchase working
- [ ] User stats display real data
- [ ] Leaderboard shows real data
- [ ] Error handling for all contract calls
- [ ] Loading states for all async operations
- [ ] Transaction confirmations working
- [ ] Works on Celo Sepolia testnet

### Should Have (Important)
- [ ] Real-time updates via events
- [ ] cUSD approval flow seamless
- [ ] Network switching handled
- [ ] Toast notifications for transactions
- [ ] Empty states handled
- [ ] Error messages user-friendly

### Nice to Have (Polish)
- [ ] Transaction history
- [ ] Advanced loading skeletons
- [ ] Optimistic UI updates
- [ ] Retry failed transactions
- [ ] Analytics tracking

---

## 📅 Implementation Order (Priority)

1. **Phase 1** - Foundation Setup (Day 1)
   - Set up ABIs
   - Create config
   - Set up environment variables

2. **Phase 2** - Core Hooks (Day 1-2)
   - Create all contract interaction hooks
   - Test hooks independently

3. **Phase 3** - Replace Mock Data (Day 2-3)
   - Update user context
   - Update leaderboard
   - Update game page
   - Update modals

4. **Phase 4** - Enhanced Features (Day 3-4)
   - Add transaction tracking
   - Add error handling
   - Add loading states

5. **Phase 5** - Testing (Day 4-5)
   - Integration testing
   - Edge case testing
   - UI/UX testing
   - Bug fixes

---

## 🚨 Critical Notes

1. **Never Store Solution Word On-Chain**
   - Always store as hash
   - Frontend word is for UI feedback only
   - Contract verifies actual submission

2. **Always Check Transaction Status**
   - Don't assume transaction succeeded
   - Wait for confirmation
   - Handle failures gracefully

3. **Handle Network Issues**
   - Detect wrong network
   - Prompt user to switch
   - Show clear errors

4. **User Experience**
   - Show loading states
   - Provide feedback
   - Handle errors clearly
   - Don't block UI unnecessarily

5. **Security**
   - Never trust frontend for verification
   - Always verify on-chain
   - Check all conditions before transactions
   - Validate user input

---

## 📚 Additional Resources

### Contract Documentation
- `apps/contracts/README.md` - Contract overview
- `apps/contracts/SECURITY.md` - Security features
- `apps/contracts/DEPLOYMENT.md` - Deployment guide

### Frontend Documentation
- `FRONTEND_MIGRATION_COMPLETE.md` - Frontend status
- `WALLET_INTEGRATION_COMPLETE.md` - Wallet setup

### External Resources
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Viem Documentation](https://viem.sh/)

---

## 🎯 Success Metrics

- ✅ Zero mock data in application
- ✅ All contract functions integrated
- ✅ All transactions working
- ✅ User can play and claim rewards
- ✅ Leaderboard displays real data
- ✅ No console errors
- ✅ Smooth user experience
- ✅ Works on testnet

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Ready for Implementation

