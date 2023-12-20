import "dotenv/config";
import { ThirdwebSDK, UserWallet } from "@thirdweb-dev/sdk";
import { BigNumber, ethers } from "ethers";
import { PERMIT2_ADDRESS } from "@uniswap/universal-router-sdk";
import {
  AllowanceTransfer,
  MaxUint160,
  PermitSingle,
} from "@uniswap/permit2-sdk";

import { Permit2Permit } from "@uniswap/universal-router-sdk/dist/utils/inputTokens";
import { getLogger } from "../../utils/logger";

const logger = getLogger("onchain/uniswap/permits");

export async function generatePermitSignature(
  permit: PermitSingle,
  signer: UserWallet,
  chainId: number,
  permitAddress: string = PERMIT2_ADDRESS,
): Promise<string> {
  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permit,
    permitAddress,
    chainId,
  );
  //eslint-disable-next-line
  return (await signer.signTypedData(domain as any, types, values)).signature;
}

export async function generateEip2098PermitSignature(
  permit: PermitSingle,
  signer: UserWallet,
  chainId: number,
  permitAddress: string = PERMIT2_ADDRESS,
): Promise<string> {
  const sig = await generatePermitSignature(
    permit,
    signer,
    chainId,
    permitAddress,
  );
  const split = ethers.utils.splitSignature(sig);
  return split.compact;
}

export function toInputPermit(
  signature: string,
  permit: PermitSingle,
): Permit2Permit {
  return {
    ...permit,
    signature,
  };
}

export async function preparePermit2(
  sdk: ThirdwebSDK,
  token: string,
  permit2Address: string,
  universalRouterAddress: string,
  chainId: number,
) {
  const p2Contract = await sdk.getContract(permit2Address);
  const [p2Amount, p2Expiration, p2Nonce]: [BigNumber, number, number] =
    await p2Contract.call("allowance", [
      await sdk.wallet.getAddress(),
      token,
      universalRouterAddress,
    ]);
  logger.debug(
    `Permit2 Amount: ${p2Amount}, p2Expiration: ${p2Expiration}, p2Nonce: ${p2Nonce}`,
  );

  const permit: PermitSingle = {
    details: {
      token,
      amount: MaxUint160,
      expiration: "3000000000000",
      nonce: p2Nonce,
    },
    spender: universalRouterAddress,
    sigDeadline: "3000000000000",
  };

  const signature = await generateEip2098PermitSignature(
    permit,
    sdk.wallet,
    chainId,
    permit2Address,
  );
  return { signature, permit };
}

export async function approveToken(
  sdk: ThirdwebSDK,
  token: string,
  amount: string,
  permit2Address: string,
) {
  logger.debug(
    `Approving ${amount.toString()} ${token} to spend permit ${permit2Address}`,
  );
  const erc20Contract = await sdk.getContract(token);

  const allowance: BigNumber = await erc20Contract.call("allowance", [
    await sdk.wallet.getAddress(),
    permit2Address,
  ]);
  logger.debug(`Allowance for ${permit2Address}:  ${allowance.toString()}`);
  if (!allowance.gte(amount)) {
    logger.debug(`Approving token allowance for ${permit2Address}`);
    const txApprove = erc20Contract.prepare("approve", [
      permit2Address,
      amount,
    ]);
    // const txSent = await txApprove.send();
    const rawTx = await txApprove.populateTransaction();
    logger.debug("txPrepared", rawTx);
    const txSent = await sdk.wallet.sendRawTransaction(rawTx);
    await txSent.wait(1);
    logger.debug("Tx Receipt for tokenApproval", txSent);
  }
}
