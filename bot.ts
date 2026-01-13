import dotenv from "dotenv";
import { Bot, InlineKeyboard } from "grammy";

dotenv.config({ path: ".env" });

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

//Create a new bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const webAppUrl = "https://motherlode-mine-sweeper.netlify.app/";

//Pre-assign menu text
const menu =
  "<b>Check this out</b>\n\nClick the button below to see a basic web app in telegram.";

// Build keyboards
const menuMarkup = new InlineKeyboard().webApp("🎮 Play", webAppUrl);

bot.command("start", async (ctx) => {
  await ctx.reply(menu, {
    parse_mode: "HTML",
    reply_markup: menuMarkup
  });
});

//This handler sends a menu with the inline buttons we pre-assigned above
bot.command("menu", async (ctx) => {
  await ctx.reply(menu, {
    parse_mode: "HTML",
    reply_markup: menuMarkup
  });
});

bot.command("play", async (ctx) => {
  await ctx.reply("Click the button below to play the game.", {
    parse_mode: "HTML",
    reply_markup: menuMarkup
  });
});

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
  await ctx.reply(
    "this bot can't talk! Click the button below to play the game.",
    {
      parse_mode: "HTML",
      reply_markup: menuMarkup
    }
  );
});

// Export bot instance for use in server.ts
export { bot };
