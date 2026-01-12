# Telegram Game

## Resources

https://core.telegram.org/bots#host-games

[web apps](https://core.telegram.org/bots/webapps)

[building a telegram app](https://youtu.be/Z_FHTr1iCn0)

## Useful packages

[TS types for the telegram web app script](https://www.npmjs.com/package/@types/telegram-web-app)

## Notes

- Can build web apps essentially in telegram. The diff is you use the Telegram global object instead of Window like you would in the browser.
- Ensure that you send the hash from telegram along with the user data to the server, in order to verify the legitimacy of the data.
- We will build a telegram web app for this, NOT a Telgram Mini App (because we need to use Solana blockchain, not TON). Further explanation:
  - TON (The Open Network {previously Telegram Open Network}) is linked to Telegram but is a legally seperate entity (for reasons). It's a Layer-1 blockchain (like Ethereum or Solana). All Telegram Mini Apps using blockchain functionality MUST exclusively use TON. We need to use Solana so this is a no-no.

## Bot

**name**: PigHeadedBot

**username**: PigHeadedBot

- Getting to the bot: https://t.me/PigHeadedBot
  Can add optional parameters like ?start=start

## Info about the minesweeper type gambling game

- when they close the app - they get warning that they lose their bet.
- This bot you interact with on telegram, then to trade solana it opens up a web app: @PoopoovilleBot.
