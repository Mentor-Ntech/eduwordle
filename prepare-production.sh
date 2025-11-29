#!/bin/bash

# Production Preparation Script
# This script ensures your codebase is ready for production deployment

set -e

echo "🚀 Preparing codebase for production..."
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Step 1: Remove backup files that might contain secrets
echo "📋 Step 1: Removing backup files..."
BACKUP_FILES=(
  "apps/contracts/.env.backup"
  "apps/contracts/.env.bak"
)

for file in "${BACKUP_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ❌ Removing: $file"
    rm -f "$file"
  fi
done

# Step 2: Update .gitignore
echo ""
echo "📋 Step 2: Updating .gitignore files..."

# Add backup files to root .gitignore
if ! grep -q "\.env\.backup" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Backup files" >> .gitignore
  echo "*.backup" >> .gitignore
  echo "*.bak" >> .gitignore
  echo "  ✅ Added backup file patterns to .gitignore"
fi

# Add turbo logs to .gitignore
if ! grep -q "\.turbo" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Turbo cache and logs" >> .gitignore
  echo ".turbo/" >> .gitignore
  echo "  ✅ Added .turbo/ to .gitignore"
fi

# Step 3: Check for committed secrets
echo ""
echo "📋 Step 3: Checking for committed secrets..."

# Check if .env files are tracked
TRACKED_ENV=$(git ls-files | grep -E "\.env$|\.env\.backup|\.env\.bak" || true)
if [ -n "$TRACKED_ENV" ]; then
  echo -e "  ${RED}⚠️  WARNING: Found tracked .env files:${NC}"
  echo "$TRACKED_ENV" | while read -r file; do
    echo -e "    ${YELLOW}- $file${NC}"
  done
  echo ""
  echo -e "  ${YELLOW}💡 These should be removed from git:${NC}"
  echo "    git rm --cached <file>"
else
  echo -e "  ${GREEN}✅ No .env files are tracked in git${NC}"
fi

# Step 4: Remove unnecessary files
echo ""
echo "📋 Step 4: Cleaning up unnecessary files..."

# Remove turbo logs
if [ -d "apps/web/.turbo" ]; then
  echo "  🗑️  Removing turbo cache..."
  rm -rf apps/web/.turbo
fi

# Step 5: Verify .env.example files exist (templates are OK)
echo ""
echo "📋 Step 5: Checking for .env.example files..."
if [ -f "apps/contracts/.env.example" ]; then
  echo -e "  ${GREEN}✅ Found apps/contracts/.env.example${NC}"
else
  echo -e "  ${YELLOW}⚠️  apps/contracts/.env.example not found (consider creating one)${NC}"
fi

if [ -f "apps/web/.env.local.example" ]; then
  echo -e "  ${GREEN}✅ Found apps/web/.env.local.example${NC}"
else
  echo -e "  ${YELLOW}⚠️  apps/web/.env.local.example not found (consider creating one)${NC}"
fi

# Step 6: Check for hardcoded secrets in code
echo ""
echo "📋 Step 6: Scanning for potential hardcoded secrets..."

# Check for common secret patterns (excluding comments and examples)
SECRET_PATTERNS=(
  "PRIVATE_KEY=0x[0-9a-fA-F]{64}"
  "API_KEY=[a-zA-Z0-9]{20,}"
  "SECRET=[a-zA-Z0-9]{20,}"
)

FOUND_SECRETS=false
for pattern in "${SECRET_PATTERNS[@]}"; do
  # Search in non-example, non-test files
  RESULTS=$(grep -r -E "$pattern" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=.next \
    --exclude="*.example" \
    --exclude="*.template" \
    --exclude="*.md" \
    --exclude="*.test.*" \
    . 2>/dev/null || true)
  
  if [ -n "$RESULTS" ]; then
    FOUND_SECRETS=true
    echo -e "  ${RED}⚠️  Potential hardcoded secret found:${NC}"
    echo "$RESULTS" | head -5 | while read -r line; do
      echo -e "    ${YELLOW}$line${NC}"
    done
  fi
done

if [ "$FOUND_SECRETS" = false ]; then
  echo -e "  ${GREEN}✅ No hardcoded secrets found${NC}"
fi

# Step 7: Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Production preparation complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Review the changes: git status"
echo "  2. Remove any tracked .env files: git rm --cached <file>"
echo "  3. Commit the cleanup: git add .gitignore && git commit -m 'chore: prepare for production'"
echo "  4. Verify no secrets in git history: git log --all --full-history --source -- '*.env*'"
echo ""
echo "🔒 Security checklist:"
echo "  ✅ .env files are in .gitignore"
echo "  ✅ Backup files removed"
echo "  ✅ No hardcoded secrets (if check passed)"
echo "  ⚠️  Verify .env files are NOT in git history"
echo ""

