import Redis, { RedisOptions } from "ioredis";
import { BufferLike } from "../fetchers/types";
import { getLogger } from "../utils/logger";

const logger = getLogger("PubSubQueue");

export abstract class PubSubSystem {
  abstract publish(channelId: string, data: BufferLike): Promise<void>;
  abstract subscribe(
    channelId: string,
    onData: (data: BufferLike) => void,
  ): Promise<void>;
  abstract unsubscribe(channelId: string): Promise<void>;
  abstract getSubscriberCount(channelId: string): Promise<number>;
  abstract close(): Promise<void>;
}

// Redis implementation
export class RedisPubSubSystem extends PubSubSystem {
  private redisPublisher: Redis;
  private redisSubscriber: Redis;

  constructor(options?: RedisOptions) {
    super();
    if (!options) {
      options = {
        host: "localhost",
        port: 6379,
      };
    }
    this.redisPublisher = new Redis(options);
    this.redisSubscriber = new Redis(options);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.redisPublisher.publish(channel, message);
  }

  async subscribe(
    channelId: string,
    callback: (message: BufferLike) => void,
  ): Promise<void> {
    await this.redisSubscriber.subscribe(channelId, (err) => {
      if (err) {
        console.error(`Failed to subscribe to channel ${channelId}: ${err}`);
        return;
      }
      this.redisSubscriber.on("message", (channel, message) => {
        if (channel === channelId) {
          callback(message);
        }
      });
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.redisSubscriber.unsubscribe(channel);
  }

  async getSubscriberCount(channel: string): Promise<number> {
    return (await this.redisPublisher.pubsub("NUMSUB", channel))[1] as number;
  }

  async close(): Promise<void> {
    return Promise.all([
      this.redisPublisher.quit(),
      this.redisSubscriber.quit(),
    ]).then(() => {
      logger.info("Redis connections closed");
    });
  }
}

// Producer class
export class PubSubPublisher {
  constructor(private pubSubSystem: PubSubSystem) {}

  async publish(channel: string, message: BufferLike): Promise<void> {
    const messageString = JSON.stringify(message);
    await this.pubSubSystem.publish(channel, messageString);
  }
}

// Consumer class
export class PubSubConsumer {
  constructor(private pubSubSystem: PubSubSystem) {}

  async subscribe(
    channel: string,
    callback: (message: BufferLike) => void,
  ): Promise<void> {
    await this.pubSubSystem.subscribe(channel, (messageString: BufferLike) => {
      callback(messageString);
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.pubSubSystem.unsubscribe(channel);
  }
}
// constructor(private onPublishCallback?: (arg: BufferLike) => Promise<void>) {}
// async publish(channelId: string, data: BufferLike) {
//   logger.info(`Publishing data to ${channelId}: ${data}`);
//   if (this.onPublishCallback) {
//     await this.onPublishCallback(data);
//   }
// }
