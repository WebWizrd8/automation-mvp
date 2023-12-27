import { action_type } from "@prisma/client";
import { z } from "zod";
import { EventFetchRequestTriggerFunctionName } from "../../db/event";

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

export function getConditionsForFunctionName(functionName: string) {
  switch (functionName) {
    case EventFetchRequestTriggerFunctionName.SPOT_PRICE_MATCH:
      return [
        {
          operator: "eq",
          value: "2",
          field: '$."chain_id"',
        },
        {
          operator: "gte",
          value: "2020",
          field: '$."priceUsd"',
        },
        {
          operator: "eq",
          value: '"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"',
          field: '$."token_address"',
        },
      ];
    case EventFetchRequestTriggerFunctionName.SPOT_PRICE_INCREASE:
      return [
        {
          operator: "eq",
          value: "2",
          field: '$."chain_id"',
        },
        {
          operator: "eq",
          value: '"30D"',
          field: '$."duration"',
        },
        {
          operator: "gte",
          value: "3",
          field: '$."change_percentage"',
        },
        {
          operator: "eq",
          value: '"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"',
          field: '$."token_address"',
        },
      ];
    case EventFetchRequestTriggerFunctionName.SPOT_PRICE_DECREASE:
      return [
        {
          operator: "eq",
          value: "2",
          field: '$."chain_id"',
        },
        {
          operator: "eq",
          value: '"30D"',
          field: '$."duration"',
        },
        {
          operator: "lte",
          value: "-300",
          field: '$."changeUsd"',
        },
        {
          operator: "eq",
          value: '"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"',
          field: '$."token_address"',
        },
      ];
    case EventFetchRequestTriggerFunctionName.MA_ABOVE:
      return [
        {
          operator: "GREATER_THAN",
          value: "100",
          field: "spotPrice",
        },
      ];
    case EventFetchRequestTriggerFunctionName.MA_BELOW:
      return [
        {
          operator: "eq",
          value: "2",
          field: '$."chain_id"',
        },
        {
          operator: "eq",
          value: '"30D"',
          field: '$."duration"',
        },
        {
          operator: "lte",
          value: "3",
          field: '$."moving_average"',
        },
        {
          operator: "eq",
          value: '"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"',
          field: '$."token_address"',
        },
      ];
    default:
      return [];
  }
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
