import { EventFetchRequest } from "../events";
import DataFetcher from "../fetchers/data-fetcher";
import { BufferLike } from "../fetchers/types";
import { getLogger } from "../utils/logger";

const logger = getLogger("DataProducer");

export default class DataProducer {
  private eventFetchRequest: EventFetchRequest;
  private dataFetcher?: DataFetcher<BufferLike>;

  constructor(eventFetchRequest: EventFetchRequest) {
    this.eventFetchRequest = eventFetchRequest;
  }

  async start(
    onData: (data: BufferLike) => void,
    onError: (error: BufferLike) => void,
  ) {
    console.log("Starting fetcher...");
    try {
      const fetcher = await this.eventFetchRequest.getFethcher();
      fetcher.onData((data) => {
        onData(data);
      });
      fetcher.onError((error) => {
        onError(error);
      });
      this.dataFetcher = fetcher;
      await fetcher.startFetching();
    } catch (e) {
      logger.error("Fetcher error ", e);
      throw e;
    }
  }

  stop() {
    if (!this.dataFetcher) {
      return;
    }
    this.dataFetcher.stopFetching();
  }
}
