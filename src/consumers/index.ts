import { Worker } from "worker_threads";
import { PubSubConsumer } from "../producers/queue";
import { getLogger } from "../utils/logger";

interface WorkerDetails {
  worker: Worker;
  status: "created" | "running" | "stopped";
  eventFetchRequestId: string;
}

const logger = getLogger("DataConsumerWorkerManager");

export class DataConsumerWorkerManager {
  private workers: Map<string, WorkerDetails> = new Map();

  constructor(private pubSubQueue: PubSubConsumer) {
    this.pubSubQueue = pubSubQueue;
  }

  async create(id: string, eventFetchRequestId: string): Promise<string> {
    logger.info(`Creating consumer worker for trigger ${eventFetchRequestId}`);
    const worker = new Worker("./dist/consumers/consumer_worker.js", {
      workerData: {
        eventFetchRequestId,
      },
    });
    await this.pubSubQueue.subscribe(id, (message) => {
      logger.debug(`Sending message to consumer worker ${id}`, message);
      worker.postMessage({
        type: "message",
        message,
      });
    });
    const workerDetails: WorkerDetails = {
      worker,
      status: "created",
      eventFetchRequestId,
    };
    this.workers.set(id, workerDetails);
    logger.info(`Created consumer worker for trigger ${eventFetchRequestId}`);
    this.start(id);
    return id;
  }

  private start(id: string) {
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
}
