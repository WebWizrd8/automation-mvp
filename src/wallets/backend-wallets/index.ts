import { LocalWalletNode } from "@thirdweb-dev/wallets/evm/wallets/local-wallet-node";
import { EVMChainId } from "../../chains/types";

export async function getActiveBackendWalletByChainId(
  chainId: number = EVMChainId.ETH,
) {
  const sessionWallet = new LocalWalletNode();
  await sessionWallet.import({
    privateKey: process.env.THIRDWEB_BACKEND_SK!,
    encryption: {
      password: process.env.THIRDWEB_BACKEND_SK_PASSWORD!,
    },
  });
  switch (chainId) {
    case EVMChainId.ETH:
      return "0x9Aa13F15BdC45995b86e43129681693077f39777";
    default:
      return "0x9Aa13F15BdC45995b86e43129681693077f39777";
  }
}
