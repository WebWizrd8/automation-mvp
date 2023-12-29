import { Request, Response } from "express";
import dbClient from "../../utils/db-client";
import { AccountsService } from "../services/accounts.service";
import {
  RegisterSessionKeyRequestSchema,
  SmartAccountRegisterRequestSchema,
} from "../models/account";
import { getLogger } from "../../utils/logger";

const logger = getLogger("accounts.controller");

const accountsService = new AccountsService(dbClient);

async function getAccountFactories(_req: Request, res: Response) {
  const accountFactories = await accountsService.getAccountFactories();
  res.json(accountFactories);
}

async function getAllBackendWallets(_req: Request, res: Response) {
  const backendWallets = await accountsService.getAllBackendWallets();
  res.json(backendWallets);
}

async function getSmartAccountFromPersonalWallet(req: Request, res: Response) {
  const personalWalletAddress = req.params.walletAddress;
  const smartAccount = await accountsService.getSmartAccountFromPersonalWallet(
    personalWalletAddress,
  );
  res.json(smartAccount);
}

async function registerSmartAccount(req: Request, res: Response) {
  const parsedRequest = SmartAccountRegisterRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    logger.error(
      "Error parsing smart account register request",
      parsedRequest.error,
    );
    res.status(400).send(parsedRequest.error.issues);
  } else {
    await accountsService.registerSmartAccount(parsedRequest.data);
  }
  res.status(200).send();
}

async function registerSessionKey(req: Request, res: Response) {
  const parsedRequest = RegisterSessionKeyRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    logger.error(
      "Error parsing smart account register request",
      parsedRequest.error,
    );
    res.status(400).send(parsedRequest.error.issues);
  } else {
    await accountsService.registerSessionKey(parsedRequest.data);
  }
  res.status(200).send();
}

export default {
  getAccountFactories,
  getAllBackendWallets,
  getSmartAccountFromPersonalWallet,
  registerSmartAccount,
  registerSessionKey,
};
