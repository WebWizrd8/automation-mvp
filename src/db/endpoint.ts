import { getLogger } from "../utils/logger";
import dbClient from "../utils/db-client";

export enum ConnectionType {
  HTTP = "http",
  WS = "ws",
}

const logger = getLogger("db/endpoint.ts");

export class EndpointRecord {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  connection_kind: ConnectionType;
  provider_id: number;

  constructor(
    id: number,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    connection_kind: ConnectionType,
    provider_id: number,
    description: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
    this.connection_kind = connection_kind;
    this.provider_id = provider_id;
  }
}

export async function getEndpointRecordFromId(
  id: number,
): Promise<EndpointRecord> {
  let endpointRecord: EndpointRecord;
  try {
    const dbRecord = await dbClient.endpoint.findUnique({
      where: {
        id: id,
      },
    });
    if (dbRecord === null) {
      throw new Error(`Endpoint with id ${id} not found`);
    }

    endpointRecord = new EndpointRecord(
      dbRecord.id,
      dbRecord.name,
      dbRecord.createdAt,
      dbRecord.updatedAt,
      dbRecord.connection_kind as ConnectionType,
      dbRecord.provider_id,
      dbRecord.description,
    );
  } catch (e) {
    logger.error(`Error getting endpoint record for id: ${id}`);
    throw e;
  }
  // if (id === 0) {
  //   endpointRecord = new EndpointRecord(
  //     0,
  //     "newHeads",
  //     new Date().toISOString(),
  //     new Date().toISOString(),
  //     "Get new heads from the chain using Alchemy ws",
  //     ConnectionType.WS,
  //     0,
  //   );
  // } else if (id === 1) {
  //   endpointRecord = new EndpointRecord(
  //     1,
  //     "getTokenPrices",
  //     new Date().toISOString(),
  //     new Date().toISOString(),
  //     "Get token prices from Defined",
  //     ConnectionType.HTTP,
  //     1,
  //   );
  // } else {
  //   throw new Error(`Unknown endpoint id: ${id}`);
  // }
  return endpointRecord;
}
