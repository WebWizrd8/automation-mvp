/*
model provider {
  id             Int              @id @default(autoincrement())
  name           String
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  description    String?
  http_url       String
  ws_url         String
  provider_chain provider_chain[]
  endpoint       endpoint[]
}
*/

import ApiProvider from "../providers";
import { AlchemyProviderWsApi } from "../providers/alchemy";
import { DefinedProviderHttpApi } from "../providers/defined";
import { getLogger } from "../utils/logger";

const logger = getLogger("db/provider");

export class ProviderRecord {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  http_token: string;
  ws_token: string;

  constructor(
    id: number,
    name: string,
    createdAt: string,
    updatedAt: string,
    description: string,
    http_url: string,
    ws_url: string,
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
    this.http_token = http_url;
    this.ws_token = ws_url;
  }
}

//TODO: This values should come from `db.provider`.
export function getProviderFromId(id: number): ApiProvider {
  let providerRecord: ProviderRecord;
  if (id === 0) {
    providerRecord = new ProviderRecord(
      0,
      "Alchemy",
      new Date().toISOString(),
      new Date().toISOString(),
      "Alchemy provider",
      "",
      process.env.ALCHEMY_API_TOKEN!,
    );
  } else if (id === 1) {
    providerRecord = new ProviderRecord(
      1,
      "Defined",
      new Date().toISOString(),
      new Date().toISOString(),
      "Defined provider",
      process.env.DEFINED_API!,
      "",
    );
  } else {
    throw new Error(`Unknown provider id: ${id}`);
  }

  if (id === 0) {
    logger.debug("Creating AlchemyProvider");
    return new AlchemyProviderWsApi(providerRecord);
  } else if (id === 1) {
    logger.debug("Creating DefinedProviderHttpApi");
    return new DefinedProviderHttpApi(providerRecord);
  }
  throw new Error(`Unknown provider id: ${id}`);
}
