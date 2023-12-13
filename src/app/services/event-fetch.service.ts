import { PrismaClient } from "@prisma/client";
import dbClient from "../../utils/db-client";
import {
  EventFetchRequestResponse,
  EventFetchRequestTriggerResponse,
  EventFetchRequestTriggerWithConditionsResponse,
  EventFetchTagResponse,
} from "app/models/event-fetch";

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

  async getEventFetchRequestFunctionForIdWithActions(
    id: number,
  ): Promise<EventFetchRequestTriggerWithConditionsResponse | null> {
    console.log("Id", id);
    const event =
      await this.client.event_fetch_request_trigger_function.findUnique({
        where: { id },
        include: { action: true },
      });
    console.log(event);
    if (!event) {
      return null;
    }
    const actionsWithConditions = [];
    for (const action of event.action) {
      const actionRecord = await this.client.action.findUnique({
        where: { id: action.id },
        include: { action_condition: true, destination: true },
      });
      const actionWithConditions = {
        id: action.id,
        name: action.name,
        chainId: action.chain_id,
        conditions: actionRecord!.action_condition.map((condition) => {
          return {
            id: condition.id,
            operator: condition.operator,
            value: JSON.stringify(condition.value),
          };
        }),
        destinations: actionRecord!.destination.map((destination) => {
          return {
            id: destination.id,
            destinationType: destination.type,
          };
        }),
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
}
