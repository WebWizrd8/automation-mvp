import { DataConsumerWorkerManager } from "../consumers";
import { getNewConsumerId } from "../consumers/utils";
import {
  EventTagName,
  getAllEventFetchRequestRecordsForTag,
} from "../db/event";
import { DataProducerWorkerManager } from "../producers";
import {
  PubSubConsumer,
  PubSubPublisher,
  RedisPubSubSystem,
} from "../producers/queue";
import { getNewBlocksChannel } from "../producers/types";
import { getLogger } from "../utils/logger";
import { initThirdwebSDK } from "./thirdweb_engine";

const logger = getLogger("consumer/woker/event_handler");

const blockChannelIds = new Map<number, string>();
export function getNewBlockChannelId(chainId: number): string {
  if (blockChannelIds.has(chainId)) {
    return blockChannelIds.get(chainId)!;
  }
  const newBlockChannelId = getNewBlocksChannel(chainId);
  blockChannelIds.set(chainId, newBlockChannelId);
  return newBlockChannelId;
}

export async function initNewBlockListeners(
  manager: DataProducerWorkerManager,
) {
  const eventFetchRequestRecords = await getAllEventFetchRequestRecordsForTag(
    EventTagName.GET_NEW_BLOCKS,
  );

  logger.info(`Got ${eventFetchRequestRecords.length} GET_NEW_BLOCKS records`);

  for (const eventFetchRequestRecord of eventFetchRequestRecords) {
    const newBlockChannelId = getNewBlockChannelId(
      eventFetchRequestRecord.chain_id,
    );
    const id = manager.create(newBlockChannelId, eventFetchRequestRecord);
    manager.start(id);
  }
}

export async function initSpotPriceListeners(
  producerManager: DataProducerWorkerManager,
  consumerManager: DataConsumerWorkerManager,
) {
  const eventFetchRequestRecords = await getAllEventFetchRequestRecordsForTag(
    EventTagName.GET_SPOT_PRICE,
  );

  logger.info(`Got ${eventFetchRequestRecords.length} GET_SPOT_PRICE records`);

  for (const eventFetchRequestRecord of eventFetchRequestRecords) {
    const consumerId = getNewConsumerId(
      eventFetchRequestRecord.id,
      eventFetchRequestRecord.tag_id,
    );
    const id = producerManager.create(consumerId, eventFetchRequestRecord);
    const consumerWorkerId = await consumerManager.create(
      consumerId,
      eventFetchRequestRecord,
    );
    producerManager.start(id);
    producerIds.set(eventFetchRequestRecord.id, id);
    consumerIds.set(eventFetchRequestRecord.id, consumerWorkerId);
  }
}

const pubsubQueue = new RedisPubSubSystem();
const publisher = new PubSubPublisher(pubsubQueue);
const consumer = new PubSubConsumer(pubsubQueue);

const producerManager = new DataProducerWorkerManager(publisher);
const consumerManager = new DataConsumerWorkerManager(consumer);

const producerIds = new Map<number, string>();
const consumerIds = new Map<number, string>();

export async function initEngine() {
  await initThirdwebSDK();

  if (process.env.DISABLE_ENGINE === "true") {
    logger.info("Engine disabled");
    return;
  }

  await initNewBlockListeners(producerManager);
  await initSpotPriceListeners(producerManager, consumerManager);
}

export async function stopEngine() {
  for (const id of producerIds.values()) {
    producerManager.stop(id);
  }
  for (const id of consumerIds.values()) {
    consumerManager.stop(id);
  }
  await pubsubQueue.close();
}
