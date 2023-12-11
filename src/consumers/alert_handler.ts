import { getDestinationsForActions } from "../db/action";
import {
  getDestinationPayloadForDiscord,
  getDestinationPayloadForTelegram,
} from "../db/destination";
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
          const telegramPayload = await getDestinationPayloadForTelegram(
            destination.id,
          );
          const { template, telegram_destination } = telegramPayload;
          const preparedResponse = replaceTemplateValues(
            template,
            data,
            filter,
          );
          await bot.telegram.sendMessage(
            telegram_destination.chat_id,
            preparedResponse,
          );
          break;
        }
        case "discord": {
          const discordPayload = await getDestinationPayloadForDiscord(
            destination.id,
          );
          const { template, discord_destination } = discordPayload;
          const preparedResponse = replaceTemplateValues(
            template,
            data,
            filter,
          );
          const webhook = getWebhook(discord_destination.webhook_url);
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
