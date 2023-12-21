//NOTE: This script works with versions
// "@thirdweb-dev/sdk": "^4.0.14",
// "@thirdweb-dev/wallets": "^2.1.6",
import "dotenv/config";
import { AbstractWallet, SmartWallet } from "@thirdweb-dev/wallets";
import { Mumbai } from "@thirdweb-dev/chains";
import { LocalWalletNode } from "@thirdweb-dev/wallets/evm/wallets/local-wallet-node";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BigNumber, ethers } from "ethers";
import {
  SwapRouter,
  UNIVERSAL_ROUTER_ADDRESS,
  UniswapTrade,
  SwapOptions,
  PERMIT2_ADDRESS,
} from "@uniswap/universal-router-sdk";
import {
  TradeType,
  Token,
  CurrencyAmount,
  Currency,
  Percent,
  BigintIsh,
} from "@uniswap/sdk-core";
import { Trade as RouterTrade } from "@uniswap/router-sdk";
import {
  Pool,
  FeeAmount,
  Trade as V3Trade,
  Route as RouteV3,
  TickMath,
  TICK_SPACINGS,
  nearestUsableTick,
} from "@uniswap/v3-sdk";
import IUniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import JSBI from "jsbi";
import {
  AllowanceTransfer,
  MaxUint160,
  PermitSingle,
} from "@uniswap/permit2-sdk";
import { Permit2Permit } from "@uniswap/universal-router-sdk/dist/utils/inputTokens";

const chain = Mumbai;

const WMATIC = new Token(
  chain.chainId,
  "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
  18,
  "WMATIC",
  "Wrapped Matic",
);

// const WETH = new Token(
//   chain.chainId,
//   "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
//   18,
//   "WETH",
//   "Wrapped Ether",
// );

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
  // for (const signer of signers) {
  //   console.log("Signer", signer);
  // }

  const smartWalletSdk = await getSdk(smartWallet);

  //This wallet will act as out backend server wallet
  const sessionWallet = new LocalWalletNode({
    storageJsonFile: "sec/sessionWallet.json",
  });
  await sessionWallet.loadOrCreate({
    encryption: false,
    strategy: "privateKey",
  });

  const exportedKey = await sessionWallet.export({
    strategy: "privateKey",
    encryption: {
      password: process.env.THIRDWEB_BACKEND_SK_PASSWORD!,
    },
  });
  console.log("SK", exportedKey);

  const sessionKeyAddress = await sessionWallet.getAddress();
  console.log("SessionKeyAddress", sessionKeyAddress);
  process.exit(0);
  // const _ = await smartWallet.createSessionKey(sessionKeyAddress, {
  //   approvedCallTargets: "*",
  //   startDate: new Date(),
  //   expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  // });

  // await smartWallet.revokeSessionKey(sessionKeyAddress);

  const sessionSmartWallet = new SmartWallet(config);
  await sessionSmartWallet.connect({
    personalWallet: sessionWallet,
    accountAddress: await smartWallet.getAddress(),
  });

  // const sessionSdk = await getSdk(sessionSmartWallet);

  const inputAmount = ethers.utils.parseEther("1").toString();
  await swapUsingUniversalRouter(smartWalletSdk, inputAmount);
  await sessionSmartWallet.disconnect();
}

const swapUsingUniversalRouter = async (
  sdk: ThirdwebSDK,
  inputAmount: string,
) => {
  const sdkWalletAddress = await sdk.wallet.getAddress();
  console.log(
    "Uniswap Universal Router Address",
    UNIVERSAL_ROUTER_ADDRESS(chain.chainId),
  );

  console.log("Allowing Universal Router to spend WMATIC");

  const { signature: permitSignature, permit } = await approveToken(
    sdk,
    WMATIC.address,
    ethers.constants.MaxUint256.toString(),
    PERMIT2_ADDRESS,
    UNIVERSAL_ROUTER_ADDRESS(chain.chainId),
  );

  console.log("Permit Signature", permitSignature, permit);

  const WMATIC_USDC = await getPool(sdk, WMATIC, USDC, FeeAmount.HIGH);

  const trade = await V3Trade.fromRoute(
    new RouteV3([WMATIC_USDC], WMATIC, USDC),
    CurrencyAmount.fromRawAmount(WMATIC, inputAmount),
    TradeType.EXACT_INPUT,
  );
  const routerTrade = buildTrade([trade]);
  const opts = swapOptions({
    recipient: sdkWalletAddress,
    inputTokenPermit: toInputPermit(permitSignature, permit),
  });

  console.log("UniswapTrade", new UniswapTrade(routerTrade, opts));

  const params = SwapRouter.swapCallParameters(
    new UniswapTrade(routerTrade, opts),
  );

  console.log("params", params);

  console.log("Smart Wallet Balance for Token", WMATIC_USDC.token0.symbol);
  await balance(sdk, WMATIC_USDC.token0.address);
  console.log("Smart Wallet Balance for Token", WMATIC_USDC.token1.symbol);
  await balance(sdk, WMATIC_USDC.token1.address);

  console.log("Sending transaction");

  const tx = await sdk.wallet.sendRawTransaction({
    data: params.calldata,
    to: UNIVERSAL_ROUTER_ADDRESS(chain.chainId),
    value: params.value,
    from: await sdk.wallet.getAddress(),
    gasLimit: BigNumber.from("1957840"),
  });
  console.log("Transaction sent, waiting for confirmations", tx);
  await tx.wait(1);

  console.log("Smart Wallet Balance for Token", WMATIC_USDC.token0.symbol);
  await balance(sdk, WMATIC_USDC.token0.address);
  console.log("Smart Wallet Balance for Token", WMATIC_USDC.token1.symbol);
  await balance(sdk, WMATIC_USDC.token1.address);
};

