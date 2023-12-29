import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BigNumber } from "ethers";

import { getLogger } from "../../utils/logger";

const logger = getLogger("onchain/erc20/index");

export async function getAllowance(
  sdk: ThirdwebSDK,
  token: string,
  owner: string,
  address: string,
) {
  const erc20Contract = await sdk.getContract(token);
  const allowance: BigNumber = await erc20Contract.call("allowance", [
    owner,
    address,
  ]);

  logger.debug(`Allowance for ${address}:  ${allowance.toString()}`);
  return allowance;
}
