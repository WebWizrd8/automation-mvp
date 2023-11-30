import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDestinationPayloadForTelegram = async (
  destinationId: number,
) => {
  const destionationPayload =
    await prisma.telegram_destination_payload.findMany({
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
  const destionationPayload = await prisma.discord_destination_payload.findMany(
    {
      where: {
        destination_id: destinationId,
      },
      include: {
        discord_destination: true,
      },
    },
  );
  if (!destionationPayload.length) {
    throw new Error(`Discord destination with id ${destinationId} not found`);
  }
  return destionationPayload[0];
};
