import { Worker } from "worker_threads";
import { PubSubQueue } from "./queue";
import { TriggerRequest } from "./types";
import { getLogger } from "../utils/logger";

export interface WorkerDetails {
  worker: Worker;
  status: string;
}

const logger = getLogger("DataProducerWokerManager");

export class DataProducerWokerManager {
  private workers: Map<string, WorkerDetails> = new Map();

  constructor(private pubSubQueue: PubSubQueue) {
    this.pubSubQueue = pubSubQueue;
  }

  create(id: string, triggerRequest: TriggerRequest): string {
    const worker = new Worker("./dist/producers/producer_worker.js", {
      workerData: {
        triggerRequest,
      },
    });
    worker.on("message", (message) => {
      logger.info(`Message from worker ${id}`, message);
      this.onMessageFromProducer(id, message);
    });
    worker.on("error", (err) => {
      logger.info(`Error from worker ${id}: ${err}`);
    });
    const workerDetails: WorkerDetails = {
      worker,
      status: "created",
    };
    this.workers.set(id, workerDetails);
    return id;
  }

  start(id: string) {
    const workerDetails = this.workers.get(id);
    if (workerDetails?.status === "created") {
      workerDetails.worker.postMessage({ type: "start" });
      workerDetails.status = "running";
    }
  }

  stop(id: string) {
    const workerDetails = this.workers.get(id);
    if (workerDetails?.status === "running") {
      workerDetails.worker.postMessage({ type: "shutdown" });
      workerDetails.status = "stopped";
    }
  }

  onMessageFromProducer(channelId: string, message: string) {
    this.pubSubQueue.publish(channelId, message);
  }
}
