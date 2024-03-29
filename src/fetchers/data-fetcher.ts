import { BufferLike, Callback } from "./types";

// Base Interface
interface IDataFetcher<ResType> {
  onData(callback: Callback<ResType>): void;
  onError(callback: Callback<ResType>): void;
  startFetching(): Promise<void>;
  stopFetching(): void;
}

// Base Class
export default abstract class DataFetcher<T> implements IDataFetcher<T> {
  abstract onData(callback: Callback<T>): void;
  abstract onError(callback: Callback<T>): void;
  abstract startFetching(): Promise<void>;
  abstract stopFetching(): void;
}

export abstract class PubSubDataFetcher<T> extends DataFetcher<T> {
  abstract sendData(data: BufferLike): void;
}
