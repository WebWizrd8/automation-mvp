import { parentPort, workerData } from "worker_threads";
import DataProducer from "./producer";
import { TriggerRequest } from "./types";

const { triggerRequest } = workerData;
Object.setPrototypeOf(triggerRequest, TriggerRequest.prototype);

console.log(
  `Worker received endpoint: ${JSON.stringify(triggerRequest, null, 2)}`,
);

if (parentPort) {
  const producer = new DataProducer(triggerRequest);
  parentPort.on("message", (message) => {
    switch (message.type) {
      case "start":
        console.log("Starting worker");
        producer.start(
          parentPort!.postMessage.bind(parentPort),
          parentPort!.postMessage.bind(parentPort),
          Buffer.from(triggerRequest.subscribeCmd, "utf-8"),
        );
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
