#!/usr/bin/env node

/**
 * Script to redeploy ONLY the Leaderboard contract with fixes
 * and update the existing EduWordle contract to point to it
 * 
 * Usage:
 *   node redeploy-leaderboard.js [EduWordleAddress]
 * 
 * If EduWordleAddress is not provided, it will try to read from deployed_addresses.json
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const RPC_URL = process.env.RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Leaderboard ABI (minimal)
const LeaderboardABI = [
  'constructor(address _eduWordleContract, uint256 _maxTopPlayers)',
  'function maxTopPlayers() view returns (uint256)',
];

// EduWordle ABI (minimal)
const EduWordleABI = [
  'function setLeaderboardContract(address _leaderboardContract)',
  'function leaderboardContract() view returns (address)',
  'function owner() view returns (address)',
];

async function main() {
  console.log('🚀 Redeploying Leaderboard Contract with Fixes\n');

  // Check environment
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in environment');
    console.error('   Set it in .env file or export PRIVATE_KEY=...');
    process.exit(1);
  }

  // Get EduWordle address
  let eduWordleAddress = process.argv[2];
  
  if (!eduWordleAddress) {
    // Try to read from deployed_addresses.json
    const deployedPath = path.join(__dirname, 'ignition', 'deployments', 'chain-11142220', 'deployed_addresses.json');
    if (fs.existsSync(deployedPath)) {
      const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
      // Try to find EduWordle address
      eduWordleAddress = deployed['EduWordleModule#EduWordle'] || 
                        deployed['EduWordleWithMockCUSDModule#EduWordle'];
    }
  }

  if (!eduWordleAddress) {
    console.error('❌ EduWordle address not provided');
    console.error('   Usage: node redeploy-leaderboard.js <EduWordleAddress>');
    console.error('   Or set it in deployed_addresses.json');
    process.exit(1);
  }

  console.log(`📋 Using EduWordle: ${eduWordleAddress}\n`);

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`👤 Deploying from: ${wallet.address}\n`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} CELO`);
  if (balance < ethers.parseEther('0.01')) {
    console.error('⚠️  Warning: Low balance. You may need more CELO for gas.\n');
  }

  // Verify we're the owner of EduWordle
  const eduWordle = new ethers.Contract(eduWordleAddress, EduWordleABI, provider);
  const owner = await eduWordle.owner();
  
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error('❌ Error: You are not the owner of the EduWordle contract!');
    console.error(`   Owner: ${owner}`);
    console.error(`   Your address: ${wallet.address}`);
    console.error('\n   You need to be the owner to update the leaderboard address.');
    process.exit(1);
  }

  console.log('✅ Verified: You are the owner of EduWordle\n');

  // Deploy Leaderboard contract
  console.log('📦 Deploying Leaderboard contract...');
  
  // Read contract bytecode and ABI
  const leaderboardArtifact = require('./artifacts/contracts/Leaderboard.sol/Leaderboard.json');
  const leaderboardFactory = new ethers.ContractFactory(
    leaderboardArtifact.abi,
    leaderboardArtifact.bytecode,
    wallet
  );

  const maxTopPlayers = 100; // Default value
  const leaderboard = await leaderboardFactory.deploy(eduWordleAddress, maxTopPlayers);
  
  console.log(`   ⏳ Transaction: ${leaderboard.deploymentTransaction()?.hash}`);
  console.log('   ⏳ Waiting for confirmation...');
  
  await leaderboard.waitForDeployment();
  const leaderboardAddress = await leaderboard.getAddress();
  
  console.log(`   ✅ Leaderboard deployed at: ${leaderboardAddress}`);
  console.log(`   📊 Explorer: https://celo-sepolia.blockscout.com/address/${leaderboardAddress}\n`);

  // Update EduWordle to point to new Leaderboard
  console.log('🔗 Updating EduWordle to use new Leaderboard...');
  const eduWordleWithSigner = new ethers.Contract(eduWordleAddress, EduWordleABI, wallet);
  
  const tx = await eduWordleWithSigner.setLeaderboardContract(leaderboardAddress);
  console.log(`   ⏳ Transaction: ${tx.hash}`);
  console.log('   ⏳ Waiting for confirmation...');
  
  await tx.wait();
  console.log('   ✅ EduWordle updated!\n');

  // Verify the update
  const currentLeaderboard = await eduWordle.leaderboardContract();
  if (currentLeaderboard.toLowerCase() === leaderboardAddress.toLowerCase()) {
    console.log('✅ Verification: Leaderboard is correctly linked!\n');
  } else {
    console.error('❌ Error: Leaderboard link verification failed!');
    process.exit(1);
  }

  // Save addresses
  console.log('📝 Contract Addresses:\n');
  console.log(`EduWordle: ${eduWordleAddress}`);
  console.log(`Leaderboard: ${leaderboardAddress}\n`);

  console.log('📝 Add to apps/web/.env.local:\n');
  console.log(`NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=${eduWordleAddress}`);
  console.log(`NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=${leaderboardAddress}\n`);

  console.log('✅ Redeployment complete!');
  console.log('\n⚠️  Important: Update your frontend .env.local and restart the dev server!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });

