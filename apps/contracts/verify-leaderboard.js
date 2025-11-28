#!/usr/bin/env node

/**
 * Script to verify leaderboard connection and check player stats
 * 
 * Usage:
 *   node verify-leaderboard.js [playerAddress]
 */

require('dotenv').config()
const { ethers } = require('ethers')

const RPC_URL = process.env.RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
// Use environment variable or default to deployed address
const EDUWORDLE_ADDRESS = process.env.EDUWORDLE_ADDRESS || process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS || '0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95'
const LEADERBOARD_ADDRESS = process.env.LEADERBOARD_ADDRESS || process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS || '0x427Dd48f0Aa09f0B70F2F4Fb5055c5c145E602f1'

const EduWordleABI = [
  'function leaderboardContract() view returns (address)',
  'function currentDay() view returns (uint256)',
  'function getTotalSolversToday() view returns (uint256)',
]

const LeaderboardABI = [
  'function getPlayerStats(address) view returns (uint256 totalWins, uint256 longestStreak, uint256 currentStreak, uint256 totalRewardsEarned, uint256 lastWinDay, bool exists)',
  'function getTopPlayersByWins(uint256) view returns (address[] players, uint256[] wins)',
  'function getTopPlayersByStreak(uint256) view returns (address[] players, uint256[] streaks)',
  'function getTotalPlayers() view returns (uint256)',
]

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const playerAddress = process.argv[2]

  console.log('🔍 Verifying Leaderboard Connection...\n')
  console.log(`📋 Using EduWordle: ${EDUWORDLE_ADDRESS}\n`)

  const eduWordle = new ethers.Contract(EDUWORDLE_ADDRESS, EduWordleABI, provider)

  // Check if leaderboard is connected
  console.log('1️⃣ Checking Leaderboard Connection...')
  const leaderboardAddress = await eduWordle.leaderboardContract()
  
  if (leaderboardAddress === '0x0000000000000000000000000000000000000000') {
    console.log('   ❌ Leaderboard NOT connected to EduWordle!')
    console.log('   💡 Fix: Call setLeaderboardContract() on EduWordle')
    process.exit(1)
  } else {
    console.log(`   ✅ Leaderboard connected: ${leaderboardAddress}`)
    
    if (LEADERBOARD_ADDRESS && leaderboardAddress.toLowerCase() !== LEADERBOARD_ADDRESS.toLowerCase()) {
      console.log(`   ⚠️  Warning: Leaderboard address mismatch!`)
      console.log(`      Expected: ${LEADERBOARD_ADDRESS}`)
      console.log(`      On-chain: ${leaderboardAddress}`)
    }
  }

  // Get leaderboard stats
  console.log('\n2️⃣ Checking Leaderboard Stats...')
  const leaderboard = new ethers.Contract(leaderboardAddress, LeaderboardABI, provider)
  
  try {
    const totalPlayers = await leaderboard.getTotalPlayers()
    console.log(`   📊 Total registered players: ${totalPlayers}`)

    const [topWinsPlayers, topWinsCounts] = await leaderboard.getTopPlayersByWins(10)
    const [topStreakPlayers, topStreakCounts] = await leaderboard.getTopPlayersByStreak(10)

    console.log(`\n   🏆 Top 10 by Wins:`)
    if (topWinsPlayers.length === 0) {
      console.log('      (No players yet)')
    } else {
      topWinsPlayers.forEach((player, idx) => {
        console.log(`      ${idx + 1}. ${player} - ${topWinsCounts[idx]} wins`)
      })
    }

    console.log(`\n   🔥 Top 10 by Streak:`)
    if (topStreakPlayers.length === 0) {
      console.log('      (No players yet)')
    } else {
      topStreakPlayers.forEach((player, idx) => {
        console.log(`      ${idx + 1}. ${player} - ${topStreakCounts[idx]} streak`)
      })
    }
  } catch (error) {
    console.error('   ❌ Error fetching leaderboard stats:', error.message)
  }

  // Check specific player if provided
  if (playerAddress) {
    console.log(`\n3️⃣ Checking Player Stats for ${playerAddress}...`)
    try {
      const stats = await leaderboard.getPlayerStats(playerAddress)
      if (stats.exists) {
        console.log(`   ✅ Player is registered`)
        console.log(`      Total Wins: ${stats.totalWins}`)
        console.log(`      Current Streak: ${stats.currentStreak}`)
        console.log(`      Longest Streak: ${stats.longestStreak}`)
        console.log(`      Total Rewards: ${ethers.formatUnits(stats.totalRewardsEarned, 18)} cUSD`)
        console.log(`      Last Win Day: ${stats.lastWinDay}`)
      } else {
        console.log(`   ⚠️  Player not yet registered in leaderboard`)
        console.log(`      (Player hasn't won a puzzle yet)`)
      }
    } catch (error) {
      console.error('   ❌ Error fetching player stats:', error.message)
    }
  }

  // Check today's puzzle status
  console.log('\n4️⃣ Checking Today\'s Puzzle...')
  try {
    const currentDay = await eduWordle.currentDay()
    const totalSolvers = await eduWordle.getTotalSolversToday()
    console.log(`   Current Day: ${currentDay}`)
    console.log(`   Total Solvers Today: ${totalSolvers}`)
  } catch (error) {
    console.error('   ❌ Error fetching puzzle status:', error.message)
  }

  console.log('\n✅ Verification complete!')
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})

