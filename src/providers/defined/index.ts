import dotenv from "dotenv";
import { EVMChains, EVMChainId } from "../../chains/types";
import HttpFetcher from "../../fetchers/http-fetcher";
import DataFetcher from "../../fetchers/data-fetcher";
import { BufferLike } from "../../fetchers/types";
import ApiProvider, { ApiHttpInput } from "..";
import { ProviderRecord } from "../../db/provider";

type Address = string;
type ChainInput = EVMChainId | EVMChains;

const chainMapping = {
  [EVMChainId.ETH]: 1,
  [EVMChainId.ARBITRUM]: 42161,
  [EVMChainId.ZKSYNC]: 324,
  [EVMChainId.SCROLL]: 534352,
};

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

export class DefinedProviderHttpApi extends ApiProvider {
  record: ProviderRecord;
  constructor(record: ProviderRecord) {
    super(record);
    dotenv.config();
    this.record = record;
  }

  getUrl(_chainId: number) {
    return "https://graph.defined.fi/graphql";
  }

  public getConnectionConfig(
    name: string,
    chainId: number,
    connection_type: string,
    apiInputData: ApiHttpInput,
  ): DataFetcher<BufferLike> {
    if (connection_type !== "http") {
      throw new Error(
        `Unknown type: ${connection_type} for DefinedProviderHttpApi`,
      );
    }

    const axiosConfig = {
      url: this.getUrl(chainId),
      headers: {
        "Content-Type": "application/json",
        Authorization: `${process.env.DEFINED_API}`,
      },
    };

    const { input, channelIdForTick } = apiInputData;
    if (name === "getTokenPrices") {
      return this.getTokenPrice(
        axiosConfig,
        JSON.parse(input),
        channelIdForTick,
      );
    }

    throw new Error(`Unknown trigger name: ${name}`);
  }

  public getTokenPrice(
    axiosConfig: Record<string, unknown>,
    input: GetTokenPricesInput,
    channelIdForTick: string,
  ): DataFetcher<BufferLike> {
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
      axiosConfig,
      method: "post",
      data: JSON.stringify({ query }),
    };
    //Disable eslint no-any rule for dataProcessor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetcher = new HttpFetcher(config, channelIdForTick, (data) => {
      const prices = data.data.getTokenPrices;
      return prices[0];
    });
    return fetcher;
  }
}
