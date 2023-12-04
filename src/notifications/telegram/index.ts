import "dotenv/config";
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

const generateRandomString = () => {
  return [...Array(32)]
    .map((_) => (~~(Math.random() * 36)).toString(36))
    .join("");
};

bot.start(async (ctx) => {
  console.log(ctx.message.chat, ctx.message.from, ctx.message.text);
  const randomString = generateRandomString();
  await bot.telegram.sendMessage(
    ctx.message.chat.id,
    "Welcome to the bot, use this code to register: " + randomString,
  );
});

bot
  .launch()
  .then(() => console.log("Bot is running"))
  .catch(console.error)
  .finally(() => console.log("Bot is running"));

export default bot;

/*
const run = async () => {
  const randomString = generateRandomString();
  await bot.telegram.sendMessage(
    "6200972469",
    "Welcome to the bot, use this code to register: " + randomString,
  );
};
run()
  .then(() => console.log("Bot is running"))
  .catch(console.error)
  .finally(() => console.log("Bot is running"));
*/
