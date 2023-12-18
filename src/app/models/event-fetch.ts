import { action_type } from "@prisma/client";
import { z } from "zod";

export interface EventFetchTagResponse {
  id: number;
  name: string;
  description: string | null;
  chains: {
    chainId: number;
    endpointId: number;
  }[];
}

export interface EventFetchRequestResponse {
  id: number;
  tagId: number;
  chainId: number;
  payload: string | null;
  addedBy: string | null;
}

export interface EventFetchRequestTriggerResponse {
  id: number;
  eventFetchRequestId: number;
  functionName: string;
  functionArgs: string | null;
  addedBy: string;
}

export interface EventFetchRequestTriggerWithConditionsResponse
  extends EventFetchRequestTriggerResponse {
  actions: {
    id: number;
    name: string;
    chainId: number;
    conditions: {
      id: number;
      operator: string;
      value: string;
    }[];
    destinations: {
      id: number;
      destinationType: action_type;
      destinationConfig: string;
    }[];
  }[];
}

export interface EventFetchRequestTriggerRequest {
  eventFetchRequestId: number;
  functionName: string;
  functionArgs: string | null;
  addedBy: string;
}

export interface EventFetchRequestTriggerWithConditionsRequest
  extends EventFetchRequestTriggerRequest {
  actions: {
    name: string;
    chainId: number;
    userId: string;
    conditions: {
      operator: string;
      value: string;
      field: string;
    }[];
    destinations: {
      destinationType: action_type;
      destinationConfig: string;
    }[];
  }[];
}
