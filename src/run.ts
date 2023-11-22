import "dotenv/config";
import { EVMChainId } from "./chains/types";
import { DefinedProviderApi } from "./providers/defined";

const provider = new DefinedProviderApi();

const fetcher = provider.getTokenPrice(
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  EVMChainId.ETH,
  //1700589599,
);

const callback = (data: any) => {
  console.log(data.data);
};

fetcher.onData(callback);

const run = async () => {
  await fetcher.startFetching();
};

run();
