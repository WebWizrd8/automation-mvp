//Disable no-case-declarations lint
/* eslint-disable no-case-declarations */
import "dotenv/config";
import { parentPort, workerData } from "worker_threads";
import { getLogger } from "../../utils/logger";
import { handleOnMessage } from "./event_handler";
import { EventFetchRequestRecord } from "../../db/event";

export interface ConsumerWorkerData {
  eventFetchRequestRecord: EventFetchRequestRecord;
}

const logger = getLogger("consumer_worker");

const run = () => {
  let messageCount = 0;
  const { eventFetchRequestRecord }: ConsumerWorkerData = workerData;
  Object.setPrototypeOf(
    eventFetchRequestRecord,
    EventFetchRequestRecord.prototype,
  );
  logger.info(`Consumer worker started with data`, eventFetchRequestRecord);
  if (parentPort) {
    parentPort.on("message", async (message) => {
      console.log("Message received", message);
      switch (message.type) {
        case "start":
          break;
        case "message":
          messageCount++;
          if (messageCount === 1) {
            //First message is ack from defined.fi for subscription, which we ignore
            logger.info("Received first message from producer, ignoring");
            break;
          }
          logger.info(
            `Received message (${messageCount}) from producer`,
            message.message,
          );

          // Find all alerts that are interested in this message
          try {
            const messageParsed: Record<string, unknown> = JSON.parse(
              message.message,
            );

            await handleOnMessage(eventFetchRequestRecord, messageParsed);
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
