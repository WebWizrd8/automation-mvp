import { Request, Response } from "express";
import dbClient from "../../utils/db-client";

async function getAllChains(req: Request, res: Response) {
  const chains = await dbClient.chain.findMany();
  res.send(chains);
}

export default {
  getAllChains,
};
