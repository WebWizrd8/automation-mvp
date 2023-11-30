import { DataConsumerWorkerManager } from "../consumers";
import {
  PubSubConsumer,
  PubSubPublisher,
  RedisPubSubSystem,
} from "../producers/queue";
import { getTriggerRequestFromId } from "../db";
import { getNewBlocksChannel } from "../producers/types";
import { DataProducerWorkerManager } from "../producers";

describe("Producers Test", () => {
  let pubsubQueue: RedisPubSubSystem;
  let publisher: PubSubPublisher;
  let consumer: PubSubConsumer;

  beforeEach(() => {
    pubsubQueue = new RedisPubSubSystem();
    publisher = new PubSubPublisher(pubsubQueue);
    consumer = new PubSubConsumer(pubsubQueue);
  });

  afterEach(async () => {
    await pubsubQueue.close();
  });

  it("should receive tokenprice on each block", async () => {
    if (!process.env.DEFINED_API) {
      throw new Error("DEFINED_URL env variable not set");
    }
    const manager = new DataProducerWorkerManager(publisher);
    const consumer_manager = new DataConsumerWorkerManager(consumer);

    const newBlockChannelId = getNewBlocksChannel(1);
    const id = manager.create(newBlockChannelId, getTriggerRequestFromId(0));

    const getMainnetTokenPricesId = manager.create(
      "test_2",
      getTriggerRequestFromId(1),
    );

    const consumer_worker_id = await consumer_manager.create(
      "test_2",
      "test_2",
    );

    manager.start(id);
    manager.start(getMainnetTokenPricesId);
    //Timeout to wait for two blocks to be mined
    await new Promise((resolve) => setTimeout(resolve, 25000));
    manager.stop(id);
    manager.stop(getMainnetTokenPricesId);
    consumer_manager.stop(consumer_worker_id);
  }, 25500);
});
