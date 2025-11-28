# 📋 Contract Addresses - Celo Sepolia

## ✅ New Contracts (With MockERC20)

**EduWordle Contract:**
```
0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95
```

**Leaderboard Contract:**
```
0x30dd0Ff90fA9e956964f8C033F8651Bf40A5Fc08
```

**MockERC20 (cUSD) Token:**
```
0x644160A6e05D96fA84dc5525E1E5CC213D9F3a13
```

## 📝 Update apps/web/.env.local

Add or update these lines:

```env
NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0x30dd0Ff90fA9e956964f8C033F8651Bf40A5Fc08
NEXT_PUBLIC_DAILY_WORD=REACT
NEXT_PUBLIC_TARGET_CHAIN_ID=11142220
```

## ✅ Status

- ✅ MockERC20 deployed and minted
- ✅ Treasury funded with 50 cUSD
- ✅ Puzzle initialized with word "REACT"
- ✅ Contracts linked and ready

## 🔗 Block Explorer Links

- EduWordle: https://celo-sepolia.blockscout.com/address/0xB0796aDB7F853E804Bfc921AaFAeCd011ea0BD95
- Leaderboard: https://celo-sepolia.blockscout.com/address/0x30dd0Ff90fA9e956964f8C033F8651Bf40A5Fc08
- MockERC20: https://celo-sepolia.blockscout.com/address/0x644160A6e05D96fA84dc5525E1E5CC213D9F3a13

## ⚠️ Important

**After updating .env.local, you MUST restart your Next.js dev server!**

```bash
# Stop the server (Ctrl+C), then:
cd apps/web
pnpm dev
```





