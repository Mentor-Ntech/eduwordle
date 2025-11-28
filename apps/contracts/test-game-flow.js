#!/usr/bin/env node

/**
 * Comprehensive test script for EduWordle game flow
 * Tests: Puzzle initialization, contract state, leaderboard, and game flow
 */

require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = 'https://forno.celo-sepolia.celo-testnet.org';
const EDUWORDLE_ADDRESS = '0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95';
const LEADERBOARD_ADDRESS = '0x427Dd48f0Aa09f0B70F2F4Fb5055c5c145E602f1';

const EduWordleABI = [
  'function currentDay() view returns (uint256)',
  'function currentSolutionHash() view returns (bytes32)',
  'function hasUserClaimed(address) view returns (bool)',
  'function leaderboardContract() view returns (address)',
  'function treasuryBalance() view returns (uint256)',
  'function baseRewardAmount() view returns (uint256)',
  'function getTotalSolversToday() view returns (uint256)',
];

const LeaderboardABI = [
  'function getTotalPlayers() view returns (uint256)',
  'function getTopPlayersByWins(uint256) view returns (address[], uint256[])',
  'function getTopPlayersByStreak(uint256) view returns (address[], uint256[])',
];

async function testPuzzleInitialization(provider, eduWordle) {
  console.log('\n📋 Test 1: Puzzle Initialization');
  console.log('─'.repeat(50));
  
  try {
    const currentDay = await eduWordle.currentDay();
    const solutionHash = await eduWordle.currentSolutionHash();
    const today = Math.floor(Date.now() / 86400000) * 86400;
    
    console.log(`   Today (UTC): ${today}`);
    console.log(`   Contract Day: ${currentDay.toString()}`);
    console.log(`   Solution Hash: ${solutionHash}`);
    
    if (currentDay.toString() === today.toString()) {
      console.log('   ✅ Puzzle is initialized for today');
      if (solutionHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log('   ✅ Solution hash is set');
        return true;
      } else {
        console.log('   ❌ Solution hash is empty');
        return false;
      }
    } else {
      console.log('   ❌ Puzzle is NOT initialized for today');
      console.log('   💡 Run: node initialize-puzzle.js REACT');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testContractConfiguration(provider, eduWordle) {
  console.log('\n📋 Test 2: Contract Configuration');
  console.log('─'.repeat(50));
  
  try {
    const leaderboardContract = await eduWordle.leaderboardContract();
    const treasuryBalance = await eduWordle.treasuryBalance();
    const baseReward = await eduWordle.baseRewardAmount();
    const totalSolvers = await eduWordle.getTotalSolversToday();
    
    console.log(`   Leaderboard: ${leaderboardContract}`);
    console.log(`   Treasury: ${ethers.formatEther(treasuryBalance)} cUSD`);
    console.log(`   Base Reward: ${ethers.formatEther(baseReward)} cUSD`);
    console.log(`   Solvers Today: ${totalSolvers.toString()}`);
    
    const checks = [];
    
    if (leaderboardContract.toLowerCase() === LEADERBOARD_ADDRESS.toLowerCase()) {
      console.log('   ✅ Leaderboard is correctly linked');
      checks.push(true);
    } else {
      console.log('   ❌ Leaderboard is NOT linked correctly');
      checks.push(false);
    }
    
    if (treasuryBalance > 0n) {
      console.log('   ✅ Treasury has funds');
      checks.push(true);
    } else {
      console.log('   ⚠️  Treasury is empty (needs funding)');
      checks.push(false);
    }
    
    return checks.every(c => c);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testLeaderboard(provider, leaderboard) {
  console.log('\n📋 Test 3: Leaderboard State');
  console.log('─'.repeat(50));
  
  try {
    const totalPlayers = await leaderboard.getTotalPlayers();
    const [topWinsAddresses, topWinsCounts] = await leaderboard.getTopPlayersByWins(10);
    const [topStreakAddresses, topStreakCounts] = await leaderboard.getTopPlayersByStreak(10);
    
    console.log(`   Total Players: ${totalPlayers.toString()}`);
    console.log(`   Top by Wins: ${topWinsAddresses.length} players`);
    console.log(`   Top by Streak: ${topStreakAddresses.length} players`);
    
    if (topWinsAddresses.length > 0) {
      console.log('\n   🏆 Top Players by Wins:');
      for (let i = 0; i < Math.min(5, topWinsAddresses.length); i++) {
        console.log(`      ${i + 1}. ${topWinsAddresses[i]} - ${topWinsCounts[i].toString()} wins`);
      }
    }
    
    if (topStreakAddresses.length > 0) {
      console.log('\n   🔥 Top Players by Streak:');
      for (let i = 0; i < Math.min(5, topStreakAddresses.length); i++) {
        console.log(`      ${i + 1}. ${topStreakAddresses[i]} - ${topStreakCounts[i].toString()} streak`);
      }
    }
    
    if (totalPlayers > 0n) {
      console.log('   ✅ Leaderboard has players');
      return true;
    } else {
      console.log('   ⚠️  Leaderboard is empty (no players yet)');
      return true; // This is OK, just means no one has played yet
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testUserClaimStatus(provider, eduWordle, userAddress) {
  console.log('\n📋 Test 4: User Claim Status');
  console.log('─'.repeat(50));
  
  if (!userAddress) {
    console.log('   ⚠️  No user address provided (skipping)');
    return true;
  }
  
  try {
    const hasClaimed = await eduWordle.hasUserClaimed(userAddress);
    console.log(`   User: ${userAddress}`);
    console.log(`   Has Claimed Today: ${hasClaimed ? 'YES' : 'NO'}`);
    
    if (hasClaimed) {
      console.log('   ✅ User has claimed (should be blocked from replay)');
    } else {
      console.log('   ✅ User has NOT claimed (can play)');
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 EduWordle Game Flow Test Suite');
  console.log('='.repeat(50));
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const eduWordle = new ethers.Contract(EDUWORDLE_ADDRESS, EduWordleABI, provider);
  const leaderboard = new ethers.Contract(LEADERBOARD_ADDRESS, LeaderboardABI, provider);
  
  // Get user address from command line or skip
  const userAddress = process.argv[2] || null;
  
  const results = [];
  
  // Run all tests
  results.push(await testPuzzleInitialization(provider, eduWordle));
  results.push(await testContractConfiguration(provider, eduWordle));
  results.push(await testLeaderboard(provider, leaderboard));
  results.push(await testUserClaimStatus(provider, eduWordle, userAddress));
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('='.repeat(50));
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`   Tests Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('   ✅ All tests passed! Game is ready to play.');
    console.log('\n💡 Next Steps:');
    console.log('   1. Open the frontend app');
    console.log('   2. Connect your wallet');
    console.log('   3. Play the game and win');
    console.log('   4. Submit transaction');
    console.log('   5. Check leaderboard for updates');
  } else {
    console.log('   ⚠️  Some tests failed. Please fix the issues above.');
    
    if (!results[0]) {
      console.log('\n💡 Fix: Initialize puzzle');
      console.log('   node initialize-puzzle.js REACT');
    }
    
    if (!results[1]) {
      console.log('\n💡 Fix: Check contract configuration');
      console.log('   - Ensure leaderboard is linked');
      console.log('   - Fund treasury if empty');
    }
  }
  
  console.log('\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });

