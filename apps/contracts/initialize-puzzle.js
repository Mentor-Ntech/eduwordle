#!/usr/bin/env node

/**
 * Script to initialize the daily puzzle on the EduWordle contract
 * 
 * Usage:
 *   node initialize-puzzle.js [word]
 * 
 * Example:
 *   node initialize-puzzle.js REACT
 */

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Contract ABI (minimal - just what we need)
const EDUWORDLE_ABI = [
  "function initializeDay(bytes32 _solutionHash) external",
  "function currentDay() external view returns (uint256)",
  "function currentSolutionHash() external view returns (bytes32)",
  "function owner() external view returns (address)"
];

// Contract address (from deployment)
const CONTRACT_ADDRESS = '0x130efc67fBe2EC623B62Ef761d1d1C9fc0B073A9';

// Network configuration
const RPC_URL = 'https://forno.celo-sepolia.celo-testnet.org';

async function main() {
  // Get word from command line or use default
  const word = process.argv[2] || 'REACT';
  const upperWord = word.toUpperCase().trim();

  if (upperWord.length !== 5) {
    console.error('❌ Error: Word must be exactly 5 letters');
    console.log('Usage: node initialize-puzzle.js [WORD]');
    process.exit(1);
  }

  if (!/^[A-Z]+$/.test(upperWord)) {
    console.error('❌ Error: Word must contain only letters');
    process.exit(1);
  }

  // Check private key
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  console.log('🚀 Initializing puzzle...');
  console.log(`📝 Word: ${upperWord}`);

  // Connect to network
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(`👤 Deployer: ${wallet.address}`);

  // Connect to contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, EDUWORDLE_ABI, wallet);

  // Check if caller is owner
  try {
    const owner = await contract.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error(`❌ Error: Wallet ${wallet.address} is not the contract owner`);
      console.log(`   Owner is: ${owner}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error checking owner:', error.message);
    process.exit(1);
  }

  // Check current state
  try {
    const currentDay = await contract.currentDay();
    const currentHash = await contract.currentSolutionHash();
    console.log(`📅 Current day: ${currentDay.toString()}`);
    console.log(`🔐 Current hash: ${currentHash}`);
    
    if (currentDay > 0n && currentHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log('⚠️  Warning: Puzzle already initialized for today');
      console.log('   The contract will only allow initialization for a new day');
    }
  } catch (error) {
    console.log('ℹ️  Could not read current state (contract may not be initialized yet)');
  }

  // Generate solution hash
  // The contract uses keccak256 of the word
  const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(upperWord));
  console.log(`🔐 Solution hash: ${solutionHash}`);

  // Initialize the puzzle
  try {
    console.log('\n📤 Sending transaction...');
    const tx = await contract.initializeDay(solutionHash);
    console.log(`⏳ Transaction hash: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log(`✅ Puzzle initialized successfully!`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    
    // Verify initialization
    const newDay = await contract.currentDay();
    const newHash = await contract.currentSolutionHash();
    console.log(`\n✅ Verification:`);
    console.log(`   Day: ${newDay.toString()}`);
    console.log(`   Hash: ${newHash}`);
    
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Add to apps/web/.env.local:`);
    console.log(`      NEXT_PUBLIC_DAILY_WORD=${upperWord}`);
    console.log(`   2. Restart your Next.js dev server`);
    
  } catch (error) {
    if (error.reason) {
      console.error(`❌ Error: ${error.reason}`);
    } else if (error.message) {
      console.error(`❌ Error: ${error.message}`);
    } else {
      console.error('❌ Error:', error);
    }
    
    if (error.message && error.message.includes('Day already initialized')) {
      console.log('\n💡 Tip: The contract only allows one initialization per day.');
      console.log('   Wait until tomorrow or use a different day identifier.');
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

