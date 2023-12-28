import dbClient from "../../../utils/db-client";
import { getLogger } from "../../../utils/logger";

const logger = getLogger("spot_price/index");

export async function getPricesByStandardWindows(
  chainId: number,
  tokenAddress: string,
) {
  //Get timestamp of 90d ago from now and get all token_prices from that timestamp to now
  const now = new Date();
  const tokenPrices = await getNinetyDayPrices(chainId, tokenAddress, now);
  //Sort tokenPrices by timestamp in ascending order
  tokenPrices.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  logger.info(`tokenPrices Length ${tokenPrices.length}`);
  logger.info("tokenPrices", tokenPrices[tokenPrices.length - 1]);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(now.getDate() - 1);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  const oneDayPrices = tokenPrices.filter(
    (tokenPrice) => tokenPrice.timestamp >= oneDayAgo,
  );
  const sevenDayPrices = tokenPrices.filter(
    (tokenPrice) => tokenPrice.timestamp >= sevenDaysAgo,
  );
  const thirtyDayPrices = tokenPrices.filter(
    (tokenPrice) => tokenPrice.timestamp >= thirtyDaysAgo,
  );
  const sixtyDayPrices = tokenPrices.filter(
    (tokenPrice) => tokenPrice.timestamp >= sixtyDaysAgo,
  );
  const ninetyDayPrices = tokenPrices;

  //Calculate price change from 1d, 7d, 30d, 60d, 90d
  const priceMaps = {
    "1D": oneDayPrices,
    "7D": sevenDayPrices,
    "30D": thirtyDayPrices,
    "60D": sixtyDayPrices,
    "90D": ninetyDayPrices,
  };
  return priceMaps;
}

export async function getAllPrices(chainId: number, tokenAddress: string) {
  const tokenPrices = await dbClient.token_prices.findMany({
    where: {
      chain_id: chainId,
      token_address: tokenAddress,
    },
  });
  //Sort tokenPrices by timestamp in ascending order
  tokenPrices.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  logger.debug(`tokenPrices Length ${tokenPrices.length}`);
  logger.debug("tokenPrices", tokenPrices[tokenPrices.length - 1]);
  return tokenPrices;
}

export async function getNinetyDayPrices(
  chainId: number,
  tokenAddress: string,
  now: Date = new Date(),
) {
  //Get timestamp of 90d ago from now and get all token_prices from that timestamp to now
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 90);
  const tokenPrices = await dbClient.token_prices.findMany({
    where: {
      chain_id: chainId,
      token_address: tokenAddress,
      timestamp: {
        gte: ninetyDaysAgo,
      },
    },
  });
  //Sort tokenPrices by timestamp in ascending order
  tokenPrices.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  logger.debug(`tokenPrices Length ${tokenPrices.length}`);
  logger.debug("tokenPrices", tokenPrices[tokenPrices.length - 1]);
  return tokenPrices;
}
