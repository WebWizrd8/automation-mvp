import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ActionRecord {
  id: number;
  name: string;
  chain_id: number;

  constructor(id: number, name: string, chain_id: number) {
    this.id = id;
    this.name = name;
    this.chain_id = chain_id;
  }
}

export const getActionFromId = (id: number) => {
  return prisma.action.findUnique({
    where: {
      id,
    },
  });
};

export const getDestinationsForActions = async (alertId: number) => {
  const alert_destinations = await prisma.action.findMany({
    where: {
      id: alertId,
    },
    include: {
      destination: true,
    },
  });
  return alert_destinations;
};
