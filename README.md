# EduWordle - Tested with MiniPay (ngrok) 🎮💰

A decentralized vocabulary game built on the Celo blockchain that rewards players with cUSD stablecoins for solving daily word puzzles. **Successfully tested with MiniPay using ngrok for mobile testing.**

![Screenshot of the testing page](/apps/web/public/eduworldu.jpeg)

## Introduction

EduWordle is a mobile-first, educational word puzzle game that combines the fun of Wordle with real cryptocurrency rewards. Players solve a daily five-letter word puzzle and earn Celo Dollar (cUSD) stablecoins when they get the answer correct. The game runs entirely on the Celo blockchain, ensuring transparency and fairness, while providing an engaging way to learn new vocabulary.

## The Problem We're Solving

Traditional language learning apps often struggle with low user engagement. Many educational games don't offer meaningful rewards, especially in emerging markets where traditional payment systems are expensive and complicated. Small rewards in regular money are hard to give because of high fees and transaction problems.

EduWordle solves this by:
- Making learning fun through daily word puzzles
- Rewarding players with real cryptocurrency (cUSD) that has stable value
- Using blockchain technology for transparent and fair reward distribution
- Working seamlessly with mobile wallets like MiniPay for easy access
- Providing low-cost transactions that make small rewards practical

## Main Features

### 🎯 Daily Word Puzzle
- A new five-letter word puzzle every day
- Up to six guesses to solve the puzzle
- Color-coded feedback (green = correct letter in right place, yellow = correct letter wrong place, gray = letter not in word)
- Puzzle resets automatically at midnight UTC

### 💰 Cryptocurrency Rewards
- Earn cUSD (Celo Dollar) stablecoins for solving puzzles
- Base reward of 1 cUSD per solved puzzle
- Streak bonuses for consecutive daily wins (50% bonus per day)
- Rewards are sent directly to your wallet on the blockchain

### 📊 Leaderboard System
- See how you rank against other players
- Track your total wins and longest streak
- View top players globally
- All data stored on-chain for transparency

### 🔥 Streak Tracking
- Build a winning streak by solving puzzles daily
- Each consecutive day increases your reward bonus
- Track your progress and compete with friends

### 💡 Hint System
- Purchase hints if you get stuck (optional feature)
- Reveals correct letters to help you solve the puzzle
- Small fee in cUSD for each hint

### 🌍 Multi-Language Support
- Interface available in multiple languages
- English, Spanish, French, German, and Portuguese
- Easy language switching in settings

### 📱 Mobile-First Design
- Works perfectly on mobile devices
- Responsive design for all screen sizes
- Optimized for MiniPay wallet integration
- Progressive Web App (PWA) - can be installed on your phone

### 🔐 Secure and Transparent
- All game logic stored on blockchain smart contracts
- Puzzle answers stored as secure hashes
- No cheating possible - everything verified on-chain
- Open source code for transparency

## How to Use the App

### Getting Started

1. **Connect Your Wallet**
   - Open the app in your browser
   - Click "Connect Wallet" button
   - Choose MiniPay or any Celo-compatible wallet
   - Approve the connection

2. **View the Daily Challenge**
   - Go to the Dashboard to see today's puzzle
   - Check the base reward amount
   - See how many players have solved it today
   - View your current streak

3. **Play the Game**
   - Click "Start Playing" or go to the Play page
   - Type your first guess using the on-screen keyboard
   - Press Enter or click Submit
   - See color-coded feedback for each letter
   - Continue guessing until you solve it or run out of attempts

4. **Claim Your Reward**
   - When you solve the puzzle, click "Claim Reward"
   - Confirm the transaction in your wallet
   - Wait for the transaction to complete
   - Your cUSD reward will appear in your wallet

5. **Track Your Progress**
   - Visit the Leaderboard to see your ranking
   - Check your stats on the Dashboard
   - View your streak and total wins
   - See your wallet balance

### Navigating the App

**Dashboard** - Your main page showing:
- Today's daily challenge card
- Your quick stats (wins, streak, balance)
- Quick action buttons

**Play** - The game page where you:
- Enter your guesses
- See the game board with your attempts
- Submit your final answer
- Claim rewards

**Leaderboard** - See rankings showing:
- Top players by total wins
- Longest streaks
- Your position

**Settings** - Manage your preferences:
- Change language
- View wallet connection status
- Check MiniPay balance
- Adjust notification settings

## Tools and Technologies Used

### Frontend
- **Next.js 14** - React framework for building the web application
- **TypeScript** - Type-safe JavaScript for better code quality
- **React 18** - UI library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - High-quality React component library
- **RainbowKit** - Wallet connection UI components
- **Wagmi** - React hooks for Ethereum/Celo interactions
- **Viem** - TypeScript interface for Ethereum/Celo

