import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface IAlert {
  id: number;
  name: string;
  user_id: number;
  chain_id: number;
}

export const getAlertFromId = (id: number) => {
  return prisma.alert.findUnique({
    where: {
      id,
    },
  });
};

export const getDestinationsForAlert = async (alertId: number) => {
  const alert_destinations = await prisma.alert_destination.findMany({
    where: {
      alert_id: alertId,
    },
    include: {
      destination: true,
    },
  });
  return alert_destinations;
};
