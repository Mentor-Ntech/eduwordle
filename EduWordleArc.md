eduwordle/
├── contracts/               # Solidity smart contracts
│   ├── EduWordle.sol
│   ├── interfaces/
│   └── utils/
│
├── frontend/                # Progressive Web App (PWA) frontend
│   ├── public/              # Static assets (favicon, manifest, etc.)
│   ├── src/
│   │   ├── assets/          # Custom icons, images, logos
│   │   ├── components/      # Reusable UI elements
│   │   ├── context/         # Web3 or app-wide context providers
│   │   ├── hooks/           # Custom React/Svelte hooks (e.g. useWallet)
│   │   ├── pages/           # Page-level components (Home, Game, Claim)
│   │   ├── services/        # API / contract service logic
│   │   ├── utils/           # Formatters, helpers
│   │   ├── constants/       # Game config, contract addresses
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts       # Or use next.config.js if using Next.js
│
├── scripts/                 # Deployment & management scripts
│   ├── deploy.ts
│   ├── verify.ts
│   └── seed.ts
│
├── test/                    # Contract tests
│   ├── EduWordle.test.ts
│   └── utils/
│
├── abi/                     # Exported contract ABIs for frontend
│   └── EduWordle.json
│
├── .env                     # Environment variables
├── hardhat.config.ts        # Or foundry.toml if using Foundry
├── package.json             # Monorepo root package
├── README.md
└── whitepaper.pdf           # Your finalized white paper

