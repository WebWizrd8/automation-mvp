import DataFetcher from "../fetchers/data-fetcher";
import { BufferLike } from "../fetchers/types";

export abstract class ApiProvider {
  constructor() {}
  abstract getFetcher(
    name: string,
    chainId: number,
    input: string,
  ): DataFetcher<BufferLike>;
}
