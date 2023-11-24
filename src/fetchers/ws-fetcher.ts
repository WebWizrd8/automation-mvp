import { PubSubDataFetcher } from "./data-fetcher";
import { EventEmitter } from "events";
import { BufferLike, Callback } from "./types";

const waitForOpenSocket = (socket: WebSocket) => {
  return new Promise((resolve) => {
    if (socket.readyState !== socket.OPEN) {
      socket.onopen = (_) => {
        resolve(_);
      };
    } else {
      resolve(null);
    }
  });
};

export default class WebSocketFetcher<T> extends PubSubDataFetcher<T> {
  private url: string;
  private eventEmitter: EventEmitter;
  ws: WebSocket | null;

  constructor(url: string) {
    super();
    this.url = url;
    this.eventEmitter = new EventEmitter();
    this.ws = null;
  }

  async connect(): Promise<void> {
    if (this.ws) {
      console.warn("WebSocket is already connected");
      return;
    }
    this.ws = new WebSocket(this.url);
    await waitForOpenSocket(this.ws!);

    this.ws!.onmessage = ({ data }) => {
      this.eventEmitter.emit("data", data);
    };

    this.ws!.onerror = (error) => {
      //console.error("WebSocket Error:", error);
      this.eventEmitter.emit("error", error);
    };

    this.ws!.onclose = (close) => {
      console.log("WebSocket closed:", {
        type: close.type,
        code: close.code,
        reason: close.reason,
        wasClean: close.wasClean,
      });
    };
  }

  onData(callback: Callback<T>): void {
    this.eventEmitter.on("data", callback);
  }

  onError(callback: Callback<T>): void {
    this.eventEmitter.on("error", callback);
  }

  async startFetching(subscribeCmd: BufferLike): Promise<void> {
    await this.connect();
    console.log("Sending subscribe command");
    this.sendData(subscribeCmd);
  }

  sendData(data: BufferLike): void {
    this.ws?.send(data);
  }

  stopFetching(): void {
    this.ws?.close();
    this.ws = null;
  }
}
