import { EndpointRecord, getEndpointRecordFromId } from "../db/endpoint";
import { getProviderFromId } from "../db/provider";
import ApiProvider from "../providers";

export class Endpoint {
  record: EndpointRecord;
  provider: ApiProvider;

  constructor(id: number) {
    this.record = getEndpointRecordFromId(id);
    this.provider = getProviderFromId(this.record.provider_id);
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
