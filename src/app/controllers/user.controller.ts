import { Request, Response } from "express";
import dbClient from "../../utils/db-client";
import UserService from "../services/user.service";
import { getLogger } from "../../utils/logger";
import { UserRegisterRequestSchema } from "../models/user";

const logger = getLogger("user.controller");

const accountsService = new UserService(dbClient);

async function registerUser(req: Request, res: Response) {
  const parsedRequest = UserRegisterRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    logger.error("Error parsing user register request", parsedRequest.error);
    res.status(400).send(parsedRequest.error.issues);
  } else {
    try {
      await accountsService.registerUser(parsedRequest.data);
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.error("Error registering user", e);
      res.status(500).send("Error registering user");
    }
  }
  res.status(200).send();
}

export default {
  registerUser,
};
