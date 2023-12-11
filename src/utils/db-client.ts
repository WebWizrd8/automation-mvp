import { PrismaClient } from "@prisma/client";

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
