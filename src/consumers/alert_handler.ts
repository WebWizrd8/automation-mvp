import { getDestinationsForAlert } from "../db/alert";
import { getDestinationPayloadForTelegram } from "../db/destination";
import { replaceTemplateValues } from "../templates";
import bot from "../notifications/telegram";

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
      console.log("Sending Discord message");
    }
  }
  console.log(destinationRecords);
};
