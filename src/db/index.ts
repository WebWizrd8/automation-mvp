import ApiProvider from "../providers";
import { AlchemyProviderWsApi } from "../providers/alchemy";
import { DefinedProviderHttpApi } from "../providers/defined";
import { TriggerRequest } from "../triggers";
import { getLogger } from "../utils/logger";

export interface EndpointRecord {
  id: number;
  provider: number;
  name: string;
  type: string;
}

const logger = getLogger("db");

export function getEndpointFromId(id: number): EndpointRecord {
  if (id === 0) {
    return {
      id: 0,
      provider: 0,
      name: "newHeads",
      type: "ws",
    };
  } else if (id === 1) {
    return {
      id: 1,
      provider: 1,
      name: "getTokenPrices",
      type: "http",
    };
  }
  throw new Error(`Unknown endpoint id: ${id}`);
}

export function getProviderFromId(id: number): ApiProvider {
  if (id === 0) {
    logger.debug("Creating AlchemyProvider");
    return new AlchemyProviderWsApi();
  } else if (id === 1) {
    logger.debug("Creating DefinedProviderHttpApi");
    return new DefinedProviderHttpApi();
  }
  throw new Error(`Unknown provider id: ${id}`);
}

export function getTriggerRequestFromId(id: number): TriggerRequest {
  if (id === 0) {
    const getTokenPricersInput = {
      jsonrpc: "2.0",
      id: 2,
      method: "eth_subscribe",
      params: ["newHeads"],
    };
    return new TriggerRequest(0, 0, 1, 0, JSON.stringify(getTokenPricersInput));
  } else if (id === 1) {
    const getTokenPricersInput = {
      token: "0x6b175474e89094c44da98b954eedeac495271d0f",
      networkId: 1,
    };
    return new TriggerRequest(1, 1, 1, 1, JSON.stringify(getTokenPricersInput));
  }
  throw new Error(`Unknown trigger request id: ${id}`);
}
