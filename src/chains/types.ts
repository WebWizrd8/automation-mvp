export enum EVMChainId {
  ETH = 1,
  ARBITRUM = 42161,
  ZKSYNC = 324,
  SCROLL = 534352,
}

export type EVMChains = keyof typeof EVMChainId;
