//Disable no-case-declarations lint
/* eslint-disable no-case-declarations */
import { parentPort, workerData } from "worker_threads";
import { find_matching_alerts } from "../db/functions";
import { getLogger } from "../utils/logger";
import { handleAlerts } from "./alert_handler";
import {
  getEventFetchRequestRecordFromId,
  getEventFetchRequestTriggerFunctionRecordFromId,
  getEventTagRecordFromId,
} from "../db/event";
import { PrismaClient } from "@prisma/client";

const dbClient = new PrismaClient();

const {
  eventFetchRequestTriggerFunctionId,
}: { eventFetchRequestTriggerFunctionId: string } = workerData;

const logger = getLogger("consumer_worker");

logger.info(
  `Consumer worker started for id: ${eventFetchRequestTriggerFunctionId}`,
);

const eventFetchRequestFunctionRecord =
  getEventFetchRequestTriggerFunctionRecordFromId(
    Number.parseInt(eventFetchRequestTriggerFunctionId),
  );

const eventFetchRequestRecord = getEventFetchRequestRecordFromId(
  eventFetchRequestFunctionRecord.event_fetch_request_id,
);

const eventTagRecord = getEventTagRecordFromId(eventFetchRequestRecord.tag_id);

const run = () => {
  if (parentPort) {
    parentPort.on("message", async (message) => {
      switch (message.type) {
        case "start":
          break;
        case "message":
          logger.info("Received message from producer", message.message);

          // Find all alerts that are interested in this message
          try {
            const messageJson: Record<string, unknown> = JSON.parse(
              message.message,
            );

            if (eventTagRecord.name === "GET_SPOT_PRICE") {
              try {
                await dbClient.token_prices.create({
                  data: {
                    chain_id: eventFetchRequestRecord.chain_id,
                    token_address: messageJson.address as string,
                    priceUsd: messageJson.priceUsd as number,
                    timestamp: new Date(messageJson.timestamp as string),
                  },
                });
              } catch (error) {
                logger.error("failed to save spot price", error);
              }
            }

            //TODO: how to process input by passing it to the function? then how to use the output to find matching alerts?
            const alerts = await find_matching_alerts(messageJson);
            logger.info("Alerts found", alerts);
            if (alerts) await handleAlerts(alerts, messageJson);
          } catch (error) {
            logger.error("failed to handle message", error);
            break;
          }
          break;
        case "shutdown":
          logger.info("Shutting down worker");
          // Clean up and close the worker
          process.exit(0);
      }
    });
  } else {
    console.error("This worker must be run as a thread from worker_threads");
  }
};

run();
