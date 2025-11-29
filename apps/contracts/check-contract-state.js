#!/usr/bin/env node

/**
 * Script to check contract state and find the current word
 * 
 * Usage:
 *   node check-contract-state.js
 */

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const RPC_URL = 'https://forno.celo-sepolia.celo-testnet.org';
const CONTRACT_ADDRESS = process.env.EDUWORDLE_ADDRESS || '0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95';

const EDUWORDLE_ABI = [
  'function currentDay() view returns (uint256)',
  'function currentSolutionHash() view returns (bytes32)',
  'function treasuryBalance() view returns (uint256)',
  'function baseRewardAmount() view returns (uint256)',
  'function getTotalSolversToday() view returns (uint256)',
  'function leaderboardContract() view returns (address)',
];

async function findWordForHash(targetHash) {
  console.log('\n🔍 Searching for word matching hash...');
  console.log(`   Target hash: ${targetHash}`);
  
  // Check daily-words.csv first
  const csvPath = path.join(__dirname, 'daily-words.csv');
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length === 2) {
        const word = parts[1].trim().toUpperCase();
        if (word.length === 5) {
          const hash = ethers.keccak256(ethers.toUtf8Bytes(word));
          if (hash.toLowerCase() === targetHash.toLowerCase()) {
            console.log(`   ✅ FOUND in daily-words.csv: ${word}`);
            return word;
          }
        }
      }
    }
  }
  
  // Check word-bank.txt
  const wordBankPath = path.join(__dirname, 'word-bank.txt');
  if (fs.existsSync(wordBankPath)) {
    const words = fs.readFileSync(wordBankPath, 'utf8')
      .split('\n')
      .filter(w => w.trim().length === 5 && !w.startsWith('#'));
    
    console.log(`   Checking ${words.length} words from word-bank.txt...`);
    
    for (const word of words) {
      const upperWord = word.trim().toUpperCase();
      if (upperWord.length === 5) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(upperWord));
        if (hash.toLowerCase() === targetHash.toLowerCase()) {
          console.log(`   ✅ FOUND in word-bank.txt: ${upperWord}`);
          return upperWord;
        }
      }
    }
  }
  
  console.log('   ❌ Word not found in any word list');
  return null;
}

async function main() {
  console.log('📊 Contract State Checker');
  console.log('='.repeat(60));
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, EDUWORDLE_ABI, provider);
  
  try {
    // Get contract state
    const currentDay = await contract.currentDay();
    const solutionHash = await contract.currentSolutionHash();
    const treasuryBalance = await contract.treasuryBalance();
    const baseReward = await contract.baseRewardAmount();
    const totalSolvers = await contract.getTotalSolversToday();
    const leaderboardContract = await contract.leaderboardContract();
    
    const today = Math.floor(Date.now() / 86400000) * 86400;
    const todayDate = new Date(today * 1000).toISOString().split('T')[0];
    
    console.log('\n📅 Day Information:');
    console.log(`   Today (UTC): ${today} (${todayDate})`);
    console.log(`   Contract Day: ${currentDay.toString()}`);
    
    if (currentDay.toString() === today.toString()) {
      console.log('   ✅ Puzzle is initialized for TODAY');
    } else if (currentDay.toString() === '0') {
      console.log('   ❌ Puzzle is NOT initialized');
    } else {
      const contractDate = new Date(Number(currentDay) * 1000).toISOString().split('T')[0];
      console.log(`   ⚠️  Puzzle is initialized for: ${contractDate} (NOT today)`);
    }
    
    console.log('\n🔐 Solution Hash:');
    console.log(`   ${solutionHash}`);
    
    if (solutionHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log('   ❌ No solution hash set');
    } else {
      // Try to find the word
      const word = await findWordForHash(solutionHash);
      if (word) {
        console.log(`\n✅ Current word on contract: ${word}`);
      } else {
        console.log('\n⚠️  Could not find matching word in word lists');
        console.log('   The word might be:');
        console.log('   - Not in the word bank');
        console.log('   - A custom word that was manually set');
        console.log('   - From a previous day');
      }
    }
    
    console.log('\n💰 Treasury & Rewards:');
    console.log(`   Treasury Balance: ${ethers.formatEther(treasuryBalance)} cUSD`);
    console.log(`   Base Reward: ${ethers.formatEther(baseReward)} cUSD`);
    console.log(`   Total Solvers Today: ${totalSolvers.toString()}`);
    
    console.log('\n🔗 Leaderboard:');
    if (leaderboardContract === '0x0000000000000000000000000000000000000000') {
      console.log('   ❌ Not connected');
    } else {
      console.log(`   ✅ Connected: ${leaderboardContract}`);
    }
    
    // Check expected word for today
    console.log('\n📝 Expected Word for Today:');
    const csvPath = path.join(__dirname, 'daily-words.csv');
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length === 2) {
          const date = parts[0].trim();
          const word = parts[1].trim().toUpperCase();
          
          if (date === todayDate) {
            const expectedHash = ethers.keccak256(ethers.toUtf8Bytes(word));
            console.log(`   Date: ${date}`);
            console.log(`   Word: ${word}`);
            console.log(`   Expected Hash: ${expectedHash}`);
            
            if (solutionHash.toLowerCase() === expectedHash.toLowerCase()) {
              console.log('   ✅ Contract hash MATCHES expected word!');
            } else {
              console.log('   ❌ Contract hash does NOT match expected word');
              console.log('   💡 The contract needs to be reinitialized with the correct word');
            }
            break;
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'NETWORK_ERROR') {
      console.error('   Check your internet connection and RPC URL');
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

