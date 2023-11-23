import DataProducer, { PubSubQueue, Endpoint } from ".";
import mockAxios from "jest-mock-axios";
import { EVMChainId } from "../chains/types";

describe("DefinedProvider", () => {
  let producer: DataProducer;

  beforeAll(() => {
    const pubsubQueue = new PubSubQueue();
    const endpoint = new Endpoint(1, "getTokenPrices", 2);
    producer = new DataProducer(pubsubQueue, endpoint);
  });

  it("should produce data", async () => {
    producer.start();
  });
});
