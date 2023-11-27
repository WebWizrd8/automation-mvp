import { parentPort, workerData } from "worker_threads";
import DataProducer from "./producer";
import { TriggerRequest } from "../triggers";

const { triggerRequest } = workerData;
Object.setPrototypeOf(triggerRequest, TriggerRequest.prototype);

console.log(
  `Worker received endpoint: ${JSON.stringify(triggerRequest, null, 2)}`,
);

const run = () => {
  if (parentPort) {
    const producer = new DataProducer(triggerRequest);
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

run();
