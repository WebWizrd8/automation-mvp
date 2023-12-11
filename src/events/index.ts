import { ApiHttpInput, ApiWsInput } from "../providers";

import DataFetcher from "../fetchers/data-fetcher";
import { BufferLike } from "../fetchers/types";
import { getLogger } from "../utils/logger";
import { getNewBlocksChannel } from "../producers/types";
import { Endpoint } from "../endpoints";
import { ConnectionType, EndpointRecord } from "../db/endpoint";
import {
  EventFetchRequestRecord,
  getEndpointRecordFromFetchRequestId,
  getEventFetchRequestRecordFromId,
} from "../db/event";

const logger = getLogger("EventFetchRequest");

export class EventFetchRequest {
  record: EventFetchRequestRecord;
  endpointRecord: EndpointRecord;

  constructor(record: EventFetchRequestRecord) {
    this.record = record;
    this.endpointRecord = getEndpointRecordFromFetchRequestId(
      this.record.id,
      this.record.chain_id,
    );
  }

  static fromId(id: number): EventFetchRequest {
    const record = getEventFetchRequestRecordFromId(id);
    return new EventFetchRequest(record);
  }

  getEventTagId(): number {
    return this.record.tag_id;
  }

  getChainId(): number {
    return this.record.chain_id;
  }

  getEndpointId(): number {
    return this.endpointRecord.id;
  }

  getFethcher(): DataFetcher<BufferLike> {
    return fetcherFromEventFetchRequest(this);
  }

  getInput(): ApiHttpInput | ApiWsInput {
    const endpointRecord = this.endpointRecord;
    if (endpointRecord.connection_kind === ConnectionType.WS) {
      return { input: this.record.payload };
    } else {
      const newBlockChannelId = getNewBlocksChannel(this.record.chain_id);
      return {
        input: this.record.payload,
        channelIdForTick: newBlockChannelId,
      };
    }
  }
}

function fetcherFromEventFetchRequest(
  req: EventFetchRequest,
): DataFetcher<BufferLike> {
  const chainId = req.getChainId();
  const endpointId = req.getEndpointId();
  const endpoint = new Endpoint(endpointId);
  logger.debug(`Getting fetcher for ${endpoint.getName()}`);
  return endpoint.provider.getConnectionConfig(
    endpoint.getName(),
    chainId,
    endpoint.getConnectionType(),
    req.getInput(),
  );
}
