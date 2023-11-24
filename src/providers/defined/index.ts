import { EVMChains, EVMChainId } from "../../chains/types";
import HttpFetcher from "../../fetchers/http-fetcher";
import DataFetcher from "../../fetchers/data-fetcher";
import { BufferLike } from "../../fetchers/types";

type Address = string;
type ChainInput = EVMChainId | EVMChains;

const chainMapping = {
  [EVMChainId.ETH]: 1,
  [EVMChainId.ARBITRUM]: 42161,
  [EVMChainId.ZKSYNC]: 324,
  [EVMChainId.SCROLL]: 534352,
};

const URL = "https://graph.defined.fi/graphql";

function getUrl() {
  return URL;
}

function getAxoisConfig() {
  return {
    url: getUrl(),
    headers: {
      "Content-Type": "application/json",
      Authorization: `${process.env.DEFINED_API}`,
    },
  };
}

export default class DefinedProvider {
  public getChainId(chainId: ChainInput): number {
    if (typeof chainId === "string") {
      const chain = chainId as EVMChains;
      const chainIdNumber = EVMChainId[chain];
      return chainMapping[chainIdNumber];
    }
    return chainMapping[chainId];
  }
}

export type GetTokenPricesInput = {
  token: Address;
  networkId: ChainInput;
  timestamp?: number;
};

export type Price = {
  address: Address;
  networkId: number;
  priceUsd: number;
  timestamp: number;
};

export class DefinedProviderHttpApi {
  public getFetcher(
    name: string,
    _chainId: number,
    input: string,
  ): DataFetcher<BufferLike> {
    if (name === "getTokenPrices") {
      return this.getTokenPrice(JSON.parse(input));
    }
    throw new Error(`Unknown trigger name: ${name}`);
  }

  public getTokenPrice(input: GetTokenPricesInput): DataFetcher<BufferLike> {
    const { token, networkId, timestamp } = input;
    let query;
    if (!timestamp) {
      query = `
        query {
				getTokenPrices(inputs: [{address: "${token}", networkId: ${networkId}}]) {
                  address
                  networkId
                  priceUsd
                  timestamp
  			}
        }`;
    } else {
      query = `
        query {
				getTokenPrices(inputs:[{address: "${token}", networkId: ${networkId}, timestamp: ${timestamp}}]) {
                  address
                  networkId
                  priceUsd
                  timestamp
  			}
        }`;
    }
    const config = {
      ...getAxoisConfig(),
      method: "post",
      data: JSON.stringify({ query }),
    };
    const fetcher = new HttpFetcher<BufferLike>(config);
    return fetcher;
  }
}
