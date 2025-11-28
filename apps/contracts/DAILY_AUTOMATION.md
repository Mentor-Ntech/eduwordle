# 🕒 Daily Automation Guide

This script keeps EduWordle “living” in a decentralized-friendly way: it **only performs owner duties** (funding the treasury and publishing the next puzzle hash). Players still submit their own answers from their wallets, so wins and rewards remain fully on-chain and trustless.

---

## 1. Prerequisites

| Variable | Description |
| --- | --- |
| `PRIVATE_KEY` | Owner key that can call `initializeDay` and `fundTreasury`. **Never** use a player wallet. |
| `EDUWORDLE_ADDRESS` | Deployed EduWordle contract (or set `NEXT_PUBLIC_EDUWORDLE_CONTRACT_ADDRESS`). |
| `CUSD_ADDRESS` | cUSD (or Mock cUSD) token address used by the contract. |
| `RPC_URL` | Optional; defaults to `https://forno.celo-sepolia.celo-testnet.org`. |
| `TREASURY_BUFFER` | Optional minimum treasury balance (in cUSD). Default: `10`. |
| `DAILY_WORDS_FILE` | Optional custom path for the CSV word list. Default: `apps/contracts/daily-words.csv`. |
| `FRONTEND_ENV_FILE` | Optional path to the frontend `.env` that should receive `NEXT_PUBLIC_DAILY_WORD`. Default: `apps/web/.env.local`. |
| `DAILY_WORD_JSON` | Optional path for the generated JSON file consumed by the frontend (default: `apps/web/public/daily-word.json`). |
| `LEADERBOARD_JSON` | Optional path to a JSON file that contains `{ "address": "0x..." }`. If present, the script will call `setLeaderboardContract` automatically. |
| `SUPABASE_URL` | Required for stats sync: your Supabase project URL. |
| `SUPABASE_SERVICE_KEY` | Required for stats sync: the Supabase service role key (store securely). |
| `EVENT_STATE_FILE` | Optional path to store the last processed block for event syncing (default: `.puzzle-sync-state.json`). |

Create or update `apps/contracts/.env` with:

```env
PRIVATE_KEY=0x...
EDUWORDLE_ADDRESS=0x...
CUSD_ADDRESS=0x...
TREASURY_BUFFER=10
# Optional overrides
# FRONTEND_ENV_FILE=/absolute/path/to/apps/web/.env.local
# DAILY_WORDS_FILE=/absolute/path/to/daily-words.csv
# DAILY_WORD_JSON=/absolute/path/to/apps/web/public/daily-word.json
# LEADERBOARD_JSON=/absolute/path/to/apps/contracts/leaderboard-address.json
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=service-role-key
# EVENT_STATE_FILE=/absolute/path/.puzzle-sync-state.json
```

---

## 2. Define the word schedule

`apps/contracts/daily-words.csv` maps UTC dates to solution words:

```
# date,word
2025-11-24,REACT
2025-11-25,BLOCK
2025-11-26,CHAIN
```

- Dates **must** be `YYYY-MM-DD` in UTC.
- Words can be lowercase or uppercase; the script uppercases automatically.
- Keep the file in version control (or mount a secrets-managed copy for production).

---

## 3. Run the cycle locally

From `apps/contracts`:

```bash
pnpm install
pnpm daily
```

The script will:

1. Load today’s word from the CSV.
2. Ensure the treasury has at least `TREASURY_BUFFER` cUSD (auto-approves + funds if needed).
3. Call `initializeDay` if today’s puzzle hasn’t been set yet.
4. Write `apps/web/public/daily-word.json` with `{ date, word, hash, updatedAt }`.
5. Update the frontend `.env` file with `NEXT_PUBLIC_DAILY_WORD=<WORD>` (legacy fallback).
6. (Optional) If `LEADERBOARD_JSON` is provided, ensure EduWordle points to the same leaderboard contract.
7. (Optional) Sync `PuzzleSolved` events into Supabase (`player_stats`) when Supabase env variables are configured.

Console output clearly reports each step; failures exit with code `1`.

---

## 4. Automate it (cron / GitHub Actions)

Use any scheduler that can run once per day. Example GitHub Action (`.github/workflows/daily.yml`):

```yaml
name: Daily EduWordle
on:
  schedule:
    - cron: '5 0 * * *' # 00:05 UTC
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: pnpm install --filter ./apps/contracts
      - run: pnpm daily --filter ./apps/contracts
        env:
          PRIVATE_KEY: ${{ secrets.EDUWORDLE_OWNER_KEY }}
          EDUWORDLE_ADDRESS: ${{ vars.EDUWORDLE_ADDRESS }}
          CUSD_ADDRESS: ${{ vars.CUSD_ADDRESS }}
          TREASURY_BUFFER: '10'
          FRONTEND_ENV_FILE: apps/web/.env.local
          DAILY_WORD_JSON: apps/web/public/daily-word.json
          LEADERBOARD_JSON: apps/contracts/leaderboard-address.json
      - run: pnpm stats:sync --filter ./apps/contracts
        env:
          PRIVATE_KEY: ${{ secrets.EDUWORDLE_OWNER_KEY }}
          EDUWORDLE_ADDRESS: ${{ vars.EDUWORDLE_ADDRESS }}
          SUPABASE_URL: ${{ vars.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          EVENT_STATE_FILE: apps/contracts/.puzzle-sync-state.json
```

> ⚠️ **Security:** store the owner key in the scheduler’s secrets manager. Never hardcode it.

---

## 5. How players keep winning

This automation **does not** touch player wallets. Every day:

1. The script publishes the hashed solution and tops up rewards.
2. Players visit `/play`, solve the puzzle, and their own wallet signs `submitAnswer`.
3. The `Leaderboard` contract records the win + streak. Nothing is forged.

Result: truly decentralized win tracking while still giving you hands-off daily maintenance. Run the script consistently and your leaderboard will naturally reflect however many days real players solve the puzzle. 🎯




