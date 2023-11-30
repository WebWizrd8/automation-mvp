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

export const handleAlerts = async (alertIds: number[], data: string) => {
  for (const alertId of alertIds) {
    await handleAlert(alertId, data);
  }
};

export const handleAlert = async (alertId: number, data: string) => {
  const destinationRecords = await getDestinationsForAlert(alertId);
  if (!destinationRecords) {
    throw new Error(`Alert with id ${alertId} not found`);
  }
  for (const destinationRecord of destinationRecords) {
    const { destination } = destinationRecord;
    if (destination.type === "telegram") {
      const telegramPayload = await getDestinationPayloadForTelegram(
        destination.id,
      );
      const { template, telegram_destination } = telegramPayload;
      const preparedResponse = replaceTemplateValues(template, data);
      await bot.telegram.sendMessage(
        telegram_destination.chat_id,
        preparedResponse,
      );
    } else if (destination.type === "discord") {
      const discordPayload = await getDestinationPayloadForDiscord(
        destination.id,
      );
      const { template, discord_destination } = discordPayload;
      const preparedResponse = replaceTemplateValues(template, data);
      const webhook = getWebhook(discord_destination.webhook_url);
      await sendWebhookMessage(webhook, preparedResponse);
    }
  }
  console.log(destinationRecords);
};
