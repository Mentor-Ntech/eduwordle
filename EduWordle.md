Hacksdao Project

EduWordle: A Decentralized Mobile Vocabulary Game on Celo
Abstract
EduWordle is a mobile-first, decentralized vocabulary game built on the Celo blockchain. It combines the addictive daily-word-puzzle format of Wordle with on-chain rewards: players who solve the daily challenge earn Celo Dollar (cUSD) stablecoins. The front-end is a Progressive Web App (PWA) written in TypeScript, while the backend logic resides in Solidity smart contracts. Integration with Opera’s MiniPay wallet provides seamless user onboarding and micropayments: learners can use their phone numbers to manage cUSD with sub-cent fees and no gas hasslespress.opera.compress.opera.com. The game aims to boost language learning engagement by tying real economic incentives to educational play, leveraging Celo’s fast, low-cost transactions and stablecoin supportquicknode.comsanako.com. This white paper outlines the vision, architecture, user experience, smart-contract design, and security considerations, and suggests future expansions (such as community-generated puzzles) for the Celo MiniPay Hackathon project.
Problem Statement
Traditional language learning tools often suffer from low engagement and lack real incentives. Research shows that game-based learning dramatically increases student engagement and retention of new vocabularysanako.com. However, most educational games do not reward users in a meaningful way – especially in emerging markets where traditional payment systems are cumbersome. Additionally, small micropayments or rewards in fiat currency are difficult to scale due to fees and friction. There is a gap for a solution that makes practice fun and rewarding with real stable-value tokens. At the same time, many potential learners in Africa and Latin America are becoming active crypto users via mobile wallets like MiniPay, yet few apps combine education with decentralized finance. EduWordle addresses these challenges by gamifying vocabulary practice and rewarding success with Celo’s on-chain stablecoins (cUSD), which are universally accessible and have negligible volatility. By using Celo’s mobile-friendly chain and Opera’s MiniPay wallet, we remove barriers of access and cost for learners, making daily micro-incentives practicalquicknode.compress.opera.com.
Solution Overview
EduWordle presents users with a daily five-letter word puzzle. Each day, the smart contract specifies a secret solution (hashed for security). Players have up to six guesses: each guess is processed by the PWA and feedback (“correct letter, wrong place”, etc.) is shown instantly in the UI. When a player finds the word, they claim their reward on-chain. A Solidity function verifies the answer and sends cUSD to the player’s wallet. The frontend is implemented as a PWA (TypeScript/React) so it can run in any mobile browser or be installed like an applearn.microsoft.com. Users connect their MiniPay wallet (or inject a web3 provider) to sign transactions.
The technical stack is entirely open-source: TypeScript and modern web frameworks for the client; Solidity smart contracts on Celo for the game logic. The contracts hold a small cUSD treasury funded by the developer (or hackathon grant) to pay winners. Because Celo is EVM-compatible, we use the standard ERC-20 interface for cUSD. The app follows Celo’s design principles: low-cost, fast transactions (1-second block timesquicknode.com), and gas abstraction so users pay fees in cUSD instead of CELOquicknode.com. MiniPay integration provides an intuitive phone-number-based account that can swap local currency to cUSD and back with no hidden feespress.opera.com. In summary, EduWordle is a PWA front-end + Celo back-end game where solving a word puzzle earns you tangible cUSD rewards in a seamless, on-chain mannerquicknode.compress.opera.com.
Technical Architecture
Figure 1: Celo full-stack architecture (Applications layer, Core Contracts, Blockchain)docs.celo.org. EduWordle’s architecture follows the Celo full-stack model. The client (mobile browser/PWA) runs on the user’s device and handles the UI (rendering the puzzle grid, capturing input, etc.). It connects to the Celo blockchain via a Web3 provider. In practice, this is Opera’s MiniPay wallet (either standalone or within Opera Mini browser), which injects a web3 provider pointing to Celo’s RPC nodes.
Underneath, Celo Core Contracts and Blockchain provide the ledger and protocol. We deploy a custom Solidity contract for the game logic alongside Celo’s core contracts (e.g. the cUSD token contract). Users’ transactions – such as submitting an answer or buying a hint – are packaged by MiniPay and sent as transactions to Celo’s network. Thanks to Celo’s design, these transactions finalize in about 1 secondquicknode.com and cost only a fraction of a cent in fees. Because Celo supports gas payments in stablecoins (fee abstraction), our app simply specifies cUSD as the fee currency, and MiniPay handles the details.
On the infrastructure side, Celo uses a multi-tier node setup. Figure 2: Celo network topology (mobile light clients ↔ full nodes ↔ validators)docs.celo.org. As shown in Figure 2, users’ mobile devices act as light clients, connecting to distributed full nodes and validators in the Celo networkdocs.celo.org. In practice, our PWA makes JSON-RPC calls through MiniPay; the on-phone MiniPay app is effectively a light client. Transactions and queries flow through full nodes to the validators, who maintain consensus via proof-of-stake. This topology means any phone can participate without needing to run a full node, aligning with Celo’s mobile-first goalsdocs.celo.org. In sum, EduWordle’s stack is: (1) a PWA frontend (TypeScript/JavaScript, possibly using React or similar) running in the browser; (2) MiniPay or any Celo-compatible wallet for account and signing; (3) Celo blockchain providing fast blocks, stablecoins, and smart contract executionquicknode.compress.opera.com.
User Flow
Onboarding: The user opens EduWordle in their mobile browser. If using MiniPay, the wallet is already logged in via phone/SMS. Otherwise, they connect a Celo wallet (MiniPay or MetaMask with Celo). No password keys or seed words are needed thanks to MiniPay’s UX.


