import ApiProvider, { ApiWsInput } from "..";
import { ProviderRecord } from "../../db/provider";
import DataFetcher from "../../fetchers/data-fetcher";
import { BufferLike } from "../../fetchers/types";
import WebSocketFetcher from "../../fetchers/ws-fetcher";
import { getLogger } from "../../utils/logger";

export interface SubscribeInput {
  jsonrpc: "2.0";
  id: 2;
  method: "eth_subscribe";
  params: string[];
}

const logger = getLogger("AlchemyProvider");

export class AlchemyProviderWsApi extends ApiProvider {
  record: ProviderRecord;
  constructor(record: ProviderRecord) {
    super(record);
    this.record = record;
    logger.debug(`Created AlchemyProviderWsApi`, this.record);
  }

  getUrl(chainId: number) {
    if (chainId === 2) {
      return `wss://eth-mainnet.g.alchemy.com/v2/${this.record.ws_token}`;
    } else {
      throw new Error(`Unknown chainId: ${chainId} for AlchemyProviderWsApi`);
    }
  }

  //This should return only connection configurations
  //The fetcher should be constructed by endpoint and this method will be called by it.
  getConnectionConfig(
    name: string,
    chainId: number,
    connnection_type: string,
    apiInputData: ApiWsInput,
  ): DataFetcher<BufferLike> {
    if (connnection_type !== "ws") {
      throw new Error(
        `Unknown type: ${connnection_type} for AlchemyProviderWsApi`,
      );
    }
    const { input } = apiInputData;
    if (input === null) {
      throw new Error(`Input is null for AlchemyProviderWsApi`);
    }
    const subscribeInput = JSON.parse(input);
    logger.debug(`Creating fetcher for ${name}`);
    if (name === "newHeads") {
      return this.newHeads(chainId, subscribeInput);
    }
    throw new Error(`Unknown trigger name: ${name}`);
  }

  newHeads(
    chainId: number,
    input: SubscribeInput,
  ): WebSocketFetcher<BufferLike> {
    const fetcher = new WebSocketFetcher<BufferLike>(
      this.getUrl(chainId),
      JSON.stringify(input),
    );
    return fetcher;
  }
}
