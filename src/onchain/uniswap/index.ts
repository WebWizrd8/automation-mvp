import "dotenv/config";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import {
  PERMIT2_ADDRESS,
  SwapOptions,
  SwapRouter,
  UNIVERSAL_ROUTER_ADDRESS,
  UniswapTrade,
} from "@uniswap/universal-router-sdk";
import {
  TradeType,
  Token,
  Currency,
  Percent,
  BigintIsh,
  CurrencyAmount,
} from "@uniswap/sdk-core";
import { Trade as RouterTrade } from "@uniswap/router-sdk";
import {
  Pool,
  FeeAmount,
  Trade as V3Trade,
  TickMath,
  TICK_SPACINGS,
  nearestUsableTick,
  Route as RouteV3,
} from "@uniswap/v3-sdk";
import IUniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import JSBI from "jsbi";
import { approveToken, toInputPermit } from "./permits";
import { BigNumber, ethers } from "ethers";
import { getErc20Balance } from "../utils";
import { getLogger } from "../../utils/logger";
import { MaxUint160 } from "@uniswap/permit2-sdk";

const SLIPPAGE_TOLERANCE = new Percent(5, 100);

const logger = getLogger("onchain/uniswap");

export async function getPool(
  sdk: ThirdwebSDK,
  tokenA: Token,
  tokenB: Token,
  feeAmount: FeeAmount,
) {
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
}

export function buildTrade(trades: V3Trade<Currency, Currency, TradeType>[]) {
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

export function swapOptions(options: Partial<SwapOptions>): SwapOptions {
  return Object.assign(
    {
      slippageTolerance: SLIPPAGE_TOLERANCE,
    },
    options,
  );
}

export async function swapUsingUniversalRouter(
  sdk: ThirdwebSDK,
  {
    chainId,
    inputAmount,
    input,
    output,
  }: {
    chainId: number;
    inputAmount: string;
    input: Token;
    output: Token;
  },
) {
  const sdkWalletAddress = await sdk.wallet.getAddress();
  logger.debug(
    "Uniswap Universal Router Address",
    UNIVERSAL_ROUTER_ADDRESS(chainId),
  );

  logger.debug(`Allowing Universal Router to spend ${input.symbol}`);

  const { signature: permitSignature, permit } = await approveToken(
    sdk,
    input.address,
    MaxUint160.toString(),
    PERMIT2_ADDRESS,
    UNIVERSAL_ROUTER_ADDRESS(chainId),
    chainId,
  );

  const uniPool = await getPool(sdk, input, output, FeeAmount.HIGH);

  const trade = await V3Trade.fromRoute(
    new RouteV3([uniPool], input, output),
    CurrencyAmount.fromRawAmount(input, inputAmount),
    TradeType.EXACT_INPUT,
  );
  const routerTrade = buildTrade([trade]);
  const opts = swapOptions({
    recipient: sdkWalletAddress,
    inputTokenPermit: toInputPermit(permitSignature, permit),
  });

  logger.debug("UniswapTrade", new UniswapTrade(routerTrade, opts));

  const params = SwapRouter.swapCallParameters(
    new UniswapTrade(routerTrade, opts),
  );

  logger.debug("params", params);

  logger.debug(
    `Smart Wallet Balance for Token ${uniPool.token0.symbol}`,
    await getErc20Balance(sdk, uniPool.token0.address),
  );
  logger.debug(
    `Smart Wallet Balance for Token ${uniPool.token1.symbol}`,
    await getErc20Balance(sdk, uniPool.token1.address),
  );

  logger.debug("Sending transaction");

  const tx = await sdk.wallet.sendRawTransaction({
    data: params.calldata,
    to: UNIVERSAL_ROUTER_ADDRESS(chainId),
    value: params.value,
    from: await sdk.wallet.getAddress(),
    gasLimit: BigNumber.from("1957840"),
  });
  logger.debug("Transaction sent, waiting for confirmations", tx);
  await tx.wait(1);

  logger.debug(
    `Smart Wallet Balance for Token ${uniPool.token0.symbol}`,
    await getErc20Balance(sdk, uniPool.token0.address),
  );
  logger.debug(
    `Smart Wallet Balance for Token ${uniPool.token1.symbol}`,
    await getErc20Balance(sdk, uniPool.token1.address),
  );
}
