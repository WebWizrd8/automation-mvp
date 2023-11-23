import DataFetcher from "../fetchers/data-fetcher";
import HttpFetcher from "../fetchers/http-fetcher";
import { BufferLike } from "../fetchers/types";
import { DefinedProviderHttpApi } from "../providers/defined";

export default class DataProducer {
  constructor(
    private pubsubQueue: PubSubQueue,
    private endpoint: Endpoint,
  ) {}

  start() {
    const fetcher = this.endpoint.getFetcher();
    fetcher.onData((data) => {
      this.pubsubQueue.publish(data);
    });
    fetcher.onError((error) => {
      this.pubsubQueue.publish(error);
    });
  }
}

export class PubSubQueue {
  constructor() {}
  publish(data: BufferLike) {}
}

export class Endpoint {
  constructor(
    public id: number,
    public name: string,
    public providerId: number,
  ) {}

  getFetcher(): DataFetcher<string> {
    fetcherFromEndpoint(this);
  }
}

function fetcherFromEndpoint(endpoint: Endpoint): DataFetcher<string> {
  if (endpoint.name === "getTokenPrices") {
    DefinedProviderHttpApi.getTokenPrice();
  }
}
