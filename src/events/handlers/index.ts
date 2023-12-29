import {
  EventFetchRequestRecord,
  EventFetchRequestTriggerFunctionName,
  EventTagName,
  getEventFetchRequestFunctionFromFetchRequestId,
  getEventTagRecordFromId,
} from "../../db/event";
import { Prisma } from "@prisma/client";
import { getLogger } from "../../utils/logger";
import dbClient from "../../utils/db-client";
import _ from "lodash";
import { handleMovingAverageChangeEvents } from "./spot_price/moving_averages";
import { handleSpotPriceMatchEvents } from "./spot_price/price_match";
import { handleSpotPriceChangeEvents } from "./spot_price/price_change";

const logger = getLogger("consumer/woker/event_handler");

export async function handleOnMessage(
  eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  const eventTagRecord = await getEventTagRecordFromId(
    eventFetchRequestRecord.tag_id,
  );
  if (eventTagRecord.name === EventTagName.GET_SPOT_PRICE) {
    await handleSpotPriceEvent(eventFetchRequestRecord, message);
  }
}

async function saveTokenPrice(
  eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  try {
    const sqlQuery = Prisma.sql`INSERT INTO token_prices ("chain_id", "token_address", "priceUsd", "timestamp") VALUES (${eventFetchRequestRecord.chain_id}, ${message.address}, ${message.priceUsd}, to_timestamp(${message.timestamp})) ON CONFLICT DO NOTHING`;
    await dbClient.$executeRaw(sqlQuery);
  } catch (error) {
    logger.error("failed to save spot price", error);
  }
}

async function handleSpotPriceEvent(
  eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  try {
    await saveTokenPrice(eventFetchRequestRecord, message);
    //Get all event_fetch_request_trigger_function records for this event_fetch_request
    const eventFetchRequestFunctionRecords =
      await getEventFetchRequestFunctionFromFetchRequestId(
        eventFetchRequestRecord.id,
      );

    //handle simple price match
    const priceMatchRecords = eventFetchRequestFunctionRecords.filter(
      (eventFetchRequestFunctionRecord) =>
        eventFetchRequestFunctionRecord.function_name ===
        EventFetchRequestTriggerFunctionName.SPOT_PRICE_MATCH,
    );
    await handleSpotPriceMatchEvents(
      priceMatchRecords,
      eventFetchRequestRecord,
      message,
    );

    //handle spot price change
    const priceChangeRecords = eventFetchRequestFunctionRecords.filter(
      (eventFetchRequestFunctionRecord) =>
        eventFetchRequestFunctionRecord.function_name ===
          EventFetchRequestTriggerFunctionName.SPOT_PRICE_INCREASE ||
        EventFetchRequestTriggerFunctionName.SPOT_PRICE_DECREASE,
    );
    await handleSpotPriceChangeEvents(
      priceChangeRecords,
      eventFetchRequestRecord,
      message,
    );

    const movingAverageRecords = eventFetchRequestFunctionRecords.filter(
      (eventFetchRequestFunctionRecord) =>
        eventFetchRequestFunctionRecord.function_name ===
          EventFetchRequestTriggerFunctionName.MA_ABOVE ||
        EventFetchRequestTriggerFunctionName.MA_BELOW,
    );

    await handleMovingAverageChangeEvents(
      movingAverageRecords,
      eventFetchRequestRecord,
      message,
    );
  } catch (error) {
    logger.error("failed to handle message", error);
  }
}
