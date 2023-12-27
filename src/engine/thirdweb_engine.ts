import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { EVMChainId, EVMChains, getEVMChainId } from "../chains/types";
import { getLogger } from "../utils/logger";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";

const logger = getLogger("thirdweb_engine");

const readOnlySdks: { [chainId: number]: ThirdwebSDK } = {};

export async function initThirdwebSDK() {
  const chainIds = (
    Object.keys(EVMChainId).filter((key) => isNaN(Number(key))) as EVMChains[]
  ).map((chain) => getEVMChainId(chain));
  console.log("chainIds", chainIds);

  for (const chainId of chainIds) {
    readOnlySdks[chainId] = new ThirdwebSDK(
      await getChainByChainIdAsync(chainId),
      {
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      },
    );
  }
}

export function getReadOnlyThirdwebSDK(chainId: number | EVMChains) {
  logger.debug(`getReadOnlyThirdwebSDK: ${chainId}`);
  try {
    if (typeof chainId === "number") {
      return readOnlySdks[chainId];
    }
    return readOnlySdks[getEVMChainId(chainId)];
  } catch (e) {
    logger.error("Invalid chainId", e);
    throw new Error("Invalid chainId");
  }
}
