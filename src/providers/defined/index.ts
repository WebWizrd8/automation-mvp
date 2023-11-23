import { EVMChains, EVMChainId } from "../../chains/types";
import { AxiosRequestConfig } from "axios";
import HttpFetcher from "../../fetchers/http-fetcher";

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

export type Price = {
  address: Address;
  networkId: number;
  priceUsd: number;
  timestamp: number;
};

export class DefinedProviderHttpApi {
  private cronPattern?: string;

  constructor(cronPattern?: string) {
    this.cronPattern = cronPattern;
  }

  public static getTokenPrice(
    token: Address,
    chainId: ChainInput,
    timestamp?: number,
  ): AxiosRequestConfig {
    const chainIdNumber = new DefinedProvider().getChainId(chainId);

    let query;
    if (!timestamp) {
      query = `
        query {
				getTokenPrices(inputs: [{address: "${token}", networkId: ${chainIdNumber}}]) {
                  address
                  networkId
                  priceUsd
                  timestamp
  			}
        }`;
    } else {
      query = `
        query {
				getTokenPrices(inputs:[{address: "${token}", networkId: ${chainIdNumber}, timestamp: ${timestamp}}]) {
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
    return config;
  }
}
