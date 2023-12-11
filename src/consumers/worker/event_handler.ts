import { find_matching_actions } from "../../db/functions";
import { handleActions } from "../alert_handler";
import {
  EventFetchRequestRecord,
  getEventFetchRequestFunctionFromFetchRequestId,
  getEventTagRecordFromId,
} from "../../db/event";
import { Prisma, PrismaClient } from "@prisma/client";
import { getLogger } from "../../utils/logger";

const dbClient = new PrismaClient({ log: ["query"] });

const logger = getLogger("consumer/woker/event_handler");

async function saveTokenPrice(
  eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  const sqlQuery = Prisma.sql`INSERT INTO token_prices ("chain_id", "token_address", "priceUsd", "timestamp") VALUES (${eventFetchRequestRecord.chain_id}, '${message.address}', ${message.priceUsd}, to_timestamp(${message.timestamp})) ON CONFLICT DO NOTHING`;
  await dbClient.$executeRaw(sqlQuery);
}

export async function handleOnMessage(
  eventFetchRequestRecord: EventFetchRequestRecord,
  message: Record<string, unknown>,
) {
  const eventTagRecord = getEventTagRecordFromId(
    eventFetchRequestRecord.tag_id,
  );

  if (eventTagRecord.name === "GET_SPOT_PRICE") {
    try {
      await saveTokenPrice(eventFetchRequestRecord, message);
      //Get all event_fetch_request_trigger_function records for this event_fetch_request
      const eventFetchRequestFunctionRecords =
        await getEventFetchRequestFunctionFromFetchRequestId(
          eventFetchRequestRecord.id,
        );
      for (const eventFetchRequestFunctionRecord of eventFetchRequestFunctionRecords) {
        logger.info("EFRFR", eventFetchRequestFunctionRecord);
        if (
          eventFetchRequestFunctionRecord.function_name === "SPOT_PRICE_MATCH"
        ) {
          const filter = message;
          const alerts = await find_matching_actions(filter);
          logger.info("Alerts found", alerts);
          if (alerts) await handleActions(alerts, message, filter);
        } else if (
          eventFetchRequestFunctionRecord.function_name === "SPOT_PRICE_CHANGE"
        ) {
          //Get timestamp of 90d ago from now and get all token_prices from that timestamp to now
          const now = new Date();
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(now.getDate() - 90);
          const tokenPrices = await dbClient.token_prices.findMany({
            where: {
              chain_id: eventFetchRequestRecord.chain_id,
              token_address: message.address as string,
              timestamp: {
                gte: ninetyDaysAgo,
              },
            },
          });
          //Sort tokenPrices by timestamp in ascending order
          tokenPrices.sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
          );
          logger.info(`tokenPrices Length ${tokenPrices.length}`);
          logger.info("tokenPrices", tokenPrices[tokenPrices.length - 1]);

          //From the token_prices, get prices at 1d, 7d, 30d, 60d, 90d
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
          const filters = Object.entries(priceMaps).map(([key, prices]) => {
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
              change_percentage: Math.abs(priceChangePercentage),
              changeUsd: Math.abs(priceChangeUsd),
              direction: priceChangeUsd > 0 ? "UP" : "DOWN",
            };
            return filter;
          });

          //For each filter, find matching alerts
          for (const filter of filters) {
            const alerts = await find_matching_actions(filter);
            logger.info("Alerts found", alerts);
            if (alerts) await handleActions(alerts, message, filter);
          }
        }
      }
    } catch (error) {
      logger.error("failed to save spot price", error);
    }
  }
}
