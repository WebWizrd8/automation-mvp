import { getDestinationsForActions } from "../db/action";
import { replaceTemplateValues } from "../templates";
import bot from "../notifications/telegram";
import {
  getWebhook,
  sendWebhookMessage,
} from "../notifications/discord/webhook";

export const handleActions = async (
  actionIds: number[],
  data: Record<string, unknown>,
  filter: Record<string, unknown>,
) => {
  for (const actionId of actionIds) {
    await handleAction(actionId, data, filter);
  }
};

export const handleAction = async (
  actionId: number,
  data: Record<string, unknown>,
  filter: Record<string, unknown>,
) => {
  const actionRecords = await getDestinationsForActions(actionId);
  if (!actionRecords) {
    throw new Error(`Alert with id ${actionId} not found`);
  }
  for (const actionRecord of actionRecords) {
    const { destination: destinationRecords } = actionRecord;
    for (const destination of destinationRecords) {
      switch (destination.type) {
        case "telegram": {
          const telegramConfig = JSON.parse(
            JSON.stringify(destination.destination_config),
          );
          const preparedResponse = replaceTemplateValues(
            telegramConfig.template,
            data,
            filter,
          );
          await bot.telegram.sendMessage(
            telegramConfig.telegramChatId,
            preparedResponse,
          );
          break;
        }
        case "discord": {
          const discordConfig = JSON.parse(
            JSON.stringify(destination.destination_config),
          );
          const preparedResponse = replaceTemplateValues(
            discordConfig.template,
            data,
            filter,
          );
          const webhook = getWebhook(discordConfig.discordWebhookUrl);
          await sendWebhookMessage(webhook, preparedResponse);
          break;
        }
        case "webhook":
          //TODO: implement webhook
          break;
        default:
          throw new Error(`Unknown destination type ${destination.type}`);
      }
    }
  }
  console.log(actionRecords);
};
