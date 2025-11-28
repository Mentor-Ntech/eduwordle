#!/usr/bin/env node

/**
 * Script to set up the deployed contracts:
 * 1. Mint MockERC20 tokens
 * 2. Approve EduWordle to spend tokens
 * 3. Fund the treasury
 * 4. Initialize the puzzle
 */

require('dotenv').config();
const { ethers } = require('ethers');

// Contract addresses
const MOCK_CUSD_ADDRESS = '0x644160A6e05D96fA84dc5525E1E5CC213D9F3a13';
const EDUWORDLE_ADDRESS = '0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95';

// Network configuration
const RPC_URL = 'https://forno.celo-sepolia.celo-testnet.org';

// ABIs
const MOCK_ERC20_ABI = [
  "function mint(address to, uint256 amount)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const EDUWORDLE_ABI = [
  "function fundTreasury(uint256 amount)",
  "function initializeDay(bytes32 solutionHash)",
  "function treasuryBalance() view returns (uint256)",
  "function currentDay() view returns (uint256)"
];

async function main() {
  console.log('🚀 Setting up contracts...\n');

  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  // Connect to network
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(`👤 Wallet: ${wallet.address}\n`);

  const mockCUSD = new ethers.Contract(MOCK_CUSD_ADDRESS, MOCK_ERC20_ABI, wallet);
  const eduWordle = new ethers.Contract(EDUWORDLE_ADDRESS, EDUWORDLE_ABI, wallet);

  // Step 1: Mint tokens
  console.log('📝 Step 1: Minting 1000 MockERC20 tokens...');
  try {
    const mintTx = await mockCUSD.mint(wallet.address, ethers.parseUnits('1000', 18));
    console.log(`   Transaction: ${mintTx.hash}`);
    await mintTx.wait();
    console.log('   ✅ Tokens minted!\n');
  } catch (error) {
    console.error('   ❌ Minting failed:', error.message);
    process.exit(1);
  }

  // Check balance
  const balance = await mockCUSD.balanceOf(wallet.address);
  console.log(`   💵 Your balance: ${ethers.formatUnits(balance, 18)} cUSD\n`);

  // Step 2: Approve
  console.log('📝 Step 2: Approving EduWordle to spend 100 cUSD...');
  try {
    const approveTx = await mockCUSD.approve(EDUWORDLE_ADDRESS, ethers.parseUnits('100', 18));
    console.log(`   Transaction: ${approveTx.hash}`);
    await approveTx.wait();
    console.log('   ✅ Approved!\n');
  } catch (error) {
    console.error('   ❌ Approval failed:', error.message);
    process.exit(1);
  }

  // Step 3: Fund treasury
  console.log('📝 Step 3: Funding treasury with 50 cUSD...');
  try {
    const fundTx = await eduWordle.fundTreasury(ethers.parseUnits('50', 18));
    console.log(`   Transaction: ${fundTx.hash}`);
    await fundTx.wait();
    console.log('   ✅ Treasury funded!\n');
  } catch (error) {
    console.error('   ❌ Funding failed:', error.message);
    process.exit(1);
  }

  // Verify treasury
  const treasuryBalance = await eduWordle.treasuryBalance();
  console.log(`   💰 Treasury balance: ${ethers.formatUnits(treasuryBalance, 18)} cUSD\n`);

  // Step 4: Initialize puzzle
  console.log('📝 Step 4: Initializing puzzle with word "REACT"...');
  try {
    const solution = "REACT";
    const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));
    const initTx = await eduWordle.initializeDay(solutionHash);
    console.log(`   Transaction: ${initTx.hash}`);
    await initTx.wait();
    console.log('   ✅ Puzzle initialized!\n');
  } catch (error) {
    if (error.message && error.message.includes('Day already initialized')) {
      console.log('   ⚠️  Puzzle already initialized for today\n');
    } else {
      console.error('   ❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  console.log('🎉 Setup complete!\n');
  console.log('📝 Update your frontend .env.local with:');
  console.log(`   NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=${EDUWORDLE_ADDRESS}`);
  console.log(`   NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0x30dd0Ff90fA9e956964f8C033F8651Bf40A5Fc08`);
  console.log(`   NEXT_PUBLIC_DAILY_WORD=REACT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





