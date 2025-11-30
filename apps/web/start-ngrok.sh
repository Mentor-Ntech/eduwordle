#!/bin/bash

# Script to start ngrok for MiniPay testing
# Usage: ./start-ngrok.sh [port] [region]

PORT=${1:-3000}
REGION=${2:-us}

echo "🚀 Starting ngrok on port $PORT (region: $REGION)"
echo "📱 Use the Forwarding URL in MiniPay Developer Settings"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo "📖 Install it from: https://ngrok.com/download"
    exit 1
fi

# Check if port is in use
if ! lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Warning: Nothing seems to be running on port $PORT"
    echo "   Make sure your Next.js dev server is running first!"
    echo "   Run: pnpm dev"
    echo ""
fi

# Start ngrok
if [ "$REGION" != "us" ]; then
    ngrok http $PORT --region $REGION
else
    ngrok http $PORT
fi

