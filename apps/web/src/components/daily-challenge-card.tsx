'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowRightIcon } from '@/components/icons/arrow-right'
import { useReadContract, useChainId } from 'wagmi'
import { getContractAddresses } from '@/lib/contracts/config'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { formatUnits } from 'viem'
import { useUserStats } from '@/hooks/use-user-stats'
import { useDailyPuzzle } from '@/hooks/use-daily-puzzle'
import { useAccount } from 'wagmi'

export function DailyChallengeCard() {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const chainId = useChainId()
  const { address, isConnected } = useAccount()
  const contracts = getContractAddresses(chainId)
  const contractAddress = contracts.eduWordle as `0x${string}`
  
  // Fetch contract data
  const { data: baseReward } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'baseRewardAmount',
  })
  
  const { data: streakBonusBps } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'streakBonusBps',
  })
  
  const { streak, hasClaimed } = useUserStats()
  const {
    isInitialized,
    totalSolversToday,
    isLoading: isPuzzleLoading,
    isSupportedChain,
    isStalePuzzle,
    lastInitializedDate,
  } = useDailyPuzzle()

  const lastInitializedDisplay = useMemo(() => {
    if (!lastInitializedDate) return null
    return lastInitializedDate.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    })
  }, [lastInitializedDate])
  
  // Calculate reward amounts
  const baseRewardAmount = baseReward ? parseFloat(formatUnits(baseReward as bigint, 18)) : 0
  const bonusMultiplier = streakBonusBps ? Number(streakBonusBps) / 10000 : 0
  const streakBonusAmount = streak > 1 ? baseRewardAmount * bonusMultiplier * (streak - 1) : 0

  return (
    <div className="relative overflow-hidden rounded-lg card-elevation hover:card-elevation-hover transition-all bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-8">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Today's Challenge</p>
            <h2 className="text-4xl font-bold text-foreground">{today}</h2>
          </div>
          <span className="text-5xl">🎯</span>
        </div>
        
        <p className="text-lg text-muted-foreground mb-6 max-w-md">
          {!isSupportedChain ? (
            <>Please switch your wallet to Celo Sepolia to view today's puzzle and rewards.</>
          ) : hasClaimed && isConnected ? (
            <>You've already completed today's puzzle! Come back tomorrow for a new challenge.</>
          ) : isPuzzleLoading ? (
            <>Checking today's puzzle status...</>
          ) : isInitialized ? (
            <>Complete today's word puzzle to earn <strong>{baseRewardAmount.toFixed(2)} cUSD</strong> and maintain your winning streak.</>
          ) : isStalePuzzle ? (
            <>
              Today's puzzle hasn't been published yet. The last on-chain word went live{' '}
              <span className="font-semibold text-foreground">
                {lastInitializedDisplay ?? 'recently'}
              </span>{' '}
              (UTC). Please check back once the admin reinitializes the contract.
            </>
          ) : (
            <>Puzzle not initialized yet. Please check back later.</>
          )}
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Base Reward</p>
            <p className="font-bold text-lg">{baseRewardAmount.toFixed(2)} cUSD</p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Solvers Today</p>
            <p className="font-bold text-lg">{totalSolversToday}</p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Your Streak</p>
            <p className="font-bold text-lg">{streak > 0 ? `🔥 ${streak}` : '0'}</p>
          </div>
        </div>
        
        {streakBonusAmount > 0 && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-semibold">
              Streak Bonus: +{streakBonusAmount.toFixed(2)} cUSD ({((bonusMultiplier * 100).toFixed(0))}% per day)
            </p>
          </div>
        )}
        
        <Link href="/play">
          <button 
            className="inline-flex items-center gap-2 h-11 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPuzzleLoading || !isSupportedChain || !isInitialized || (hasClaimed && isConnected)}
          >
            {hasClaimed && isConnected
              ? 'Already Completed'
              : !isSupportedChain
                ? 'Wrong Network'
              : isPuzzleLoading
                ? 'Checking Status...'
                : 'Start Playing'}
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  )
}

