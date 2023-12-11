import { DataProducerWorkerManager } from ".";
import { getEventFetchRequestRecordFromId } from "../db/event";
import { BufferLike } from "../fetchers/types";
import { PubSubConsumer, PubSubPublisher, RedisPubSubSystem } from "./queue";
import { getNewBlocksChannel } from "./types";

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

  it("should receive successful subscription response", async () => {
    const callback = jest.fn();
    const printCallback = (message: BufferLike) => {
      console.log("printCallback", message);
    };

    await consumer.subscribe("test_1", callback);
    await consumer.subscribe("test_1", printCallback);

    const manager = new DataProducerWorkerManager(publisher);
    const id = manager.create("test_1", getEventFetchRequestRecordFromId(0));
    manager.start(id);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    manager.stop(id);
    expect(callback).toHaveBeenCalled();
  }, 3500);

  it("should receive tokenprice on each block", async () => {
    const manager = new DataProducerWorkerManager(publisher);
    const newBlockChannelId = getNewBlocksChannel(1);
    const id = manager.create(
      newBlockChannelId,
      getEventFetchRequestRecordFromId(0),
    );
    const printCallback = (message: BufferLike) => {
      console.log("printCallback", message);
    };
    await consumer.subscribe(newBlockChannelId, printCallback);
    const getMainnetTokenPricesId = manager.create(
      "test_2",
      getEventFetchRequestRecordFromId(1),
    );

    const getMainnetTokenPricesCallback = jest.fn();
    await consumer.subscribe("test_2", getMainnetTokenPricesCallback);

    manager.start(id);
    manager.start(getMainnetTokenPricesId);
    //Timeout to wait for two blocks to be mined
    await new Promise((resolve) => setTimeout(resolve, 25000));
    manager.stop(id);
    manager.stop(getMainnetTokenPricesId);
    //Callback is called 3 times because: subscribed + 2 blocks
    expect(getMainnetTokenPricesCallback).toHaveBeenCalledTimes(3);
  }, 25500);
});