Daily Puzzle: The app retrieves the current day’s puzzle (from a backend API or directly from the smart contract). The puzzle is a five-letter English word. The answer itself is stored on-chain as a hash (so it’s kept secret).


Gameplay: The user enters a guess via the on-screen keyboard. The PWA checks the guess client-side and highlights each letter (green/yellow/gray). This logic (Wordle rules) runs entirely in the front-end.


Reward Claim: If the user successfully solves the word within the allowed attempts, they tap “Claim Reward”. The app then sends a transaction calling the smart contract’s submitAnswer function. This transaction includes the guessed word.


On-Chain Verification: In the contract, submitAnswer hashes the provided word and compares it to the stored solution hash. If they match and the user hasn’t already claimed for today, the contract transfers a fixed cUSD reward to the user’s address.


Micropayments (Optional): To discourage brute-forcing, the app may require a small cUSD fee for each guess or for hints. For example, a user might pay 0.10 cUSD to reveal one correct letter if stuck. Such micropayments are made via MiniPay with sub-cent feespress.opera.com and automatically routed to the contract.


Daily Reset: At the end of each UTC day (or on admin command), the contract owner calls initializeDay to set the new puzzle’s hash. The next day’s game starts afresh.


Throughout this flow, cUSD is the currency for all transfers. Users never handle volatile tokens: cUSD is pegged to USD, so rewards have predictable value. All wallet and payment interactions use MiniPay’s API, which abstracts away gas and lets users see balances in their local currency if desiredpress.opera.com. The PWA may store minimal state (e.g. “today’s attempts left”) but relies on on-chain checks for correctness and reward disbursement. This flow leverages Celo’s low fees to make micro-incentivization feasible: paying or receiving a few cents in cUSD is practical for daily playquicknode.compress.opera.com.
Smart Contract Functions
EduWordle’s Solidity contract includes the following key functions:
initializeDay(bytes32 solutionHash): Admin only. Sets the SHA-256 hash of the current day’s solution. This could also store a timestamp or day-index. The solutionHash is kept private so that only matches submitted by users will succeed.


submitAnswer(string guess): Public. Called by the player with their final solved word. The contract computes keccak256(abi.encodePacked(guess)) and compares it to the stored solutionHash. If equal and the caller hasn’t already claimed today, it marks them as claimed and triggers an ERC-20 cUSD transfer as a reward. If wrong, it simply reverts or does nothing, letting the user try again (off-chain).


buyHint(): (Optional) Allows a user to pay a small cUSD fee to get a hint (e.g. revealing one correct letter via an event). This demonstrates microtransactions usage. The paid cUSD can go into the reward pool.


withdrawFunds(): Admin only. In case of excess funds, allows the owner to withdraw leftover cUSD from the contract. This ensures no funds are locked when no longer needed.


view functions: E.g. getRewardAmount() or dayStatus(address), letting front-end display info.


Internally, the contract uses OpenZeppelin’s SafeERC20 library for all token transfers, to handle any non-standard ERC-20s safely. State changes (like marking a win) occur before the external cUSD transfer, following the checks–effects–interactions pattern. Solidity 0.8+ is used so integer overflows are checked by default. All administrative functions are restricted via onlyOwner (e.g. using OpenZeppelin’s Ownable). The contract also records which addresses have won on a given day to prevent double-claims. Because MiniPay currently only supports sending transactions with cUSD as the fee currencydocs.celo.org, the contract assumes all fees are paid in cUSD. In summary, the smart contract offers a straightforward on-chain game loop: set puzzle, accept correct answer, and mint (transfer) stablecoin rewards in a trust-minimized way.
Security Considerations
Answer Secrecy: To prevent front-running or guessing, the daily word is never stored in plaintext on-chain. Only a hash is stored, so no one can trivially derive the word ahead of time. The hashing scheme (SHA-256 or keccak256) and a salt known only to the admin ensures security.


