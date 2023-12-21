import { getDestinationsForActions, markActionAsExecuted } from "../db/action";
import { replaceTemplateValues } from "../templates";
import bot from "../notifications/telegram";
import {
  getWebhook,
  sendWebhookMessage,
} from "../notifications/discord/webhook";
import { getBackendWallet, getChain, getSdk } from "../onchain/utils";
import { swapUsingUniversalRouter } from "../onchain/uniswap";
import { ethers } from "ethers";
import { getToken } from "../onchain/tokens";
import { Prisma } from "@prisma/client";
import { getLogger } from "../utils/logger";
import { approveToken } from "../onchain/uniswap/permits";
import { MaxUint160, PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";

const logger = getLogger("consumer/woker/action_handler");

export const handleActions = async (
  actionIds: number[],
  data: Record<string, unknown>,
  filter: Record<string, unknown>,
) => {
  for (const actionId of actionIds) {
    await handleAction(actionId, data, filter);
    await markActionAsExecuted(actionId);
  }
};

export const handleAction = async (
  actionId: number,
  data: Record<string, unknown>,
  filter: Record<string, unknown>,
) => {
  const actionRecords = await getDestinationsForActions(actionId);
  if (!actionRecords) {
    throw new Error(`Alert with id ${actionId} not found`);
  }
  for (const actionRecord of actionRecords) {
    const { destination } = actionRecord;
    const destinationRecords = destination.map((destination) => {
      return { ...destination };
    });
    for (const destination of destinationRecords) {
      switch (destination.type) {
        case "telegram": {
          const telegramConfig = JSON.parse(
            JSON.stringify(destination.destination_config),
          );
          const preparedResponse = replaceTemplateValues(
            telegramConfig.template,
            data,
            filter,
          );
          await bot.telegram.sendMessage(
            telegramConfig.telegramChatId,
            preparedResponse,
          );
          break;
        }
        case "discord": {
          const discordConfig = JSON.parse(
            JSON.stringify(destination.destination_config),
          );
          const preparedResponse = replaceTemplateValues(
            discordConfig.template,
            data,
            filter,
          );
          const webhook = getWebhook(discordConfig.discordWebhookUrl);
          await sendWebhookMessage(webhook, preparedResponse);
          break;
        }
        case "onchain": {
          await handleOnchainAction(destination);
          break;
        }
        case "webhook":
          //TODO: implement webhook
          break;
        default:
          throw new Error(`Unknown destination type ${destination.type}`);
      }
    }
  }
  console.log(actionRecords);
};

async function handleOnchainAction(
  destination: Partial<{
    type: string;
    destination_config: Prisma.JsonValue;
  }>,
) {
  console.log("onchain");
  //TODO: approve transfer of tokens for this address to permit2
  //TODO: create session key for this address
  // const accountAddress = "0x7780CcB62782b58c34A51837097B3BD2BD2c4416";
  // const chainId = 80001;
  // const inTokenSymbol = "USDC";
  // const outTokenSymbol = "WETH";
  // const amount = "1";

  const txnDestinationConfig = JSON.parse(
    JSON.stringify(destination.destination_config),
  );

  logger.debug("txnDestinationConfig", txnDestinationConfig);

  switch (txnDestinationConfig.txnType) {
    case "UNISWAP_V3_TRADE": {
      const { accountAddress, chainId, inTokenSymbol, outTokenSymbol, amount } =
        txnDestinationConfig;
      const chain = getChain(chainId);
      const backendWallet = await getBackendWallet(chain, accountAddress);
      const sdk = await getSdk(backendWallet, chain);
      const inToken = getToken(inTokenSymbol, chain.chainId);
      const outToken = getToken(outTokenSymbol, chain.chainId);
      if (!inToken || !outToken) {
        throw new Error("Token not found");
      }
      const inputAmount = ethers.utils
        .parseUnits(amount.toString(), inToken.decimals)
        .toString();
      await approveToken(
        sdk,
        inToken.address,
        MaxUint160.toString(),
        PERMIT2_ADDRESS,
      );

      logger.debug(
        `Swapping ${inputAmount} ${inToken.address} for ${outToken.address}`,
      );

      await swapUsingUniversalRouter(sdk, {
        chainId,
        inputAmount,
        input: inToken,
        output: outToken,
      });

      break;
    }
    default: {
      throw new Error(`Unknown txn type ${txnDestinationConfig.txnType}`);
    }
  }
}
