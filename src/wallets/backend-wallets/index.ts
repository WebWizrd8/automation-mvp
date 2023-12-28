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
    default:
    case EVMChainId.ETH:
      return await sessionWallet.getAddress();
  }
}
