# 🧪 Complete Testing Checklist

## ✅ Automated Tests (PASSED)

All automated tests passed:
- ✅ Puzzle is initialized for today
- ✅ Leaderboard is correctly linked
- ✅ Treasury has funds (49 cUSD)
- ✅ Contract configuration is correct

## 📋 Manual Testing Steps

### Step 1: Frontend Setup
- [ ] Open the frontend app in browser
- [ ] Connect your wallet
- [ ] Verify wallet address is displayed
- [ ] Check that you're on the correct network (Celo Sepolia)

### Step 2: Play Page Test
- [ ] Navigate to Play page
- [ ] Verify puzzle is initialized (no "Puzzle not initialized" message)
- [ ] Verify you can see the game board
- [ ] Verify you can type letters
- [ ] Verify keyboard works (on-screen and physical)

### Step 3: Game Flow Test
- [ ] Enter a wrong guess → Should show feedback
- [ ] Enter correct word "REACT" → Should show win
- [ ] Verify reward modal appears
- [ ] Verify modal shows correct reward amount
- [ ] Click to submit transaction
- [ ] Verify wallet prompts for transaction
- [ ] Confirm transaction in wallet

### Step 4: Transaction Confirmation Test
- [ ] Wait for transaction confirmation
- [ ] Verify success message appears
- [ ] Verify transaction hash is shown
- [ ] Click "View Transaction" link → Should open explorer
- [ ] Verify transaction shows on blockchain explorer
- [ ] Verify reward amount in transaction

### Step 5: Replay Blocking Test
- [ ] After successful transaction, try to play again
- [ ] Verify game shows "already completed" message
- [ ] Verify you cannot enter letters
- [ ] Verify you cannot submit guesses
- [ ] Refresh page → Should still show "already completed"

### Step 6: Leaderboard Test
- [ ] Navigate to Leaderboard page
- [ ] Verify your address appears on leaderboard
- [ ] Verify your wins count is correct (should be 1)
- [ ] Verify your streak is correct
- [ ] Verify your rewards/points are shown
- [ ] Click "Refresh" button → Should update
- [ ] Switch tabs and come back → Should auto-refresh

### Step 7: Multi-Player Test
- [ ] Connect a different wallet
- [ ] Play and win with second wallet
- [ ] Verify second player appears on leaderboard
- [ ] Verify both players are visible
- [ ] Verify rankings are correct
- [ ] Verify leaderboard updates within 5-10 seconds

### Step 8: Error Handling Test
- [ ] Try to submit wrong answer → Should show error
- [ ] Try to submit when puzzle not initialized → Should show error
- [ ] Try to submit when already claimed → Should be blocked
- [ ] Reject transaction in wallet → Should allow retry
- [ ] Verify error messages are user-friendly

## 🔍 Verification Commands

### Check Contract State
```bash
cd apps/contracts
node test-game-flow.js [YOUR_WALLET_ADDRESS]
```

### Check Specific User
```bash
cd apps/contracts
node verify-leaderboard.js [WALLET_ADDRESS]
```

### Check Puzzle Status
```bash
cd apps/contracts
node -e "const { ethers } = require('ethers'); const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org'); const contract = new ethers.Contract('0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95', ['function currentDay() view returns (uint256)', 'function currentSolutionHash() view returns (bytes32)'], provider); Promise.all([contract.currentDay(), contract.currentSolutionHash()]).then(([day, hash]) => { console.log('Day:', day.toString()); console.log('Hash:', hash); });"
```

## 🐛 Common Issues & Fixes

### Issue: "Puzzle not initialized"
**Fix:** Run `node initialize-puzzle.js REACT` in `apps/contracts`

### Issue: Leaderboard not updating
**Fix:** 
1. Check leaderboard is linked: `node verify-leaderboard.js`
2. Wait 5-10 seconds (auto-refresh interval)
3. Click "Refresh" button
4. Check browser console for errors

### Issue: Can still play after claiming
**Fix:** 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. Check contract state: `node test-game-flow.js [YOUR_ADDRESS]`

### Issue: Transaction fails
**Check:**
1. Wallet has enough CELO for gas
2. Treasury has funds (should show in test)
3. Puzzle is initialized
4. You haven't already claimed today

## ✅ Success Criteria

All of these should work:
- ✅ Can play game when not claimed
- ✅ Can submit transaction when winning
- ✅ Transaction confirms successfully
- ✅ Reward is transferred to wallet
- ✅ Cannot replay after claiming
- ✅ Leaderboard shows player
- ✅ Leaderboard updates automatically
- ✅ Multiple players appear on leaderboard
- ✅ Rankings are correct

## 📝 Test Results Template

```
Date: ___________
Tester: ___________
Wallet: ___________

Test Results:
[ ] Step 1: Frontend Setup
[ ] Step 2: Play Page Test
[ ] Step 3: Game Flow Test
[ ] Step 4: Transaction Confirmation Test
[ ] Step 5: Replay Blocking Test
[ ] Step 6: Leaderboard Test
[ ] Step 7: Multi-Player Test
[ ] Step 8: Error Handling Test

Issues Found:
_____________________________________________
_____________________________________________
_____________________________________________

Overall Status: [ ] PASS [ ] FAIL
```

---

**Ready to test?** Start with Step 1 and work through each step systematically!

