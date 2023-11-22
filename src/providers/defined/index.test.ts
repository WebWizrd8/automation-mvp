import { DefinedProviderApi } from ".";
import mockAxios from "jest-mock-axios";
import { EVMChainId } from "../../chains/types";

describe("DefinedProvider", () => {
  let provider: DefinedProviderApi;

  beforeAll(() => {
    provider = new DefinedProviderApi();
  });

  it("should construct properly", async () => {
    const expectedToken = {
      data: {
        getTokenPrices: [
          {
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            networkId: 1,
            priceUsd: 1995.603382315396,
            timestamp: 1700585423,
          },
        ],
      },
    };
    const fetcher = provider.getTokenPrice(
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      EVMChainId.ETH,
    );
    const callback = jest.fn();
    fetcher.onData(callback);
    mockAxios.mockResolvedValue(expectedToken);
    await fetcher.startFetching();
    fetcher.stopFetching();
    expect(callback).toHaveBeenCalledWith(expectedToken.data);
  });
});
