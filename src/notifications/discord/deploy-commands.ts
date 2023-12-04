import { ApplicationCommandDataResolvable, REST, Routes } from "discord.js";
import { commands } from "./commands";

export async function deployCommands() {
  const commandsData: Array<ApplicationCommandDataResolvable> = Object.values(
    commands,
  ).map((command) => command.data.toJSON());

  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    console.log("Started refreshing application (/) commands.");
    console.log(commandsData);

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID!),
      {
        body: commandsData,
      },
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
