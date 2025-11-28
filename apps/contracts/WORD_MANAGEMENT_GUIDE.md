# 📚 Word Management Guide for EduWordle

This guide explains how to manage daily puzzle words without manually editing CSV files every day. We provide multiple professional solutions to fit your needs.

---

## 🎯 Quick Start

### Option 1: Use the Word Management CLI (Recommended)

The easiest way to manage words is using the built-in CLI tool:

```bash
cd apps/contracts

# Add a word for today
pnpm words:add REACT

# Add a word for a specific date
pnpm words:add BLOCK 2025-12-01

# Add a word for 7 days from today
pnpm words:add CHAIN 7

# List words for next 30 days
pnpm words:list

# Generate words automatically for next 90 days
pnpm words:generate 90

# Fill all gaps in your schedule
pnpm words:fill

# Validate your CSV file
pnpm words:validate
```

---

## 📋 Solution Options

### **Solution 1: Manual Word Management (Current + Enhanced)**

**Best for:** When you want full control over each word

**How it works:**
- Use the CLI tool to add words individually
- Words are stored in `daily-words.csv`
- Automation script reads from CSV daily

**Workflow:**
```bash
# Once a week, add words for the next 7 days
pnpm words:add MONDAY 0
pnpm words:add TUESDAY 1
pnpm words:add WEDNESDAY 2
# ... etc

# Or add words for specific dates
pnpm words:add CHRISTMAS 2025-12-25
```

**Pros:**
- ✅ Full control over word selection
- ✅ Can plan themed words (holidays, seasons, etc.)
- ✅ Simple and transparent

**Cons:**
- ❌ Requires manual input
- ❌ Need to remember to add words regularly

---

### **Solution 2: Semi-Automated Word Generation**

**Best for:** When you want automation but still want to review/curate words

**How it works:**
- Maintain a word bank (`word-bank.txt`) with valid 5-letter words
- Use CLI to generate words for multiple days at once
- Review and edit generated words if needed

**Workflow:**
```bash
# Generate words for next 90 days
pnpm words:generate 90

# Review the generated words
pnpm words:list 90

# Edit specific words if needed
pnpm words:add BETTER 2025-12-15  # Replace generated word

# Fill any gaps
pnpm words:fill
```

**Setup:**
1. Edit `word-bank.txt` to add your preferred words (one per line, 5 letters)
2. Run generation script weekly/monthly
3. Review and adjust as needed

**Pros:**
- ✅ Fast bulk generation
- ✅ Can still customize individual words
- ✅ Reduces manual work significantly

**Cons:**
- ❌ Generated words are random (may not be themed)
- ❌ Need to maintain word bank

---

### **Solution 3: Fully Automated with Word Bank**

**Best for:** When you want "set it and forget it" automation

**How it works:**
1. Maintain a curated word bank
2. Set up a cron job to run `pnpm words:fill` daily
3. The script automatically fills gaps with words from the bank

**Setup:**

**Step 1:** Create a comprehensive word bank
```bash
# Edit word-bank.txt with your preferred words
# One word per line, exactly 5 letters, uppercase
```

**Step 2:** Set up daily automation
```bash
# Add to your crontab (runs at 00:05 UTC daily)
5 0 * * * cd /path/to/eduwordle-celo/apps/contracts && pnpm words:fill && pnpm daily
```

**Or use GitHub Actions** (see `DAILY_AUTOMATION.md`)

**Pros:**
- ✅ Fully automated
- ✅ No daily manual work
- ✅ Consistent word availability

**Cons:**
- ❌ Less control over specific words
- ❌ Need to maintain word bank quality

---

## 🛠️ CLI Tool Reference

### Commands

| Command | Usage | Description |
|---------|-------|-------------|
| `add` | `pnpm words:add <word> [date]` | Add word for date (or today) |
| `list` | `pnpm words:list [days]` | List words for next N days |
| `remove` | `pnpm words:remove <date>` | Remove word for date |
| `generate` | `pnpm words:generate [days]` | Generate words from bank |
| `fill-gaps` | `pnpm words:fill` | Fill missing dates |
| `validate` | `pnpm words:validate` | Validate CSV format |

### Date Formats

- **YYYY-MM-DD**: `2025-12-25`
- **Number**: `7` (7 days from today)
- **Empty**: Today's date

### Examples

```bash
# Add word for today
pnpm words:add REACT

# Add word for Christmas
pnpm words:add SANTA 2025-12-25

# Add word for next Monday (7 days)
pnpm words:add MONDAY 7

# List next 60 days
pnpm words:list 60

# Generate words for next quarter (90 days)
pnpm words:generate 90

# Fill all gaps in next 90 days
pnpm words:fill

# Check for errors
pnpm words:validate
```

---

## 📁 File Structure

