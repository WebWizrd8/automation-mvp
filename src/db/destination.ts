import dbClient from "../utils/db-client";

export const getDestinationPayloadForTelegram = async (
  destinationId: number,
) => {
  const destionationPayload =
    await dbClient.telegram_destination_payload.findMany({
      where: {
        destination_id: destinationId,
      },
      include: {
        telegram_destination: true,
      },
    });
  if (!destionationPayload.length) {
    throw new Error(`Telegram destination with id ${destinationId} not found`);
  }
  return destionationPayload[0];
};

export const getDestinationPayloadForDiscord = async (
  destinationId: number,
) => {
  const destionationPayload =
    await dbClient.discord_destination_payload.findMany({
      where: {
        destination_id: destinationId,
      },
      include: {
        discord_destination: true,
      },
    });
  if (!destionationPayload.length) {
    throw new Error(`Discord destination with id ${destinationId} not found`);
  }
  return destionationPayload[0];
};
