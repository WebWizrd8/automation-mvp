import "dotenv/config";
import { parentPort, workerData } from "worker_threads";
import DataProducer from "./producer";
import { EventFetchRequestRecord } from "../db/event";
import { EventFetchRequest } from "../events";
import { getLogger } from "../utils/logger";

export interface ProducerWorkerData {
  eventFetchRequestRecord: EventFetchRequestRecord;
}

const { eventFetchRequestRecord }: ProducerWorkerData = workerData;
Object.setPrototypeOf(
  eventFetchRequestRecord,
  EventFetchRequestRecord.prototype,
);

const logger = getLogger("producer_worker.ts");

logger.info(`Producer worker started with data`, eventFetchRequestRecord);

const run = async () => {
  if (parentPort) {
    const eventFetchRequest = await EventFetchRequest.fromRecord(
      eventFetchRequestRecord,
    );

    const producer = new DataProducer(eventFetchRequest);
    parentPort.on("message", async (message) => {
      switch (message.type) {
        case "start":
          console.log("Starting worker");
          try {
            await producer.start(
              parentPort!.postMessage.bind(parentPort),
              parentPort!.postMessage.bind(parentPort),
            );
          } catch (e) {
            console.log(e);
          }
          console.log("Worker started");
          break;
        case "shutdown":
          console.log("Shutting down worker");
          // Clean up and close the worker
          process.exit(0);
      }
    });
  } else {
    console.error("This worker must be run as a thread from worker_threads");
  }
};

run().catch((e) => {
  logger.error("Worker failed with:", e);
  process.exit(1);
});
