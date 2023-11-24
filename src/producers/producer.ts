import { BufferLike } from "../fetchers/types";
import { TriggerRequest } from "./types";

export default class DataProducer {
  constructor(private triggerRequest: TriggerRequest) {}

  start(
    onData: (data: BufferLike) => void,
    onError: (error: BufferLike) => void,
    subscribeCmd: BufferLike,
  ) {
    const fetcher = this.triggerRequest.getFethcher();
    fetcher.onData((data) => {
      onData(data);
    });

    fetcher.onError((error) => {
      onError(error);
    });
    fetcher.startFetching(subscribeCmd);
  }

  stop() {
    const fetcher = this.triggerRequest.getFethcher();
    fetcher.stopFetching();
  }
}
