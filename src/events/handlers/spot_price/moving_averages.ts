import { format } from "date-fns";
import _ from "lodash";
import { getLogger } from "../../../utils/logger";
import {
  EventFetchRequestRecord,
  EventFetchRequestTriggerFunctionName,
  EventFetchRequestTriggerFunctionRecord,
} from "../../../db/event";
import { findAndHandleActions } from "../../../actions";
import { getAllPrices } from ".";

const logger = getLogger("spot_price/moving_averages");

export async function handleMovingAverageChangeEvents(
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
        const tokenPrices = await getAllPrices(
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
