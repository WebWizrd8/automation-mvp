import { Worker } from "worker_threads";
import { PubSubConsumer } from "../producers/queue";
import { getLogger } from "../utils/logger";

interface WorkerDetails {
  worker: Worker;
  status: "created" | "running" | "stopped";
  triggerId: string;
}

const logger = getLogger("DataConsumerWorkerManager");

export class DataConsumerWorkerManager {
  private workers: Map<string, WorkerDetails> = new Map();

  constructor(private pubSubQueue: PubSubConsumer) {
    this.pubSubQueue = pubSubQueue;
  }

  async create(id: string, triggerRequestId: string): Promise<string> {
    logger.info(`Creating consumer worker for trigger ${triggerRequestId}`);
    const worker = new Worker("./dist/consumers/consumer_worker.js", {
      workerData: {
        triggerId: triggerRequestId,
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
      triggerId: triggerRequestId,
    };
    this.workers.set(id, workerDetails);
    logger.info(`Created consumer worker for trigger ${triggerRequestId}`);
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