const approveToken = async (
  sdk: ThirdwebSDK,
  token: string,
  amount: string,
  permit2Address: string,
  universalRouterAddress: string,
) => {
  // console.log("Approving token allowance for", permit2Address);
  // const erc20Contract = await sdk.getContract(token);
  // const txDeposit = erc20Contract.prepare("approve", [permit2Address, amount]);
  // const txSent = await txDeposit.send();
  // // const rawTx = await txApprove.populateTransaction();
  // // console.log("txPrepared", rawTx);
  // // const txReceipt = await sdk.wallet.sendRawTransaction(rawTx);
  // await txSent.wait(2);
  // console.log("Tx Receipt for tokenApproval", txSent);
  // const allowance = await erc20Contract.call("allowance", [
  //   await sdk.wallet.getAddress(),
  //   permit2Address,
  // ]);
  // console.log(`Allowance for ${permit2Address}`, allowance);

  const p2Contract = await sdk.getContract(permit2Address);
  const [p2Amount, p2Expiration, p2Nonce]: [BigNumber, number, number] =
    await p2Contract.call("allowance", [
      await sdk.wallet.getAddress(),
      WMATIC.address,
      universalRouterAddress,
    ]);
  console.log("P2 Amount, Expiration, Nonce", p2Amount, p2Expiration, p2Nonce);

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
    sdk,
    chain.chainId,
    permit2Address,
  );
  return { signature, permit };
};

export async function generatePermitSignature(
  permit: PermitSingle,
  sdk: ThirdwebSDK,
  chainId: number,
  permitAddress: string = PERMIT2_ADDRESS,
): Promise<string> {
  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permit,
    permitAddress,
    chainId,
  );
  //eslint-disable-next-line
  return (await sdk.wallet.signTypedData(domain as any, types, values)).signature;
}

export async function generateEip2098PermitSignature(
  permit: PermitSingle,
  sdk: ThirdwebSDK,
  chainId: number,
  permitAddress: string = PERMIT2_ADDRESS,
): Promise<string> {
  const sig = await generatePermitSignature(
    permit,
    sdk,
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

const getPool = async (
  sdk: ThirdwebSDK,
  tokenA: Token,
  tokenB: Token,
  feeAmount: FeeAmount,
) => {
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA];
  const poolAddress = Pool.getAddress(token0, token1, feeAmount);
  const poolContract = await sdk.getContract(poolAddress, IUniswapV3Pool.abi);
  const slot0 = await poolContract.call("slot0");
  const [sqrtPriceX96, tick]: [BigintIsh, number] = slot0;
  const liquidity: BigintIsh = await poolContract.call("liquidity");
  const pool = new Pool(
    token0,
    token1,
    feeAmount,
    sqrtPriceX96,
    liquidity,
    tick,
    [
      {
        index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: liquidity,
        liquidityGross: liquidity,
      },
      {
        index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: JSBI.multiply(
          JSBI.BigInt(liquidity.toString()),
          JSBI.BigInt("-1"),
        ),
        liquidityGross: liquidity,
      },
    ],
  );
  return pool;
};

function buildTrade(trades: V3Trade<Currency, Currency, TradeType>[]) {
  const routes = trades
    .filter((trade) => trade instanceof V3Trade)
    .flatMap((trade) => {
      const s = trade.swaps.map((swap) => {
        return {
          routev3: swap.route,
          inputAmount: swap.inputAmount,
          outputAmount: swap.outputAmount,
        };
      });
      return s;
    });
  return new RouterTrade({
    v2Routes: [],
    v3Routes: routes,
    mixedRoutes: [],
    tradeType: TradeType.EXACT_INPUT,
  });
}

function swapOptions(options: Partial<SwapOptions>): SwapOptions {
  return Object.assign(
    {
      slippageTolerance: new Percent(5, 100),
    },
    options,
  );
}

// const trade = await V3Trade.fromRoute(
//   new RouteV3([poolAddress], tokenA, tokenB),
//   CurrencyAmount.fromRawAmount(tokenA, "1000000000000000000"),
//   TradeType.EXACT_INPUT,
// );

async function balance(sdk: ThirdwebSDK, token: string) {
  const contract = await sdk.getContract(token);
  const balance: BigNumber = await contract.call("balanceOf", [
    await sdk.wallet.getAddress(),
  ]);
  JSBI.BigInt(balance.toString());
}

run().catch(console.error);
