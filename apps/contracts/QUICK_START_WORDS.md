# 🚀 Quick Start: Managing Daily Words

## The Problem
You were manually editing `daily-words.csv` and environment variables every day. **No more!**

## The Solution
We've created a professional word management system with multiple options.

---

## ⚡ Quick Start (Choose One)

### **Option A: Manual Control (5 minutes/week)**
```bash
cd apps/contracts

# Add words for the next week (do this once per week)
pnpm words:add MONDAY 0
pnpm words:add TUESDAY 1
pnpm words:add WEDNESDAY 2
pnpm words:add THURSDAY 3
pnpm words:add FRIDAY 4
pnpm words:add SATURDAY 5
pnpm words:add SUNDAY 6

# Done! Your automation will use these words
```

### **Option B: Semi-Automated (5 minutes/month)**
```bash
cd apps/contracts

# Generate words for next 90 days (do this once per month)
pnpm words:generate 90

# Review what was generated
pnpm words:list 30

# Customize special dates if needed
pnpm words:add CHRISTMAS 2025-12-25

# Done! Automation will use these words
```

### **Option C: Fully Automated (Set once, forget it)**
```bash
cd apps/contracts

# Generate initial words
pnpm words:generate 90

# Set up cron job (runs daily at 00:05 UTC)
# This will auto-fill any gaps and run daily automation
5 0 * * * cd /path/to/apps/contracts && pnpm words:fill && pnpm daily
```

---

## 📋 Common Commands

```bash
# Add a word for today
pnpm words:add REACT

# Add a word for specific date
pnpm words:add BLOCK 2025-12-01

# List next 30 days
pnpm words:list 30

# Generate words for next 90 days
pnpm words:generate 90

# Fill missing dates automatically
pnpm words:fill

# Check for errors
pnpm words:validate
```

---

## 🎯 Recommended Workflow

**For most users, we recommend Option B (Semi-Automated):**

1. **Once per month:**
   ```bash
   pnpm words:generate 90
   pnpm words:list 30  # Review
   ```

2. **Your daily automation** (cron/GitHub Actions) will automatically:
   - Read the word from CSV
   - Initialize the puzzle on-chain
   - Fund the treasury if needed

3. **No daily manual work needed!** 🎉

---

## 📚 Full Documentation

See `WORD_MANAGEMENT_GUIDE.md` for:
- Detailed explanations
- Advanced workflows
- Troubleshooting
- Best practices

---

## ✨ What Changed?

**Before:**
- ❌ Edit CSV manually every day
- ❌ Update environment variables
- ❌ Remember to run scripts

**After:**
- ✅ Generate words in bulk (monthly)
- ✅ CLI tool for easy management
- ✅ Automatic gap filling
- ✅ Validation and error checking
- ✅ No daily manual work!

---

## 🎉 You're All Set!

Your existing `run-daily-cycle.js` script already works with this system. Just:
1. Add words using the CLI (or generate them)
2. Your automation will pick them up automatically
3. No more daily manual editing!

**Questions?** Check `WORD_MANAGEMENT_GUIDE.md` for detailed help.

