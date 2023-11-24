import { ApiProvider } from "../providers";

import DataFetcher from "../fetchers/data-fetcher";
import { BufferLike } from "../fetchers/types";
import { DefinedProviderHttpApi } from "../providers/defined";

export class TriggerRequest {
  public subscribeCmd: BufferLike;
  constructor(
    public id: number,
    public triggerId: number,
    public chainId: number,
    public endpointId: number,
    public input: string,
  ) {
    this.subscribeCmd = "";
  }

  getTriggerId(): number {
    return this.id;
  }

  getChainId(): number {
    return this.chainId;
  }

  getEndpointId(): number {
    return this.endpointId;
  }

  getFethcher(): DataFetcher<BufferLike> {
    return fetcherFromTriggerRequest(this);
  }

  getInput(): string {
    return this.input;
  }
}

function fetcherFromTriggerRequest(
  req: TriggerRequest,
): DataFetcher<BufferLike> {
  const chainId = req.getChainId();
  const endpointId = req.getEndpointId();
  const endpoint = new Endpoint(endpointId);
  return endpoint.provider.getFetcher(
    endpoint.getName(),
    chainId,
    req.getInput(),
  );
}

export class Endpoint {
  public provider: ApiProvider;
  public name: string;

  constructor(public endpointId: number) {
    this.provider = new DefinedProviderHttpApi();
    this.name = "getTokenPrices";
  }

  getName(): string {
    return this.name;
  }
}
