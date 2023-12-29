export enum EVMChainId {
  ETH = 1,
  ARBITRUM = 42161,
  ARBITRUM_SEPOLIA = 421614,
  ZKSYNC = 324,
  SCROLL = 534352,
  SCROLL_TESTNET = 534351,
  MUMBAI = 80001,
  SEPOLIA = 11155111,
}

export type EVMChains = keyof typeof EVMChainId;

export function getEVMChainId(chain: EVMChains) {
  return EVMChainId[chain];
}
