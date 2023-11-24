import { DataProducerWokerManager } from ".";
import DataProducer from "./producer";
import mockAxios from "jest-mock-axios";
import { EVMChainId } from "../chains/types";
import { PubSubQueue } from "./queue";
import { Endpoint, TriggerRequest } from "./types";
import { GetTokenPricesInput } from "../providers/defined";

describe("DefinedProvider", () => {
  let manager: DataProducerWokerManager;
  let producer: DataProducer;

  beforeAll(() => {
    const pubsubQueue = new PubSubQueue();
    manager = new DataProducerWokerManager(pubsubQueue);
  });

  it("should produce data", async () => {
    const getTokenPricersInput: GetTokenPricesInput = {
      token: "0x6b175474e89094c44da98b954eedeac495271d0f",
      networkId: 1,
    };
    const id = manager.create(
      "test_1",
      new TriggerRequest(1, 2, 1, 1, JSON.stringify(getTokenPricersInput)),
    );
    console.log(`Created worker with id: ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Finishing Test");
  });
});
