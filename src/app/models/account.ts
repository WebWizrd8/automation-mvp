import { z } from "zod";

export const SmartAccountRegisterRequestSchema = z.object({
  id: z.number(),
  userAddress: z.string(),
  accountAddress: z.string(),
  chainId: z.number(),
  factoryAddress: z.string(),
});

export type SmartAccountRegisterRequest = z.infer<
  typeof SmartAccountRegisterRequestSchema
>;

export const RegisterSessionKeyRequestSchema = z.object({
  sessionKeyAddress: z.string(),
  smartAccountAddress: z.string(),
  chainId: z.number(),
  approvedCallTargets: z.array(z.string()),
  nativeTokenLimit: z.number(),
  startDate: z.coerce.date(),
  expirationDate: z.coerce.date(),
  txnHash: z.string(),
});

export type RegisterSessionKeyRequest = z.infer<
  typeof RegisterSessionKeyRequestSchema
>;
