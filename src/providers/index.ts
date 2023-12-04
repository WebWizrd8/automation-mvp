import { ProviderRecord } from "../db/provider";
import DataFetcher from "../fetchers/data-fetcher";
import { BufferLike } from "../fetchers/types";

export interface ApiHttpInput {
  input: string;
  channelIdForTick: string;
}

export interface ApiWsInput {
  input: string;
}

export default abstract class ApiProvider {
  record: ProviderRecord;
  constructor(_record: ProviderRecord) {
    this.record = _record;
  }
  abstract getUrl(chainId: number): string;
  abstract getConnectionConfig(
    name: string,
    chainId: number,
    connection_type: string,
    input: ApiHttpInput | ApiWsInput,
  ): DataFetcher<BufferLike>;

  public getChainValue(chainId: number): string {
    //TODO: This is a hack to get the chain_value from the provider id
    // This should come from `db.provider_chain`.
    if (this.record.id == 0) {
      if (chainId == 1) {
        return `${1}`;
      } else {
        throw new Error(`Unknown chainId: ${chainId} for AlchemyProviderWsApi`);
      }
    } else if (this.record.id == 1) {
      if (chainId == 1) {
        return `${1}`;
      } else {
        throw new Error(
          `Unknown chainId: ${chainId} for DefinedProviderHttpApi`,
        );
      }
    } else {
      throw new Error(`Unknown provider id: ${this.record.id}`);
    }
  }
}
