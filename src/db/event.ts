export class EventTagRecord {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  description?: string;

  constructor(
    id: number,
    name: string,
    createdAt: string,
    updatedAt: string,
    description: string,
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
  }
}

//TODO: This values should come from `db.event_tag`.
export function getEventTagRecordFromId(id: number): EventTagRecord {
  let eventTagRecord: EventTagRecord;
  if (id === 0) {
    eventTagRecord = new EventTagRecord(
      0,
      "GET_NEW_BLOCKS",
      new Date().toISOString(),
      new Date().toISOString(),
      "Get new blocks from the chain",
    );
  } else if (id === 1) {
    eventTagRecord = new EventTagRecord(
      1,
      "GET_SPOT_PRICE",
      new Date().toISOString(),
      new Date().toISOString(),
      "Get spot price from the chain",
    );
  } else {
    throw new Error(`Unknown event tag id: ${id}`);
  }
  return eventTagRecord;
}

export class EventFetchRequestRecord {
  id: number;
  createdAt: string;
  updatedAt: string;
  tag_id: number;
  chain_id: number;
  payload: string;
  added_by: string;

  constructor(
    id: number,
    tag_id: number,
    chain_id: number,
    payload: string,
    added_by: string,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.tag_id = tag_id;
    this.chain_id = chain_id;
    this.payload = payload;
    this.added_by = added_by;
  }
}

//TODO: This values should come from `db.event_fetch_request`.
export function getEventFetchRequestRecordFromId(
  id: number,
): EventFetchRequestRecord {
  let eventFetchRequestRecord: EventFetchRequestRecord;

  if (id === 0) {
    const getNewBlocks = {
      jsonrpc: "2.0",
      id: 2,
      method: "eth_subscribe",
      params: ["newHeads"],
    };
    eventFetchRequestRecord = new EventFetchRequestRecord(
      0,
      0,
      1,
      JSON.stringify(getNewBlocks),
      "test_user",
      new Date().toISOString(),
      new Date().toISOString(),
    );
  } else if (id === 1) {
    const getTokenPricersInput = {
      token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      networkId: 1,
    };
    eventFetchRequestRecord = new EventFetchRequestRecord(
      1,
      1,
      1,
      JSON.stringify(getTokenPricersInput),
      "test_user",
      new Date().toISOString(),
      new Date().toISOString(),
    );
  } else {
    throw new Error(`Unknown event fetch request id: ${id}`);
  }

  return eventFetchRequestRecord;
}
