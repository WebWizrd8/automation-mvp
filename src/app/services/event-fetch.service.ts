import { Prisma, PrismaClient } from "@prisma/client";
import dbClient from "../../utils/db-client";
import {
  EventFetchRequestResponse,
  EventFetchRequestTriggerFunctionName,
  EventFetchRequestTriggerRequestSchema,
  EventFetchRequestTriggerResponse,
  EventFetchRequestTriggerWithConditionsRequest,
  EventFetchRequestTriggerWithConditionsResponse,
  EventFetchTagResponse,
} from "../models/event-fetch";
import { getLogger } from "../../utils/logger";
import { ActionConditionRecord } from "../../db/event";

const logger = getLogger("event-fetch.service");

export class EventTagService {
  private readonly client: PrismaClient;

  constructor() {
    this.client = dbClient;
  }

  async getAllEventFetchTags(): Promise<EventFetchTagResponse[]> {
    const tags = await this.client.event_tag.findMany({
      include: { event_tag_chain: true },
    });
    const mappedTags = tags.map((tag) => {
      tag.event_tag_chain.sort((a, b) => {
        return a.chain_id - b.chain_id;
      });
      const eventTagChain = tag.event_tag_chain.map((event_tag_chain) => {
        return {
          chainId: event_tag_chain.chain_id,
          endpointId: event_tag_chain.endpoint_id,
        };
      });
      return {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        chains: eventTagChain,
      };
    });
    return mappedTags;
  }

  async getEventFetchTagsByChainId(
    chainId: number,
  ): Promise<EventFetchTagResponse[]> {
    const tags = await this.client.event_tag.findMany({
      where: { event_tag_chain: { some: { chain_id: chainId } } },
      include: { event_tag_chain: true },
    });

    const mappedTags = tags.map((tag) => {
      tag.event_tag_chain.sort((a, b) => {
        return a.chain_id - b.chain_id;
      });
      const eventTagChain = tag.event_tag_chain.map((event_tag_chain) => {
        return {
          chainId: event_tag_chain.chain_id,
          endpointId: event_tag_chain.endpoint_id,
        };
      });
      return {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        chains: eventTagChain,
      };
    });
    return mappedTags;
  }
}

export class EventFetchRequestService {
  private readonly client: PrismaClient;

  constructor() {
    this.client = dbClient;
  }

  async getAllEventFetchRequests(): Promise<EventFetchRequestResponse[]> {
    const dbEvents = await this.client.event_fetch_request.findMany();
    const events = dbEvents.map((event) => {
      return {
        id: event.id,
        tagId: event.tag_id,
        chainId: event.chain_id,
        payload: event.payload ? JSON.stringify(event.payload) : null,
        addedBy: event.added_by,
      };
    });
    return events;
  }

  async getEventFetchRequestById(
    id: number,
  ): Promise<EventFetchRequestResponse | null> {
    const event = await this.client.event_fetch_request.findUnique({
      where: { id },
    });
    if (!event) {
      return null;
    }

    return {
      id: event.id,
      tagId: event.tag_id,
      chainId: event.chain_id,
      payload: event.payload ? JSON.stringify(event.payload) : null,
      addedBy: event.added_by,
    };
  }
}

export class EventFetchRequestFunctionService {
  private readonly client: PrismaClient;

  constructor() {
    this.client = dbClient;
  }

  async getEventFetchRequestFunctionById(
    id: number,
  ): Promise<EventFetchRequestTriggerResponse | null> {
    const event =
      await this.client.event_fetch_request_trigger_function.findUnique({
        where: { id },
      });
    if (!event) {
      return null;
    }

    return {
      id: event.id,
      eventFetchRequestId: event.event_fetch_request_id,
      functionName: event.function_name,
      functionArgs: event.function_args
        ? JSON.stringify(event.function_args)
        : null,
      addedBy: event.added_by,
    };
  }

  getAllEventFetchRequestFunctions(): string[] {
    return Object.values(EventFetchRequestTriggerFunctionName);
  }

