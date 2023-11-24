import { Endpoint, PubSubQueue } from ".";
import { BufferLike } from "../fetchers/types";

export default class DataProducer {
  constructor(private endpoint: Endpoint) {}

  start(
    onData: (data: BufferLike) => void,
    onError: (error: BufferLike) => void,
  ) {
    const fetcher = this.endpoint.getFetcher();
    fetcher.onData((data) => {
      onData(data);
    });

    fetcher.onError((error) => {
      onError(error);
    });
  }
}