```
apps/contracts/
├── daily-words.csv          # Your word schedule (date,word)
├── word-bank.txt            # Available words for generation
├── manage-words.js          # CLI tool
├── run-daily-cycle.js       # Daily automation script
└── WORD_MANAGEMENT_GUIDE.md # This file
```

---

## 🔄 Recommended Workflows

### **Weekly Workflow** (Manual Control)

```bash
# Every Sunday, plan next week
pnpm words:add MONDAY 0
pnpm words:add TUESDAY 1
pnpm words:add WEDNESDAY 2
pnpm words:add THURSDAY 3
pnpm words:add FRIDAY 4
pnpm words:add SATURDAY 5
pnpm words:add SUNDAY 6

# Review
pnpm words:list 7
```

### **Monthly Workflow** (Semi-Automated)

```bash
# First of each month, generate next 30 days
pnpm words:generate 30

# Review and customize special dates
pnpm words:list 30
pnpm words:add CHRISTMAS 2025-12-25
pnpm words:add NEWYEAR 2026-01-01

# Validate
pnpm words:validate
```

### **Quarterly Workflow** (Fully Automated)

```bash
# Every quarter, generate next 90 days
pnpm words:generate 90

# Review for special occasions
pnpm words:list 90

# Set up automation to fill gaps daily
# (See Solution 3 above)
```

---

## 🎨 Advanced: Themed Word Planning

You can plan themed words for special occasions:

```bash
# Educational theme week
pnpm words:add LEARN 0
pnpm words:add STUDY 1
pnpm words:add TEACH 2
pnpm words:add SMART 3
pnpm words:add BRAIN 4

# Tech theme week
pnpm words:add REACT 0
pnpm words:add BLOCK 1
pnpm words:add CHAIN 2
pnpm words:add TOKEN 3
pnpm words:add SMART 4

# Holiday themes
pnpm words:add SANTA 2025-12-25
pnpm words:add HEART 2026-02-14
pnpm words:add SPOOK 2025-10-31
```

---

## 🔍 Troubleshooting

### "No word found for date"
- Run `pnpm words:list` to see what dates have words
- Use `pnpm words:add <word> <date>` to add missing words
- Or run `pnpm words:fill` to auto-fill gaps

### "Word must be exactly 5 letters"
- Check your word is exactly 5 characters
- Use uppercase letters only
- Remove spaces or special characters

### "Duplicate dates found"
- Run `pnpm words:validate` to see duplicates
- The tool automatically keeps the last entry for duplicates
- Or manually edit `daily-words.csv`

### "No available words in bank"
- Edit `word-bank.txt` to add more words
- Ensure words are exactly 5 letters, one per line
- Run `pnpm words:validate` to check format

---

## 🚀 Integration with Daily Automation

The daily automation script (`run-daily-cycle.js`) automatically reads from `daily-words.csv`. No changes needed!

Just ensure:
1. Your CSV has words for upcoming dates
2. Run `pnpm daily` (or set up cron/GitHub Actions)
3. The script will initialize puzzles on-chain

---

## 📝 Best Practices

1. **Plan Ahead**: Generate words for at least 30 days in advance
2. **Review Regularly**: Check `pnpm words:list` weekly
3. **Validate Often**: Run `pnpm words:validate` before deploying
4. **Maintain Word Bank**: Keep `word-bank.txt` updated with quality words
5. **Backup CSV**: Keep `daily-words.csv` in version control
6. **Test Automation**: Test your cron/GitHub Actions setup

---

## 🎯 Recommended Setup for Production

1. **Initial Setup:**
   ```bash
   # Generate words for next 90 days
   pnpm words:generate 90
   
   # Review and customize
   pnpm words:list 90
   
   # Validate
   pnpm words:validate
   ```

2. **Set Up Automation:**
   - Use GitHub Actions (see `DAILY_AUTOMATION.md`)
   - Or cron job: `5 0 * * * cd /path/to/apps/contracts && pnpm words:fill && pnpm daily`

3. **Monthly Maintenance:**
   ```bash
   # Generate next month
   pnpm words:generate 30
   
   # Review and adjust
   pnpm words:list 30
   ```

4. **Weekly Check:**
   ```bash
   # Quick check
   pnpm words:list 7
   ```

---

## 💡 Tips

- **Word Quality**: Choose words that are:
  - Educational/relevant to your audience
  - Not too obscure
  - Appropriate difficulty level
  - Fun and engaging

- **Consistency**: Use the same word bank source for consistency

- **Flexibility**: Keep some manual control for special events

- **Monitoring**: Set up alerts if automation fails

---

## 📞 Need Help?

- Check `DAILY_AUTOMATION.md` for automation setup
- Review `daily-words.csv` format (date,word)
- Validate with `pnpm words:validate`
- Check word bank format in `word-bank.txt`

---

**Happy Word Managing! 🎉**

