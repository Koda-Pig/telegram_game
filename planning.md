# Telegram Minesweeper Gambling Game - Technical Implementation Guide

## Project Overview

A Solana-based minesweeper gambling game accessible via Telegram bot, designed for a meme coin launch. Players bet SOL, select mine count (risk level), and reveal tiles (green diamonds) for multiplying rewards. Hit a mine = lose bet. Cash out anytime to claim winnings.

**Business Context:**

- Game for community engagement around token launch
- Funds generated go towards project treasury
- Profits rewarded back to token holders
- Simplified gameplay (5×5 grid) compared to traditional minesweeper

**Key Implementation Pattern:** Telegram bot + inline button → React web app → Solana wallet integration

## Game Rules

**Grid:** 5×5 board (25 tiles total)
**Setup:** Player chooses bet amount and number of mines to place (1-24 mines)
**Gameplay:** Click tiles to reveal "green diamonds" (safe tiles)
**Win:** Cash out anytime to claim current multiplier × bet
**Lose:** Click a mine = lose entire bet
**Multiplier:** Increases with each safe tile revealed (see multiplier table)

## Architecture

### Why This Pattern Works

- ✅ Bot sends commands/notifications, inline button opens web app
- ✅ Web app handles all game logic and Solana transactions
- ✅ No Telegram Mini App SDK complexity
- ✅ Not restricted by TON exclusivity (it's just a web app opened via button)
- ✅ Full-screen game canvas with standard Solana Web3.js integration

### Tech Stack

**Bot:** Node.js + Grammy

**Web App:** React + TypeScript + Vite + Tailwind ([separate repository](https://github.com/Koda-Pig/motherlode_minesweeper_frontend))

**Blockchain:** Solana Web3.js + Wallet Adapter

**Hosting:** Fly.io (bot) + Netlify (web app)

## Critical Technical Decisions

### 1. Randomness Strategy (On-Chain vs Off-Chain)

**For provably fair gambling, you need verifiable randomness.** Here are your options:

#### Option A: Solana On-Chain Randomness (Recommended for Production)

Solana has no native on-chain randomness source like Ethereum's Chainlink VRF. Your options:

1. **Switchboard VRF** (Most Production-Ready)

   - Decentralized oracle network providing verifiable randomness
   - Costs ~0.002 SOL per VRF request
   - Best for production gambling apps
   - Docs: https://docs.switchboard.xyz/

2. **Pyth Oracle Randomness** (Newer Option)

   - Pyth Network now offers entropy/randomness feeds
   - Lower latency than Switchboard
   - Still maturing for gambling use cases

3. **Commit-Reveal with Recent Blockhash**
   - Use Solana's recent blockhash as entropy source
   - **Issue:** Validators can potentially manipulate by withholding blocks
   - Only suitable for low-value games or testing
   - Implementation: Hash `(server_seed + client_seed + recent_blockhash)`

**Reference:** https://solana.stackexchange.com/questions/14667/how-can-i-generate-a-random-number-on-solana

#### Option B: Off-Chain Server Randomness with Cryptographic Proof

Common pattern for crypto gambling sites:

1. Server generates `server_seed` (hashed and shown to player before game)
2. Player provides `client_seed` (or browser generates one)
3. Game result = Hash(server_seed + client_seed + nonce)
4. After game, server reveals `server_seed` for verification

**Pros:** No blockchain fees, instant gameplay
**Cons:** Requires trusting server didn't cheat (but cryptographically verifiable)

**For MVP/testing:** Start with Option B (off-chain provably fair)
**For production:** Migrate to Switchboard VRF (Option A)

### 2. Wallet Strategy

**Bot-Generated Wallets (Preferred)**

- Bot creates unique Solana wallet per user when they enter the bot
- User must fund that wallet to play the game
- User can withdraw funds and profits back to their main wallet at any time
- **Security Requirements:**
  - Encrypted private key storage
  - Secure key derivation (BIP39/BIP44)
  - Rate limiting on withdrawals
  - Multi-signature for treasury withdrawals
- Higher risk (bot controls keys) but reduces friction and isolates risk per user

**Alternative: Direct Wallet Connection**

- User connects Phantom/Solflare via web app
- All transactions signed by user's wallet
- No bot custody of funds
- Standard Web3 pattern

### 3. Game Economics

**Multiplier Table:**

![Multiplier Table](multiplier-table.png)

- Reference: `multiplier-table.png` (contains complete multiplier values for all mine/diamond combinations)
- Table structure: DIAMONDS (rows 1-24) × MINES (columns 1-24)
- Multipliers increase significantly with higher mine counts and more diamonds revealed

**Game Parameters:**

- House edge: ~2-5% (typical for crypto gambling)
- Min bet: 0.01 SOL
- Max bet: TBD based on treasury size
- Multipliers: Varies by mine count (higher mines = higher potential multiplier)

**Payout Structure:**

```
Base Multiplier = (25 / (25 - num_mines)) ^ tiles_revealed
Final Payout = bet_amount * multiplier * (1 - house_edge)
```

Note: The exact multiplier values are defined in `multiplier-table.png` and should be used for game logic implementation.

## Implementation Phases

### Phase 1: Proof of Concept

- [x] Basic Telegram bot with commands
- [ ] React app with wallet connection
- [ ] HTTPS tunnel for local testing
- [ ] Simple minesweeper UI (no betting yet)

### Phase 2: Core Game Mechanics

- [ ] Minesweeper game logic (mine placement, tile reveals)
- [ ] Multiplier calculations
- [ ] Off-chain provably fair randomness implementation
- [ ] Basic UI matching provided design assets

### Phase 3: Blockchain Integration

- [ ] Solana transaction handling (bets, payouts)
- [ ] Smart contract for bet escrow (optional for MVP)
- [ ] Balance checking and withdrawal flow
- [ ] Devnet testing with test SOL

### Phase 4: Polish & Deploy

- [ ] Security review and rate limiting
- [ ] Production deployment (bot + web app)
- [ ] Switch to Switchboard VRF (if budget allows)
- [ ] Launch coordination

## Quick Start Guide

**Note:** Telegram bot is already set up and deployed. See `bot.ts` for current implementation.

### Set Up React App with Solana

```bash
npm create vite@latest minesweeper-game -- --template react-ts
cd minesweeper-game
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/web3.js
```

### Local Development with HTTPS

```bash
# Terminal 1: Start React app
npm run dev

# Terminal 2: Create HTTPS tunnel
cloudflared tunnel --url http://localhost:5173
```

Update bot's `.env` with tunnel URL, restart bot, test with `/play`.

## Open Questions to Answer

### Before Development Continues:

1. **Timeline:** 1 month timeline (not commenced yet)
2. **Smart Contract:** Do we build custom bet escrow contract or handle payouts off-chain initially?
3. **House Edge:** What percentage? (2-5% is standard)
4. **Min/Max Bets:** Limits in SOL?
5. **Design Assets:** Ready to share UI mockups and style guide?
6. **Devnet Testing:** How long before moving to mainnet?

### Security & Compliance:

7. **Legal Review:** Any regulatory requirements for target markets?
8. **Age Verification:** Needed?
9. **Smart Contract Audit:** Budget available? (~$5-15k)

## Resources

**Solana Randomness:**

- Switchboard VRF: https://docs.switchboard.xyz/
- Pyth Entropy: https://docs.pyth.network/entropy
- Stack Exchange Discussion: https://solana.stackexchange.com/questions/14667/

**Telegram Development:**

- Bot API: https://core.telegram.org/bots/api
- Grammy: https://grammy.dev/

**Solana Development:**

- Web3.js: https://solana-labs.github.io/solana-web3.js/
- Wallet Adapter: https://github.com/solana-labs/wallet-adapter