Replay and Double-Claim Prevention: The contract tracks which addresses have already claimed today. Once a user solves the puzzle, any further calls to submitAnswer by that address are ignored. This stops one player from claiming multiple rewards.


Access Control: All admin functions (setting the puzzle or withdrawing funds) are restricted to the contract owner. We use Solidity’s onlyOwner modifier to lock these down. Unrestricted visibility is avoided to prevent anyone else from manipulating game statealchemy.com.


Randomness and Timing: We do not rely on block.timestamp or any on-chain randomness to generate puzzles, since miners/validators could manipulate timestamps slightlyalchemy.com. Instead, puzzles are chosen off-chain (e.g. by the developer) and committed via hash. If this were extended, a decentralized oracle could schedule puzzles.


Token Transfers: We use SafeERC20 to transfer cUSD, checking return values in case the token is non-standard. Because cUSD is a mainstream token on Celo, it behaves well, but safety is added as best practice.


Gas and Fee Considerations: Celo’s fee abstraction means transaction fees are paid in cUSD. MiniPay enforces a legacy transaction format, so we use eth_sendTransaction with feeCurrency=cUSDdocs.celo.org. We design the contract to accommodate low gas usage (no loops over many users, etc.) so that fees remain minimal.


Brute-Force Protection: If guessing were free, an attacker could try all 26⁵ combinations over time. To mitigate this, one option is to require a small cUSD fee per guess via a guess() function or limit attempts. Any such fee acts as an on-chain rate limiter. These micropayments are feasible because MiniPay supports tiny transfers cheaplypress.opera.com.


Auditing and Best Practices: We compile with Solidity ^0.8.x to get built-in overflow checks. Time-dependent logic is avoided per best practicesalchemy.com. The code would be tested and, if possible, audited. Given hackathon constraints, we rely on established libraries (OpenZeppelin) and thorough testing to minimize bugs.


Future Expansion
Community-Generated Puzzles: Enable a DAO-like process where experienced users can submit and vote on new puzzle words or entire dictionaries (English, Spanish, local languages, etc.). Contributors could earn a small cUSD bounty if their word is selected. This leverages Celo’s developer and content communities. In fact, Celo Regional DAOs have emphasized localized education content and developer onboardingforum.celo.org, suggesting a natural fit: local volunteers could create region-specific word lists.


Multiple Languages & Difficulty Levels: Expand beyond English; allow players to choose word lengths or foreign-language mode. Community members could propose and validate translated content, aligning with Celo’s mission to localize learningforum.celo.org.


Reward Scaling: Introduce leaderboards or streak bonuses (e.g. solving five days in a row gives extra cUSD). Top daily solvers could share a bonus pool. The smart contract could track streaks or completion time to allocate tiered rewards.


NFT Badges: Award NFT badges (minted on Celo) to top learners (100 puzzles solved, etc.). These collectibles could be minted via a simple extension contract, tying into the growing Celo NFT ecosystem.


Social and Sharing Features: Integrate with social platforms (even within MiniPay’s Mini Apps) so users can share their scores or invite friends. This drives organic growth.


Decentralized Governance: Eventually transform the game into a community-owned project. Token-based voting could decide the reward amount, schedule of puzzles, or new features.


Other Educational Content: The platform could extend to other word games (crosswords, definitions quiz, etc.) or subject areas (math puzzles) using the same reward mechanics.


Each of these expansions leverages Celo’s community focus. For example, Celo’s regional hubs already invest in community outreach and localized educationforum.celo.org. By opening EduWordle to contributors worldwide, we tap into that network. Community-generated content and multi-language support would make the game globally relevant and culturally inclusive, staying true to Celo’s ethos of financial and educational inclusion.
Conclusion
EduWordle demonstrates how blockchain tech and education can be combined to create engaging, rewarding learning experiences. By using Celo’s mobile-oriented blockchain and MiniPay’s stablecoin wallet, we provide learners with a fun word puzzle that actually pays. The technical architecture – a TypeScript PWA front-end with Solidity contracts on Celo – leverages best-in-class open-source tools and low-cost stablecoinsquicknode.comlearn.microsoft.com. MiniPay integration simplifies crypto for users: no private keys to manage and negligible transaction feespress.opera.compress.opera.com.
This hackathon project showcases a proof-of-concept of a play-to-learn app that is fully decentralized yet user-friendly. It addresses the problem of low engagement in language learning by aligning incentives with progress: every correct answer is rewarded with real stablecoins. In doing so, EduWordle not only helps users build vocabulary, but also introduces them to the world of digital money and decentralized apps. With careful security design and room for expansion (community content, multi-language support, gamified leaderboards), EduWordle can grow into a vibrant educational mini-app within the Celo ecosystem. It embodies the vision of accessible, fun learning powered by Web3 – and sets the stage for further innovation at the intersection of blockchain and education.

