#!/usr/bin/env node

/**
 * Daily automation script for EduWordle:
 * 1. Ensures the treasury has a minimum buffer.
 * 2. Initializes the puzzle for the current UTC day using daily-words.csv.
 *
 * Intended to run once per day from a cron job or GitHub Action.
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { ethers } = require('ethers')

const eduWordleArtifact = require('./artifacts/contracts/EduWordle.sol/EduWordle.json')
const erc20Artifact = require('./artifacts/contracts/MockERC20.sol/MockERC20.json')

const RPC_URL = process.env.RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'
const PRIVATE_KEY = process.env.PRIVATE_KEY
const EDUWORDLE_ADDRESS =
  process.env.EDUWORDLE_ADDRESS ||
  process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS ||
  ''
const CUSD_ADDRESS = process.env.CUSD_ADDRESS || process.env.MOCK_CUSD_ADDRESS || ''
const WORDS_FILE = process.env.DAILY_WORDS_FILE || path.join(__dirname, 'daily-words.csv')
const FRONTEND_ENV_FILE =
  process.env.FRONTEND_ENV_FILE ||
  path.join(__dirname, '../web/.env.local')
const TREASURY_BUFFER = process.env.TREASURY_BUFFER || '10' // in cUSD
const DAILY_WORD_JSON =
  process.env.DAILY_WORD_JSON ||
  path.join(__dirname, '../web/public/daily-word.json')
const LEADERBOARD_JSON =
  process.env.LEADERBOARD_JSON ||
  path.join(__dirname, 'leaderboard-address.json')

if (!PRIVATE_KEY) {
  throw new Error('Missing PRIVATE_KEY in environment')
}

if (!EDUWORDLE_ADDRESS) {
  throw new Error('Missing EDUWORDLE_ADDRESS (set EDUWORDLE_ADDRESS or NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS)')
}

if (!CUSD_ADDRESS) {
  throw new Error('Missing CUSD_ADDRESS (set CUSD_ADDRESS or MOCK_CUSD_ADDRESS)')
}

function getTodayDateLabel() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function loadWordForDate(dateLabel) {
  if (!fs.existsSync(WORDS_FILE)) {
    throw new Error(`Words file not found at ${WORDS_FILE}`)
  }

  const rows = fs
    .readFileSync(WORDS_FILE, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))

  for (const row of rows) {
    const [date, word] = row.split(',').map((entry) => entry.trim())
    if (date === dateLabel) {
      return word.toUpperCase()
    }
  }

  throw new Error(`No word found for ${dateLabel} in ${WORDS_FILE}`)
}

async function ensureTreasuryBuffer(eduWordle, cusdToken, walletAddress) {
  const bufferWei = ethers.parseUnits(TREASURY_BUFFER, 18)
  const currentTreasury = await eduWordle.treasuryBalance()

  if (currentTreasury >= bufferWei) {
    console.log(`✅ Treasury already funded (${ethers.formatUnits(currentTreasury, 18)} cUSD)`)
    return
  }

  const required = bufferWei - currentTreasury
  console.log(`ℹ️  Funding treasury with ${ethers.formatUnits(required, 18)} cUSD`)

  const allowance = await cusdToken.allowance(walletAddress, eduWordle.target)
  if (allowance < required) {
    console.log('➡️  Approving EduWordle to spend cUSD')
    const approveTx = await cusdToken.approve(eduWordle.target, ethers.MaxUint256)
    await approveTx.wait()
  }

  const fundTx = await eduWordle.fundTreasury(required)
  await fundTx.wait()
  console.log('✅ Treasury funded')
}

async function syncLeaderboardFromJson(eduWordle) {
  const resolvedPath = path.resolve(LEADERBOARD_JSON)
  if (!fs.existsSync(resolvedPath)) {
    console.log(`ℹ️  Leaderboard JSON not found at ${resolvedPath}. Skipping leaderboard sync.`)
    return
  }

  const payload = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'))
  const configured = payload.address
  if (!configured) {
    console.log('ℹ️  Leaderboard JSON missing "address" field. Skipping leaderboard sync.')
    return
  }

  const onChain = await eduWordle.leaderboardContract()
  if (onChain && onChain.toLowerCase() === configured.toLowerCase()) {
    console.log('✅ Leaderboard already connected to EduWordle')
    return
  }

  console.log(`➡️  Connecting leaderboard ${configured} to EduWordle`)
  const tx = await eduWordle.setLeaderboardContract(configured)
  await tx.wait()
  console.log('✅ Leaderboard contract updated')
}

async function initializePuzzleIfNeeded(eduWordle, word) {
  const todayUtcDay = Math.floor(Date.now() / 86400000) * 86400
  const currentDay = await eduWordle.currentDay()
  const currentDayNumber = Number(currentDay)

  if (currentDayNumber === todayUtcDay) {
    console.log('✅ Puzzle already initialized for today')
    return
  }

  if (currentDayNumber > todayUtcDay) {
    console.warn('⚠️  On-chain day is ahead of UTC day. Skipping initialization.')
    return
  }

  const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(word))
  console.log(`➡️  Initializing puzzle for ${getTodayDateLabel()} with hash ${solutionHash}`)
  const tx = await eduWordle.initializeDay(solutionHash)
  await tx.wait()
  console.log('✅ Puzzle initialized')
}

function writeDailyWordFile(dateLabel, word) {
  const resolvedPath = path.resolve(DAILY_WORD_JSON)
  const dir = path.dirname(resolvedPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const payload = {
    date: dateLabel,
    word: word.toUpperCase(),
    hash: ethers.keccak256(ethers.toUtf8Bytes(word.toUpperCase())),
    updatedAt: new Date().toISOString(),
  }

  fs.writeFileSync(resolvedPath, JSON.stringify(payload, null, 2))
  console.log(`✅ Wrote daily word file to ${resolvedPath}`)
}

function syncFrontendEnv(word) {
  const resolvedPath = path.resolve(FRONTEND_ENV_FILE)
  const envDir = path.dirname(resolvedPath)
  const upperWord = word.toUpperCase()
  const targetLine = `NEXT_PUBLIC_DAILY_WORD=${upperWord}`

  if (!fs.existsSync(envDir)) {
    console.warn(`⚠️  Frontend env directory not found (${envDir}). Skipping .env sync.`)
    return
  }

  let contents = ''
  if (fs.existsSync(resolvedPath)) {
    contents = fs.readFileSync(resolvedPath, 'utf8')
  }

  const lines = contents ? contents.split(/\r?\n/) : []
  let updated = false
  let found = false

  const newLines = lines.map((line) => {
    if (line.startsWith('NEXT_PUBLIC_DAILY_WORD=')) {
      found = true
      if (line !== targetLine) {
        updated = true
        return targetLine
      }
    }
    return line
  })

  if (!found) {
    newLines.push(targetLine)
    updated = true
  }

  if (!updated) {
    console.log('✅ Frontend .env already has the correct NEXT_PUBLIC_DAILY_WORD')
    return
  }

  fs.writeFileSync(resolvedPath, newLines.filter((line) => line !== undefined).join('\n'))
  console.log(`✅ Updated ${resolvedPath} with NEXT_PUBLIC_DAILY_WORD=${upperWord}`)
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

  console.log(`👤 Operator: ${wallet.address}`)
  console.log(`📆 Today (UTC): ${getTodayDateLabel()}`)

  const eduWordle = new ethers.Contract(EDUWORDLE_ADDRESS, eduWordleArtifact.abi, wallet)
  const cusdToken = new ethers.Contract(CUSD_ADDRESS, erc20Artifact.abi, wallet)

  const word = loadWordForDate(getTodayDateLabel())
  console.log(`🧩 Word for today: ${word}`)

  await ensureTreasuryBuffer(eduWordle, cusdToken, wallet.address)
  await initializePuzzleIfNeeded(eduWordle, word)
  writeDailyWordFile(getTodayDateLabel(), word)
  syncFrontendEnv(word)
  await syncLeaderboardFromJson(eduWordle)

  console.log('🎉 Daily cycle complete')
}

main().catch((err) => {
  console.error('❌ Daily cycle failed:', err)
  process.exit(1)
})




