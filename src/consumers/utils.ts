export function getNewConsumerId(id: number, tag_id: number): string {
  return `consumer-${id}-${tag_id}`;
}
