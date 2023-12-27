import { address_type } from "@prisma/client";
import { z } from "zod";

export const UserRegisterRequestSchema = z.object({
  userAddress: z.string(),
  address_type: z.nativeEnum(address_type),
});

export type UserRegisterRequest = z.infer<typeof UserRegisterRequestSchema>;
