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

const logger = getLogger("events/index.ts");

export class EventFetchRequest {
  record: EventFetchRequestRecord;
  endpointRecord: EndpointRecord;

  constructor(record: EventFetchRequestRecord, endpointRecord: EndpointRecord) {
    this.record = record;
    this.endpointRecord = endpointRecord;
  }

  static async fromRecord(
    record: EventFetchRequestRecord,
  ): Promise<EventFetchRequest> {
    const endpointRecord = await getEndpointRecordFromFetchRequestId(
      record.id,
      record.chain_id,
    );
    return new EventFetchRequest(record, endpointRecord);
  }

  static async fromId(id: number): Promise<EventFetchRequest> {
    const record = await getEventFetchRequestRecordFromId(id);
    return EventFetchRequest.fromRecord(record);
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

  async getFethcher(): Promise<DataFetcher<BufferLike>> {
    return await fetcherFromEventFetchRequest(this);
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

async function fetcherFromEventFetchRequest(
  req: EventFetchRequest,
): Promise<DataFetcher<BufferLike>> {
  const chainId = req.getChainId();
  const endpointId = req.getEndpointId();
  const endpoint = await Endpoint.fromId(endpointId);
  logger.debug(`Getting fetcher for ${endpoint.getName()}`);
  console.log(
    `Getting fetcher for ${endpoint.getName()}`,
    endpoint,
    req.getInput(),
  );
  return endpoint.provider.getConnectionConfig(
    endpoint.getName(),
    chainId,
    endpoint.getConnectionType(),
    req.getInput(),
  );
}
