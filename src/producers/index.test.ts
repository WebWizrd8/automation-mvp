import { PubSubQueue, Endpoint, DataProducerWokerManager } from ".";
import DataProducer from "./producer";
import mockAxios from "jest-mock-axios";
import { EVMChainId } from "../chains/types";

describe("DefinedProvider", () => {
  let manager: DataProducerWokerManager;

  beforeAll(() => {
    const pubsubQueue = new PubSubQueue();

    const endpoint = new Endpoint(1, "getTokenPrices", 2);
    producer = new DataProducer(pubsubQueue, endpoint);
  });

  it("should produce data", async () => {
    producer.start();
  });
});
