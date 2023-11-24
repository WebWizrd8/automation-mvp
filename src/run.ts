import "dotenv/config";
import { DataProducerWokerManager } from "./producers";
import { PubSubQueue } from "./producers/queue";
import { GetTokenPricesInput } from "./providers/defined";
import { TriggerRequest } from "./producers/types";

const run = async () => {
  const pubsubQueue = new PubSubQueue();
  const manager = new DataProducerWokerManager(pubsubQueue);

  const getTokenPricersInput: GetTokenPricesInput = {
    token: "0x6b175474e89094c44da98b954eedeac495271d0f",
    networkId: 1,
  };
  const id = manager.create(
    "test_1",
    new TriggerRequest(1, 2, 1, 1, JSON.stringify(getTokenPricersInput)),
  );
  console.log(`Created worker with id: ${id}`);
  manager.start(id);
  await new Promise((resolve) => setTimeout(resolve, 10000));
  manager.stop(id);

  console.log("Finishing Test");
};

run();
