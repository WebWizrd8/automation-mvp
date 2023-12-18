import dbClient from "../utils/db-client";

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function find_matching_actions(message: any) {
  console.log("Calling PostgreSQL function with message:", message);
  try {
    const params = [message];
    const result: [{ find_matching_actions: number }] =
      await dbClient.$queryRawUnsafe(
        `SELECT find_matching_actions($1::jsonb)`,
        ...params,
      );
    console.log("Result from PostgreSQL function:", result);
    await dbClient.$disconnect();
    const alert_ids = result.map((r) => r.find_matching_actions);
    return alert_ids;
  } catch (error) {
    console.error("Error calling PostgreSQL function:", error);
  }
}
