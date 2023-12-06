import { getDestinationsForAlert } from "../db/alert";
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

export const handleAlerts = async (
  alertIds: number[],
  data: Record<string, unknown>,
  _filter: Record<string, unknown>,
) => {
  for (const alertId of alertIds) {
    await handleAlert(alertId, data);
  }
};

export const handleAlert = async (
  alertId: number,
  data: Record<string, unknown>,
) => {
  const destinationRecords = await getDestinationsForAlert(alertId);
  if (!destinationRecords) {
    throw new Error(`Alert with id ${alertId} not found`);
  }
  for (const destinationRecord of destinationRecords) {
    const { destination } = destinationRecord;
    switch (destination.type) {
      case "telegram": {
        const telegramPayload = await getDestinationPayloadForTelegram(
          destination.id,
        );
        const { template, telegram_destination } = telegramPayload;
        const preparedResponse = replaceTemplateValues(template, data);
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
        const preparedResponse = replaceTemplateValues(template, data);
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
  console.log(destinationRecords);
};
