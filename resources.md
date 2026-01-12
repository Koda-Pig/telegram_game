# Building a Telegram Bot + Web App for Solana Gambling

Creating a Solana-based game accessible via Telegram requires just three things: a Telegram bot, an HTTPS-hosted React app, and Solana wallet integration. The **bot + inline button pattern** is the simplest approach—users interact with your bot via commands, and the bot sends inline buttons that open your web app in Telegram's in-app browser. For your proof of concept, you can have a working setup within **1-2 hours**.

## How This Pattern Works (Bot + Inline Button + Web App)

This is different from "true" Telegram Mini Apps. Your setup:

1. **User sends command** to your bot (e.g., `/play`, `/balance`)
2. **Bot responds** with a message containing an inline button ("🎮 Launch Game")
3. **Button opens web app** in Telegram's in-app browser (full-screen)
4. **Web app connects to Solana** wallets (Phantom, Solflare) - no Telegram SDK needed
5. **All game logic runs** in your React app with standard Solana Web3.js

**Key advantages:**

- ✅ No Telegram Mini App SDK complexity
- ✅ Works with Solana (not restricted by TON exclusivity)
- ✅ Standard React + Solana development
- ✅ Full-screen game canvas
- ✅ Users stay "in Telegram" but you get full control

**Reference example:** Bots like @PoopoovilleBot use this exact pattern.

## Step 1: Create Your Telegram Bot

Open Telegram and message **@BotFather** to create your bot:

```
/newbot
→ Enter display name: "Minesweeper Game"
→ Enter username: "minesweeper_game_bot" (must end in "bot")
→ Save the API token provided (looks like: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)
```

**That's it for BotFather setup.** You DON'T need to set up menu buttons or web app URLs in BotFather—inline buttons are defined in your bot code.

## Step 2: Set Up Your Bot Server

You need a simple Node.js server to run your bot. Here's a minimal setup:

### Install Dependencies

```bash
mkdir minesweeper-bot
cd minesweeper-bot
npm init -y
npm install telegraf dotenv
```

### Create Bot Code

Create `.env` file with your bot token:

```env
BOT_TOKEN=your_token_from_botfather
WEB_APP_URL=https://your-game-app.com
```

Create `bot.js`:

```javascript
const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEB_APP_URL = process.env.WEB_APP_URL;

// /start command
bot.command("start", (ctx) => {
  ctx.reply(
    "🎰 Welcome to Minesweeper!\n\n" +
      "Commands:\n" +
      "/play - Start playing\n" +
      "/balance - Check your balance\n" +
      "/help - Get help"
  );
});

// /play command - opens the game
bot.command("play", (ctx) => {
  ctx.reply("🎮 Ready to play Minesweeper? Place your bets!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎮 Launch Game",
            web_app: { url: WEB_APP_URL }
          }
        ]
      ]
    }
  });
});

// /balance command
bot.command("balance", (ctx) => {
  // TODO: Implement balance checking logic
  ctx.reply("💰 Balance: Connect your wallet in the game to see your balance");
});

// /help command
bot.command("help", (ctx) => {
  ctx.reply(
    "❓ How to play:\n\n" +
      "1. Use /play to open the game\n" +
      "2. Connect your Solana wallet (Phantom/Solflare)\n" +
      "3. Choose your bet amount and number of mines\n" +
      "4. Click tiles to reveal safe spots\n" +
      "5. Cash out anytime or risk it all!\n\n" +
      "Hit a mine = lose your bet\n" +
      "More mines = higher multipliers"
  );
});

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Start bot
bot.launch();
console.log("Bot started!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
```

### Run Your Bot

```bash
node bot.js
```

Your bot is now running! Test it by messaging your bot in Telegram and typing `/play`.

## Step 3: Set Up Your React + Solana Web App

Your web app is a **standard React app** with Solana integration—no Telegram SDK needed.

### Create React App with Vite

```bash
npm create vite@latest minesweeper-game -- --template react-ts
cd minesweeper-game
npm install
```

### Install Solana Dependencies

```bash
npm install @solana/wallet-adapter-base \
            @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets \
            @solana/web3.js
```

### Install Tailwind CSS (Optional but Recommended)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
};
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Basic App Structure with Solana Wallet

Update `src/App.tsx`:

