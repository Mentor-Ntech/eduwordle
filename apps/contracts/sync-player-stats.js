#!/usr/bin/env node

/**
 * Syncs PuzzleSolved events into Supabase player_stats table.
 *
 * Requirements:
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_KEY
 *  - EVENT_STATE_FILE (optional, defaults to .puzzle-sync-state.json)
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const { ethers } = require('ethers')
const { createClient } = require('@supabase/supabase-js')
const eduWordleArtifact = require('./artifacts/contracts/EduWordle.sol/EduWordle.json')

const RPC_URL = process.env.RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
const EDUWORDLE_ADDRESS =
  process.env.EDUWORDLE_ADDRESS ||
  process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS ||
  ''
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const EVENT_STATE_FILE =
  process.env.EVENT_STATE_FILE ||
  path.join(__dirname, '.puzzle-sync-state.json')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration (SUPABASE_URL or SUPABASE_SERVICE_KEY)')
}

if (!EDUWORDLE_ADDRESS) {
  throw new Error('Missing EDUWORDLE_ADDRESS (set EDUWORDLE_ADDRESS or NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS)')
}

function loadState() {
  try {
    const raw = fs.readFileSync(EVENT_STATE_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    return { lastProcessedBlock: 0 }
  }
}

function saveState(state) {
  fs.writeFileSync(EVENT_STATE_FILE, JSON.stringify(state, null, 2))
}

async function upsertPlayerStats(supabase, event) {
  const solver = event.args?.solver?.toLowerCase()
  const rewardWei = event.args?.reward ?? 0n
  const streak = Number(event.args?.streak ?? 0n)
  const day = Number(event.args?.day ?? 0n)

  if (!solver) return

  const rewardCusd = Number(ethers.formatUnits(rewardWei, 18))

  const { data: existing } = await supabase
    .from('player_stats')
    .select('total_wins,longest_streak,current_streak,total_rewards,last_win_day')
    .eq('address', solver)
    .maybeSingle()

  const prevWins = existing?.total_wins ?? 0
  const prevCurrentStreak = existing?.current_streak ?? 0
  const prevLongestStreak = existing?.longest_streak ?? 0
  const prevRewards = parseFloat(existing?.total_rewards ?? 0)
  const prevLastWinDay = existing?.last_win_day ?? 0

  let nextCurrentStreak = 1
  if (prevLastWinDay === day - 86400) {
    nextCurrentStreak = prevCurrentStreak + 1
  } else if (prevLastWinDay === day) {
    nextCurrentStreak = prevCurrentStreak
  }

  const nextLongestStreak = Math.max(prevLongestStreak, nextCurrentStreak, streak)
  const nextTotalWins = prevWins + 1
  const nextRewards = prevRewards + rewardCusd

  const payload = {
    address: solver,
    total_wins: nextTotalWins,
    longest_streak: nextLongestStreak,
    current_streak: nextCurrentStreak,
    total_rewards: nextRewards,
    last_win_day: day,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('player_stats')
    .upsert(payload, { onConflict: 'address' })

  if (error) {
    console.error('❌ Failed to upsert player stats', solver, error.message)
  } else {
    console.log(`   📝 Updated stats for ${solver} (wins: ${nextTotalWins}, streak: ${nextCurrentStreak})`)
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const contract = new ethers.Contract(EDUWORDLE_ADDRESS, eduWordleArtifact.abi, provider)

  const state = loadState()
  const latestBlock = await provider.getBlockNumber()
  const fromBlock = state.lastProcessedBlock ? state.lastProcessedBlock + 1 : latestBlock - 5000
  const startBlock = Math.max(fromBlock, 0)

  console.log('🔄 Syncing PuzzleSolved events')
  console.log(`   From block: ${startBlock}`)
  console.log(`   To block:   ${latestBlock}`)

  if (startBlock > latestBlock) {
    console.log('   Nothing to do (startBlock > latestBlock)')
    return
  }

  const filter = contract.filters.PuzzleSolved()
  const events = await contract.queryFilter(filter, startBlock, latestBlock)

  console.log(`   Found ${events.length} new events`)

  for (const event of events) {
    await upsertPlayerStats(supabase, event)
    state.lastProcessedBlock = event.blockNumber
  }

  if (events.length === 0) {
    state.lastProcessedBlock = latestBlock
  }

  saveState(state)
  console.log('✅ Supabase stats sync complete')
}

main().catch((error) => {
  console.error('❌ Supabase stats sync failed:', error)
  process.exit(1)
})

