import { EndpointRecord, getEndpointRecordFromId } from "./endpoint";

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

//TODO: This should come from `db.event_tag_chain`.
export function getEndpointRecordFromFetchRequestId(
  eventFetchRequestId: number,
  chainId: number,
): EndpointRecord {
  let endpointId: number;
  if (eventFetchRequestId == 0) {
    if (chainId == 1) {
      endpointId = 0;
    }
  } else if (eventFetchRequestId == 1) {
    if (chainId == 1) {
      endpointId = 1;
    }
  } else {
    throw new Error(`Unknown event fetch request id: ${eventFetchRequestId}`);
  }
  const endpointRecord = getEndpointRecordFromId(endpointId!);
  return endpointRecord;
}

export class EventFetchRequestTriggerFunctionRecord {
  id: number;
  event_fetch_request_id: number;
  function_name: string;
  function_args: string;
  added_by: string;

  constructor(
    id: number,
    event_fetch_request_id: number,
    function_name: string,
    function_args: string,
    added_by: string,
  ) {
    this.id = id;
    this.event_fetch_request_id = event_fetch_request_id;
    this.function_name = function_name;
    this.function_args = function_args;
    this.added_by = added_by;
  }
}

//TODO: This values should come from `db.event_fetch_request_trigger_function`.
export function getEventFetchRequestTriggerFunctionRecordFromId(
  id: number,
): EventFetchRequestTriggerFunctionRecord {
  let eventFetchRequestTriggerFunctionRecord: EventFetchRequestTriggerFunctionRecord;
  if (id === 0) {
    const functionArgs = {
      priceUsd: 2200.0,
    };
    eventFetchRequestTriggerFunctionRecord =
      new EventFetchRequestTriggerFunctionRecord(
        0,
        1,
        "SPOT_PRICE_MATCH",
        JSON.stringify(functionArgs),
        "test_user",
      );
  } else if (id === 1) {
    const functionArgs = {
      duration: "30D",
      change_percent: 10,
      direction: "UP",
    };
    eventFetchRequestTriggerFunctionRecord =
      new EventFetchRequestTriggerFunctionRecord(
        1,
        1,
        "SPOT_PRICE_CHANGE",
        JSON.stringify(functionArgs),
        "test_user",
      );
  } else {
    throw new Error(`Unknown event fetch request trigger function id: ${id}`);
  }
  return eventFetchRequestTriggerFunctionRecord;
}

export async function getEventFetchRequestFunctionFromFetchReqeustId(
  _eventFetchRequestRecordId: number,
) {
  // await dbClient.event_fetch_request_trigger_function.findMany({
  //   where: {
  //     event_fetch_request_id: eventFetchRequestRecordId,
  //   },
  // });

  const t = await Promise.resolve([
    getEventFetchRequestTriggerFunctionRecordFromId(0),
    getEventFetchRequestTriggerFunctionRecordFromId(1),
  ]);
  return t;
}
