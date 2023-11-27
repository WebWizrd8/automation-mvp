import ApiProvider, { ApiWsInput } from "..";
import DataFetcher from "../../fetchers/data-fetcher";
import { BufferLike } from "../../fetchers/types";
import WebSocketFetcher from "../../fetchers/ws-fetcher";
import { getLogger } from "../../utils/logger";

const URL =
  "wss://eth-mainnet.g.alchemy.com/v2/SQcfPp5joj0Lj2fpZ6nEaPF-B8eX_3Vx";

export interface SubscribeInput {
  jsonrpc: "2.0";
  id: 2;
  method: "eth_subscribe";
  params: string[];
}

const logger = getLogger("AlchemyProvider");

export class AlchemyProviderWsApi extends ApiProvider {
  constructor() {
    super();
  }

  getUrl(_chainId: number) {
    return URL;
  }

  getFetcher(
    name: string,
    chainId: number,
    type: string,
    apiInputData: ApiWsInput,
  ): DataFetcher<BufferLike> {
    if (type !== "ws") {
      throw new Error(`Unknown type: ${type} for AlchemyProviderWsApi`);
    }
    const { input } = apiInputData;
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
