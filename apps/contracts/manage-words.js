#!/usr/bin/env node

/**
 * Word Management CLI Tool for EduWordle
 * 
 * This tool helps you manage daily words easily without manually editing CSV files.
 * 
 * Usage:
 *   node manage-words.js add <word> [date]     - Add a word for a specific date (or today)
 *   node manage-words.js list [days]           - List words for next N days (default: 30)
 *   node manage-words.js remove <date>          - Remove word for a specific date
 *   node manage-words.js generate [days]       - Generate words for next N days from word bank
 *   node manage-words.js validate               - Validate CSV file format
 *   node manage-words.js fill-gaps             - Fill missing dates with random words from bank
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const WORDS_FILE = process.env.DAILY_WORDS_FILE || path.join(__dirname, 'daily-words.csv')
const WORD_BANK_FILE = path.join(__dirname, 'word-bank.txt')

// Valid 5-letter words for Wordle
const DEFAULT_WORD_BANK = [
  'REACT', 'BLOCK', 'CHAIN', 'TOKEN', 'LEARN', 'SMART', 'QUIZZ', 'STUDY',
  'GRADE', 'CLASS', 'TEACH', 'LEARN', 'WORDS', 'PUZZL', 'GAMES', 'SKILL',
  'BRAIN', 'THINK', 'LOGIC', 'SOLVE', 'MATCH', 'FOUND', 'EARTH', 'WATER',
  'PLANT', 'ANIMAL', 'HOUSE', 'MUSIC', 'DANCE', 'SPORT', 'TRAIN', 'PLANE',
  'PHONE', 'LIGHT', 'COLOR', 'SHAPE', 'SMILE', 'HAPPY', 'PEACE', 'DREAM',
  'OCEAN', 'MOUNTAIN', 'FOREST', 'RIVER', 'STORM', 'CLOUD', 'SUNNY', 'RAINY',
  'WINTER', 'SPRING', 'SUMMER', 'AUTUMN', 'BREAD', 'FRUIT', 'VEGGY', 'SWEET',
  'HEART', 'MUSIC', 'DANCE', 'SING', 'PAINT', 'DRAW', 'WRITE', 'READ',
  'STORY', 'POEM', 'SONG', 'MOVIE', 'FILM', 'ACTOR', 'STAGE', 'SCENE',
  'BOOK', 'PAGE', 'WORD', 'LETTER', 'PEN', 'PAPER', 'DESK', 'CHAIR',
  'TABLE', 'DOOR', 'WINDOW', 'WALL', 'FLOOR', 'ROOF', 'ROOM', 'HOME',
  'FAMILY', 'FRIEND', 'LOVE', 'CARE', 'KIND', 'NICE', 'GOOD', 'BEST',
  'GREAT', 'AWESOME', 'COOL', 'FUN', 'JOY', 'LAUGH', 'SMILE', 'HAPPY'
].filter(w => w.length === 5).map(w => w.toUpperCase())

function getTodayDateLabel() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate(dateStr) {
  if (!dateStr) return getTodayDateLabel()
  
  // If just a number, treat as days from today
  if (/^\d+$/.test(dateStr)) {
    const days = parseInt(dateStr, 10)
    const date = new Date()
    date.setUTCDate(date.getUTCDate() + days)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Try to parse as YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  throw new Error(`Invalid date format: ${dateStr}. Use YYYY-MM-DD or number of days from today`)
}

function validateWord(word) {
  if (!word || typeof word !== 'string') {
    throw new Error('Word must be a non-empty string')
  }
  
  const upperWord = word.toUpperCase().trim()
  
  if (upperWord.length !== 5) {
    throw new Error('Word must be exactly 5 letters')
  }
  
  if (!/^[A-Z]{5}$/.test(upperWord)) {
    throw new Error('Word must contain only letters (A-Z)')
  }
  
  return upperWord
}

function loadWordBank() {
  if (fs.existsSync(WORD_BANK_FILE)) {
    const content = fs.readFileSync(WORD_BANK_FILE, 'utf8')
    const words = content
      .split(/\r?\n/)
      .map(line => line.trim().toUpperCase())
      .filter(line => line && line.length === 5 && /^[A-Z]{5}$/.test(line))
    return words.length > 0 ? words : DEFAULT_WORD_BANK
  }
  return DEFAULT_WORD_BANK
}

function loadCSV() {
  if (!fs.existsSync(WORDS_FILE)) {
    // Create empty CSV with header
    fs.writeFileSync(WORDS_FILE, '# date,word\n', 'utf8')
    return []
  }
  
  const content = fs.readFileSync(WORDS_FILE, 'utf8')
  const rows = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
  
  const entries = []
  for (const row of rows) {
    const [date, word] = row.split(',').map(entry => entry.trim())
    if (date && word) {
      entries.push({ date, word: word.toUpperCase() })
    }
  }
  
  return entries
}

function saveCSV(entries) {
  // Sort by date
  entries.sort((a, b) => a.date.localeCompare(b.date))
  
  // Remove duplicates (keep last one)
  const uniqueEntries = []
  const seen = new Set()
  for (let i = entries.length - 1; i >= 0; i--) {
    if (!seen.has(entries[i].date)) {
      seen.add(entries[i].date)
      uniqueEntries.unshift(entries[i])
    }
  }
  
  const lines = ['# date,word', ...uniqueEntries.map(e => `${e.date},${e.word}`)]
  fs.writeFileSync(WORDS_FILE, lines.join('\n') + '\n', 'utf8')
}

function addWord(word, dateStr) {
  const validWord = validateWord(word)
  const date = parseDate(dateStr)
  
  const entries = loadCSV()
  
  // Remove existing entry for this date
  const filtered = entries.filter(e => e.date !== date)
  
  // Add new entry
  filtered.push({ date, word: validWord })
  
  saveCSV(filtered)
  console.log(`✅ Added word "${validWord}" for ${date}`)
}

function listWords(days = 30) {
  const entries = loadCSV()
  const today = new Date(getTodayDateLabel() + 'T00:00:00Z')
  const endDate = new Date(today)
  endDate.setUTCDate(endDate.getUTCDate() + days)
  
  const filtered = entries.filter(e => {
    const entryDate = new Date(e.date + 'T00:00:00Z')
    return entryDate >= today && entryDate <= endDate
  })
  
  if (filtered.length === 0) {
    console.log(`⚠️  No words found for the next ${days} days`)
    return
  }
  
  console.log(`\n📅 Words for the next ${days} days:\n`)
  filtered.forEach(e => {
    const entryDate = new Date(e.date + 'T00:00:00Z')
    const isToday = e.date === getTodayDateLabel()
    const dayName = entryDate.toLocaleDateString('en-US', { weekday: 'short' })
    const marker = isToday ? ' 👈 TODAY' : ''
    console.log(`  ${e.date} (${dayName}) - ${e.word}${marker}`)
  })
  console.log()
}

function removeWord(dateStr) {
  const date = parseDate(dateStr)
  const entries = loadCSV()
  const filtered = entries.filter(e => e.date !== date)
  
  if (filtered.length === entries.length) {
    console.log(`⚠️  No word found for ${date}`)
    return
  }
  
  saveCSV(filtered)
  console.log(`✅ Removed word for ${date}`)
}

function generateWords(days = 30) {
  const wordBank = loadWordBank()
  const entries = loadCSV()
  const existingDates = new Set(entries.map(e => e.date))
  
  const today = new Date(getTodayDateLabel() + 'T00:00:00Z')
  const usedWords = new Set(entries.map(e => e.word))
  const availableWords = wordBank.filter(w => !usedWords.has(w))
  
  if (availableWords.length === 0) {
    console.log('⚠️  No available words in bank. Consider expanding word-bank.txt')
    return
  }
  
  let added = 0
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() + i)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const dateLabel = `${year}-${month}-${day}`
    
    if (!existingDates.has(dateLabel)) {
      // Pick a random word from available words
      const randomIndex = Math.floor(Math.random() * availableWords.length)
      const word = availableWords[randomIndex]
      availableWords.splice(randomIndex, 1)
      
      entries.push({ date: dateLabel, word })
      existingDates.add(dateLabel)
      added++
    }
  }
  
  if (added > 0) {
    saveCSV(entries)
    console.log(`✅ Generated ${added} words for the next ${days} days`)
  } else {
    console.log('ℹ️  All dates already have words assigned')
  }
}

function fillGaps() {
  const entries = loadCSV()
  const wordBank = loadWordBank()
  const existingDates = new Set(entries.map(e => e.date))
  const usedWords = new Set(entries.map(e => e.word))
  const availableWords = wordBank.filter(w => !usedWords.has(w))
  
  if (availableWords.length === 0) {
    console.log('⚠️  No available words in bank. Consider expanding word-bank.txt')
    return
  }
  
  const today = new Date(getTodayDateLabel() + 'T00:00:00Z')
  const endDate = new Date(today)
  endDate.setUTCDate(endDate.getUTCDate() + 90) // Check next 90 days
  
  let added = 0
  for (let i = 0; i < 90; i++) {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() + i)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const dateLabel = `${year}-${month}-${day}`
    
    if (!existingDates.has(dateLabel)) {
      if (availableWords.length === 0) {
        console.log(`⚠️  Ran out of words after filling ${added} gaps`)
        break
      }
      
      const randomIndex = Math.floor(Math.random() * availableWords.length)
      const word = availableWords[randomIndex]
      availableWords.splice(randomIndex, 1)
      
      entries.push({ date: dateLabel, word })
      existingDates.add(dateLabel)
      added++
    }
  }
  
  if (added > 0) {
    saveCSV(entries)
    console.log(`✅ Filled ${added} date gaps with words`)
  } else {
    console.log('ℹ️  No gaps found in the next 90 days')
  }
}

function validate() {
  const entries = loadCSV()
  const errors = []
  
  entries.forEach((entry, index) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      errors.push(`Line ${index + 2}: Invalid date format "${entry.date}"`)
    }
    
    if (!validateWord(entry.word)) {
      errors.push(`Line ${index + 2}: Invalid word "${entry.word}"`)
    }
  })
  
  // Check for duplicates
  const dates = entries.map(e => e.date)
  const duplicates = dates.filter((date, index) => dates.indexOf(date) !== index)
  if (duplicates.length > 0) {
    errors.push(`Duplicate dates found: ${[...new Set(duplicates)].join(', ')}`)
  }
  
  if (errors.length > 0) {
    console.log('❌ Validation errors found:\n')
    errors.forEach(e => console.log(`  - ${e}`))
    process.exit(1)
  } else {
    console.log(`✅ CSV file is valid (${entries.length} entries)`)
  }
}

// Main CLI
const command = process.argv[2]

try {
  switch (command) {
    case 'add':
      const word = process.argv[3]
      const date = process.argv[4]
      if (!word) {
        console.error('Usage: node manage-words.js add <word> [date]')
        process.exit(1)
      }
      addWord(word, date)
      break
      
    case 'list':
      const days = parseInt(process.argv[3] || '30', 10)
      listWords(days)
      break
      
    case 'remove':
      const removeDate = process.argv[3]
      if (!removeDate) {
        console.error('Usage: node manage-words.js remove <date>')
        process.exit(1)
      }
      removeWord(removeDate)
      break
      
    case 'generate':
      const genDays = parseInt(process.argv[3] || '30', 10)
      generateWords(genDays)
      break
      
    case 'fill-gaps':
      fillGaps()
      break
      
    case 'validate':
      validate()
      break
      
    default:
      console.log(`
📚 EduWordle Word Management Tool

Usage:
  node manage-words.js <command> [options]

Commands:
  add <word> [date]      Add a word for a specific date (or today if date omitted)
                         Date format: YYYY-MM-DD or number of days from today
                         
  list [days]            List words for next N days (default: 30)
  
  remove <date>          Remove word for a specific date
  
  generate [days]        Generate words for next N days from word bank (default: 30)
  
  fill-gaps              Fill missing dates with random words from bank (next 90 days)
  
  validate               Validate CSV file format

Examples:
  node manage-words.js add REACT              # Add word for today
  node manage-words.js add BLOCK 2025-12-01   # Add word for specific date
  node manage-words.js add CHAIN 7            # Add word for 7 days from today
  node manage-words.js list 60                # List next 60 days
  node manage-words.js generate 90            # Generate words for next 90 days
  node manage-words.js fill-gaps              # Fill all gaps in next 90 days
  node manage-words.js validate               # Check CSV file
`)
      process.exit(0)
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`)
  process.exit(1)
}

