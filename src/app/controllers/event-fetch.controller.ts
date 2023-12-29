import { Request, Response } from "express";
import {
  EventFetchRequestFunctionService,
  EventFetchRequestService,
  EventTagService,
} from "../services/event-fetch.service";
import { EventFetchRequestTriggerWithConditionsRequestSchema } from "../models/event-fetch";
import { getLogger } from "../../utils/logger";

const logger = getLogger("event-fetch.controller");

const eventTagService = new EventTagService();
const eventFetchRequestService = new EventFetchRequestService();
const eventFetchRequestFunctionService = new EventFetchRequestFunctionService();

export async function getAllEventFetchTags(_req: Request, res: Response) {
  const tags = await eventTagService.getAllEventFetchTags();
  res.send(tags);
}

export async function getEventFetchTagsByChainId(req: Request, res: Response) {
  const chainId = Number(req.params.chainId);
  const tags = await eventTagService.getEventFetchTagsByChainId(chainId);
  res.send(tags);
}

export async function getAllEventFetchRequests(_req: Request, res: Response) {
  const events = await eventFetchRequestService.getAllEventFetchRequests();
  res.send(events);
}

export async function getEventFetchRequestById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const event = await eventFetchRequestService.getEventFetchRequestById(id);
  res.send(event);
}

export async function getEventFetchRequestFunctionById(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);
  const event =
    await eventFetchRequestFunctionService.getEventFetchRequestFunctionById(id);
  res.send(event);
}

export function getEventFetchRequestFunctions(_req: Request, res: Response) {
  const event =
    eventFetchRequestFunctionService.getAllEventFetchRequestFunctions();
  res.send(event);
}

export async function getEventFetchRequestFunctionForIdWithActions(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);
  const event =
    await eventFetchRequestFunctionService.getEventFetchRequestFunctionForIdWithActions(
      id,
    );
  res.send(event);
}

export async function getAllEventFetchRequestFunctionsWithActionsByUserId(
  req: Request,
  res: Response,
) {
  const userId = req.params.userId;
  if (!userId) {
    res.status(400).send("userId is required");
    return;
  }
  const event =
    await eventFetchRequestFunctionService.getAllEventFetchRequestFunctionsWithActions(
      { userId },
    );
  res.send(event);
}

export async function createEventFetchRequestFunctionWithActions(
  req: Request,
  res: Response,
) {
  const body = req.body;

  const parsedEvent =
    EventFetchRequestTriggerWithConditionsRequestSchema.safeParse(body);
  if (!parsedEvent.success) {
    logger.error(
      "Error parsing event fetch request trigger function",
      parsedEvent.error,
    );
    res.status(400).send(parsedEvent.error.issues);
  } else {
    const returnedRecord =
      await eventFetchRequestFunctionService.createEventFetchRequestFunctionForIdWithActions(
        parsedEvent.data,
      );
    res.send(returnedRecord);
  }

  res.send({});
}

export async function deleteEventFetchRequestFunctionWithActions(
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);
  await eventFetchRequestFunctionService.deleteEventFetchRequestFunctionWithActions(
    id,
  );
  res.send({});
}

export async function updateEventFetchRequestFunctionWithActions(
  req: Request,
  res: Response,
) {
  const body = req.body;
  const id = Number(req.params.id);

  const parsedEvent =
    EventFetchRequestTriggerWithConditionsRequestSchema.safeParse(body);
  if (!parsedEvent.success) {
    logger.error(
      "Error parsing event fetch request trigger function",
      parsedEvent.error,
    );
    res.status(400).send(parsedEvent.error.issues);
  } else {
    await eventFetchRequestFunctionService.updateEventFetchRequestFunctionWithActions(
      id,
      parsedEvent.data,
    );
  }

  res.send({});
}
