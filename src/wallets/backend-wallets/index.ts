import { EVMChainId } from "../../chains/types";

export function getActiveBackendWalletByChainId(
  chainId: number = EVMChainId.ETH,
) {
  switch (chainId) {
    case EVMChainId.ETH:
      return "0x9Aa13F15BdC45995b86e43129681693077f39777";
    default:
      return "0x9Aa13F15BdC45995b86e43129681693077f39777";
  }
}
