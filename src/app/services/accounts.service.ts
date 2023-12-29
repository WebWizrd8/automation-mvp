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
  id: number;
  walletAddress: string;
  userAddress: string;
  factoryId: number;
  chainId: number;
  active: boolean;
  createdAt: Date;

  constructor({
    id,
    walletAddress,
    userAddress,
    factoryId,
    chainId,
    active,
    createdAt,
  }: {
    id: number;
    walletAddress: string;
    userAddress: string;
    factoryId: number;
    chainId: number;
    active: boolean;
    createdAt: Date;
  }) {
    this.id = id;
    this.walletAddress = walletAddress;
    this.userAddress = userAddress;
    this.factoryId = factoryId;
    this.chainId = chainId;
    this.active = active;
    this.createdAt = createdAt;
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

  async getAccountFactoryByAddress(
    address: string,
  ): Promise<AccountFactoryRecord> {
    if (address === "0xC0b522846a965345d4135ae5d55cF2954D3aF82a") {
      return await Promise.resolve(
        new AccountFactoryRecord({
          id: 1,
          address: "0xC0b522846a965345d4135ae5d55cF2954D3aF82a",
          chainId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: "Test account factory",
        }),
      );
    }
    throw new Error("Account factory not found");
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
    personalWalletAddress: string,
  ): Promise<SmartAccountRecord> {
    const t = await this.client.smart_account.findFirst({
      where: {
        user_address: personalWalletAddress,
      },
    });

    if (t === null) {
      throw new Error("Smart account not found");
    }

    return new SmartAccountRecord({
      id: t.id,
      walletAddress: t.wallet_address,
      userAddress: t.user_address,
      factoryId: t.factory_id,
      chainId: t.chain_id,
      active: t.active,
      createdAt: t.createdAt,
    });
  }

  async getSmartAccountFromAddress(
    address: string,
  ): Promise<SmartAccountRecord> {
    const t = await this.client.smart_account.findFirst({
      where: {
        wallet_address: address,
      },
    });

    if (t === null) {
      throw new Error("Smart account not found");
    }

    return new SmartAccountRecord({
      id: t.id,
      walletAddress: t.wallet_address,
      userAddress: t.user_address,
      factoryId: t.factory_id,
      chainId: t.chain_id,
      active: t.active,
      createdAt: t.createdAt,
    });
  }

  async registerSmartAccount(
    smartAccountRegisterRequest: SmartAccountRegisterRequest,
  ): Promise<void> {
    await this.client.smart_account.create({
      data: {
        active: true,
        wallet_address: smartAccountRegisterRequest.accountAddress,
        user_address: smartAccountRegisterRequest.userAddress,
        factory_id: await this.getAccountFactoryByAddress(
          smartAccountRegisterRequest.factoryAddress,
        ).then((factory) => factory.id),
        chain_id: smartAccountRegisterRequest.chainId,
      },
    });
  }

  async registerSessionKey(
    registerSessionKeyRequest: RegisterSessionKeyRequest,
  ): Promise<void> {
    await this.client.session_key.create({
      data: {
        session_key_address: registerSessionKeyRequest.sessionKeyAddress,
        smart_account_id: await this.getSmartAccountFromAddress(
          registerSessionKeyRequest.smartAccountAddress,
        ).then((smartAccount) => smartAccount.id),
        chain_id: registerSessionKeyRequest.chainId,
        approved_call_targets: registerSessionKeyRequest.approvedCallTargets,
        native_token_limit: registerSessionKeyRequest.nativeTokenLimit,
        start_date: registerSessionKeyRequest.startDate,
        expiration_date: registerSessionKeyRequest.expirationDate,
        txn_hash: registerSessionKeyRequest.txnHash,
      },
    });
  }
}
