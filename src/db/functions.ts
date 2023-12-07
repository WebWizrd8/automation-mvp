import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function find_matching_actions(message: any) {
  console.log("Calling PostgreSQL function with message:", message);
  try {
    const params = [message];
    const result: [{ find_matching_actions: number }] =
      await prisma.$queryRawUnsafe(
        `SELECT find_matching_actions($1::jsonb)`,
        ...params,
      );
    console.log("Result from PostgreSQL function:", result);
    await prisma.$disconnect();
    const alert_ids = result.map((r) => r.find_matching_actions);
    return alert_ids;
  } catch (error) {
    console.error("Error calling PostgreSQL function:", error);
  }
}
