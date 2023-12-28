import { action_type } from "@prisma/client";
import { z } from "zod";

export const DestinationTypeSchema = z.nativeEnum(action_type);

export const TelegramDestinationConfigSchema = z.object({
  template: z.string(),
  telegramChatId: z.string(),
  telegramUserId: z.string(),
});

export const DiscordDestinationConfigSchema = z.object({
  template: z.string(),
  discordUserId: z.string(),
  discordWebhookUrl: z.string().url(),
});

export enum onchain_txn_type {
  UNISWAP_V3_TRADE = "UNISWAP_V3_TRADE",
}

export const OnchainDestinationConfigSchema = z.object({
  accountAddress: z.string(),
  chainId: z.number(),
  inTokenSymbol: z.string(),
  outTokenSymbol: z.string(),
  amount: z.number(),
  txnType: z.nativeEnum(onchain_txn_type),
});
