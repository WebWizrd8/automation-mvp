import ApiProvider from "../providers";
import { AlchemyProviderWsApi } from "../providers/alchemy";
import { DefinedProviderHttpApi } from "../providers/defined";
import { TriggerRequest } from "../triggers";
import { getLogger } from "../utils/logger";
import * as alert from "./alert";
import * as provider from "./provider";
import * as endpoint from "./endpoint";

const logger = getLogger("db");

export function getTriggerRequestFromId(id: number): TriggerRequest {
  if (id === 0) {
    const getNewBlocks = {
      jsonrpc: "2.0",
      id: 2,
      method: "eth_subscribe",
      params: ["newHeads"],
    };
    return new TriggerRequest(0, 0, 1, 0, JSON.stringify(getNewBlocks));
  } else if (id === 1) {
    const getTokenPricersInput = {
      token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      networkId: 1,
    };
    return new TriggerRequest(1, 1, 1, 1, JSON.stringify(getTokenPricersInput));
  }
  throw new Error(`Unknown trigger request id: ${id}`);
}

export default {
  ...alert,
  ...provider,
  ...endpoint,
  getTriggerRequestFromId,
};
