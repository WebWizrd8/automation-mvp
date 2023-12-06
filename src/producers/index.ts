import { Worker } from "worker_threads";
import { PubSubPublisher } from "./queue";
import { getLogger } from "../utils/logger";
import { EventFetchRequestRecord } from "../db/event";
import { ProducerWorkerData } from "./producer_worker";

export interface WorkerDetails {
  worker: Worker;
  status: string;
  eventFetchRequest: EventFetchRequestRecord;
}

const logger = getLogger("DataProducerWorkerManager");

export class DataProducerWorkerManager {
  private workers: Map<string, WorkerDetails> = new Map();

  constructor(private pubSubQueue: PubSubPublisher) {
    this.pubSubQueue = pubSubQueue;
  }

  create(id: string, eventFetchRequest: EventFetchRequestRecord): string {
    const worker = new Worker("./dist/producers/producer_worker.js", {
      workerData: {
        eventFetchRequest,
      } as ProducerWorkerData,
    });
    worker.on("message", async (message) => {
      logger.info(`Message from worker ${id}`, message);
      await this.onMessageFromProducer(id, message);
    });
    worker.on("error", (err) => {
      logger.info(`Error from worker ${id}: ${err}`);
    });
    const workerDetails: WorkerDetails = {
      worker,
      status: "created",
      eventFetchRequest: eventFetchRequest,
    };
    this.workers.set(id, workerDetails);
    return id;
  }

  start(id: string) {
    const workerDetails = this.workers.get(id);
    if (workerDetails?.status === "created") {
      workerDetails.worker.postMessage({
        type: "start",
      });
      workerDetails.status = "running";
    }
  }

  stop(id: string) {
    const workerDetails = this.workers.get(id);
    if (workerDetails) {
      workerDetails.worker.postMessage({ type: "shutdown" });
      workerDetails.status = "stopped";
    }
  }

  async onMessageFromProducer(channelId: string, message: string) {
    await this.pubSubQueue.publish(channelId, message);
  }
}
