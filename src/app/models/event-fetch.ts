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

//make an enum with all the function names
export enum EventFetchRequestTriggerFunctionName {
  SPOT_PRICE_MATCH = "SPOT_PRICE_MATCH",
  SPOT_PRICE_INCREASE = "SPOT_PRICE_INCREASE",
  SPOT_PRICE_DECREASE = "SPOT_PRICE_DECREASE",
  MA_ABOVE = "MA_ABOVE",
  MA_BELOW = "MA_BELOW",
}

// export interface EventFetchRequestTriggerRequest {
//   eventFetchRequestId: number;
//   //functionName should be one of the function names in the enum
//   functionName: keyof typeof EventFetchRequestTriggerFunctionName;
//   functionArgs: string | null;
//   addedBy: string;
// }
//
// export interface EventFetchRequestTriggerWithConditionsRequest
//   extends EventFetchRequestTriggerRequest {
//   actions: {
//     name: string;
//     chainId: number;
//     userId: string;
//     conditions: {
//       operator: string;
//       value: string;
//       field: string;
//     }[];
//     destinations: {
//       destinationType: action_type;
//       destinationConfig: string;
//     }[];
//     loopRules?: {
//       loop: boolean;
//       maxExecutions?: number;
//     };
//   }[];
// }

export const EventFetchRequestTriggerRequestSchema = z.object({
  eventFetchRequestId: z.number(),
  functionName: z.nativeEnum(EventFetchRequestTriggerFunctionName),
  functionArgs: z.string().nullable(),
  addedBy: z.string(),
});

export type EventFetchRequestTriggerRequest = z.infer<
  typeof EventFetchRequestTriggerRequestSchema
>;

export const EventFetchRequestTriggerWithConditionsRequestSchema =
  EventFetchRequestTriggerRequestSchema.merge(
    z.object({
      actions: z.array(
        z.object({
          name: z.string(),
          chainId: z.number(),
          userId: z.string(),
          conditions: z.array(
            z.object({
              operator: z.string(),
              value: z.string(),
              field: z.string(),
            }),
          ),
          destinations: z.array(
            z.object({
              destinationType: z.nativeEnum(action_type),
              destinationConfig: z.string(),
            }),
          ),
          loopRules: z
            .object({
              loop: z.boolean(),
              maxExecutions: z.number().optional(),
            })
            .optional(),
        }),
      ),
    }),
  );

export type EventFetchRequestTriggerWithConditionsRequest = z.infer<
  typeof EventFetchRequestTriggerWithConditionsRequestSchema
>;
