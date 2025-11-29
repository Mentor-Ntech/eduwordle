# Supabase Setup Guide

This guide will help you set up the Supabase database for EduWordle player stats synchronization.

## Prerequisites

- A Supabase project (you already have one: `mwipocrzxwiilatdkuiq`)
- Access to the Supabase SQL Editor

## Steps

### 1. Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New query**

### 2. Run the Setup SQL

1. Open the file `apps/contracts/supabase-setup.sql` in this repository
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`)

### 3. Verify Setup

After running the SQL, verify the setup:

1. Go to **Table Editor** in Supabase
2. You should see a `player_stats` table with these columns:
   - `address` (text, primary key)
   - `total_wins` (integer)
   - `longest_streak` (integer)
   - `current_streak` (integer)
   - `total_rewards` (numeric)
   - `last_win_day` (integer)
   - `updated_at` (timestamp)

3. Go to **Database** → **Views**
4. You should see `player_stats_view`

### 4. Test the Sync Script

Once the database is set up, you can test the sync script:

```bash
cd apps/contracts
pnpm stats:sync
```

This will:
- Connect to your Supabase database
- Scan for `PuzzleSolved` events from the EduWordle contract
- Upsert player stats into the `player_stats` table

## What Gets Synced?

The `stats:sync` script (and the daily GitHub Actions workflow) will:

1. Listen for `PuzzleSolved` events from the EduWordle contract
2. For each event, update the player's stats:
   - Increment `total_wins`
   - Update `current_streak` (based on consecutive days)
   - Update `longest_streak` (if current streak is longer)
   - Add to `total_rewards`
   - Update `last_win_day`

## Frontend Access

The frontend uses the `player_stats_view` view with the `anon` key to:
- Display user stats when wallet is disconnected
- Show leaderboard rankings
- Cache stats in localStorage

The RLS policies ensure that:
- The sync script (using `service_role` key) can write to `player_stats`
- The frontend (using `anon` key) can only read from `player_stats_view`

## Troubleshooting

### Error: "relation player_stats does not exist"
- Make sure you ran the SQL setup script in Supabase SQL Editor

### Error: "permission denied for table player_stats"
- Check that RLS policies are created correctly
- Verify your `SUPABASE_SERVICE_KEY` is the service role key (not anon key)

### Sync script finds 0 events
- This is normal if no one has solved puzzles yet
- The script will process new events on subsequent runs

