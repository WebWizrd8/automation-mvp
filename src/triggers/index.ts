import ApiProvider, { ApiHttpInput, ApiWsInput } from "../providers";

import DataFetcher from "../fetchers/data-fetcher";
import { BufferLike } from "../fetchers/types";
import { getEndpointFromId, getProviderFromId } from "../db";
import { getLogger } from "../utils/logger";
import { getNewBlocksChannel } from "../producers/types";

const logger = getLogger("TriggerRequest");

export class TriggerRequest {
  constructor(
    public id: number,
    public triggerId: number,
    public chainId: number,
    public endpointId: number,
    public input: string,
  ) {}

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

  getInput(): ApiHttpInput | ApiWsInput {
    const endpoint = getEndpointFromId(this.endpointId);
    if (endpoint.type === "ws") {
      return { input: this.input };
    } else {
      const newBlockChannelId = getNewBlocksChannel(this.chainId);
      return { input: this.input, channelIdForTick: newBlockChannelId };
    }
  }
}

function fetcherFromTriggerRequest(
  req: TriggerRequest,
): DataFetcher<BufferLike> {
  const chainId = req.getChainId();
  const endpointId = req.getEndpointId();
  const endpoint = new Endpoint(endpointId);
  logger.debug(`Fetching data for ${endpoint.getName()}`);
  return endpoint.provider.getFetcher(
    endpoint.getName(),
    chainId,
    endpoint.type,
    req.getInput(),
  );
}

export class Endpoint {
  public provider: ApiProvider;
  public name: string;
  public type: string;

  constructor(public endpointId: number) {
    const { provider, name, type } = getEndpointFromId(endpointId);
    this.provider = getProviderFromId(provider);
    console.log("this.provider", this.provider.getUrl(0));
    this.name = name;
    this.type = type;
  }

  getName(): string {
    return this.name;
  }
}
