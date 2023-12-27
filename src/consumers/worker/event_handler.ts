import { find_matching_actions } from "../../db/functions";
import { handleActions } from "../action_handler";
import {
  EventFetchRequestRecord,
  EventFetchRequestTriggerFunctionName,
  EventFetchRequestTriggerFunctionRecord,
  EventTagName,
  getEventFetchRequestFunctionFromFetchRequestId,
  getEventTagRecordFromId,
} from "../../db/event";
import { Prisma } from "@prisma/client";
import { getLogger } from "../../utils/logger";
import dbClient from "../../utils/db-client";
import { format } from "date-fns";
import _ from "lodash";

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

async function handleSpotPriceMatchEvents(
  eventFetchRequestFunctionRecords: EventFetchRequestTriggerFunctionRecord[],
  _eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  try {
    for (const eventFetchRequestFunctionRecord of eventFetchRequestFunctionRecords) {
      logger.info(
        "eventFetchRequestFunctionRecord",
        eventFetchRequestFunctionRecord,
      );
      if (
        eventFetchRequestFunctionRecord.function_name ===
        EventFetchRequestTriggerFunctionName.SPOT_PRICE_MATCH
      ) {
        const filter = message;
        await findAndHandleActions([filter], message);
      }
    }
  } catch (error) {
    logger.error("failed to handle message", error);
  }
}

async function handleSpotPriceChangeEvents(
  eventFetchRequestFunctionRecords: EventFetchRequestTriggerFunctionRecord[],
  eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  try {
    for (const eventFetchRequestFunctionRecord of eventFetchRequestFunctionRecords) {
      logger.info(
        "eventFetchRequestFunctionRecord",
        eventFetchRequestFunctionRecord,
      );
      if (
        eventFetchRequestFunctionRecord.function_name ===
          EventFetchRequestTriggerFunctionName.SPOT_PRICE_INCREASE ||
        eventFetchRequestFunctionRecord.function_name ===
          EventFetchRequestTriggerFunctionName.SPOT_PRICE_DECREASE
      ) {
        //From the token_prices, get prices at 1d, 7d, 30d, 60d, 90d
        const priceMaps = await getPricesByStandardWindows(
          eventFetchRequestRecord.chain_id,
          message.address as string,
        );

        const filters = Object.entries(priceMaps)
          .map(([key, prices]) => {
            const firstPrice = prices[0];
            const lastPrice = prices[prices.length - 1];
            const priceChangeUsd = lastPrice.priceUsd - firstPrice.priceUsd;
            const priceChangePercentage =
              (priceChangeUsd * 100) / firstPrice.priceUsd;

            logger.info(
              `price change for  ${message.address} in ${key}`,
              priceChangeUsd,
              priceChangePercentage,
            );

            const filter = {
              token_address: message.address as string,
              chain_id: eventFetchRequestRecord.chain_id,
              duration: key,
              change_percentage: priceChangePercentage,
              changeUsd: priceChangeUsd,
              direction: priceChangeUsd >= 0 ? "UP" : "DOWN",
            };
            return filter;
          })
          .filter((filter) => {
            if (
              eventFetchRequestFunctionRecord.function_name ===
              EventFetchRequestTriggerFunctionName.SPOT_PRICE_INCREASE
            ) {
              return filter.direction === "UP";
            }
            if (
              eventFetchRequestFunctionRecord.function_name ===
              EventFetchRequestTriggerFunctionName.SPOT_PRICE_DECREASE
            ) {
              return filter.direction === "DOWN";
            }
          });
        await findAndHandleActions(filters, message);
      }
    }
  } catch (error) {
    logger.error("failed to handle message", error);
  }
}

async function handleMovingAverageChangeEvents(
  eventFetchRequestFunctionRecords: EventFetchRequestTriggerFunctionRecord[],
  eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  try {
    for (const eventFetchRequestFunctionRecord of eventFetchRequestFunctionRecords) {
      if (
        eventFetchRequestFunctionRecord.function_name ===
          EventFetchRequestTriggerFunctionName.MA_ABOVE ||
        eventFetchRequestFunctionRecord.function_name ===
          EventFetchRequestTriggerFunctionName.MA_BELOW
      ) {
        //From the token_prices, get prices at 1d, 7d, 30d, 60d, 90d
        const tokenPrices = await getNinetyDayPrices(
          eventFetchRequestRecord.chain_id,
          message.address as string,
        );

        const movingAverages = calculateStandardMovingAverages(tokenPrices);

        const filters = Array.from(movingAverages, ([key, movingAverage]) => {
          logger.info(
            `MA for  ${message.address} in ${key}: ${
              movingAverage[movingAverage.length - 1]
            }`,
          );

          const filter = {
            token_address: message.address as string,
            chain_id: eventFetchRequestRecord.chain_id,
            duration: key,
            moving_average: movingAverage[movingAverage.length - 1],
          };
          return filter;
        });
        console.log("filters", filters);
        await findAndHandleActions(filters, message);
      }
    }
  } catch (error) {
    logger.error("failed to handle message", error);
  }
}

