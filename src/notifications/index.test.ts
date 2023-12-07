import { DataConsumerWorkerManager } from "../consumers";
import {
  PubSubConsumer,
  PubSubPublisher,
  RedisPubSubSystem,
} from "../producers/queue";
import { getNewBlocksChannel } from "../producers/types";
import { DataProducerWorkerManager } from "../producers";
import { getEventFetchRequestRecordFromId } from "../db/event";

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
    const manager = new DataProducerWorkerManager(publisher);
    const consumer_manager = new DataConsumerWorkerManager(consumer);

    const newBlockChannelId = getNewBlocksChannel(1);
    const id = manager.create(
      newBlockChannelId,
      getEventFetchRequestRecordFromId(0),
    );

    const eventFetchRecord = getEventFetchRequestRecordFromId(1);

    const getMainnetTokenPricesId = manager.create("test_2", eventFetchRecord);

    const consumer_worker_id = await consumer_manager.create(
      "test_2",
      eventFetchRecord,
    );

    manager.start(id);
    manager.start(getMainnetTokenPricesId);
    //Timeout to wait for two blocks to be mined
    await new Promise((resolve) => setTimeout(resolve, 14000));
    manager.stop(id);
    manager.stop(getMainnetTokenPricesId);
    consumer_manager.stop(consumer_worker_id);
  }, 14500);
});
