/**
 * Contract Configuration
 * 
 * This file contains all contract addresses and network-specific configurations.
 * Update these addresses after deploying contracts to each network.
 */

export const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_TARGET_CHAIN_ID ?? '11142220') // Default: Celo Sepolia

// cUSD token addresses for different Celo networks
export const CUSD_ADDRESSES = {
  celo: '0x765DE816845861e75A25fCA122bb6898B8B1282a' as `0x${string}`,
  alfajores: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1' as `0x${string}`,
  sepolia: '0x644160A6e05D96fA84dc5525E1E5CC213D9F3a13' as `0x${string}`, // MockERC20 on Sepolia
}

// Contract addresses per network
// TODO: Update these after deployment
export const CONTRACT_ADDRESSES = {
  sepolia: {
    eduWordle: (process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    leaderboard: (process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    cusd: CUSD_ADDRESSES.sepolia,
  },
  alfajores: {
    eduWordle: (process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    leaderboard: (process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    cusd: CUSD_ADDRESSES.alfajores,
  },
  celo: {
    eduWordle: (process.env.NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    leaderboard: (process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    cusd: CUSD_ADDRESSES.celo,
  },
}

// Get contract addresses for a specific chain ID
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 42220: // Celo Mainnet
      return CONTRACT_ADDRESSES.celo
    case 44787: // Alfajores Testnet
      return CONTRACT_ADDRESSES.alfajores
    case 11142220: // Celo Sepolia Testnet
      return CONTRACT_ADDRESSES.sepolia
    default:
      // Default to Sepolia for development / fallback
      return CONTRACT_ADDRESSES.sepolia
  }
}

export function getActiveChainId(chainId?: number) {
  return chainId ?? TARGET_CHAIN_ID
}

export function isSupportedChainId(chainId?: number) {
  return getActiveChainId(chainId) === TARGET_CHAIN_ID
}

// Get cUSD address for a specific chain ID
export function getCusdAddress(chainId: number): `0x${string}` {
  switch (chainId) {
    case 42220:
      return CUSD_ADDRESSES.celo
    case 44787:
      return CUSD_ADDRESSES.alfajores
    case 11142220:
      return CUSD_ADDRESSES.sepolia
    default:
      return CUSD_ADDRESSES.sepolia
  }
}

