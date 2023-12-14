import { getLogger } from "../utils/logger";
import dbClient from "../utils/db-client";
import { EndpointRecord, getEndpointRecordFromId } from "./endpoint";

const logger = getLogger("db/event.ts");

export interface ActionConditionRecord {
  id: number;
  operator: string;
  value: string;
  field: string;
}

export class EventTagRecord {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;

  constructor(
    id: number,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    description: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
  }
}

export async function getEventTagRecordFromId(
  id: number,
): Promise<EventTagRecord> {
  try {
    const dbRecord = await dbClient.event_tag.findUnique({
      where: {
        id: id,
      },
    });
    if (dbRecord === null) {
      throw new Error(`Event tag with id ${id} not found`);
    }
    const eventTagRecord = new EventTagRecord(
      dbRecord.id,
      dbRecord.name,
      dbRecord.createdAt,
      dbRecord.updatedAt,
      dbRecord.description,
    );

    return eventTagRecord;
  } catch (e) {
    logger.error(`Error getting event tag record for id: ${id}`, e);
    throw e;
  }
}

export class EventFetchRequestRecord {
  id: number;
  tag_id: number;
  chain_id: number;
  payload: string | null;
  added_by: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(obj: {
    id: number;
    tag_id: number;
    chain_id: number;
    payload: string | null;
    added_by: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = obj.id;
    this.tag_id = obj.tag_id;
    this.chain_id = obj.chain_id;
    this.payload = obj.payload;
    this.added_by = obj.added_by;
    this.createdAt = obj.createdAt;
    this.updatedAt = obj.updatedAt;
  }
}

//TODO: This values should come from `db.event_fetch_request`.
export async function getEventFetchRequestRecordFromId(
  id: number,
): Promise<EventFetchRequestRecord> {
  try {
    const dbRecord = await dbClient.event_fetch_request.findUnique({
      where: {
        id: id,
      },
    });
    if (dbRecord === null) {
      throw new Error(`Event fetch request with id ${id} not found`);
    }

    const eventFetchRequestRecord = new EventFetchRequestRecord({
      id: dbRecord.id,
      tag_id: dbRecord.tag_id,
      chain_id: dbRecord.chain_id,
      payload: dbRecord.payload ? JSON.stringify(dbRecord.payload) : null,
      added_by: dbRecord.added_by,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    });
    // if (id === 0) {
    //   const getNewBlocks = {
    //     jsonrpc: "2.0",
    //     id: 2,
    //     method: "eth_subscribe",
    //     params: ["newHeads"],
    //   };
    //   eventFetchRequestRecord = new EventFetchRequestRecord(
    //     0,
    //     0,
    //     1,
    //     JSON.stringify(getNewBlocks),
    //     "test_user",
    //     new Date().toISOString(),
    //     new Date().toISOString(),
    //   );
    // } else if (id === 1) {
    //   const getTokenPricersInput = {
    //     token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    //     networkId: 1,
    //   };
    //   eventFetchRequestRecord = new EventFetchRequestRecord(
    //     1,
    //     1,
    //     1,
    //     JSON.stringify(getTokenPricersInput),
    //     "test_user",
    //     new Date().toISOString(),
    //     new Date().toISOString(),
    //   );
    // } else {
    //   throw new Error(`Unknown event fetch request id: ${id}`);
    // }

    return eventFetchRequestRecord;
  } catch (e) {
    logger.error(`Error getting event fetch request record for id: ${id}`, e);
    throw e;
  }
}

//TODO: This should come from `db.event_tag_chain`.
export async function getEndpointRecordFromFetchRequestId(
  eventFetchRequestId: number,
  chainId: number,
): Promise<EndpointRecord> {
  const dbRecord = await dbClient.event_tag_chain.findUnique({
    where: {
      tag_id_chain_id: {
        tag_id: eventFetchRequestId,
        chain_id: chainId,
      },
    },
  });
  if (dbRecord === null) {
    throw new Error(
      `Endpoint record with event fetch request id ${eventFetchRequestId} and chain id ${chainId} not found`,
    );
  }

  // if (eventFetchRequestId == 0) {
  //   if (chainId == 1) {
  //     endpointId = 0;
  //   }
  // } else if (eventFetchRequestId == 1) {
  //   if (chainId == 1) {
  //     endpointId = 1;
  //   }
  // } else {
  //   throw new Error(`Unknown event fetch request id: ${eventFetchRequestId}`);
  // }
  const endpointRecord = await getEndpointRecordFromId(dbRecord.endpoint_id);
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
export async function getEventFetchRequestTriggerFunctionRecordFromId(
  id: number,
): Promise<EventFetchRequestTriggerFunctionRecord> {
  try {
    const dbRecord =
      await dbClient.event_fetch_request_trigger_function.findUnique({
        where: {
          id: id,
        },
      });
    if (dbRecord === null) {
      throw new Error(
        `Event fetch request trigger function with id ${id} not found`,
      );
    }
    const eventFetchRequestTriggerFunctionRecord =
      new EventFetchRequestTriggerFunctionRecord(
        dbRecord.id,
        dbRecord.event_fetch_request_id,
        dbRecord.function_name,
        dbRecord.function_args?.toString() || "",
        dbRecord.added_by,
      );
    return eventFetchRequestTriggerFunctionRecord;
  } catch (err) {
    logger.error(
      `Error getting event fetch request trigger function record for id: ${id}`,
      err,
    );
    throw err;
  }
  // let eventFetchRequestTriggerFunctionRecord: EventFetchRequestTriggerFunctionRecord;
  // if (id === 0) {
  //   const functionArgs = {
  //     priceUsd: 2200.0,
  //   };
  //   eventFetchRequestTriggerFunctionRecord =
  //     new EventFetchRequestTriggerFunctionRecord(
  //       0,
  //       1,
  //       "SPOT_PRICE_MATCH",
  //       JSON.stringify(functionArgs),
  //       "test_user",
  //     );
  // } else if (id === 1) {
  //   const functionArgs = {
  //     duration: "30D",
  //     change_percent: 10,
  //     direction: "UP",
  //   };
  //   eventFetchRequestTriggerFunctionRecord =
  //     new EventFetchRequestTriggerFunctionRecord(
  //       1,
  //       1,
  //       "SPOT_PRICE_CHANGE",
  //       JSON.stringify(functionArgs),
  //       "test_user",
  //     );
  // } else {
  //   throw new Error(`Unknown event fetch request trigger function id: ${id}`);
  // }
  // return eventFetchRequestTriggerFunctionRecord;
}

export async function getEventFetchRequestFunctionFromFetchRequestId(
  eventFetchRequestRecordId: number,
): Promise<EventFetchRequestTriggerFunctionRecord[]> {
  const dbRecords =
    await dbClient.event_fetch_request_trigger_function.findMany({
      where: {
        event_fetch_request_id: eventFetchRequestRecordId,
      },
    });

  const eventFetchFunctions = dbRecords.map((dbRecord) => {
    return new EventFetchRequestTriggerFunctionRecord(
      dbRecord.id,
      dbRecord.event_fetch_request_id,
      dbRecord.function_name,
      dbRecord.function_args?.toString() || "",
      dbRecord.added_by,
    );
  });

  return eventFetchFunctions;
}
