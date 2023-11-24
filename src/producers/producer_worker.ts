import { parentPort, workerData } from "worker_threads";
import { Endpoint } from "./index";
import DataProducer from "./producer";

const { endpoint } = workerData;
Object.setPrototypeOf(endpoint, Endpoint.prototype);

console.log(`Worker received endpoint: ${JSON.stringify(endpoint, null, 2)}`);
if (parentPort) {
  const producer = new DataProducer(endpoint);
  parentPort.on("message", (message) => {
    switch (message.type) {
      case "start":
        producer.start(
          parentPort!.postMessage.bind(parentPort),
          parentPort!.postMessage.bind(parentPort),
        );
        break;
      case "shutdown":
        // Clean up and close the worker
        process.exit(0);
        break;
    }
  });
  parentPort.postMessage("DONE");
} else {
  console.error("This worker must be run as a thread from worker_threads");
}
