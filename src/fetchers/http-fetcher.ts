import axios, { AxiosRequestConfig } from "axios";
import DataFetcher from "./data-fetcher";
import { EventEmitter } from "events";
import { CronJob } from "cron";
import { Callback } from "./types";
import { PubSubConsumer, RedisPubSubSystem } from "../producers/queue";

export default class HttpFetcher<ResType> extends DataFetcher<ResType> {
  axoisConfig: AxiosRequestConfig;
  eventEmitter: EventEmitter;
  pubsubConsumer: PubSubConsumer;
  channelId: string;
  task: CronJob | null;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataProcessor?: (data: any) => ResType;

  constructor(
    axiosConfig: AxiosRequestConfig,
    channelId: string,
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataProcessor?: (data: any) => ResType,
  ) {
    super();
    this.axoisConfig = axiosConfig;
    this.eventEmitter = new EventEmitter();
    const pubsubQueue = new RedisPubSubSystem();
    this.pubsubConsumer = new PubSubConsumer(pubsubQueue);
    this.channelId = channelId;
    this.task = null;
    this.dataProcessor = dataProcessor;
  }

  async startFetching() {
    if (this.task) {
      console.warn("Fetcher is already scheduled");
      return;
    }

    console.log("Starting fetcher...");
    await this.pubsubConsumer.subscribe(this.channelId, async () => {
      await this.fetchData();
    });

    // this.task = new CronJob(
    //   this.cronPattern,
    //   async () => {
    //   },
    //   null,
    //   true,
    // );
    console.log("Fetcher scheduled");
  }

  stopFetching() {
    if (this.task) {
      this.task.stop();
      this.task = null;
    }
  }

  private async fetchData() {
    try {
      const response = await axios(this.axoisConfig);
      //console.log("HTTP Fetch Response:", response.data);
      let data;
      if (this.dataProcessor) {
        data = this.dataProcessor(response.data);
      } else {
        data = response.data;
      }
      this.eventEmitter.emit("data", data); // Emit the fetched data
    } catch (error) {
      console.error("HTTP Fetch Error:", error);
      this.eventEmitter.emit("error", error); // Emit an error event
    }
  }

  onData(callback: Callback<ResType>) {
    this.eventEmitter.on("data", callback);
  }

  onError(callback: Callback<ResType>) {
    this.eventEmitter.on("error", callback);
  }
}
