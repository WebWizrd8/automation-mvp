import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function find_matching_alerts(message: string) {
  console.log("Calling PostgreSQL function with message:", message);
  try {
    const params = [message];
    const result: [{ find_matching_alerts: number }] =
      await prisma.$queryRawUnsafe(
        `SELECT find_matching_alerts($1::jsonb)`,
        ...params,
      );
    console.log("Result from PostgreSQL function:", result);
    await prisma.$disconnect();
    const alert_ids = result.map((r) => r.find_matching_alerts);
    return alert_ids;
  } catch (error) {
    console.error("Error calling PostgreSQL function:", error);
  }
}
