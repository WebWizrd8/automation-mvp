import { PrismaClient } from "@prisma/client";
import {
  RegisterSessionKeyRequest,
  SmartAccountRegisterRequest,
} from "../models/account";
import { getActiveBackendWalletByChainId } from "../../wallets/backend-wallets";

export class AccountFactoryRecord {
  id: number;
  address: string;
  chainId: number;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;

  constructor({
    id,
    address,
    chainId,
    createdAt,
    updatedAt,
    description,
  }: {
    id: number;
    address: string;
    chainId: number;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
  }) {
    this.id = id;
    this.address = address;
    this.chainId = chainId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.description = description;
  }
}
export class BackendWallet {
  id: number;
  address: string;
  chainId: number;
  createdAt: Date;

  constructor({
    id,
    address,
    chainId,
    createdAt,
  }: {
    id: number;
    address: string;
    chainId: number;
    createdAt: Date;
  }) {
    this.id = id;
    this.address = address;
    this.chainId = chainId;
    this.createdAt = createdAt;
  }
}

export class SmartAccountRecord {
  walletAddress: string;

  constructor() {
    this.walletAddress = "0x7780CcB62782b58c34A51837097B3BD2BD2c4416";
  }
}

export class AccountsService {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly client: PrismaClient;

  constructor(dbClient: PrismaClient) {
    this.client = dbClient;
  }

  async getAccountFactories(): Promise<AccountFactoryRecord[]> {
    //TODO: Get this from the database
    const accountFactories = [
      new AccountFactoryRecord({
        id: 1,
        address: "0xC0b522846a965345d4135ae5d55cF2954D3aF82a",
        chainId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "Test account factory",
      }),
    ];
    return await Promise.resolve(accountFactories);
  }

  async getAllBackendWallets(): Promise<BackendWallet[]> {
    const backendWallets = [
      new BackendWallet({
        id: 1,
        address: getActiveBackendWalletByChainId(1),
        chainId: 1,
        createdAt: new Date(),
      }),
    ];
    return await Promise.resolve(backendWallets);
  }

  async getSmartAccountFromPersonalWallet(
    _personalWalletAddress: number,
  ): Promise<SmartAccountRecord> {
    return await Promise.resolve(new SmartAccountRecord());
  }

  async registerSmartAccount(
    _smartAccountRegisterRequest: SmartAccountRegisterRequest,
  ): Promise<void> {
    return await Promise.resolve();
  }

  async registerSessionKey(
    _registerSessionKeyRequest: RegisterSessionKeyRequest,
  ): Promise<void> {
    return await Promise.resolve();
  }
}
