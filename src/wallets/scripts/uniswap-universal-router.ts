//NOTE: This script works with versions
// "@thirdweb-dev/sdk": "^4.0.14",
// "@thirdweb-dev/wallets": "^2.1.6",
import "dotenv/config";
import { AbstractWallet, SmartWallet } from "@thirdweb-dev/wallets";
import { Mumbai } from "@thirdweb-dev/chains";
import { LocalWalletNode } from "@thirdweb-dev/wallets/evm/wallets/local-wallet-node";
import { Token } from "@uniswap/sdk-core";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

const chain = Mumbai;

const WMATIC = new Token(
  chain.chainId,
  "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
  18,
  "WMATIC",
  "Wrapped Matic",
);

const WETH = new Token(
  chain.chainId,
  "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
  18,
  "WETH",
  "Wrapped Ether",
);

const USDC = new Token(
  chain.chainId,
  "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23",
  6,
  "USDC",
  "USD Coin",
);

async function getSdk(wallet: AbstractWallet) {
  return await ThirdwebSDK.fromWallet(wallet, chain, {
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
}

async function run() {
  //Personal Wallet
  const personalWallet = new LocalWalletNode({
    chain: chain,
    storageJsonFile: "sec/personalWallet.json",
  });
  await personalWallet.loadOrCreate({
    encryption: false,
    strategy: "privateKey",
  });
  console.log("----------- Personal Wallet -----------");
  console.log("Address: ", await personalWallet.getAddress());
  console.log("Balance: ", await personalWallet.getBalance());
  console.log("--------------------------------------");
  // const personalSdk = await getSdk(personalWallet);
  // await mintWMatic(personalSdk, "5");
  //Transfer some WMATIC to the smart wallet
  // await transfer(
  //   personalSdk,
  //   "5",
  //   "0x7780CcB62782b58c34A51837097B3BD2BD2c4416",
  //   WMATIC.address,
  // );

  const config = {
    chain: chain,
    factoryAddress: "0xC0b522846a965345d4135ae5d55cF2954D3aF82a",
    secretKey: process.env.THIRDWEB_SECRET_KEY,
    gasless: true,
  };

  // Smart Wallet which is an abtract account
  const smartWallet = new SmartWallet(config);
  await smartWallet.connect({
    personalWallet,
  });

  console.log("----------- Smart Wallet -----------");
  console.log("Address: ", await smartWallet.getAddress());
  console.log("Balance: ", await smartWallet.getBalance());
  const signers = await smartWallet.getAllActiveSigners();
  console.log("Smart wallet now has", signers.length, "active signers");
  console.log("------------------------------------");

  const sdk = await getSdk(smartWallet);
  await mintWMatic(sdk, "0.1");

  //This wallet will act as out backend server wallet
  const sessionWallet = new LocalWalletNode({
    storageJsonFile: "sec/sessionWallet.json",
  });
  await sessionWallet.loadOrCreate({
    encryption: false,
    strategy: "privateKey",
  });
  const sessionKeyAddress = await sessionWallet.getAddress();
  console.log("SessionKeyAddress", sessionKeyAddress);

  const sessionSmartWallet = new SmartWallet(config);
  await sessionSmartWallet.connect({
    personalWallet: sessionWallet,
    accountAddress: await smartWallet.getAddress(),
  });
  const sessionSdk = await getSdk(sessionSmartWallet);
  await mintWMatic(sessionSdk, "0.1");
}

const mintWMatic = async (sdk: ThirdwebSDK, amount: string) => {
  const wMaticContract = await sdk.getContract(WMATIC.address);
  const txDeposit = wMaticContract.prepare("deposit", [], {
    value: ethers.utils.parseEther(amount),
  });
  const txReceipt = await txDeposit.send();
  // const rawTx = await txApprove.populateTransaction();
  // console.log("txPrepared", rawTx);
  // const txReceipt = await sdk.wallet.sendRawTransaction(rawTx);
  await txReceipt.wait(2);
  console.log("txReceipt", txReceipt);
};

// async function transfer(
//   sdk: ThirdwebSDK,
//   amount: string,
//   to: string,
//   token?: string,
// ) {
//   const txTrnsfr = await sdk.wallet.transfer(to, amount, token);
//   console.log(`Transfered ${amount} to ${to}`, txTrnsfr);
// }

run().catch(console.error);
