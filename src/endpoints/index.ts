import { EndpointRecord, getEndpointRecordFromId } from "../db/endpoint";
import { getProviderFromId } from "../db/provider";
import ApiProvider from "../providers";

export class Endpoint {
  record: EndpointRecord;
  provider: ApiProvider;

  constructor(record: EndpointRecord, provider: ApiProvider) {
    this.record = record;
    this.provider = provider;
  }

  static async fromId(id: number) {
    const record = await getEndpointRecordFromId(id);
    const provider = await getProviderFromId(record.provider_id);
    return new Endpoint(record, provider);
  }

  getId() {
    return this.record.id;
  }

  getFetcher() {}

  getName() {
    return this.record.name;
  }

  getConnectionType() {
    return this.record.connection_kind;
  }
}
