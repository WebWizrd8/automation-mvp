import dbClient from "../utils/db-client";

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

export const getActionFromId = async (id: number) => {
  return await dbClient.action.findUnique({
    where: {
      id,
    },
  });
};

export const getDestinationsForActions = async (alertId: number) => {
  const alert_destinations = await dbClient.action.findMany({
    where: {
      id: alertId,
    },
    include: {
      destination: true,
    },
  });
  return alert_destinations;
};
