export enum ConnectionType {
  HTTP = "http",
  WS = "ws",
}

/*

model endpoint {
  id              Int             @id @default(autoincrement())
  name            String          @unique
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  description     String?
  connection_kind connection_type
  provider_id     Int
  provider        provider        @relation(fields: [provider_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
}
*/

export class EndpointRecord {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  connection_kind: ConnectionType;
  provider_id: number;

  constructor(
    id: number,
    name: string,
    createdAt: string,
    updatedAt: string,
    description: string,
    connection_kind: ConnectionType,
    provider_id: number,
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
    this.connection_kind = connection_kind;
    this.provider_id = provider_id;
  }
}

export function getEndpointRecordFromId(id: number): EndpointRecord {
  let endpointRecord: EndpointRecord;
  if (id === 0) {
    endpointRecord = new EndpointRecord(
      0,
      "newHeads",
      new Date().toISOString(),
      new Date().toISOString(),
      "Get new heads from the chain using Alchemy ws",
      ConnectionType.WS,
      0,
    );
  } else if (id === 1) {
    endpointRecord = new EndpointRecord(
      1,
      "getTokenPrices",
      new Date().toISOString(),
      new Date().toISOString(),
      "Get token prices from Defined",
      ConnectionType.HTTP,
      1,
    );
  } else {
    throw new Error(`Unknown endpoint id: ${id}`);
  }
  return endpointRecord;
}
