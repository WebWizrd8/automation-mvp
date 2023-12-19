import { Mumbai, Arbitrum, Ethereum } from "@thirdweb-dev/chains";
import { Token } from "@uniswap/sdk-core";

export function getToken(tokenSymbol: string, chainId: number) {
  switch (chainId) {
    case Mumbai.chainId: {
      switch (tokenSymbol) {
        case "WMATIC":
          return new Token(
            chainId,
            "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
            18,
            "WMATIC",
            "Wrapped Matic",
          );
        case "WETH":
          return new Token(
            chainId,
            "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
            18,
            "WETH",
            "Wrapped Ether",
          );
        case "USDC":
          return new Token(
            chainId,
            "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23",
            6,
            "USDC",
            "USD Coin",
          );
        default:
          throw new Error("Token not found");
      }
    }
    //Arbitrum
    case Arbitrum.chainId:
      switch (tokenSymbol) {
        case "WETH":
          return new Token(
            chainId,
            "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            18,
            "WETH",
            "Wrapped Ether",
          );
        case "USDC":
          return new Token(
            chainId,
            "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
            6,
            "USDC",
            "USD Coin",
          );
        case "DAI":
          return new Token(
            chainId,
            "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
            18,
            "DAI",
            "Dai Stablecoin",
          );
        default:
          throw new Error("Token not found");
      }
    // Mainnet
    case Ethereum.chainId:
    default: {
      switch (tokenSymbol) {
        case "WETH":
          return new Token(
            chainId,
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            18,
            "WETH",
            "Wrapped Ether",
          );
        case "USDC":
          return new Token(
            chainId,
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            6,
            "USDC",
            "USD Coin",
          );
        case "DAI":
          return new Token(
            chainId,
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            18,
            "DAI",
            "Dai Stablecoin",
          );
      }
    }
  }
}
