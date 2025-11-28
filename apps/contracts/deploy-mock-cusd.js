#!/usr/bin/env node

/**
 * Script to deploy MockERC20 token for testing on Celo Sepolia
 * This creates a test cUSD token that can be used for the game
 */

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Network configuration
const RPC_URL = 'https://forno.celo-sepolia.celo-testnet.org';

// MockERC20 ABI (from compilation)
const MOCK_ERC20_ABI = [
  "constructor(string name, string symbol, uint8 decimals)",
  "function mint(address to, uint256 amount)",
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)"
];

// MockERC20 bytecode (we'll need to get this from artifacts)
async function getMockERC20Bytecode() {
  try {
    const artifactsPath = path.join(__dirname, 'artifacts', 'contracts', 'MockERC20.sol', 'MockERC20.json');
    const artifacts = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    return artifacts.bytecode;
  } catch (error) {
    console.error('❌ Could not find MockERC20 bytecode. Please compile contracts first:');
    console.error('   Run: pnpm compile');
    throw error;
  }
}

async function main() {
  console.log('🚀 Deploying MockERC20 Token for Testing...\n');

  // Check private key
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  // Connect to network
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(`👤 Deployer: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 CELO balance: ${ethers.formatEther(balance)} CELO\n`);

  if (balance < ethers.parseEther('0.01')) {
    console.error('❌ Insufficient CELO for deployment. Need at least 0.01 CELO for gas.');
    process.exit(1);
  }

  try {
    // Get bytecode
    console.log('📦 Loading contract bytecode...');
    const bytecode = await getMockERC20Bytecode();
    
    // Create contract factory
    const MockERC20Factory = new ethers.ContractFactory(MOCK_ERC20_ABI, bytecode, wallet);
    
    // Deploy
    console.log('📤 Deploying MockERC20...');
    const mockCUSD = await MockERC20Factory.deploy(
      "Celo Dollar",  // name
      "cUSD",         // symbol
      18              // decimals
    );
    
    console.log(`⏳ Transaction: ${mockCUSD.deploymentTransaction().hash}`);
    console.log('⏳ Waiting for deployment...');
    
    await mockCUSD.waitForDeployment();
    const address = await mockCUSD.getAddress();
    
    console.log(`\n✅ MockERC20 deployed at: ${address}`);
    console.log(`   Explorer: https://celo-sepolia.blockscout.com/address/${address}\n`);
    
    // Mint some tokens to the deployer
    console.log('💰 Minting 1000 cUSD to deployer...');
    const mintTx = await mockCUSD.mint(wallet.address, ethers.parseUnits('1000', 18));
    await mintTx.wait();
    console.log('✅ Tokens minted!\n');
    
    // Check balance
    const tokenBalance = await mockCUSD.balanceOf(wallet.address);
    console.log(`💵 Your cUSD balance: ${ethers.formatUnits(tokenBalance, 18)} cUSD\n`);
    
    console.log('📝 Next steps:');
    console.log(`   1. Update contract config to use: ${address}`);
    console.log(`   2. Or use this address to fund the treasury`);
    console.log(`   3. Note: The game contract expects a different address, so you may need to redeploy`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
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