  async getEventFetchRequestFunctionForIdWithActions(
    id: number,
  ): Promise<EventFetchRequestTriggerWithConditionsResponse | null> {
    console.log("Id", id);

    const event =
      await this.client.event_fetch_request_trigger_function.findUnique({
        where: { id },
        include: { action: { include: { destination: true } } },
      });
    console.log(event);
    if (!event) {
      return null;
    }
    const actionsWithConditions = [];
    for (const action of event.action) {
      // const actionRecord = await this.client.action.findUnique({
      //   where: { id: action.id },
      //   include: { action_condition: true, destination: true },
      // });

      console.log(action.id);
      const prismaSql = Prisma.sql`SELECT id,action_id,field::VARCHAR,operator,value FROM "action_condition" WHERE "action_id" = ${action.id}`;
      const actionConditionsRecords: ActionConditionRecord[] =
        await this.client.$queryRaw(prismaSql);

      const destinations = [];
      for (const destination of action.destination) {
        switch (destination.type) {
          case "discord": {
            destinations.push({
              id: destination.id,
              destinationType: destination.type,
              destinationConfig: JSON.stringify(destination.destination_config),
            });
            break;
          }
          case "telegram": {
            destinations.push({
              id: destination.id,
              destinationType: destination.type,
              destinationConfig: JSON.stringify(destination.destination_config),
            });
            break;
          }
          case "webhook":
          default:
            logger.error("Unknown destination type");
        }
      }
      const actionWithConditions = {
        id: action.id,
        name: action.name,
        chainId: action.chain_id,
        conditions: actionConditionsRecords!.map((condition) => {
          return {
            id: condition.id,
            operator: condition.operator,
            value: JSON.stringify(condition.value),
            field: condition.field,
          };
        }),
        destinations,
      };
      actionsWithConditions.push(actionWithConditions);
    }
    const mappedEvent = {
      id: event.id,
      eventFetchRequestId: event.event_fetch_request_id,
      functionName: event.function_name,
      functionArgs: event.function_args
        ? JSON.stringify(event.function_args)
        : null,
      addedBy: event.added_by,
      actions: actionsWithConditions,
    };

    return mappedEvent;
  }

  async createEventFetchRequestFunctionForIdWithActions(
    data: EventFetchRequestTriggerWithConditionsRequest,
  ) {
    const eventData = {
      event_fetch_request_id: data.eventFetchRequestId,
      function_name: data.functionName,
      function_args: data.functionArgs ? JSON.parse(data.functionArgs) : null,
      added_by: data.addedBy,
    };

    logger.info("Creating event fetch request trigger function", eventData);

    try {
      await this.client.$transaction(async (tx) => {
        const event = await tx.event_fetch_request_trigger_function.create({
          data: {
            ...eventData,
          },
        });

        for (const action of data.actions) {
          const loopRules = prepareLoopRules(action);
          const actionsResp = await tx.action.create({
            data: {
              name: action.name,
              chain_id: action.chainId,
              user_id: action.userId,
              event_fetch_request_trigger_function_id: event.id,
              executed: 0,
              last_executed_at: null,
              loop: loopRules.loop,
              loop_config: loopRules.loopConfig
                ? JSON.parse(loopRules.loopConfig)
                : null,
            },
          });

          for (const condition of action.conditions) {
            const t = {
              operator: condition.operator,
              value: condition.value,
              field: condition.field,
              action_id: actionsResp.id,
            };

            const sql = Prisma.sql`INSERT INTO "action_condition" ("operator","value","field","action_id") VALUES (${t.operator}, CAST(${t.value}::text AS jsonb), CAST(${t.field}::text as jsonpath), ${t.action_id})`;

            try {
              const actionConditionRecord = await tx.$executeRaw(sql);
              logger.info("Inserted action condition", actionConditionRecord);
            } catch (e) {
              logger.error("Error inserting action condition", e);
              throw e;
            }
          }

          await tx.destination.createMany({
            data: action.destinations.map((destination) => {
              return {
                action_id: actionsResp.id,
                type: destination.destinationType,
                destination_config: JSON.parse(destination.destinationConfig),
              };
            }),
          });
        }
      });
    } catch (e) {
      logger.error("Error inserting action", e);
      throw e;
    }
  }
}

function prepareLoopRules(action: {
  loopRules?: EventFetchRequestTriggerWithConditionsRequest["actions"][0]["loopRules"];
}) {
  const loopRules: { loop: boolean; loopConfig: string | null } = {
    loop: false,
    loopConfig: null,
  };
  if (action.loopRules) {
    loopRules.loop = action.loopRules.loop;
    const maxExecutions = action.loopRules.maxExecutions;
    const loopConfig: { max_executions?: number } = {};
    if (maxExecutions) {
      loopConfig.max_executions = maxExecutions;
    }
    loopRules.loopConfig = JSON.stringify(loopConfig);
  }
  return loopRules;
}
