#!/usr/bin/env node

/**
 * Script to get deployed contract addresses from Hardhat Ignition deployment
 */

const fs = require('fs');
const path = require('path');

// Chain ID for Celo Sepolia
const CHAIN_ID = '11142220';

// Path to deployment journal
const journalPath = path.join(__dirname, 'ignition', 'deployments', `chain-${CHAIN_ID}`, 'journal.jsonl');

console.log('🔍 Finding Contract Addresses...\n');

// Check if journal exists
if (!fs.existsSync(journalPath)) {
  console.error('❌ Deployment journal not found!');
  console.error(`   Expected at: ${journalPath}`);
  console.error('\n💡 Contracts may not be deployed yet.');
  console.error('   Run: cd apps/contracts && pnpm deploy');
  process.exit(1);
}

// Read journal
const journalContent = fs.readFileSync(journalPath, 'utf-8');
const lines = journalContent.split('\n').filter(line => line.trim());

// Parse journal entries
const addresses = {};

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    
    // Look for deployed contract addresses
    if (entry.type === 'DEPLOYMENT_EXECUTION_STATE_COMPLETE' && entry.result?.contractAddress) {
      const futureId = entry.futureId || '';
      const address = entry.result.contractAddress;
      
      if (futureId.includes('EduWordle')) {
        addresses.eduWordle = address;
      } else if (futureId.includes('Leaderboard')) {
        addresses.leaderboard = address;
      }
    }
    
    // Alternative: Look for address in contractAddress field
    if (entry.contractAddress) {
      const futureId = entry.futureId || '';
      if (futureId.includes('EduWordle')) {
        addresses.eduWordle = entry.contractAddress;
      } else if (futureId.includes('Leaderboard')) {
        addresses.leaderboard = entry.contractAddress;
      }
    }
  } catch (e) {
    // Skip invalid JSON lines
  }
}

// Display results
console.log('📋 Deployed Contract Addresses:\n');

if (addresses.eduWordle) {
  console.log(`✅ EduWordle Contract:`);
  console.log(`   ${addresses.eduWordle}`);
  console.log(`   Explorer: https://celo-sepolia.blockscout.com/address/${addresses.eduWordle}\n`);
} else {
  console.log('❌ EduWordle Contract: Not found (may not be deployed)\n');
}

if (addresses.leaderboard) {
  console.log(`✅ Leaderboard Contract:`);
  console.log(`   ${addresses.leaderboard}`);
  console.log(`   Explorer: https://celo-sepolia.blockscout.com/address/${addresses.leaderboard}\n`);
} else {
  console.log('❌ Leaderboard Contract: Not found (may not be deployed)\n');
}

// Generate .env format
if (addresses.eduWordle || addresses.leaderboard) {
  console.log('📝 Add to apps/web/.env.local:\n');
  console.log(`NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=${addresses.eduWordle || '0x0000000000000000000000000000000000000000'}`);
  console.log(`NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=${addresses.leaderboard || '0x0000000000000000000000000000000000000000'}\n`);
}

// Exit with error if no addresses found
if (!addresses.eduWordle && !addresses.leaderboard) {
  console.error('⚠️  No deployed contracts found in deployment journal.');
  console.error('\n💡 If contracts were just deployed, try:');
  console.error('   1. Check the deployment output');
  console.error('   2. Verify deployment completed successfully');
  console.error('   3. Check blockscout explorer for your deployment wallet transactions');
  console.error(`   Wallet: 0x5c7e85c6e93570ba4f45e41ab41ee8e06e14772f\n`);
  process.exit(1);
}

