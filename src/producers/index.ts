import DataProducer from "./producer";
import DataFetcher from "../fetchers/data-fetcher";
import HttpFetcher from "../fetchers/http-fetcher";
import { BufferLike } from "../fetchers/types";
import { DefinedProviderHttpApi } from "../providers/defined";
import { Worker } from "worker_threads";

export class DataProducerWokerManager {
  private workers: Map<string, Worker> = new Map();

  constructor(private pubSubQueue: PubSubQueue) {
    this.pubSubQueue = pubSubQueue;
  }

  create(id: string, endpoint: Endpoint) {
    const worker = new Worker("./producer_worker.ts", {
      workerData: {
        endpoint,
      },
    });
    worker.on("message", (message) => {
      console.log(`Message from worker ${id}: ${message}`);
      this.onMessageFromProducer(message);
    });
    worker.on("error", (err) => {
      console.log(`Error from worker ${id}: ${err}`);
    });
    this.workers.set(id, worker);
  }

  onMessageFromProducer(message: string) {
    this.pubSubQueue.publish(message);
  }
}

export class PubSubQueue {
  constructor() {}
  publish(data: BufferLike) {}
}

export class Endpoint {
  constructor(
    public id: number,
    public name: string,
    public providerId: number,
  ) {}

  getFetcher(): DataFetcher<BufferLike> {
    fetcherFromEndpoint(this);
  }
}

function fetcherFromEndpoint(endpoint: Endpoint): DataFetcher<BufferLike> {
  if (endpoint.name === "getTokenPrices") {
    DefinedProviderHttpApi.getTokenPrice();
  }
}
