import { Request, Response } from "express";
import { getLogger } from "../../utils/logger";
import {
  DestinationTypeSchema,
  DiscordDestinationConfigSchema,
  OnchainDestinationConfigSchema,
  TelegramDestinationConfigSchema,
} from "../models/destination";
import zodToJsonSchema from "zod-to-json-schema";

const logger = getLogger("destination.controller");

async function getDestinationConfigSchema(req: Request, res: Response) {
  const parsedDestinationType = await DestinationTypeSchema.safeParseAsync(
    req.params.destinationType,
  );
  if (!parsedDestinationType.success) {
    logger.error("Error parsing destination type", parsedDestinationType.error);
    res.status(400).send(parsedDestinationType.error.issues);
  } else {
    const destinationType = parsedDestinationType.data;
    const _subType = req.params.subType;
    switch (destinationType) {
      case "telegram":
        res.send(zodToJsonSchema(TelegramDestinationConfigSchema));
        break;
      case "discord":
        res.send(zodToJsonSchema(DiscordDestinationConfigSchema));
        break;
      case "onchain":
        res.send(zodToJsonSchema(OnchainDestinationConfigSchema));
        break;
      case "webhook":
      default:
        res.status(400).send("Invalid destination type");
    }
  }
}

export default {
  getDestinationConfigSchema,
};
