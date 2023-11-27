import { BufferLike } from "../fetchers/types";
import { getLogger } from "../utils/logger";
import { TriggerRequest } from "../triggers";

const logger = getLogger("DataProducer");

export default class DataProducer {
  constructor(private triggerRequest: TriggerRequest) {}

  async start(
    onData: (data: BufferLike) => void,
    onError: (error: BufferLike) => void,
  ) {
    console.log("Starting fetcher...");
    const fetcher = this.triggerRequest.getFethcher();
    fetcher.onData((data) => {
      onData(data);
    });

    fetcher.onError((error) => {
      onError(error);
    });
    try {
      await fetcher.startFetching();
    } catch (e) {
      logger.error("Error while staring fetcher ", e);
    }
  }

  stop() {
    const fetcher = this.triggerRequest.getFethcher();
    fetcher.stopFetching();
  }
}