```tsx
import { FC, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import Game from "./components/Game";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

const App: FC = () => {
  // Use devnet for testing, mainnet-beta for production
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <header className="p-4 flex justify-between items-center border-b border-gray-800">
              <h1 className="text-2xl font-bold">💎 Minesweeper</h1>
              <WalletMultiButton />
            </header>
            <main className="container mx-auto p-4">
              <Game />
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
```

Create `src/components/Game.tsx`:

```tsx
import { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const Game: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [betAmount, setBetAmount] = useState("0.1");
  const [numMines, setNumMines] = useState(3);
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!publicKey) return;
    const bal = await connection.getBalance(publicKey);
    setBalance(bal / LAMPORTS_PER_SOL);
  };

  // Handle game start (placeholder)
  const startGame = async () => {
    if (!publicKey) {
      alert("Please connect your wallet first!");
      return;
    }

    // TODO: Implement actual game logic and blockchain transaction
    console.log("Starting game with:", { betAmount, numMines });
    alert(`Game started! Bet: ${betAmount} SOL, Mines: ${numMines}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!publicKey ? (
        <div className="text-center py-12">
          <h2 className="text-xl mb-4">👆 Connect your wallet to play</h2>
          <p className="text-gray-400">
            Use Phantom or Solflare wallet to get started
          </p>
        </div>
      ) : (
        <div>
          {/* Balance Display */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Balance:</span>
              <div>
                {balance !== null ? (
                  <span className="text-2xl font-bold">
                    {balance.toFixed(4)} SOL
                  </span>
                ) : (
                  <button
                    onClick={fetchBalance}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Check Balance
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Game Setup */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Setup Your Game</h3>

            <div className="mb-4">
              <label className="block text-gray-400 mb-2">
                Bet Amount (SOL)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 
                           focus:border-blue-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 mb-2">
                Number of Mines: {numMines}
              </label>
              <input
                type="range"
                value={numMines}
                onChange={(e) => setNumMines(Number(e.target.value))}
                min="1"
                max="24"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Low Risk (1)</span>
                <span>High Risk (24)</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg 
                         text-xl font-bold transition-colors"
            >
              🎮 Start Game
            </button>
          </div>

          {/* Game Grid (TODO: Implement actual minesweeper grid) */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Game Board</h3>
            <div className="aspect-square bg-gray-700 rounded flex items-center justify-center">
              <p className="text-gray-500">Game board will appear here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
```

## Step 4: Development Workflow & Testing

### Local Development with HTTPS

Your web app needs HTTPS for the inline button to work. Two options:

#### Option A: Cloudflare Tunnel (Recommended - No Account Needed)

```bash
# Install cloudflared
# macOS: brew install cloudflare/cloudflare/cloudflared
# Linux: https://github.com/cloudflare/cloudflared/releases

# Start your React app
npm run dev

# In another terminal, create tunnel
cloudflared tunnel --url http://localhost:5173
```

Copy the HTTPS URL (e.g., `https://abc-123.trycloudflare.com`) and update your bot's `.env` file:

```env
WEB_APP_URL=https://abc-123.trycloudflare.com
```

Restart your bot.

#### Option B: ngrok (Requires Free Account)

```bash
# Install ngrok: https://ngrok.com/download

# Start your React app
npm run dev

# In another terminal, create tunnel
ngrok http 5173
```

Copy the HTTPS URL and update your bot's `.env` file.

### Testing Flow

1. Start your React app: `npm run dev`
2. Start your tunnel (cloudflared or ngrok)
3. Update bot's `.env` with tunnel URL
4. Restart bot: `node bot.js`
5. Open Telegram, find your bot
6. Send `/play` command
7. Click "🎮 Launch Game" button
8. Your web app opens in Telegram's in-app browser!

### Mobile Debugging

Since you're testing in Telegram's in-app browser, console.log won't help. Install Eruda for mobile debugging:

```bash
npm install eruda
```

Add to your `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Enable mobile debugging console
if (import.meta.env.DEV) {
  import("eruda").then((eruda) => eruda.default.init());
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Now you'll have a draggable console in your mobile browser for debugging.

## Step 5: Reading Telegram User Data (Optional)

If you want to know who's playing (user ID, name, etc.), Telegram passes this in the URL hash when opening your web app. You can parse it without the Telegram SDK:

```typescript
// src/utils/telegram.ts
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramWebAppInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

export function getTelegramInitData(): TelegramWebAppInitData | null {
  try {
    // Telegram passes data in URL fragment or as tgWebAppData
    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    const initData = urlParams.get("tgWebAppData");

    if (!initData) return null;

    const params = new URLSearchParams(initData);
    const userStr = params.get("user");

    return {
      user: userStr ? JSON.parse(userStr) : undefined,
      auth_date: Number(params.get("auth_date")),
      hash: params.get("hash") || ""
    };
  } catch (error) {
    console.error("Failed to parse Telegram init data:", error);
    return null;
  }
}
```

Use it in your component:

```tsx
import { useEffect, useState } from "react";
import { getTelegramInitData, TelegramUser } from "../utils/telegram";

function Game() {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const initData = getTelegramInitData();
    if (initData?.user) {
      setTelegramUser(initData.user);
      console.log("Telegram user:", initData.user);
    }
  }, []);

  return (
    <div>
      {telegramUser && <p>Welcome, {telegramUser.first_name}!</p>}
      {/* rest of your game */}
    </div>
  );
}
```

## Step 6: Deploying to Production

### Deploy Web App

Use any static hosting that provides HTTPS:

**Vercel (Recommended):**

```bash
npm install -g vercel
vercel
```

**Netlify:**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Cloudflare Pages:**

```bash
npm install -g wrangler
wrangler pages publish dist
```

### Deploy Bot

Your bot needs to run 24/7. Options:

**Railway (Recommended - Free Tier):**

1. Push your bot code to GitHub
2. Go to railway.app
3. Create new project from GitHub repo
4. Add environment variables (BOT_TOKEN, WEB_APP_URL)
5. Deploy

**Render:**

1. Push to GitHub
2. Go to render.com
3. Create new Web Service
4. Connect GitHub repo
5. Add environment variables
6. Deploy

**DigitalOcean App Platform:**
Similar process, slightly more expensive but very reliable.

### Update URLs

Once deployed, update your bot's `.env` with production URLs:

```env
BOT_TOKEN=your_token
WEB_APP_URL=https://your-app.vercel.app
```

## Common Issues & Solutions

### "Button doesn't open anything"

- Check that WEB_APP_URL in bot .env is correct HTTPS URL
- Make sure bot is restarted after changing .env
- Verify URL is accessible in regular browser

### "Wallet won't connect"

- Ensure you're on correct network (devnet vs mainnet)
- Check that wallet adapter is properly installed
- Make sure HTTPS is working (wallets require secure context)

### "Can't debug issues on mobile"

- Install Eruda as shown above
- Check bot logs on server (console.log in bot.js)
- Use Telegram's "Report Bot" feature if bot crashes

### "Local testing is slow"

- Use cloudflared instead of ngrok (faster)
- Consider VS Code port forwarding (if using VS Code)
- Use browser testing first, mobile testing second

## Next Steps for Your Gambling Game

Now that you have the basic setup, you need to:

1. **Implement minesweeper game logic:**

   - Grid generation with random mine placement
   - Tile reveal logic
   - Multiplier calculations
   - Win/loss detection

2. **Add Solana smart contract integration:**

   - Bet escrow contract
   - Provably fair random number generation
   - Payout logic
   - Transaction signing and sending

3. **Enhance bot functionality:**

   - `/balance` command that actually checks on-chain balance
   - `/withdraw` command to help users move funds
   - Game history and statistics
   - Leaderboard (optional)

4. **Add security & validation:**

   - Server-side game validation (don't trust client)
   - Rate limiting on bot commands
   - Input validation for bet amounts
   - Smart contract audit before mainnet

5. **Polish UI/UX:**
   - Implement provided "retro hacker aesthetic" design
   - Add animations and sound effects
   - Loading states and error handling
   - Responsive design for different screen sizes

## Resources

### Telegram Bot Development

- Telegram Bot API: https://core.telegram.org/bots/api
- Telegraf docs: https://telegraf.js.org/
- Grammy (alternative): https://grammy.dev/

### Solana Development

- Solana Web3.js: https://solana-labs.github.io/solana-web3.js/
- Wallet Adapter: https://github.com/solana-labs/wallet-adapter
- Solana Cookbook: https://solanacookbook.com/

### Deployment

- Railway: https://railway.app/
- Vercel: https://vercel.com/
- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

---

This guide gives you everything you need for the **bot + inline button + Solana web app** pattern. No Telegram Mini App SDK complexity, just standard bot development and React + Solana integration.
