import { ApiHttpInput, ApiWsInput } from "../providers";

import DataFetcher from "../fetchers/data-fetcher";
import { BufferLike } from "../fetchers/types";
import { getLogger } from "../utils/logger";
import { getNewBlocksChannel } from "../producers/types";
import { Endpoint } from "../endpoints";
import { ConnectionType, getEndpointRecordFromId } from "../db/endpoint";
import {
  EventFetchRequestRecord,
  getEventFetchRequestRecordFromId,
} from "../db/event";

const logger = getLogger("EventFetchRequest");

export class EventFetchRequest {
  record: EventFetchRequestRecord;

  constructor(id: number) {
    this.record = getEventFetchRequestRecordFromId(id);
  }

  getEventTagId(): number {
    return this.record.tag_id;
  }

  getChainId(): number {
    return this.record.chain_id;
  }

  getEndpointId(): number {
    const chainId = this.getChainId();
    const tagId = this.getEventTagId();
    const endpointRecord = getEndpointRecordFromId(this.record.endpoint_id);
    return this.record.endpoint_id;
  }

  getFethcher(): DataFetcher<BufferLike> {
    return fetcherFromEventFetchRequest(this);
  }

  getInput(): ApiHttpInput | ApiWsInput {
    const endpointRecord = getEndpointRecordFromId(this.endpointId);
    if (endpointRecord.connection_kind === ConnectionType.WS) {
      return { input: this.input };
    } else {
      const newBlockChannelId = getNewBlocksChannel(this.chainId);
      return { input: this.input, channelIdForTick: newBlockChannelId };
    }
  }
}

function fetcherFromEventFetchRequest(
  req: EventFetchRequest,
): DataFetcher<BufferLike> {
  const chainId = req.getChainId();
  const endpointId = req.getEndpointId();
  const endpoint = new Endpoint(endpointId);
  logger.debug(`Fetching data for ${endpoint.getName()}`);
  return endpoint.provider.getConnectionConfig(
    endpoint.getName(),
    chainId,
    endpoint.getConnectionType(),
    req.getInput(),
  );
}
