import { PrismaClient } from "@prisma/client";
import { UserRegisterRequest } from "../models/user";

export default class UserService {
  private dbClient: PrismaClient;

  constructor(dbClient: PrismaClient) {
    this.dbClient = dbClient;
  }

  async registerUser({ userAddress, address_type }: UserRegisterRequest) {
    const user = await this.dbClient.user.create({
      data: {
        address: userAddress,
        address_type,
      },
    });
    return user;
  }
}
