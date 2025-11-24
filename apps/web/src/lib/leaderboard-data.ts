export interface LeaderboardEntry {
  rank: number
  username: string
  avatar: string
  points: number
  streak: number
  wins: number
  isCurrentUser?: boolean
}

// Helper function to format address as username
export function formatAddressAsUsername(address: string, currentUser?: string): string {
  if (!address) return 'Unknown'
  // Check if it's the current user
  if (currentUser && address.toLowerCase() === currentUser.toLowerCase()) {
    return 'You'
  }
  // Format as first 4 and last 4 characters
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Helper function to generate avatar from address
export function getAvatarFromAddress(address: string): string {
  if (!address) return '👤'
  // Simple hash-based avatar selection
  const avatars = ['🏆', '⚡', '📚', '👑', '🎯', '💬', '🧩', '🌟', '🔥', '💎']
  const hash = address.charCodeAt(address.length - 1)
  return avatars[hash % avatars.length]
}

// Transform contract leaderboard data to UI format
export function transformLeaderboardData(
  entries: Array<{ rank: number; address: string; wins: number; streak: number }>,
  currentUserAddress?: string
): LeaderboardEntry[] {
  return entries.map((entry) => ({
    rank: entry.rank,
    username: formatAddressAsUsername(entry.address, currentUserAddress),
    avatar: getAvatarFromAddress(entry.address),
    points: entry.wins * 50, // Approximate points (could be fetched from contract if available)
    streak: entry.streak,
    wins: entry.wins,
    isCurrentUser: currentUserAddress?.toLowerCase() === entry.address.toLowerCase(),
  }))
}
