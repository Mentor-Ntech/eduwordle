# Deployment Troubleshooting Guide

## PRIVATE_KEY Format Issue

If you're seeing "private key too short, expected 32 bytes", your PRIVATE_KEY in `.env` is not in the correct format.

### Correct Format

Your `.env` file should have:
```
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Important**:
- Must be 64 hex characters (32 bytes)
- Can optionally start with `0x`
- No spaces or quotes
- No newlines

### How to Get Your Private Key

1. **From MetaMask**:
   - Settings → Security & Privacy → Show Private Key
   - Copy the private key (it should be 64 hex characters)

2. **From Other Wallets**:
   - Export your private key
   - Ensure it's the full 64-character hex string

### Verify Your Private Key

A valid private key should:
- Be exactly 64 hex characters (0-9, a-f, A-F)
- Optionally start with `0x` (making it 66 characters total)
- Example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Update Your .env File

1. Open `apps/contracts/.env`
2. Ensure PRIVATE_KEY is on a single line:
   ```
   PRIVATE_KEY=your_64_character_hex_private_key_here
   ```
3. Save the file
4. Try deployment again

### Alternative: Set Environment Variable Directly

Instead of using `.env`, you can export it:

```bash
export PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
pnpm deploy
```

### Security Warning

⚠️ **NEVER commit your `.env` file to git!**
- Ensure `.env` is in `.gitignore`
- Never share your private key
- Use a separate wallet for testing

