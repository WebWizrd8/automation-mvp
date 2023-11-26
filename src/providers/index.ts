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
  abstract getUrl(chainId: number): string;
  abstract getFetcher(
    name: string,
    chainId: number,
    type: string,
    input: ApiHttpInput | ApiWsInput,
  ): DataFetcher<BufferLike>;
}
