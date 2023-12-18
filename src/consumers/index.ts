import { Worker } from "worker_threads";
import { PubSubConsumer } from "../producers/queue";
import { getLogger } from "../utils/logger";
import { ConsumerWorkerData } from "./worker";
import { EventFetchRequestRecord } from "../db/event";

interface WorkerDetails {
  worker: Worker;
  status: "created" | "running" | "stopped";
  eventFetchRequestRecord: EventFetchRequestRecord;
}

const logger = getLogger("DataConsumerWorkerManager");

export class DataConsumerWorkerManager {
  private workers: Map<string, WorkerDetails> = new Map();

  constructor(private pubSubQueue: PubSubConsumer) {
    this.pubSubQueue = pubSubQueue;
  }

  async create(
    id: string,
    eventFetchRequestRecord: EventFetchRequestRecord,
  ): Promise<string> {
    logger.info(
      `Creating consumer worker with following event data:`,
      eventFetchRequestRecord,
    );
    const worker = new Worker("./dist/consumers/worker/index.js", {
      workerData: {
        eventFetchRequestRecord,
      } as ConsumerWorkerData,
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
      eventFetchRequestRecord: eventFetchRequestRecord,
    };
    this.workers.set(id, workerDetails);
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
