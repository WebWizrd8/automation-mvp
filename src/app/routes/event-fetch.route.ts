import { Router } from "express";
import * as eventFetchController from "../controllers/event-fetch.controller";

const eventFetchRouter = Router();

eventFetchRouter.get("/tags", eventFetchController.getAllEventFetchTags);
eventFetchRouter.get(
  "/tags/:chainId",
  eventFetchController.getEventFetchTagsByChainId,
);

eventFetchRouter.get(
  "/base-listeners",
  eventFetchController.getAllEventFetchRequests,
);

eventFetchRouter.get(
  "/base-listeners/:id",
  eventFetchController.getEventFetchRequestById,
);

eventFetchRouter.get(
  "/base-listeners/triggers/:id",
  eventFetchController.getEventFetchRequestFunctionById,
);

eventFetchRouter.get(
  "/base-listeners/trigger-with-actions/:id",
  eventFetchController.getEventFetchRequestFunctionForIdWithActions,
);

export default eventFetchRouter;
