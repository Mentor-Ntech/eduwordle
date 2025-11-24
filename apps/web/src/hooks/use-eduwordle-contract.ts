'use client'

import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses } from '@/lib/contracts/config'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { type Abi, type Address } from 'viem'

/**
 * Hook to interact with the EduWordle contract
 * Provides read and write functions for contract interactions
 */
export function useEduWordleContract() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract()

  const contracts = getContractAddresses(chainId)
  const contractAddress = contracts.eduWordle as Address

  // Read contract functions
  const readContract = useReadContract

  // Write contract function wrapper
  const executeWrite = async (functionName: string, args: any[] = []) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }

    return writeContract({
      address: contractAddress,
      abi: EduWordleABI as Abi,
      functionName,
      args,
    })
  }

  return {
    contractAddress,
    isConnected,
    address,
    readContract,
    writeContract: executeWrite,
    isWritePending,
    writeError,
    contracts,
  }
}

