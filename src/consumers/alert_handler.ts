import { getDestinationsForActions } from "../db/action";
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

export const handleActions = async (
  actionIds: number[],
  data: Record<string, unknown>,
  filter: Record<string, unknown>,
) => {
  for (const actionId of actionIds) {
    await handleAction(actionId, data, filter);
    //TODO: remove this break after onchain actions are fully implemented
    break;
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
      return { ...destination, type: (destination.type = "onchain") };
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
          console.log("onchain");
          //TODO: approve transfer of tokens for this address to permit2
          //TODO: create session key for this address
          const accountAddress = "0x7780CcB62782b58c34A51837097B3BD2BD2c4416";
          const chainId = 80001;
          const inTokenSymbol = "USDC";
          const outTokenSymbol = "WETH";
          const amount = "1";
          const decimals = 6;

          const chain = getChain(chainId);
          const backendWallet = await getBackendWallet(chain, accountAddress);
          const sdk = await getSdk(backendWallet, chain);
          const inputAmount = ethers.utils
            .parseUnits(amount, decimals)
            .toString();
          const inToken = getToken(inTokenSymbol, chain.chainId);
          const outToken = getToken(outTokenSymbol, chain.chainId);
          if (!inToken || !outToken) {
            throw new Error("Token not found");
          }
          console.log("Swapping", inputAmount, inToken, outToken);
          await swapUsingUniversalRouter(sdk, {
            chainId,
            inputAmount,
            input: inToken,
            output: outToken,
          });
          break;
        }
        case "webhook":
          //TODO: implement webhook
          break;
        default:
          throw new Error(`Unknown destination type ${destination.type}`);
      }
      //TODO: remove this break after onchain actions are fully implemented
      break;
    }
  }
  console.log(actionRecords);
};
