#!/usr/bin/env node

/**
 * Script to fund the EduWordle contract treasury with cUSD
 * 
 * Usage:
 *   node fund-treasury.js [amount]
 * 
 * Example:
 *   node fund-treasury.js 20
 */

require('dotenv').config();
const { ethers } = require('ethers');

// Contract addresses (checksummed)
const CUSD_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // cUSD on Celo Sepolia (checksummed)
const GAME_ADDRESS = '0x130efc67fBe2EC623B62Ef761d1d1C9fc0B073A9'; // EduWordle contract

// Network configuration
const RPC_URL = 'https://forno.celo-sepolia.celo-testnet.org';

// cUSD ABI (minimal)
const CUSD_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// EduWordle ABI (minimal)
const GAME_ABI = [
  "function fundTreasury(uint256 amount)",
  "function treasuryBalance() view returns (uint256)"
];

async function main() {
  // Get amount from command line or use default
  const amount = process.argv[2] || '20';
  const amountInWei = ethers.parseUnits(amount, 18);

  // Check private key
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  console.log('💰 Funding EduWordle Treasury...');
  console.log(`📝 Amount: ${amount} cUSD`);

  // Connect to network
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(`👤 Wallet: ${wallet.address}`);

  // Check wallet cUSD balance
  const cusd = new ethers.Contract(CUSD_ADDRESS, CUSD_ABI, provider);
  const balance = await cusd.balanceOf(wallet.address);
  console.log(`💵 Your cUSD balance: ${ethers.formatUnits(balance, 18)} cUSD`);

  if (balance < amountInWei) {
    console.error(`❌ Error: Insufficient cUSD balance. You have ${ethers.formatUnits(balance, 18)} cUSD but need ${amount} cUSD`);
    process.exit(1);
  }

  // Check current allowance
  const gameContract = new ethers.Contract(GAME_ADDRESS, GAME_ABI, provider);
  const currentAllowance = await cusd.allowance(wallet.address, GAME_ADDRESS);
  console.log(`🔐 Current allowance: ${ethers.formatUnits(currentAllowance, 18)} cUSD`);

  // Step 1: Approve if needed
  if (currentAllowance < amountInWei) {
    console.log('\n📤 Step 1: Approving cUSD...');
    const cusdWithSigner = new ethers.Contract(CUSD_ADDRESS, CUSD_ABI, wallet);
    
    try {
      const approveTx = await cusdWithSigner.approve(GAME_ADDRESS, amountInWei);
      console.log(`⏳ Approval transaction: ${approveTx.hash}`);
      console.log('⏳ Waiting for confirmation...');
      
      await approveTx.wait();
      console.log('✅ Approval confirmed!');
    } catch (error) {
      console.error('❌ Approval failed:', error.message);
      if (error.reason) {
        console.error(`   Reason: ${error.reason}`);
      }
      process.exit(1);
    }
  } else {
    console.log('✅ Already approved, skipping approval step');
  }

  // Step 2: Fund treasury
  console.log('\n📤 Step 2: Funding treasury...');
  const gameWithSigner = new ethers.Contract(GAME_ADDRESS, GAME_ABI, wallet);
  
  try {
    const fundTx = await gameWithSigner.fundTreasury(amountInWei);
    console.log(`⏳ Funding transaction: ${fundTx.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    await fundTx.wait();
    console.log('✅ Treasury funded successfully!');
    
    // Verify treasury balance
    const treasuryBalance = await gameContract.treasuryBalance();
    console.log(`\n✅ Verification:`);
    console.log(`   Treasury balance: ${ethers.formatUnits(treasuryBalance, 18)} cUSD`);
    
    if (treasuryBalance >= amountInWei) {
      console.log('\n🎉 Success! The game is now ready to pay rewards!');
    }
  } catch (error) {
    console.error('❌ Funding failed:', error.message);
    if (error.reason) {
      console.error(`   Reason: ${error.reason}`);
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

