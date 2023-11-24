import axios, { AxiosRequestConfig } from "axios";
import DataFetcher from "./data-fetcher";
import { EventEmitter } from "events";
import { CronJob } from "cron";
import { BufferLike, Callback } from "./types";

export default class HttpFetcher<ResType> extends DataFetcher<ResType> {
  axoisConfig: AxiosRequestConfig;
  cronPattern?: string;
  eventEmitter: EventEmitter;
  task: CronJob | null;

  constructor(axiosConfig: AxiosRequestConfig, cronPattern?: string) {
    super();
    this.axoisConfig = axiosConfig;
    this.cronPattern = cronPattern;
    this.eventEmitter = new EventEmitter();
    this.task = null;
  }

  async startFetching(_subscribeCmd: BufferLike) {
    if (this.task) {
      console.warn("Fetcher is already scheduled");
      return;
    }
    if (!this.cronPattern) {
      await this.fetchData();
      return;
    }
    console.log("Starting fetcher...");
    this.task = new CronJob(
      this.cronPattern,
      () => {
        this.fetchData();
      },
      null,
      true,
    );
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
      this.eventEmitter.emit("data", response.data); // Emit the fetched data
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
