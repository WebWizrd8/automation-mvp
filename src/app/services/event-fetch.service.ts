import { PrismaClient } from "@prisma/client";
import dbClient from "../../utils/db-client";

interface EventFetchTagResponse {
  id: number;
  name: string;
  description: string | null;
  chains: {
    chainId: number;
    endpointId: number;
  }[];
}

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

interface EventFetchRequestResponse {
  id: number;
  tagId: number;
  chainId: number;
  payload: string | null;
  addedBy: string | null;
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
