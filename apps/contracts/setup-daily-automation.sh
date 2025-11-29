#!/bin/bash

# Setup script for daily automation
# This creates a cron job to run the daily cycle script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_LOG="$SCRIPT_DIR/daily-automation.log"

echo "🕒 Setting up Daily Automation for EduWordle"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "❌ Error: .env file not found in $SCRIPT_DIR"
    echo "   Please create .env with required variables:"
    echo "   - PRIVATE_KEY"
    echo "   - EDUWORDLE_ADDRESS"
    echo "   - CUSD_ADDRESS"
    exit 1
fi

echo "✅ Found .env file"

# Check if run-daily-cycle.js exists
if [ ! -f "$SCRIPT_DIR/run-daily-cycle.js" ]; then
    echo "❌ Error: run-daily-cycle.js not found"
    exit 1
fi

echo "✅ Found run-daily-cycle.js"

# Make it executable
chmod +x "$SCRIPT_DIR/run-daily-cycle.js"

# Create cron job
CRON_TIME="5 0 * * *"  # 00:05 UTC daily
CRON_COMMAND="cd $SCRIPT_DIR && /usr/local/bin/node run-daily-cycle.js >> $CRON_LOG 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "run-daily-cycle.js"; then
    echo "⚠️  Cron job already exists"
    echo ""
    echo "Current cron jobs:"
    crontab -l | grep "run-daily-cycle.js"
    echo ""
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove old cron job
        crontab -l 2>/dev/null | grep -v "run-daily-cycle.js" | crontab -
        # Add new cron job
        (crontab -l 2>/dev/null; echo "$CRON_TIME $CRON_COMMAND") | crontab -
        echo "✅ Cron job updated"
    else
        echo "ℹ️  Keeping existing cron job"
    fi
else
    # Add new cron job
    (crontab -l 2>/dev/null; echo "$CRON_TIME $CRON_COMMAND") | crontab -
    echo "✅ Cron job added"
fi

echo ""
echo "📋 Cron job details:"
echo "   Time: $CRON_TIME (00:05 UTC daily)"
echo "   Command: $CRON_COMMAND"
echo "   Log file: $CRON_LOG"
echo ""
echo "📝 To view cron jobs: crontab -l"
echo "📝 To edit cron jobs: crontab -e"
echo "📝 To remove cron job: crontab -l | grep -v 'run-daily-cycle.js' | crontab -"
echo ""
echo "✅ Daily automation setup complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Test the script manually: cd $SCRIPT_DIR && node run-daily-cycle.js"
echo "   2. Check the log file after it runs: tail -f $CRON_LOG"
echo "   3. Verify the puzzle is initialized correctly"

