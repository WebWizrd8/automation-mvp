import { Request, Response } from "express";
import {
  EventFetchRequestService,
  EventTagService,
} from "../services/event-fetch.service";

const eventTagService = new EventTagService();
const eventFetchRequestService = new EventFetchRequestService();

export async function getAllEventFetchTags(_req: Request, res: Response) {
  const tags = await eventTagService.getAllEventFetchTags();
  res.send(tags);
}

export async function getEventFetchTagsByChainId(req: Request, res: Response) {
  const chainId = Number(req.params.chainId);
  const tags = await eventTagService.getEventFetchTagsByChainId(chainId);
  res.send(tags);
}

export async function getAllEventFetchRequests(req: Request, res: Response) {
  const events = await eventFetchRequestService.getAllEventFetchRequests();
  res.send(events);
}

export async function getEventFetchRequestById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const event = await eventFetchRequestService.getEventFetchRequestById(id);
  res.send(event);
}
