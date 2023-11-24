import { BufferLike } from "../fetchers/types";
import { getLogger } from "../utils/logger";

const logger = getLogger("PubSubQueue");

export class PubSubQueue {
  constructor() {}
  publish(channelId: string, data: BufferLike) {
    logger.info(`Publishing data to ${channelId}`, data);
  }
}
