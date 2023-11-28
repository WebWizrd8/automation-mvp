export function getNewBlocksChannel(chainId: number): string {
  return `new-blocks-${chainId}`;
}
// const pubSubSystem = new RedisPubSubSystem();
// const newBlocksChannel = getNewBlocksChannel(chainId);
// pubSubSystem.getSubscriberCount;
