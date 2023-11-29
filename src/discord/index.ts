import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  await deployCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  console.log(Events.InteractionCreate, interaction);
  if (!interaction.isCommand()) return;
  const command = commands[interaction.commandName as keyof typeof commands];
  if (!command) return;
  await command.execute(interaction);
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;
  await message.channel.send("Hello!");
});

process.on("uncaughtException", console.error);
client.on("error", console.error);

client
  .login(process.env.DISCORD_BOT_TOKEN!)
  .then(() => {})
  .catch(console.error)
  .finally(() => {});
