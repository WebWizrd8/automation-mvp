import { PrismaClient } from "@prisma/client";

export type PrismaClientTrans = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const dbClient = new PrismaClient({
  log: (() => {
    switch (process.env.NODE_ENV) {
      case "production":
        return ["warn", "error"];
      case "test":
        return ["query", "error"];
      default:
        return ["query"];
    }
  })(),
});

export default dbClient;
