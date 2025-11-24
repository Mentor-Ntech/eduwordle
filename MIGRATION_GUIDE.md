# EduWordle Celo Composer Migration Guide

## Overview
This document tracks the migration of EduWordle frontend from standalone Next.js to Celo Composer monorepo structure.

## Project Structure

```
eduwordle-celo/
├── apps/
│   ├── web/              # Next.js frontend (migrated from edu-wordle-ui-design 2)
│   └── contracts/        # Hardhat smart contracts
├── package.json          # Root workspace config
└── turbo.json           # Turborepo config
```

## Migration Steps

### ✅ Completed
1. Created Celo Composer project
2. Set up environment files (.env.local, .env)
3. Verified project structure

### 🔄 In Progress
1. Migrate frontend code
2. Update wallet provider for MiniPay
3. Merge design system
4. Set up contracts structure

### ⏳ Pending
1. Test integration
2. Deploy contracts
3. Connect frontend to contracts

## Key Changes

### Wallet Integration
- **Before**: Mock wallet with localStorage
- **After**: RainbowKit + Wagmi with MiniPay support
- **Location**: `apps/web/src/components/wallet-provider.tsx`

### Design System
- Migrating Tailwind config with EduWordle colors
- Preserving all custom CSS utilities
- Maintaining component structure

### File Mapping

| Old Location | New Location |
|-------------|-------------|
| `app/` | `apps/web/src/app/` |
| `components/` | `apps/web/src/components/` |
| `lib/` | `apps/web/src/lib/` |
| `public/` | `apps/web/public/` |
| `styles/` | `apps/web/src/app/` (merged into globals.css) |

## Environment Variables

### Web App (`apps/web/.env.local`)
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
CELO_RPC_URL=https://forno.celo.org
```

### Contracts (`apps/contracts/.env`)
```
PRIVATE_KEY=your_private_key_here
CELOSCAN_API_KEY=your_celoscan_api_key_here
```

## Next Steps
1. Copy all frontend files
2. Update imports and paths
3. Test wallet connection
4. Deploy test contracts
5. Connect frontend to contracts

