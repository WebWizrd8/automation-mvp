//Disable no-case-declarations lint
/* eslint-disable no-case-declarations */
import { parentPort, workerData } from "worker_threads";
import { find_matching_alerts } from "../db/functions";
import { getLogger } from "../utils/logger";
import { handleAlerts } from "./alert_handler";

const { triggerId }: { triggerId: string } = workerData;

const logger = getLogger("consumer_worker");

logger.info(`Consumer worker received id: ${triggerId}`);

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
            const messageJson: Record<string, any> = JSON.parse(message.message);
            const alerts = await find_matching_alerts(messageJson);
            logger.info("Alerts found", alerts);
            //TODO: Send alerts to alerting system
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
