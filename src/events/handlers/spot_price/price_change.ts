import _ from "lodash";
import { getLogger } from "../../../utils/logger";
import {
  EventFetchRequestRecord,
  EventFetchRequestTriggerFunctionName,
  EventFetchRequestTriggerFunctionRecord,
} from "../../../db/event";
import { findAndHandleActions } from "../../../actions";
import { getPricesByStandardWindows } from ".";

const logger = getLogger("spot_price/price_change");

export async function handleSpotPriceChangeEvents(
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