### Smart Contracts
- **Solidity 0.8.28** - Programming language for smart contracts
- **Hardhat** - Development environment for Ethereum/Celo
- **OpenZeppelin** - Secure smart contract libraries
- **TypeChain** - TypeScript bindings for smart contracts

### Blockchain
- **Celo Network** - Mobile-first blockchain platform
- **cUSD** - Celo Dollar stablecoin for rewards
- **MiniPay** - Mobile wallet integration

### Development Tools
- **Turborepo** - Monorepo build system
- **PNPM** - Fast, disk space efficient package manager
- **ESLint** - Code linting and quality checks
- **TypeScript** - Static type checking

### Additional Services
- **Supabase** - Optional database for enhanced features
- **Vercel** - Deployment platform (optional)

## Setup Instructions

### Prerequisites

Before you begin, make sure you have:
- Node.js version 18 or higher installed
- PNPM package manager installed
- A code editor (VS Code recommended)
- A Celo-compatible wallet (MiniPay recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/eduwordle-celo.git
   cd eduwordle-celo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the `apps/web` directory:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_TARGET_CHAIN_ID=11142220
   NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS=your_contract_address
   NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=your_leaderboard_address
   ```

   Get your WalletConnect Project ID from: https://cloud.walletconnect.com/

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The app should now be running

### Smart Contract Setup

1. **Navigate to contracts directory**
   ```bash
   cd apps/contracts
   ```

2. **Set up contract environment**
   Create a `.env` file:
   ```env
   PRIVATE_KEY=your_private_key
   CELOSCAN_API_KEY=your_celoscan_api_key
   ```

3. **Compile contracts**
   ```bash
   pnpm compile
   ```

4. **Deploy to testnet**
   ```bash
   pnpm deploy:alfajores
   # or
   pnpm deploy:sepolia
   ```

## Testing with MiniPay (ngrok)

EduWordle has been successfully tested with MiniPay using ngrok for local development. Here's how to test it yourself:

### Prerequisites
- MiniPay app installed on your phone
- ngrok installed on your computer
- Next.js dev server running on port 3000

### Steps

1. **Start your development server**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Start ngrok in a new terminal**
   ```bash
   ngrok http 3000
   ```

3. **Copy the ngrok URL**
   - Look for the "Forwarding" URL in the ngrok output
   - It will look like: `https://xxxxx.ngrok-free.dev`

4. **Enable Developer Mode in MiniPay**
   - Open MiniPay app on your phone
   - Go to Settings → About
   - Tap the version number 7 times
   - Go back to Settings → Developer Settings
   - Enable Developer Mode
   - Toggle "Use Testnet" for Alfajores testnet

5. **Load the app in MiniPay**
   - In Developer Settings, tap "Load test page"
   - Enter your ngrok URL
   - Tap "Load"
   - Your app will open in MiniPay

6. **Test the features**
   - Connect your MiniPay wallet
   - Play the daily puzzle
   - Claim rewards
   - Check the leaderboard

### Troubleshooting

- **502 Bad Gateway**: Make sure your Next.js server is running on port 3000
- **Connection issues**: Verify ngrok is forwarding to the correct port
- **Wallet not connecting**: Ensure you're on the correct network (Alfajores testnet)

## Project Structure

```
eduwordle-celo/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/         # Next.js app router pages
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   └── lib/         # Utilities and configurations
│   │   └── package.json
│   └── contracts/            # Smart contracts
│       ├── contracts/       # Solidity contract files
│       ├── test/           # Contract tests
│       └── ignition/       # Deployment scripts
├── package.json            # Root package.json
└── README.md              # This file
```

## Available Scripts

### Root Level
- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all code
- `pnpm type-check` - Run TypeScript type checking

### Web App
- `cd apps/web && pnpm dev` - Start Next.js dev server
- `cd apps/web && pnpm build` - Build for production
- `cd apps/web && pnpm start` - Start production server

### Smart Contracts
- `cd apps/contracts && pnpm compile` - Compile contracts
- `cd apps/contracts && pnpm test` - Run contract tests
- `cd apps/contracts && pnpm deploy:alfajores` - Deploy to Alfajores
- `cd apps/contracts && pnpm deploy:sepolia` - Deploy to Sepolia

## Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Security

The smart contracts have been designed with security best practices:
- ReentrancyGuard protection
- Access control for admin functions
- Safe token transfers using SafeERC20
- Hash-based puzzle storage
- Double-claim prevention

See `apps/contracts/SECURITY.md` for detailed security documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Celo Foundation for blockchain infrastructure
- MiniPay team for wallet integration support
- Hardhat for development tools
- The Wordle game for inspiration

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the documentation in the `apps/contracts` directory
- Review the troubleshooting section above

---

**Built with ❤️ for the Celo ecosystem and educational gaming**
