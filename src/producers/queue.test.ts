import { PubSubConsumer, PubSubPublisher, RedisPubSubSystem } from "./queue";

describe("Redis PubSub", () => {
  it("should publish and consume data", async () => {
    const callback = jest.fn();
    const pubsubQueue = new RedisPubSubSystem();
    const publisher = new PubSubPublisher(pubsubQueue);
    const consumer = new PubSubConsumer(pubsubQueue);
    await consumer.subscribe("test_1", callback);
    const subscriberCount = await pubsubQueue.getSubscriberCount("test_1");
    await publisher.publish("test_1", "test");
    await pubsubQueue.close();
    expect(subscriberCount).toBe(1);
    expect(callback).toHaveBeenCalledWith('"test"');
  }, 5000);
});

