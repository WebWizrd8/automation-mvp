import { EVMChainId } from "../../chains/types";

export function getActiveBackendWalletByChainId(
  chainId: number = EVMChainId.ETH,
) {
  switch (chainId) {
    default:
    case EVMChainId.ETH:
      return "0x9Aa13F15BdC45995b86e43129681693077f39777";
  }
}
