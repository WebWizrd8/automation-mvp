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

export const getDestinationsForActions = async (actionId: number) => {
  const action_destinations = await dbClient.action.findMany({
    where: {
      id: actionId,
    },
    include: {
      destination: true,
    },
  });
  return action_destinations;
};