function calculateStandardMovingAverages(
  data: { priceUsd: number; timestamp: Date }[],
) {
  const movingAverages = new Map<string, number[]>();
  const windowSizes = [1, 7, 30, 60, 90];
  for (const windowSize of windowSizes) {
    const movingAverage = calculateMovingAverage(data, windowSize);
    movingAverages.set(`${windowSize}D`, movingAverage);
  }
  return movingAverages;
}

function calculateMovingAverage(
  data: { priceUsd: number; timestamp: Date }[],
  windowSize: number,
): number[] {
  const movingAverages = [];
  //Sum priceUsd for each days using timestamp
  const pricesByDay = _.groupBy(data, (price) => {
    return format(price.timestamp, "yyyy-MM-dd");
  });
  const averagePricesByDay = _.mapValues(pricesByDay, (prices) => {
    const sum = _.sumBy(prices, "priceUsd");
    return sum / prices.length;
  });

  const keys = Object.keys(averagePricesByDay);
  for (let i = windowSize - 1; i < keys.length; i++) {
    let sum = 0;
    for (let j = i; j > i - windowSize; j--) {
      sum += averagePricesByDay[keys[j]];
    }
    movingAverages.push(sum / windowSize);
  }

  return movingAverages;
}

async function getNinetyDayPrices(
  chainId: number,
  tokenAddress: string,
  now: Date = new Date(),
) {
  //Get timestamp of 90d ago from now and get all token_prices from that timestamp to now
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 90);
  const tokenPrices = await dbClient.token_prices.findMany({
    where: {
      chain_id: chainId,
      token_address: tokenAddress,
      timestamp: {
        gte: ninetyDaysAgo,
      },
    },
  });
  //Sort tokenPrices by timestamp in ascending order
  tokenPrices.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  logger.info(`tokenPrices Length ${tokenPrices.length}`);
  logger.info("tokenPrices", tokenPrices[tokenPrices.length - 1]);
  return tokenPrices;
}

async function getPricesByStandardWindows(
  chainId: number,
  tokenAddress: string,
) {
  //Get timestamp of 90d ago from now and get all token_prices from that timestamp to now
  const now = new Date();
  const tokenPrices = await getNinetyDayPrices(chainId, tokenAddress, now);
  //Sort tokenPrices by timestamp in ascending order
  tokenPrices.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  logger.info(`tokenPrices Length ${tokenPrices.length}`);
  logger.info("tokenPrices", tokenPrices[tokenPrices.length - 1]);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(now.getDate() - 1);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  const oneDayPrices = tokenPrices.filter(
    (tokenPrice) => tokenPrice.timestamp >= oneDayAgo,
  );
  const sevenDayPrices = tokenPrices.filter(
    (tokenPrice) => tokenPrice.timestamp >= sevenDaysAgo,
  );
  const thirtyDayPrices = tokenPrices.filter(
    (tokenPrice) => tokenPrice.timestamp >= thirtyDaysAgo,
  );
  const sixtyDayPrices = tokenPrices.filter(
    (tokenPrice) => tokenPrice.timestamp >= sixtyDaysAgo,
  );
  const ninetyDayPrices = tokenPrices;

  //Calculate price change from 1d, 7d, 30d, 60d, 90d
  const priceMaps = {
    "1D": oneDayPrices,
    "7D": sevenDayPrices,
    "30D": thirtyDayPrices,
    "60D": sixtyDayPrices,
    "90D": ninetyDayPrices,
  };
  return priceMaps;
}

async function findAndHandleActions(
  filters: Record<string, unknown>[],
  message: Record<string, unknown>,
) {
  //For each filter, find matching alerts
  for (const filter of filters) {
    try {
      const actions = await find_matching_actions(filter);
      logger.info("Alerts found", actions);
      if (actions) await handleActions(actions, message, filter);
    } catch (error) {
      logger.error("failed to handle message", error);
    }
  }
}
