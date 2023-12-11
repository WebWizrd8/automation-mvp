import ApiProvider from "../providers";
import { AlchemyProviderWsApi } from "../providers/alchemy";
import { DefinedProviderHttpApi } from "../providers/defined";
import { getLogger } from "../utils/logger";
import dbClient from "../utils/db-client";

const logger = getLogger("db/provider");

export class ProviderRecord {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  http_token: string | null;
  ws_token: string | null;

  constructor(obj: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    http_token: string | null;
    ws_token: string | null;
  }) {
    this.id = obj.id;
    this.name = obj.name;
    this.createdAt = obj.createdAt;
    this.updatedAt = obj.updatedAt;
    this.description = obj.description;
    this.http_token = obj.http_token;
    this.ws_token = obj.ws_token;
  }
}

//TODO: This values should come from `db.provider`.
export async function getProviderFromId(id: number): Promise<ApiProvider> {
  try {
    const dbRecord = await dbClient.provider.findUnique({
      where: {
        id: id,
      },
    });
    if (dbRecord === null) {
      throw new Error(`Provider with id ${id} not found`);
    }
    const providerRecord = new ProviderRecord({
      id: dbRecord.id,
      name: dbRecord.name,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
      description: dbRecord.description,
      http_token: dbRecord.http_token,
      ws_token: dbRecord.ws_token,
    });
    switch (dbRecord.name) {
      case "Alchemy":
        logger.debug("Creating AlchemyProvider");
        return new AlchemyProviderWsApi(providerRecord);
      case "Defined":
        logger.debug("Creating DefinedProviderHttpApi");
        return new DefinedProviderHttpApi(providerRecord);
      default:
        throw new Error(`Unknown provider id: ${id}`);
    }

    // if (dbRecord.name === "Alchemy") {
    //   logger.debug("Creating AlchemyProvider");
    //   return new AlchemyProviderWsApi(providerRecord);
    // } else if (dbRecord.name === "Defined") {
    //   logger.debug("Creating DefinedProviderHttpApi");
    //   return new DefinedProviderHttpApi(providerRecord);
    // }
    // throw new Error(`Unknown provider id: ${id}`);
  } catch (err) {
    logger.error(`Error while getting provider from id`, err);
    throw err;
  }
}
