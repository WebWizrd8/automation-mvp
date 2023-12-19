import "dotenv/config";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { AbstractWallet, Chain, SmartWallet } from "@thirdweb-dev/wallets";
import { Arbitrum, Ethereum, Mumbai } from "@thirdweb-dev/chains";
import { LocalWalletNode } from "@thirdweb-dev/wallets/evm/wallets/local-wallet-node";

export function getChain(chainId: number) {
  switch (chainId) {
    case 80001:
      return Mumbai;
    case 421611:
      return Arbitrum;
    case 1:
    default:
      return Ethereum;
  }
}

export async function getBackendWallet(chain: Chain, walletToControl: string) {
  //This wallet will act as out backend server wallet
  const sessionWallet = new LocalWalletNode();
  await sessionWallet.import({
    privateKey: process.env.THIRDWEB_BACKEND_SK!,
    encryption: {
      password: process.env.THIRDWEB_BACKEND_SK_PASSWORD!,
    },
  });

  const config = {
    chain: chain,
    factoryAddress: "0xC0b522846a965345d4135ae5d55cF2954D3aF82a",
    secretKey: process.env.THIRDWEB_SECRET_KEY,
    gasless: true,
  };

  const sessionKeyAddress = await sessionWallet.getAddress();
  console.log("SessionKeyAddress", sessionKeyAddress);

  const sessionSmartWallet = new SmartWallet(config);
  await sessionSmartWallet.connect({
    personalWallet: sessionWallet,
    accountAddress: walletToControl,
  });

  return sessionSmartWallet;
}

export async function getSdk(wallet: AbstractWallet, chain: Chain) {
  return await ThirdwebSDK.fromWallet(wallet, chain, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
}

export async function getErc20Balance(sdk: ThirdwebSDK, token: string) {
  return (await sdk.wallet.balance(token)).value;
}
