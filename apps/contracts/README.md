# EduWordle Smart Contracts

Secure, audited smart contracts for the EduWordle vocabulary game on Celo blockchain.

## 📋 Contracts

### 1. **EduWordle.sol**
Main game contract that handles:
- Daily puzzle verification
- Reward distribution (cUSD)
- Streak tracking and bonuses
- Hint purchases
- Treasury management

### 2. **Leaderboard.sol**
On-chain leaderboard tracking:
- Total wins per player
- Longest streaks
- Top players rankings
- Player statistics

### 3. **MockERC20.sol**
Mock ERC20 token for testing (simulates cUSD)

## 🔒 Security Features

- ✅ ReentrancyGuard protection
- ✅ Ownable access control
- ✅ SafeERC20 token transfers
- ✅ Hash-based puzzle storage
- ✅ Double-claim prevention
- ✅ Checks-Effects-Interactions pattern
- ✅ Solidity 0.8.28 overflow protection

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## 🚀 Quick Start

### Installation

```bash
pnpm install
```

### Compile

```bash
pnpm compile
```

### Test

```bash
pnpm test
```

### Deploy to Celo Sepolia Testnet (Default)

1. Set environment variables:
```bash
export PRIVATE_KEY=your_private_key_here
export CELOSCAN_API_KEY=your_celoscan_api_key
```

2. Deploy:
```bash
pnpm deploy
# or explicitly:
pnpm deploy:sepolia
```

### Deploy to Alfajores Testnet (Alternative)

```bash
pnpm deploy:alfajores
```

### Deploy to Celo Mainnet

```bash
pnpm deploy:celo
```

## 📝 Configuration

### cUSD Addresses

- **Celo Mainnet**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **Celo Sepolia** (Default): `0x1C7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Alfajores Testnet**: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

### Default Parameters

- **Base Reward**: 1 cUSD
- **Hint Price**: 0.1 cUSD
- **Streak Bonus**: 50% per consecutive day
- **Max Hints**: 3 per day

## 🔧 Usage

### Initialize Daily Puzzle

```solidity
// Hash the solution word (e.g., "REACT")
bytes32 solutionHash = keccak256(abi.encodePacked("REACT"));
eduWordle.initializeDay(solutionHash);
```

### Submit Answer

```solidity
eduWordle.submitAnswer("REACT");
```

### Purchase Hint

```solidity
// First approve cUSD
cusd.approve(eduWordleAddress, hintPrice);
// Then purchase
eduWordle.buyHint();
```

### Fund Treasury

```solidity
cusd.approve(eduWordleAddress, amount);
eduWordle.fundTreasury(amount);
```

## 📊 Events

All important state changes emit events:

- `PuzzleInitialized(uint256 day, bytes32 solutionHash)`
- `PuzzleSolved(address solver, uint256 day, uint256 reward, uint256 streak)`
- `RewardClaimed(address claimer, uint256 amount)`
- `HintPurchased(address buyer, uint256 day, uint256 hintNumber)`
- `TreasuryFunded(address funder, uint256 amount)`

## 🧪 Testing

Comprehensive test suite covers:
- Deployment
- Puzzle management
- Answer submission
- Streak tracking
- Hint purchases
- Treasury management
- Access control
- Edge cases

Run tests:
```bash
pnpm test
```

## 📚 Documentation

- [Security Documentation](./SECURITY.md)
- [Contract API Reference](./docs/API.md) (coming soon)

## 🔗 Integration

### Frontend Integration

```typescript
import { ethers } from 'ethers';
import EduWordleABI from './abis/EduWordle.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const eduWordle = new ethers.Contract(contractAddress, EduWordleABI, signer);

// Submit answer
await eduWordle.submitAnswer("REACT");
```

## 🛠️ Development

### Project Structure

```
contracts/
├── EduWordle.sol          # Main game contract
├── Leaderboard.sol        # Leaderboard tracking
└── MockERC20.sol          # Test token

test/
└── EduWordle.test.ts      # Comprehensive tests

ignition/
└── modules/
    └── EduWordle.ts       # Deployment script
```

### Scripts

- `pnpm compile` - Compile contracts
- `pnpm test` - Run tests
- `pnpm deploy:alfajores` - Deploy to Alfajores
- `pnpm deploy:celo` - Deploy to Celo Mainnet
- `pnpm clean` - Clean build artifacts

## 📄 License

MIT

## 🙏 Acknowledgments

- OpenZeppelin for battle-tested contracts
- Celo Foundation for blockchain infrastructure
- Hardhat for development tools

---

**Built with ❤️ for the Celo ecosystem**
