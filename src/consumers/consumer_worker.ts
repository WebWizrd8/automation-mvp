//Disable no-case-declarations lint
/* eslint-disable no-case-declarations */
import { parentPort, workerData } from "worker_threads";
import { find_matching_alerts } from "../db/functions";

const { triggerId }: { triggerId: string } = workerData;

console.log(`Consumer worker received id: ${triggerId}`);

const run = () => {
  if (parentPort) {
    parentPort.on("message", async (message) => {
      switch (message.type) {
        case "start":
          console.log("Starting worker");
          console.log("Worker started");
          break;
        case "message":
          console.log("Received message from producer", message.message);
          // Find all alerts that are interested in this message
          const alerts = await find_matching_alerts(message.message);
          console.log("Alerts found", alerts);
          //TODO: Send alerts to alerting system

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
